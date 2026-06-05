-- Create gear_items table for non-fashion hobby items
create table if not exists gear_items (
  id               text primary key default gen_random_uuid()::text,
  user_id          uuid not null references auth.users(id) on delete cascade,
  hobby            text not null,
  name             text not null,
  brand            text,
  image_url        text,
  original_image_url text,
  purchase_price   numeric(12, 2),
  purchase_date    date,
  condition        text check (condition in ('new', 'like_new', 'good', 'fair', 'poor')),
  status           text not null default 'draft' check (status in ('draft', 'verified')),
  declutter_status text check (declutter_status in ('donate', 'sell', 'giveaway')),
  declutter_note   text,
  metadata         jsonb not null default '{}',
  tags             text[],
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists gear_items_user_id_idx on gear_items(user_id);
create index if not exists gear_items_hobby_idx on gear_items(hobby);

-- RLS
alter table gear_items enable row level security;

create policy "Users can manage their own gear items"
  on gear_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Auto-update updated_at
create trigger gear_items_updated_at
  before update on gear_items
  for each row execute function update_updated_at();
