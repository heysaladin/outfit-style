-- Hobby Activities: time-stamped note + location logs per hobby
create table if not exists hobby_activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  hobby text not null,
  note text,
  location text,
  activity_at timestamptz not null default now(),
  created_at timestamptz default now()
);
alter table hobby_activities enable row level security;
create policy "Users manage own hobby activities" on hobby_activities
  for all using (auth.uid() = user_id);
create index hobby_activities_user_hobby on hobby_activities(user_id, hobby);

-- Hobby Photos: max 6 per hobby rolling window (oldest removed on server when 7th added)
create table if not exists hobby_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  hobby text not null,
  image_url text not null,
  storage_path text,
  note text,
  created_at timestamptz default now()
);
alter table hobby_photos enable row level security;
create policy "Users manage own hobby photos" on hobby_photos
  for all using (auth.uid() = user_id);
create index hobby_photos_user_hobby on hobby_photos(user_id, hobby);
