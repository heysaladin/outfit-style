create table if not exists wardrobe_collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  created_at timestamptz default now()
);
alter table wardrobe_collections enable row level security;
create policy "Users manage own wardrobe collections" on wardrobe_collections
  for all using (auth.uid() = user_id);

create table if not exists wardrobe_collection_items (
  wardrobe_collection_id uuid references wardrobe_collections(id) on delete cascade not null,
  item_id uuid references wardrobe_items(id) on delete cascade not null,
  primary key (wardrobe_collection_id, item_id)
);
alter table wardrobe_collection_items enable row level security;
create policy "Users manage own wardrobe collection items" on wardrobe_collection_items
  for all using (
    auth.uid() = (select user_id from wardrobe_collections where id = wardrobe_collection_id)
  );
