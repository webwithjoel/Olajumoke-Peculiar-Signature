grant usage on schema public to anon, authenticated;
grant select on public.categories to anon, authenticated;
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
alter table public.products add column if not exists price numeric(12,2) check (price is null or price > 0);
