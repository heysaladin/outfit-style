alter table outfit_items add column if not exists sort_order integer not null default 0;
alter table wardrobe_collection_items add column if not exists sort_order integer not null default 0;
alter table wardrobe_collections add column if not exists sort_order integer not null default 0;
