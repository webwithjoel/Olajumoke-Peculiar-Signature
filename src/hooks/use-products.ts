import { useQuery } from '@tanstack/react-query';

import type { ReadyToWearProduct } from '@/pages/ready-to-wear';
import { supabase } from '@/lib/supabase';
import { formatProductPrice } from '@/lib/product-price';

type ProductRow = {
  id: string;
  title: string;
  description: string | null;
  alt: string | null;
  price: number | null;
  image_path: string | null;
  is_featured: boolean | null;
  is_customizable: boolean | null;
  category: {
    slug: string;
    label: string;
  } | {
    slug: string;
    label: string;
  }[] | null;
};

export type Product = ReadyToWearProduct & {
  isFeatured: boolean;
  isCustomizable: boolean;
};

async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('id, title, description, alt, price, image_path, is_featured, is_customizable, category:categories!products_category_id_fkey(slug, label)')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data as ProductRow[]).flatMap((row) => {
    const category = Array.isArray(row.category) ? row.category[0] : row.category;
    if (!category) return [];

    return [{
      id: row.id,
      slug: category.slug,
      category: category.slug,
      categoryLabel: category.label,
      title: row.title,
      image: row.image_path !== null
        ? supabase.storage.from('product-images').getPublicUrl(row.image_path).data.publicUrl
        : null,
      alt: row.alt ?? row.title,
      description: row.description ?? '',
      priceLabel: formatProductPrice(row.price),
      isFeatured: row.is_featured ?? false,
      isCustomizable: row.is_customizable ?? false,
    }];
  });
}

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });
}
