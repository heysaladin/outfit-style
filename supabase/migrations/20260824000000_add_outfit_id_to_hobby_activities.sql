ALTER TABLE hobby_activities ADD COLUMN IF NOT EXISTS outfit_id uuid REFERENCES outfits(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS hobby_activities_outfit_id ON hobby_activities(outfit_id) WHERE outfit_id IS NOT NULL;
