import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';

export type Category = {
  id: string;
  slug: string;
  label: string;
  description: string | null;
  sortOrder: number;
};

type CategoryRow = {
  id: string;
  slug: string;
  label: string;
  description: string | null;
  sort_order: number | null;
};

async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('id, slug, label, description, sort_order')
    .order('sort_order', { ascending: true });

  if (error) throw error;

  return (data as CategoryRow[]).map((row) => ({
    id: row.id,
    slug: row.slug,
    label: row.label,
    description: row.description,
    sortOrder: row.sort_order ?? 0,
  }));
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });
}
