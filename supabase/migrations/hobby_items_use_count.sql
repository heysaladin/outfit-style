-- Add use tracking to hobby_items
alter table hobby_items
  add column if not exists use_count int not null default 0,
  add column if not exists last_used date;
