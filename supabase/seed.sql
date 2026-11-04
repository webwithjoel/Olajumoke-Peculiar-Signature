insert into public.categories (slug, label, description, sort_order)
values
  ('bridal', 'Bridal', 'For the bride and every beautiful moment around her.', 0),
  ('owambe-traditional', 'Owambe & Traditional', 'Traditional styles for celebrations and special moments.', 1),
  ('dinner-special-occasions', 'Dinner & Special Occasions', 'Considered looks for evenings and occasions worth remembering.', 2),
  ('corporate-formal', 'Corporate & Formal', 'Elegant fashion for work, formal occasions and everything in between.', 3),
  ('headpieces-fascinators', 'Headpieces & Fascinators', 'Fascinators, hatinators and statement headpieces to complete the look.', 4)
on conflict (slug) do nothing;
