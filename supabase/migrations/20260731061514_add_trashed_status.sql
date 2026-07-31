ALTER TABLE wardrobe_items DROP CONSTRAINT wardrobe_items_status_check;
ALTER TABLE wardrobe_items ADD CONSTRAINT wardrobe_items_status_check CHECK (status IN ('draft', 'verified', 'trashed'));
