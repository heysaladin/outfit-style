-- Link outfits to a single wardrobe collection for collection-scoped mix & match / lookbook

alter table outfits
  add column if not exists collection_id uuid references wardrobe_collections(id) on delete set null;

create index if not exists outfits_collection_id_idx on outfits(collection_id);
