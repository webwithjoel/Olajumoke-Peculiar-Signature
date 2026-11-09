import { useEffect, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { ImagePlus, LoaderCircle, Trash2 } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useAdminCategories, type AdminProduct } from '@/hooks/use-admin-products';
import { clearExpiredAdminSession, isExpiredAdminSession } from '@/lib/admin-session';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

const productSchema = z.object({
  title: z.string().trim().min(1, 'Enter a product title.').max(160, 'Keep the title under 160 characters.'),
  description: z.string().max(5000, 'Keep the description under 5,000 characters.'),
  alt: z.string().max(250, 'Keep alt text under 250 characters.'),
  priceLabel: z.string().trim().min(1, 'Enter a price label.').max(120, 'Keep the price label under 120 characters.'),
  categoryId: z.string().min(1, 'Choose a category.'),
  sortOrder: z.number().int('Use a whole number.').min(0, 'Display order cannot be negative.'),
  isFeatured: z.boolean(),
  isCustomizable: z.boolean(),
  isPublished: z.boolean(),
});

type ProductFormValues = z.infer<typeof productSchema>;

type ProductFormProps = {
  open: boolean;
  product: AdminProduct | null;
  onClose: () => void;
};

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('This image could not be opened. Try a different photo.'));
    };
    image.src = url;
  });
}

function canvasBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, 0.85));
}

async function compressImage(file: File): Promise<{ file: File; extension: 'webp' | 'jpg' }> {
  const image = await loadImage(file);
  const scale = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Your browser could not prepare this image for upload.');
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const webp = await canvasBlob(canvas, 'image/webp');
  if (webp?.type === 'image/webp') {
    return { file: new File([webp], 'product.webp', { type: 'image/webp' }), extension: 'webp' };
  }
  const jpeg = await canvasBlob(canvas, 'image/jpeg');
  if (!jpeg) throw new Error('Your browser could not compress this image.');
  return { file: new File([jpeg], 'product.jpg', { type: 'image/jpeg' }), extension: 'jpg' };
}

function errorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  return 'The product could not be saved. Please try again.';
}

export function ProductForm({ open, product, onClose }: ProductFormProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: categories = [], isLoading: categoriesLoading, isError: categoriesError, refetch: refetchCategories } = useAdminCategories();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPreview, setSelectedPreview] = useState('');
  const [removeImage, setRemoveImage] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const submitLock = useRef(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: '',
      description: '',
      alt: '',
      priceLabel: 'Price on request',
      categoryId: '',
      sortOrder: 0,
      isFeatured: false,
      isCustomizable: false,
      isPublished: false,
    },
  });
  const { register, control, handleSubmit, reset, setValue, watch, formState: { errors, touchedFields } } = form;
  const title = watch('title');
  const existingImageUrl = product?.image_path
    ? supabase.storage.from('product-images').getPublicUrl(product.image_path).data.publicUrl
    : '';
  const imagePreview = selectedFile ? selectedPreview : removeImage ? '' : existingImageUrl;

  useEffect(() => {
    if (!selectedFile) {
      setSelectedPreview('');
      return;
    }
    const preview = URL.createObjectURL(selectedFile);
    setSelectedPreview(preview);
    return () => URL.revokeObjectURL(preview);
  }, [selectedFile]);

  useEffect(() => {
    if (!touchedFields.alt) setValue('alt', title ?? '');
  }, [setValue, title, touchedFields.alt]);

  useEffect(() => {
    if (!open) {
      setSelectedFile(null);
      setRemoveImage(false);
      return;
    }
    reset({
      title: product?.title ?? '',
      description: product?.description ?? '',
      alt: product?.alt ?? product?.title ?? '',
      priceLabel: product?.price_label ?? 'Price on request',
      categoryId: product?.category_id ?? '',
      sortOrder: product?.sort_order ?? 0,
      isFeatured: product?.is_featured ?? false,
      isCustomizable: product?.is_customizable ?? false,
      isPublished: product?.is_published ?? false,
    });
    setSelectedFile(null);
    setRemoveImage(false);
    submitLock.current = false;
  }, [open, product, reset]);

  const chooseImage = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Choose an image file', description: 'Only image files can be uploaded.', variant: 'destructive' });
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      toast({ title: 'Image is too large', description: 'Choose an image smaller than 15 MB.', variant: 'destructive' });
      return;
    }
    setSelectedFile(file);
    setRemoveImage(false);
  };

  const saveProduct = async (values: ProductFormValues) => {
    if (submitLock.current || saving) return;
    submitLock.current = true;
    setSaving(true);
    let uploadedPath: string | null = null;
    let productSaved = false;
    const previousPath = product?.image_path ?? null;

    try {
      if (selectedFile) {
        setUploadingImage(true);
        const compressed = await compressImage(selectedFile);
        const storagePath = `products/${crypto.randomUUID()}.${compressed.extension}`;
        const { error } = await supabase.storage
          .from('product-images')
          .upload(storagePath, compressed.file, {
            cacheControl: '3600',
            contentType: compressed.file.type,
            upsert: false,
          });
        if (error) throw error;
        uploadedPath = storagePath;
      }

      const imagePath = uploadedPath ?? (removeImage ? null : previousPath);
      const payload = {
        title: values.title,
        description: values.description.trim() || null,
        alt: values.alt.trim() || values.title,
        price_label: values.priceLabel,
        category_id: values.categoryId,
        sort_order: values.sortOrder,
        is_featured: values.isFeatured,
        is_customizable: values.isCustomizable,
        is_published: values.isPublished,
        image_path: imagePath,
      };
      if (product) {
        const { data, error } = await supabase.from('products').update(payload).eq('id', product.id).select('id').maybeSingle();
        if (error) throw error;
        if (!data) throw new Error('This product no longer exists or could not be updated.');
      } else {
        const { error } = await supabase.from('products').insert(payload).select('id').single();
        if (error) throw error;
      }
      productSaved = true;

      let oldImageCleanupError = '';
      if (previousPath && previousPath !== imagePath) {
        try {
          const { error } = await supabase.storage.from('product-images').remove([previousPath]);
          if (error) oldImageCleanupError = error.message;
        } catch (error) {
          oldImageCleanupError = errorMessage(error);
        }
      }
      try {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }),
          queryClient.invalidateQueries({ queryKey: ['products'] }),
        ]);
      } catch {
        toast({ title: 'Product saved, but dashboard refresh failed', description: 'Refresh the page to see the latest catalog.', variant: 'destructive' });
        onClose();
        return;
      }
      if (oldImageCleanupError) {
        toast({ title: 'Product saved, but old image cleanup failed', description: `The previous image remains in storage: ${oldImageCleanupError}`, variant: 'destructive' });
      } else {
        toast({ title: product ? 'Product updated' : 'Product added', description: `${values.title} has been saved.` });
      }
      onClose();
    } catch (error) {
      let cleanupFailed = false;
      if (uploadedPath && !productSaved) {
        try {
          const { error: cleanupError } = await supabase.storage.from('product-images').remove([uploadedPath]);
          cleanupFailed = Boolean(cleanupError);
        } catch {
          cleanupFailed = true;
        }
      }
      if (isExpiredAdminSession(error)) {
        try {
          await clearExpiredAdminSession();
          toast({ title: 'Session expired', description: 'Please sign in again to continue.', variant: 'destructive' });
        } catch {
          toast({ title: 'Session expired', description: 'Please reload and sign in again.', variant: 'destructive' });
        }
      } else {
        toast({
          title: productSaved ? 'Product saved, but another step failed' : 'Product could not be saved',
          description: `${errorMessage(error)}${cleanupFailed ? ' The temporary uploaded image could not be removed.' : ''}`,
          variant: 'destructive',
        });
      }
    } finally {
      setUploadingImage(false);
      setSaving(false);
      submitLock.current = false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen && !saving) onClose(); }}>
      <DialogContent className="max-h-[92svh] max-w-2xl overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="pr-8 text-left">
          <DialogTitle className="serif text-3xl">{product ? 'Edit product' : 'Add product'}</DialogTitle>
          <DialogDescription>Keep the catalog details clear and up to date.</DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit(saveProduct)} noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="product-title">Title <span aria-hidden="true">*</span></Label>
              <Input id="product-title" autoFocus {...register('title')} disabled={saving} aria-invalid={Boolean(errors.title)} />
              {errors.title && <p className="text-sm text-destructive" role="alert">{errors.title.message}</p>}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="product-description">Description</Label>
              <Textarea id="product-description" rows={4} {...register('description')} disabled={saving} />
              {errors.description && <p className="text-sm text-destructive" role="alert">{errors.description.message}</p>}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="product-alt">Image alt text</Label>
              <Input id="product-alt" placeholder={title || 'Describe the photo'} {...register('alt')} disabled={saving} aria-invalid={Boolean(errors.alt)} />
              {errors.alt && <p className="text-sm text-destructive" role="alert">{errors.alt.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-price">Price label <span aria-hidden="true">*</span></Label>
              <Input id="product-price" {...register('priceLabel')} disabled={saving} aria-invalid={Boolean(errors.priceLabel)} />
              {errors.priceLabel && <p className="text-sm text-destructive" role="alert">{errors.priceLabel.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-category">Category <span aria-hidden="true">*</span></Label>
              <Controller
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} disabled={saving || categoriesLoading}>
                    <SelectTrigger id="product-category" className="min-h-11" aria-invalid={Boolean(errors.categoryId)}>
                      <SelectValue placeholder={categoriesLoading ? 'Loading categories…' : 'Choose a category'} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => <SelectItem key={category.id} value={category.id}>{category.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
              {categoriesError ? (
                <div className="flex items-center justify-between gap-2 text-sm text-destructive">
                  <span>Categories could not be loaded.</span>
                  <Button type="button" size="sm" variant="outline" onClick={() => void refetchCategories()} disabled={saving}>Retry</Button>
                </div>
              ) : categories.length === 0 ? (
                <p className="text-sm text-destructive" role="alert">No categories are available. Add a category before creating products.</p>
              ) : errors.categoryId ? <p className="text-sm text-destructive" role="alert">{errors.categoryId.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-order">Display order</Label>
              <Input id="product-order" type="number" min="0" step="1" {...register('sortOrder', { valueAsNumber: true })} disabled={saving} aria-invalid={Boolean(errors.sortOrder)} />
              {errors.sortOrder && <p className="text-sm text-destructive" role="alert">{errors.sortOrder.message}</p>}
            </div>
          </div>

          <fieldset className="space-y-3 rounded-lg border border-border p-4">
            <legend className="px-1 text-sm font-semibold">Visibility and availability</legend>
            {([
              ['isFeatured', 'Featured on homepage'],
              ['isCustomizable', 'Available on Customize'],
              ['isPublished', 'Published'],
            ] as const).map(([name, label]) => (
              <div className="flex min-h-11 items-center justify-between gap-4" key={name}>
                <Label htmlFor={`product-${name}`}>{label}</Label>
                <Controller
                  control={control}
                  name={name}
                  render={({ field }) => <Switch id={`product-${name}`} checked={field.value} onCheckedChange={field.onChange} disabled={saving} />}
                />
              </div>
            ))}
          </fieldset>

          <div className="space-y-3">
            <Label>Product photo</Label>
            {imagePreview ? (
              <div className="flex flex-col gap-3 rounded-lg border border-border p-3 sm:flex-row sm:items-center">
                <img className="h-44 w-full rounded object-cover sm:h-28 sm:w-28" src={imagePreview} alt={title ? `Preview of ${title}` : 'Product image preview'} />
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" onClick={() => fileInput.current?.click()} disabled={saving}>
                    <ImagePlus aria-hidden="true" />Replace photo
                  </Button>
                  <Button type="button" variant="outline" onClick={() => { setSelectedFile(null); setRemoveImage(true); }} disabled={saving}>
                    <Trash2 aria-hidden="true" />Remove photo
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="flex min-h-28 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-5 text-sm text-muted-foreground hover:bg-muted/60"
                onClick={() => fileInput.current?.click()}
                disabled={saving}
              >
                <ImagePlus aria-hidden="true" size={22} />
                <span>Choose a photo (up to 15 MB)</span>
              </button>
            )}
            <input
              ref={fileInput}
              className="sr-only"
              type="file"
              accept="image/*"
              onChange={(event) => {
                chooseImage(event.currentTarget.files?.[0]);
                event.currentTarget.value = '';
              }}
              disabled={saving}
              aria-label="Choose product photo"
            />
            <p className="text-xs text-muted-foreground">Photos are resized to a maximum of 1600 pixels and compressed before upload.</p>
            {uploadingImage && (
              <div className="space-y-2" role="status" aria-live="polite">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <LoaderCircle className="animate-spin" size={16} aria-hidden="true" />
                  <span>Compressing and uploading image…</span>
                </div>
                <div role="progressbar" aria-label="Image upload in progress" aria-valuetext="Compressing and uploading" className="h-2 w-full overflow-hidden rounded-full bg-primary/20">
                  <div className="h-full w-1/3 animate-pulse rounded-full bg-primary" />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 border-t border-border pt-4 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button type="submit" disabled={saving || categoriesLoading || categoriesError || categories.length === 0}>
              {saving ? 'Saving…' : product ? 'Save changes' : 'Add product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
