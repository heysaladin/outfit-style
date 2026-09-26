-- Seed: personal hobby item purchases
-- Run in Supabase SQL editor
-- user_id is auto-resolved from the first (and only) user in auth.users

DO $$
DECLARE
  uid uuid := (SELECT id FROM auth.users LIMIT 1);
BEGIN

-- ── Social (Life) ────────────────────────────────────────────────────────────
INSERT INTO hobby_items (name, description, category, image_url, purchase_price, status, user_id)
VALUES
  (
    'Omron NE-C28 Compressor Nebulizer',
    'Alat uap terapi pernafasan asma NEC28',
    'social',
    'https://down-id.img.susercontent.com/file/id-11134201-23020-rawefj8pgunv7e_tn',
    603900,
    'verified',
    uid
  ),
  (
    'ENCHEN Mini 6 Portable Mini Shaver',
    'Alat cukur jenggot elektrik waterproof',
    'social',
    'https://down-id.img.susercontent.com/file/id-11134207-7r98r-lws0h5e8zqtmbf_tn',
    68900,
    'verified',
    uid
  );

-- ── Electronics (Gadget) ─────────────────────────────────────────────────────
INSERT INTO hobby_items (name, description, category, image_url, purchase_price, status, user_id)
VALUES
  (
    'Google Pixel 4',
    NULL,
    'electronics',
    'https://down-id.img.susercontent.com/file/id-11134207-7r98s-lxyrhk67h85mac_tn',
    1530000,
    'verified',
    uid
  );

-- ── Music ────────────────────────────────────────────────────────────────────
INSERT INTO hobby_items (name, description, category, image_url, purchase_price, status, user_id)
VALUES
  (
    'Corona Stand Gitar (Hitam)',
    'Stand gitar model baru',
    'music',
    'https://down-id.img.susercontent.com/file/c5856d4f479bc905b9b5bab8ff1c2197_tn',
    69900,
    'verified',
    uid
  ),
  (
    'SIT FN45105L Nickel Bass String',
    'Medium-Light Foundations Nickel Bass String',
    'music',
    'https://down-id.img.susercontent.com/file/534529ccd3200bcbe525bb9ff5784f3d_tn',
    175000,
    'verified',
    uid
  ),
  (
    'Akrilik Fret Rocker Leveling Ruler (Hitam)',
    'Untuk gitar dan bass - String Action',
    'music',
    'https://down-id.img.susercontent.com/file/id-11134207-7qul3-lfi0lacxc7415d_tn',
    45000,
    'verified',
    uid
  ),
  (
    'Akrilik Notched Edge Straight Ruler Bass',
    'Skala 34", 35", dan skala custom - Variasi 21',
    'music',
    'https://down-id.img.susercontent.com/file/00a2d70b342d7ae7cf977ec96473c464_tn',
    180000,
    'verified',
    uid
  );

END $$;
