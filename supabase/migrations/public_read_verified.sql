-- Allow unauthenticated visitors to read verified wardrobe items
create policy "Public can read verified wardrobe items"
  on wardrobe_items for select
  using (status = 'verified');
