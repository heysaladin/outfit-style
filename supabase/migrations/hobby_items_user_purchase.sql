-- Add user_id and purchase fields to hobby_items
-- Allow users to own and update their hobby items

alter table hobby_items
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists purchase_price numeric(12, 2),
  add column if not exists purchase_date date;

create index if not exists hobby_items_user_id_idx on hobby_items(user_id);

-- Users can update/delete their own items
create policy "Users can update their own hobby items"
  on hobby_items for update
  using (auth.uid() = user_id);

create policy "Users can delete their own hobby items"
  on hobby_items for delete
  using (auth.uid() = user_id);
