-- =============================================================
-- Wardrobe Items: Add English Tags
-- Generated: 2026-09-30
-- Only updates the `tags` column; preserves existing tags.
-- =============================================================

-- ---------------------------------------------------------------
-- BOTTOM — underwear
-- ---------------------------------------------------------------

UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['underwear', 'brief', 'innerwear']))
WHERE lower(category) = 'bottom'
  AND item_type = 'underwear'
  AND name ILIKE '%brief%';

UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['underwear', 'boxer', 'innerwear']))
WHERE lower(category) = 'bottom'
  AND item_type = 'underwear'
  AND name ILIKE '%boxer%';

UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['underwear', 'trunks', 'innerwear']))
WHERE lower(category) = 'bottom'
  AND item_type = 'underwear'
  AND name ILIKE '%trunk%';

-- Remaining underwear (not brief / boxer / trunk)
UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['underwear', 'innerwear']))
WHERE lower(category) = 'bottom'
  AND item_type = 'underwear'
  AND name NOT ILIKE '%brief%'
  AND name NOT ILIKE '%boxer%'
  AND name NOT ILIKE '%trunk%';

-- ---------------------------------------------------------------
-- BOTTOM — jeans / trousers / shorts
-- ---------------------------------------------------------------

UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['jeans', 'denim', 'bottom']))
WHERE lower(category) = 'bottom'
  AND item_type = 'jeans';

UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['trousers', 'pants', 'bottom']))
WHERE lower(category) = 'bottom'
  AND item_type = 'trousers';

UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['shorts', 'bottom']))
WHERE lower(category) = 'bottom'
  AND item_type = 'shorts';

-- ---------------------------------------------------------------
-- BOTTOM — pants (specific sub-types first, then fallback)
-- ---------------------------------------------------------------

UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['cargo', 'pants', 'bottom', 'tactical']))
WHERE lower(category) = 'bottom'
  AND item_type = 'pants'
  AND (name ILIKE '%cargo%' OR name ILIKE '%tactical%' OR name ILIKE '%combat%');

UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['sweatpants', 'jogger', 'pants', 'bottom', 'casual']))
WHERE lower(category) = 'bottom'
  AND item_type = 'pants'
  AND (name ILIKE '%jogger%' OR name ILIKE '%sweat%' OR name ILIKE '%track%')
  AND name NOT ILIKE '%cargo%'
  AND name NOT ILIKE '%tactical%'
  AND name NOT ILIKE '%combat%';

UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['chinos', 'pants', 'bottom', 'casual']))
WHERE lower(category) = 'bottom'
  AND item_type = 'pants'
  AND (name ILIKE '%chino%' OR name ILIKE '%chinos%')
  AND name NOT ILIKE '%cargo%'
  AND name NOT ILIKE '%tactical%'
  AND name NOT ILIKE '%combat%'
  AND name NOT ILIKE '%jogger%'
  AND name NOT ILIKE '%sweat%'
  AND name NOT ILIKE '%track%';

-- Remaining pants (no specific sub-type matched)
UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['pants', 'bottom']))
WHERE lower(category) = 'bottom'
  AND item_type = 'pants'
  AND name NOT ILIKE '%cargo%'
  AND name NOT ILIKE '%tactical%'
  AND name NOT ILIKE '%combat%'
  AND name NOT ILIKE '%jogger%'
  AND name NOT ILIKE '%sweat%'
  AND name NOT ILIKE '%track%'
  AND name NOT ILIKE '%chino%'
  AND name NOT ILIKE '%chinos%';

-- ---------------------------------------------------------------
-- BOTTOM — misc
-- ---------------------------------------------------------------

UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['sarung', 'traditional', 'wrap', 'bottom']))
WHERE lower(category) = 'bottom'
  AND item_type = 'misc'
  AND name ILIKE '%sarung%';

UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['leggings', 'activewear', 'bottom']))
WHERE lower(category) = 'bottom'
  AND item_type = 'misc'
  AND name ILIKE '%legging%';

-- ---------------------------------------------------------------
-- TOP — inner / tshirt
-- ---------------------------------------------------------------

UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['t-shirt', 'oversized', 'casual', 'top']))
WHERE lower(category) = 'top'
  AND subcategory = 'inner'
  AND item_type = 'tshirt'
  AND name ILIKE '%oversized%';

UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['t-shirt', 'sport', 'activewear', 'top']))
WHERE lower(category) = 'top'
  AND subcategory = 'inner'
  AND item_type = 'tshirt'
  AND (name ILIKE '%dry%' OR name ILIKE '%sport%')
  AND name NOT ILIKE '%oversized%';

-- All remaining tshirts (not oversized / dry / sport)
UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['t-shirt', 'casual', 'top']))
WHERE lower(category) = 'top'
  AND subcategory = 'inner'
  AND item_type = 'tshirt'
  AND name NOT ILIKE '%oversized%'
  AND name NOT ILIKE '%dry%'
  AND name NOT ILIKE '%sport%';

-- ---------------------------------------------------------------
-- TOP — inner / shirt
-- ---------------------------------------------------------------

UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['shirt', 'flannel', 'plaid', 'top']))
WHERE lower(category) = 'top'
  AND subcategory = 'inner'
  AND item_type = 'shirt'
  AND (name ILIKE '%flannel%' OR name ILIKE '%kotak%');

UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['shirt', 'batik', 'traditional', 'top']))
WHERE lower(category) = 'top'
  AND subcategory = 'inner'
  AND item_type = 'shirt'
  AND name ILIKE '%batik%'
  AND name NOT ILIKE '%flannel%'
  AND name NOT ILIKE '%kotak%';

UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['shirt', 'dress shirt', 'formal', 'top']))
WHERE lower(category) = 'top'
  AND subcategory = 'inner'
  AND item_type = 'shirt'
  AND name ILIKE '%kemeja%'
  AND (name ILIKE '%formal%' OR name ILIKE '%kantor%')
  AND name NOT ILIKE '%flannel%'
  AND name NOT ILIKE '%kotak%'
  AND name NOT ILIKE '%batik%';

UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['shirt', 'linen', 'top', 'casual']))
WHERE lower(category) = 'top'
  AND subcategory = 'inner'
  AND item_type = 'shirt'
  AND name ILIKE '%linen%'
  AND name NOT ILIKE '%flannel%'
  AND name NOT ILIKE '%kotak%'
  AND name NOT ILIKE '%batik%';

UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['polo shirt', 'polo', 'casual', 'top']))
WHERE lower(category) = 'top'
  AND subcategory = 'inner'
  AND item_type = 'shirt'
  AND name ILIKE '%polo%'
  AND name NOT ILIKE '%flannel%'
  AND name NOT ILIKE '%kotak%'
  AND name NOT ILIKE '%batik%'
  AND name NOT ILIKE '%linen%';

-- All remaining shirts
UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['shirt', 'top']))
WHERE lower(category) = 'top'
  AND subcategory = 'inner'
  AND item_type = 'shirt'
  AND name NOT ILIKE '%flannel%'
  AND name NOT ILIKE '%kotak%'
  AND name NOT ILIKE '%batik%'
  AND name NOT ILIKE '%linen%'
  AND name NOT ILIKE '%polo%'
  AND NOT (name ILIKE '%kemeja%' AND (name ILIKE '%formal%' OR name ILIKE '%kantor%'));

-- ---------------------------------------------------------------
-- TOP — inner / misc
-- ---------------------------------------------------------------

UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['tank top', 'singlet', 'innerwear', 'top']))
WHERE lower(category) = 'top'
  AND subcategory = 'inner'
  AND item_type = 'misc'
  AND (name ILIKE '%singlet%' OR name ILIKE '%tank%' OR name ILIKE '%tanktop%');

UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['turtleneck', 'top', 'casual']))
WHERE lower(category) = 'top'
  AND subcategory = 'inner'
  AND item_type = 'misc'
  AND name ILIKE '%turtleneck%'
  AND name NOT ILIKE '%singlet%'
  AND name NOT ILIKE '%tank%'
  AND name NOT ILIKE '%tanktop%';

-- All remaining inner misc
UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['top', 'casual']))
WHERE lower(category) = 'top'
  AND subcategory = 'inner'
  AND item_type = 'misc'
  AND name NOT ILIKE '%singlet%'
  AND name NOT ILIKE '%tank%'
  AND name NOT ILIKE '%tanktop%'
  AND name NOT ILIKE '%turtleneck%';

-- ---------------------------------------------------------------
-- TOP — outer / jacket
-- ---------------------------------------------------------------

UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['jacket', 'denim', 'outerwear', 'top']))
WHERE lower(category) = 'top'
  AND subcategory = 'outer'
  AND item_type = 'jacket'
  AND name ILIKE '%denim%';

UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['jacket', 'puffer', 'winter', 'outerwear', 'top']))
WHERE lower(category) = 'top'
  AND subcategory = 'outer'
  AND item_type = 'jacket'
  AND (name ILIKE '%puffer%' OR name ILIKE '%bulang%' OR name ILIKE '%down%')
  AND name NOT ILIKE '%denim%';

UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['jacket', 'military', 'outerwear', 'top']))
WHERE lower(category) = 'top'
  AND subcategory = 'outer'
  AND item_type = 'jacket'
  AND (name ILIKE '%military%' OR name ILIKE '%bomber%' OR name ILIKE '%flight%')
  AND name NOT ILIKE '%denim%'
  AND name NOT ILIKE '%puffer%'
  AND name NOT ILIKE '%bulang%'
  AND name NOT ILIKE '%down%';

UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['jacket', 'leather', 'outerwear', 'top']))
WHERE lower(category) = 'top'
  AND subcategory = 'outer'
  AND item_type = 'jacket'
  AND (name ILIKE '%leather%' OR name ILIKE '%kulit%')
  AND name NOT ILIKE '%denim%'
  AND name NOT ILIKE '%puffer%'
  AND name NOT ILIKE '%bulang%'
  AND name NOT ILIKE '%down%'
  AND name NOT ILIKE '%military%'
  AND name NOT ILIKE '%bomber%'
  AND name NOT ILIKE '%flight%';

UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['jacket', 'windbreaker', 'lightweight', 'outerwear', 'top']))
WHERE lower(category) = 'top'
  AND subcategory = 'outer'
  AND item_type = 'jacket'
  AND (name ILIKE '%windbreaker%' OR name ILIKE '%gore%')
  AND name NOT ILIKE '%denim%'
  AND name NOT ILIKE '%puffer%'
  AND name NOT ILIKE '%bulang%'
  AND name NOT ILIKE '%down%'
  AND name NOT ILIKE '%military%'
  AND name NOT ILIKE '%bomber%'
  AND name NOT ILIKE '%flight%'
  AND name NOT ILIKE '%leather%'
  AND name NOT ILIKE '%kulit%';

-- All remaining jackets
UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['jacket', 'outerwear', 'top']))
WHERE lower(category) = 'top'
  AND subcategory = 'outer'
  AND item_type = 'jacket'
  AND name NOT ILIKE '%denim%'
  AND name NOT ILIKE '%puffer%'
  AND name NOT ILIKE '%bulang%'
  AND name NOT ILIKE '%down%'
  AND name NOT ILIKE '%military%'
  AND name NOT ILIKE '%bomber%'
  AND name NOT ILIKE '%flight%'
  AND name NOT ILIKE '%leather%'
  AND name NOT ILIKE '%kulit%'
  AND name NOT ILIKE '%windbreaker%'
  AND name NOT ILIKE '%gore%';

-- ---------------------------------------------------------------
-- TOP — outer / formal-jacket
-- ---------------------------------------------------------------

UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['blazer', 'formal', 'outerwear', 'top']))
WHERE lower(category) = 'top'
  AND subcategory = 'outer'
  AND item_type = 'formal-jacket'
  AND (name ILIKE '%blazer%' OR name ILIKE '%jas%');

-- All remaining formal-jacket
UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['formal jacket', 'formal', 'outerwear', 'top']))
WHERE lower(category) = 'top'
  AND subcategory = 'outer'
  AND item_type = 'formal-jacket'
  AND name NOT ILIKE '%blazer%'
  AND name NOT ILIKE '%jas%';

-- ---------------------------------------------------------------
-- TOP — outer / misc
-- ---------------------------------------------------------------

UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['sweater', 'knitwear', 'outerwear', 'top']))
WHERE lower(category) = 'top'
  AND subcategory = 'outer'
  AND item_type = 'misc'
  AND (name ILIKE '%sweater%' OR name ILIKE '%knit%' OR name ILIKE '%rajut%');

UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['hoodie', 'casual', 'outerwear', 'top']))
WHERE lower(category) = 'top'
  AND subcategory = 'outer'
  AND item_type = 'misc'
  AND name ILIKE '%hoodie%'
  AND name NOT ILIKE '%sweater%'
  AND name NOT ILIKE '%knit%'
  AND name NOT ILIKE '%rajut%';

UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['vest', 'outerwear', 'top']))
WHERE lower(category) = 'top'
  AND subcategory = 'outer'
  AND item_type = 'misc'
  AND (name ILIKE '%vest%' OR name ILIKE '%rompi%')
  AND name NOT ILIKE '%sweater%'
  AND name NOT ILIKE '%knit%'
  AND name NOT ILIKE '%rajut%'
  AND name NOT ILIKE '%hoodie%';

UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['cardigan', 'knitwear', 'outerwear', 'top']))
WHERE lower(category) = 'top'
  AND subcategory = 'outer'
  AND item_type = 'misc'
  AND name ILIKE '%cardigan%'
  AND name NOT ILIKE '%sweater%'
  AND name NOT ILIKE '%knit%'
  AND name NOT ILIKE '%rajut%'
  AND name NOT ILIKE '%hoodie%'
  AND name NOT ILIKE '%vest%'
  AND name NOT ILIKE '%rompi%';

UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['coat', 'outerwear', 'top', 'formal']))
WHERE lower(category) = 'top'
  AND subcategory = 'outer'
  AND item_type = 'misc'
  AND (name ILIKE '%coat%' OR name ILIKE '%trench%')
  AND name NOT ILIKE '%sweater%'
  AND name NOT ILIKE '%knit%'
  AND name NOT ILIKE '%rajut%'
  AND name NOT ILIKE '%hoodie%'
  AND name NOT ILIKE '%vest%'
  AND name NOT ILIKE '%rompi%'
  AND name NOT ILIKE '%cardigan%';

-- All remaining outer misc
UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['outerwear', 'top']))
WHERE lower(category) = 'top'
  AND subcategory = 'outer'
  AND item_type = 'misc'
  AND name NOT ILIKE '%sweater%'
  AND name NOT ILIKE '%knit%'
  AND name NOT ILIKE '%rajut%'
  AND name NOT ILIKE '%hoodie%'
  AND name NOT ILIKE '%vest%'
  AND name NOT ILIKE '%rompi%'
  AND name NOT ILIKE '%cardigan%'
  AND name NOT ILIKE '%coat%'
  AND name NOT ILIKE '%trench%';

-- ---------------------------------------------------------------
-- FOOTWEAR
-- ---------------------------------------------------------------

UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['boots', 'footwear']))
WHERE lower(category) = 'footwear'
  AND (item_type = 'boots' OR subcategory = 'boots');

UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['sneakers', 'footwear']))
WHERE lower(category) = 'footwear'
  AND item_type = 'sneakers';

UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['shoes', 'footwear']))
WHERE lower(category) = 'footwear'
  AND item_type = 'shoes';

UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['sandals', 'footwear', 'casual']))
WHERE lower(category) = 'footwear'
  AND item_type = 'sandals';

UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['socks', 'footwear']))
WHERE lower(category) = 'footwear'
  AND item_type = 'socks';

UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['footwear accessory', 'footwear']))
WHERE lower(category) = 'footwear'
  AND item_type = 'misc';

-- ---------------------------------------------------------------
-- HEADWEAR
-- ---------------------------------------------------------------

UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['cap', 'headwear']))
WHERE lower(category) = 'headwear'
  AND item_type = 'cap';

UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['fedora', 'hat', 'headwear']))
WHERE lower(category) = 'headwear'
  AND item_type = 'hat'
  AND name ILIKE '%fedora%';

UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['beanie', 'hat', 'headwear']))
WHERE lower(category) = 'headwear'
  AND item_type = 'hat'
  AND (name ILIKE '%beanie%' OR name ILIKE '%kupluk%')
  AND name NOT ILIKE '%fedora%';

UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['bucket hat', 'hat', 'headwear']))
WHERE lower(category) = 'headwear'
  AND item_type = 'hat'
  AND name ILIKE '%bucket%'
  AND name NOT ILIKE '%fedora%'
  AND name NOT ILIKE '%beanie%'
  AND name NOT ILIKE '%kupluk%';

UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['panama hat', 'hat', 'headwear', 'summer']))
WHERE lower(category) = 'headwear'
  AND item_type = 'hat'
  AND name ILIKE '%panama%'
  AND name NOT ILIKE '%fedora%'
  AND name NOT ILIKE '%beanie%'
  AND name NOT ILIKE '%kupluk%'
  AND name NOT ILIKE '%bucket%';

-- All remaining hats
UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['hat', 'headwear']))
WHERE lower(category) = 'headwear'
  AND item_type = 'hat'
  AND name NOT ILIKE '%fedora%'
  AND name NOT ILIKE '%beanie%'
  AND name NOT ILIKE '%kupluk%'
  AND name NOT ILIKE '%bucket%'
  AND name NOT ILIKE '%panama%';

UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['udeng', 'traditional', 'headwear']))
WHERE lower(category) = 'headwear'
  AND item_type = 'misc'
  AND name ILIKE '%udeng%';

UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['shemagh', 'scarf', 'headwear']))
WHERE lower(category) = 'headwear'
  AND item_type = 'misc'
  AND (name ILIKE '%sorban%' OR name ILIKE '%shemagh%')
  AND name NOT ILIKE '%udeng%';

-- All remaining headwear misc
UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['headwear']))
WHERE lower(category) = 'headwear'
  AND item_type = 'misc'
  AND name NOT ILIKE '%udeng%'
  AND name NOT ILIKE '%sorban%'
  AND name NOT ILIKE '%shemagh%';

-- ---------------------------------------------------------------
-- ACCESSORIES
-- ---------------------------------------------------------------

UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['belt', 'accessories']))
WHERE lower(category) = 'accessories'
  AND subcategory = 'belt';

UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['sunglasses', 'eyewear', 'accessories']))
WHERE lower(category) = 'accessories'
  AND subcategory = 'eyewear'
  AND item_type = 'sunglasses';

UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['glasses', 'eyewear', 'accessories']))
WHERE lower(category) = 'accessories'
  AND subcategory = 'eyewear'
  AND (item_type = 'glasses' OR item_type = '');

UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['tie', 'necktie', 'accessories', 'formal']))
WHERE lower(category) = 'accessories'
  AND lower(subcategory) = 'tie';

UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['necklace', 'jewelry', 'accessories']))
WHERE lower(category) = 'accessories'
  AND subcategory = 'necklace';

UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['ring', 'jewelry', 'accessories']))
WHERE lower(category) = 'accessories'
  AND subcategory = 'ring';

UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['pocket square', 'accessories', 'formal']))
WHERE lower(category) = 'accessories'
  AND lower(subcategory) IN ('pocket-square', 'handkerchief');

UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['watch strap', 'strap', 'accessories']))
WHERE lower(category) = 'accessories'
  AND lower(subcategory) IN ('strap', 'watches');

UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['bracelet', 'wristwear', 'jewelry', 'accessories']))
WHERE lower(category) = 'accessories'
  AND subcategory = 'wristwear'
  AND item_type = 'bracelet';

UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['watch band', 'wristwear', 'accessories']))
WHERE lower(category) = 'accessories'
  AND subcategory = 'wristwear'
  AND item_type = 'band';

UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['belt', 'accessories']))
WHERE lower(category) = 'accessories'
  AND subcategory = 'misc'
  AND (name ILIKE '%belt%' OR name ILIKE '%ikat pinggang%' OR name ILIKE '%sabuk%');

UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['scarf', 'accessories']))
WHERE lower(category) = 'accessories'
  AND subcategory = 'misc'
  AND (name ILIKE '%scarf%' OR name ILIKE '%syal%')
  AND name NOT ILIKE '%belt%'
  AND name NOT ILIKE '%ikat pinggang%'
  AND name NOT ILIKE '%sabuk%';

UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['gloves', 'accessories']))
WHERE lower(category) = 'accessories'
  AND subcategory = 'misc'
  AND (name ILIKE '%gloves%' OR name ILIKE '%sarung tangan%')
  AND name NOT ILIKE '%belt%'
  AND name NOT ILIKE '%ikat pinggang%'
  AND name NOT ILIKE '%sabuk%'
  AND name NOT ILIKE '%scarf%'
  AND name NOT ILIKE '%syal%';

UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['tie', 'necktie', 'accessories', 'formal']))
WHERE lower(category) = 'accessories'
  AND subcategory = 'misc'
  AND (name ILIKE '%dasi%' OR name ILIKE '%tie%')
  AND name NOT ILIKE '%belt%'
  AND name NOT ILIKE '%ikat pinggang%'
  AND name NOT ILIKE '%sabuk%'
  AND name NOT ILIKE '%scarf%'
  AND name NOT ILIKE '%syal%'
  AND name NOT ILIKE '%gloves%'
  AND name NOT ILIKE '%sarung tangan%';

-- All remaining accessories misc
UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['accessories']))
WHERE lower(category) = 'accessories'
  AND subcategory = 'misc'
  AND name NOT ILIKE '%belt%'
  AND name NOT ILIKE '%ikat pinggang%'
  AND name NOT ILIKE '%sabuk%'
  AND name NOT ILIKE '%scarf%'
  AND name NOT ILIKE '%syal%'
  AND name NOT ILIKE '%gloves%'
  AND name NOT ILIKE '%sarung tangan%'
  AND name NOT ILIKE '%dasi%'
  AND name NOT ILIKE '%tie%';

-- ---------------------------------------------------------------
-- WATCHES
-- ---------------------------------------------------------------

UPDATE wardrobe_items
SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || ARRAY['watch', 'accessories']))
WHERE lower(category) = 'watches';
