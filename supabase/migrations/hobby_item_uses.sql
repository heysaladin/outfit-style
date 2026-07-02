-- Log each use of a hobby item
create table if not exists hobby_item_uses (
  id         uuid primary key default gen_random_uuid(),
  item_id    uuid not null references hobby_items(id) on delete cascade,
  used_at    date not null default current_date,
  note       text,
  created_at timestamptz default now()
);

create index if not exists hobby_item_uses_item_id_idx on hobby_item_uses(item_id, used_at desc);

alter table hobby_item_uses enable row level security;

create policy "Authenticated users can manage hobby item uses"
  on hobby_item_uses for all
  to authenticated
  using (true)
  with check (true);
