import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import { clearExpiredAdminSession, isExpiredAdminSession } from '@/lib/admin-session';

export type AdminProduct = {
  id: string;
  title: string;
  description: string | null;
  alt: string | null;
  price: number | null;
  category_id: string;
  image_path: string | null;
  is_featured: boolean;
  is_customizable: boolean;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  category: { id: string; label: string } | null;
};

export type AdminCategory = {
  id: string;
  slug: string;
  label: string;
  sort_order: number;
};

async function fetchAdminProducts(): Promise<AdminProduct[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, title, description, alt, price, category_id, image_path, is_featured, is_customizable, is_published, sort_order, created_at, category:categories!products_category_id_fkey(id, label)')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data ?? []).map((row) => {
      const category = Array.isArray(row.category) ? row.category[0] : row.category;
      return {
        ...row,
        is_featured: row.is_featured ?? false,
        is_customizable: row.is_customizable ?? false,
        is_published: row.is_published ?? false,
        sort_order: row.sort_order ?? 0,
        category,
      };
    }) as AdminProduct[];
  } catch (error) {
    if (isExpiredAdminSession(error)) await clearExpiredAdminSession();
    throw error;
  }
}

async function fetchAdminCategories(): Promise<AdminCategory[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, slug, label, sort_order')
      .order('sort_order', { ascending: true });

    if (error) throw error;

    return (data ?? []).map((row) => ({
      ...row,
      sort_order: row.sort_order ?? 0,
    })) as AdminCategory[];
  } catch (error) {
    if (isExpiredAdminSession(error)) await clearExpiredAdminSession();
    throw error;
  }
}

export function useAdminProducts() {
  return useQuery({
    queryKey: ['admin', 'products'],
    queryFn: fetchAdminProducts,
  });
}

export function useAdminCategories() {
  return useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: fetchAdminCategories,
  });
}
