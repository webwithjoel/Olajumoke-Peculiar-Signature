import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, ImageOff, Plus, Search } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminCategories, useAdminProducts } from '@/hooks/use-admin-products';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

type ProductListProps = {
  onAddProduct: () => void;
};

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

export function ProductList({ onAddProduct }: ProductListProps) {
  const { data = [], isLoading, isError, refetch } = useAdminProducts();
  const { data: categories = [] } = useAdminCategories();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const notifiedError = useRef(false);

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
                    <p className="mt-1 text-sm">{product.price_label ?? 'Price on request'}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {product.is_featured && <Badge variant="secondary">Featured</Badge>}
                      {product.is_customizable && <Badge variant="outline">Customizable</Badge>}
                      {!product.is_published && <Badge variant="destructive">Draft</Badge>}
                    </div>
                  </div>
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
                  <th scope="col" className="px-4 py-3 font-semibold">Price label</th>
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
                    <td className="px-4 py-3">{product.price_label ?? 'Price on request'}</td>
                    <td className="px-4 py-3">
                      {product.is_published ? <Badge>Published</Badge> : <Badge variant="destructive">Draft</Badge>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
