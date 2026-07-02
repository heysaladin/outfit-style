-- Migration: Add purchase_date to wardrobe_items
-- Run this in your Supabase SQL editor

ALTER TABLE wardrobe_items
  ADD COLUMN IF NOT EXISTS purchase_date DATE;

-- Migration: Add purchase_price and purchase_date to hobby_items

ALTER TABLE hobby_items
  ADD COLUMN IF NOT EXISTS purchase_price NUMERIC(12, 2),
  ADD COLUMN IF NOT EXISTS purchase_date  DATE;
