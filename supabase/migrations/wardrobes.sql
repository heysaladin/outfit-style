-- Create wardrobes table (physical storage locations)
create table if not exists wardrobes (
  id          text primary key default gen_random_uuid()::text,
  user_id     uuid not null references auth.users(id) on delete cascade,
  code        text not null,
  name        text not null,
  description text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists wardrobes_user_id_idx on wardrobes(user_id);

-- RLS
alter table wardrobes enable row level security;

create policy "Users can manage their own wardrobes"
  on wardrobes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Add wardrobe_id to wardrobe_items
alter table wardrobe_items
  add column if not exists wardrobe_id text references wardrobes(id) on delete set null;

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger wardrobes_updated_at
  before update on wardrobes
  for each row execute function update_updated_at();
