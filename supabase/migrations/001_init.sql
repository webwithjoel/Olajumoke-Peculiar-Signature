create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  label text not null,
  description text,
  sort_order int default 0
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  alt text,
  price_label text default 'Price on request',
  category_id uuid references public.categories(id),
  image_path text,
  is_featured bool default false,
  is_customizable bool default false,
  is_published bool default true,
  sort_order int default 0,
  created_at timestamptz default now()
);

create table public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.admins
    where user_id = auth.uid()
  );
$$;

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.admins enable row level security;

create policy "Categories are publicly readable"
  on public.categories for select
  using (true);

create policy "Admins can insert categories"
  on public.categories for insert
  with check (public.is_admin());

create policy "Admins can update categories"
  on public.categories for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete categories"
  on public.categories for delete
  using (public.is_admin());

create policy "Published products and admins can read products"
  on public.products for select
  using (is_published or public.is_admin());

create policy "Admins can insert products"
  on public.products for insert
  with check (public.is_admin());

create policy "Admins can update products"
  on public.products for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete products"
  on public.products for delete
  using (public.is_admin());

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update
set public = excluded.public;

create policy "Product images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Admins can upload product images"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "Admins can update product images"
  on storage.objects for update
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "Admins can delete product images"
  on storage.objects for delete
  using (bucket_id = 'product-images' and public.is_admin());
