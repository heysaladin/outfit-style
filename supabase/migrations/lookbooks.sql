-- Lookbook feature: lookbooks, photos, and outfit links

create table if not exists lookbooks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  sort_order integer default 0,
  created_at timestamptz default now()
);

create table if not exists lookbook_photos (
  id uuid default gen_random_uuid() primary key,
  lookbook_id uuid references lookbooks(id) on delete cascade not null,
  image_url text not null,
  caption text,
  sort_order integer default 0,
  created_at timestamptz default now()
);

create table if not exists lookbook_photo_outfits (
  lookbook_photo_id uuid references lookbook_photos(id) on delete cascade not null,
  outfit_id uuid references outfits(id) on delete cascade not null,
  primary key (lookbook_photo_id, outfit_id)
);

alter table lookbooks enable row level security;
alter table lookbook_photos enable row level security;
alter table lookbook_photo_outfits enable row level security;

create policy "Users manage own lookbooks" on lookbooks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own lookbook photos" on lookbook_photos
  for all using (
    auth.uid() = (select user_id from lookbooks where id = lookbook_id)
  ) with check (
    auth.uid() = (select user_id from lookbooks where id = lookbook_id)
  );

create policy "Users manage own lookbook photo outfits" on lookbook_photo_outfits
  for all using (
    auth.uid() = (
      select lb.user_id from lookbook_photos lbp
      join lookbooks lb on lb.id = lbp.lookbook_id
      where lbp.id = lookbook_photo_id
    )
  ) with check (
    auth.uid() = (
      select lb.user_id from lookbook_photos lbp
      join lookbooks lb on lb.id = lbp.lookbook_id
      where lbp.id = lookbook_photo_id
    )
  );
