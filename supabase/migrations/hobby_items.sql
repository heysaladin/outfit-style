-- Public hobby items catalog (separate from personal gear_items)
-- category matches HOBBIES values: fashion, motorcycle, electronics, watches, etc.
create table if not exists hobby_items (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  category    text not null,
  image_url   text,
  status      text not null default 'draft' check (status in ('draft', 'verified')),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Index for fast category + status queries
create index if not exists hobby_items_category_status on hobby_items(category, status);

-- Anyone can read verified items
create policy "Public can read verified hobby items"
  on hobby_items for select
  using (status = 'verified');

-- Authenticated users can insert (as draft)
create policy "Authenticated users can insert hobby items"
  on hobby_items for insert
  to authenticated
  with check (true);

-- Enable RLS (no rows visible unless policy matches)
alter table hobby_items enable row level security;
