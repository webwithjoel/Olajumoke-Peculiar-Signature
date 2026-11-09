import { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, ImageOff, Pencil, Plus, Search, Trash2 } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { useAdminCategories, useAdminProducts, type AdminProduct } from '@/hooks/use-admin-products';
import { clearExpiredAdminSession, isExpiredAdminSession } from '@/lib/admin-session';
import { formatProductPrice } from '@/lib/product-price';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

type ProductListProps = {
  onAddProduct: () => void;
  onEditProduct: (product: AdminProduct) => void;
};

type ProductActionsProps = {
  product: AdminProduct;
  disabled: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: (field: 'is_featured' | 'is_published', value: boolean) => void;
};

function ProductActions({ product, disabled, onEdit, onDelete, onToggle }: ProductActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <div className="flex items-center gap-2">
        <Label className="text-xs" htmlFor={`featured-${product.id}`}>Featured</Label>
        <Switch id={`featured-${product.id}`} checked={product.is_featured} onCheckedChange={(checked) => onToggle('is_featured', checked)} disabled={disabled} aria-label={`Feature ${product.title} on homepage`} />
      </div>
      <div className="flex items-center gap-2">
        <Label className="text-xs" htmlFor={`published-${product.id}`}>Published</Label>
        <Switch id={`published-${product.id}`} checked={product.is_published} onCheckedChange={(checked) => onToggle('is_published', checked)} disabled={disabled} aria-label={`Publish ${product.title}`} />
      </div>
      <Button type="button" size="icon" variant="outline" aria-label={`Edit ${product.title}`} onClick={onEdit} disabled={disabled}>
        <Pencil aria-hidden="true" />
      </Button>
      <Button type="button" size="icon" variant="outline" aria-label={`Delete ${product.title}`} onClick={onDelete} disabled={disabled}>
        <Trash2 aria-hidden="true" />
      </Button>
    </div>
  );
}

function ProductThumbnail({ path, title }: { path: string | null; title: string }) {
  if (!path) {
    return (
      <div className="grid size-16 shrink-0 place-items-center rounded border border-border bg-muted text-muted-foreground" aria-label="No product image">
        <ImageOff size={20} aria-hidden="true" />
      </div>
    );
  }
  const imageUrl = supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl;
  return <img className="size-16 shrink-0 rounded border border-border object-cover" src={imageUrl} alt={title} />;
}

export function ProductList({ onAddProduct, onEditProduct }: ProductListProps) {
  const queryClient = useQueryClient();
  const { data = [], isLoading, isError, refetch } = useAdminProducts();
  const { data: categories = [], isError: categoriesError } = useAdminCategories();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteCandidate, setDeleteCandidate] = useState<AdminProduct | null>(null);
  const notifiedError = useRef(false);
  const notifiedCategoryError = useRef(false);

  const invalidateProducts = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }),
      queryClient.invalidateQueries({ queryKey: ['products'] }),
    ]);
  };

  const toggleMutation = useMutation({
    mutationFn: async ({ productId, field, value }: { productId: string; field: 'is_featured' | 'is_published'; value: boolean }) => {
      const { data, error } = await supabase.from('products').update({ [field]: value }).eq('id', productId).select('id').maybeSingle();
      if (error) throw error;
      if (!data) throw new Error('This product no longer exists or could not be updated.');
    },
    onSuccess: async (_data, variables) => {
      await invalidateProducts();
      toast({ title: variables.field === 'is_featured' ? 'Featured setting updated' : 'Publication setting updated' });
    },
    onError: async (error) => {
      const message = error instanceof Error ? error.message : String(error);
      if (isExpiredAdminSession(error)) {
        try {
          await clearExpiredAdminSession();
          toast({ title: 'Session expired', description: 'Please sign in again to continue.', variant: 'destructive' });
        } catch {
          toast({ title: 'Session expired', description: 'Please reload and sign in again.', variant: 'destructive' });
        }
      } else {
        toast({ title: 'Product setting could not be updated', description: message, variant: 'destructive' });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (product: AdminProduct) => {
      const { data, error } = await supabase.from('products').delete().eq('id', product.id).select('id').maybeSingle();
      if (error) throw error;
      if (!data) throw new Error('This product no longer exists or could not be deleted.');
      if (product.image_path) {
        const { error: storageError } = await supabase.storage.from('product-images').remove([product.image_path]);
        return {
          storageError: storageError?.message ?? null,
          expired: storageError ? isExpiredAdminSession(storageError) : false,
        };
      }
      return { storageError: null, expired: false };
    },
    onSuccess: async (result, product) => {
      await invalidateProducts();
      setDeleteCandidate(null);
      if (result.expired) {
        try {
          await clearExpiredAdminSession();
        } catch {
          toast({ title: 'Product deleted, but the session expired', description: 'Please reload and sign in again.', variant: 'destructive' });
          return;
        }
        toast({ title: 'Product deleted; session expired', description: 'The image may remain in storage. Please sign in again.', variant: 'destructive' });
        return;
      }
      if (result.storageError) {
        toast({
          title: 'Product deleted, but image cleanup failed',
          description: `${product.title} is removed. Its storage image could not be deleted: ${result.storageError}`,
          variant: 'destructive',
        });
      } else {
        toast({ title: 'Product deleted', description: `${product.title} has been removed.` });
      }
    },
    onError: async (error) => {
      const message = error instanceof Error ? error.message : String(error);
      if (isExpiredAdminSession(error)) {
        try {
          await clearExpiredAdminSession();
          toast({ title: 'Session expired', description: 'Please sign in again to continue.', variant: 'destructive' });
        } catch {
          toast({ title: 'Session expired', description: 'Please reload and sign in again.', variant: 'destructive' });
        }
      } else {
        toast({ title: 'Product could not be deleted', description: message, variant: 'destructive' });
      }
    },
  });

  useEffect(() => {
    if (isError && !notifiedError.current) {
      toast({
        title: 'Products could not be loaded',
        description: 'Please check your connection and try again.',
        variant: 'destructive',
      });
      notifiedError.current = true;
    }
    if (!isError) notifiedError.current = false;
  }, [isError, toast]);

  useEffect(() => {
    if (categoriesError && !notifiedCategoryError.current) {
      toast({
        title: 'Categories could not be loaded',
        description: 'Category filters may be incomplete. Please retry after refreshing.',
        variant: 'destructive',
      });
      notifiedCategoryError.current = true;
    }
    if (!categoriesError) notifiedCategoryError.current = false;
  }, [categoriesError, toast]);

  const filteredProducts = data.filter((product) => {
    const matchesTitle = product.title.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category_id === categoryFilter;
    const matchesStatus = statusFilter === 'all'
      || (statusFilter === 'published' && product.is_published)
      || (statusFilter === 'draft' && !product.is_published);
    return matchesTitle && matchesCategory && matchesStatus;
  });
  const featuredCount = data.filter((product) => product.is_featured).length;

  return (
    <section aria-labelledby="products-heading" className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Manage your catalog</p>
          <h2 id="products-heading" className="serif mt-1 text-3xl">Products</h2>
        </div>
        <Button type="button" className="min-h-11 w-full sm:w-auto" onClick={onAddProduct}>
          <Plus aria-hidden="true" />
          Add product
        </Button>
      </div>

      {featuredCount > 5 && (
        <Alert className="border-primary/50 bg-secondary/40">
          <AlertTriangle aria-hidden="true" />
          <AlertTitle>More than five products are featured</AlertTitle>
          <AlertDescription>The homepage displays only five featured products. Adjust the selection to control which looks appear there.</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(11rem,0.65fr)_minmax(9rem,0.55fr)]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={17} aria-hidden="true" />
          <Input className="min-h-11 pl-10" type="search" placeholder="Search by title" aria-label="Search products by title" value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="min-h-11" aria-label="Filter by category">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((category) => <SelectItem key={category.id} value={category.id}>{category.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="min-h-11" aria-label="Filter by status">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Drafts</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3" aria-label="Loading products" aria-busy="true">
          {Array.from({ length: 4 }, (_, index) => <Skeleton className="h-24 w-full" key={index} />)}
        </div>
      ) : isError ? (
        <div className="rounded-lg border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">Your products could not be loaded.</p>
          <Button type="button" variant="outline" className="mt-4" onClick={() => void refetch()}>Try again</Button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card px-5 py-12 text-center">
          <h3 className="serif text-2xl">{data.length ? 'No matching products' : 'Your catalog is ready for its first look'}</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {data.length ? 'Try changing your search or filters.' : 'Add a product to get started.'}
          </p>
          {!data.length && <Button type="button" className="mt-5" onClick={onAddProduct}><Plus aria-hidden="true" />Add product</Button>}
        </div>
      ) : (
        <>
          <ul className="space-y-3 md:hidden">
            {filteredProducts.map((product) => (
              <li key={product.id} className="rounded-lg border border-border bg-card p-4 shadow-sm">
                <div className="flex gap-3">
                  <ProductThumbnail path={product.image_path} title={product.alt ?? product.title} />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold">{product.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{product.category?.label ?? 'Uncategorized'}</p>
                    <p className="mt-1 text-sm">{formatProductPrice(product.price)}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {product.is_featured && <Badge variant="secondary">Featured</Badge>}
                      {product.is_customizable && <Badge variant="outline">Customizable</Badge>}
                      {!product.is_published && <Badge variant="destructive">Draft</Badge>}
                    </div>
                  </div>
                </div>
                <div className="mt-4 border-t border-border pt-3">
                  <ProductActions
                    product={product}
                    disabled={toggleMutation.isPending || deleteMutation.isPending}
                    onEdit={() => onEditProduct(product)}
                    onDelete={() => setDeleteCandidate(product)}
                    onToggle={(field, value) => toggleMutation.mutate({ productId: product.id, field, value })}
                  />
                </div>
              </li>
            ))}
          </ul>

          <div className="hidden overflow-x-auto rounded-lg border border-border bg-card md:block">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Product</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Category</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Price</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <ProductThumbnail path={product.image_path} title={product.alt ?? product.title} />
                        <div>
                          <p className="font-semibold">{product.title}</p>
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            {product.is_featured && <Badge variant="secondary">Featured</Badge>}
                            {product.is_customizable && <Badge variant="outline">Customizable</Badge>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{product.category?.label ?? 'Uncategorized'}</td>
                    <td className="px-4 py-3">{formatProductPrice(product.price)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {product.is_published ? <Badge>Published</Badge> : <Badge variant="destructive">Draft</Badge>}
                        <ProductActions
                          product={product}
                          disabled={toggleMutation.isPending || deleteMutation.isPending}
                          onEdit={() => onEditProduct(product)}
                          onDelete={() => setDeleteCandidate(product)}
                          onToggle={(field, value) => toggleMutation.mutate({ productId: product.id, field, value })}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <AlertDialog
        open={Boolean(deleteCandidate)}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) setDeleteCandidate(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="serif text-2xl">Delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteCandidate && <>This will permanently delete <strong>{deleteCandidate.title}</strong> and its stored photo.</>}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={!deleteCandidate || deleteMutation.isPending}
              onClick={() => { if (deleteCandidate) deleteMutation.mutate(deleteCandidate); }}
            >
              {deleteMutation.isPending ? 'Deleting…' : 'Delete product'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
