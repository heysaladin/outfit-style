import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jotuoyzjekffadhrrroa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdHVveXpqZWtmZmFkaHJycm9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc1MTg2NCwiZXhwIjoyMDg4MzI3ODY0fQ.3HewsN4IIM_jIpQUnE6z7aJmc6jjjUcvxpqe46ZAkMM'
)

const USER_ID     = 'e087bcb0-c8b9-4628-a309-55889a3f8edb'
const WARDROBE_ID = '6e7e4f07-e094-446e-973c-0c890beffd29' // Box Daily Clothes

async function seed() {
  const { data, error } = await supabase
    .from('wardrobe_items')
    .insert([
      {
        user_id: USER_ID, wardrobe_id: WARDROBE_ID,
        name: 'Shorts Khaki Elastic',
        category: 'bottom', subcategory: null, item_type: 'shorts',
        color: 'Khaki', image_url: '', status: 'verified',
        purchase_date: '2026-09-05',
      },
      {
        user_id: USER_ID, wardrobe_id: WARDROBE_ID,
        name: 'Long Sleeve Racing T-Shirt',
        category: 'top', subcategory: 'inner', item_type: 't-shirt',
        color: 'Mixed', image_url: '', status: 'verified',
        purchase_date: '2026-09-05',
      },
      {
        user_id: USER_ID, wardrobe_id: WARDROBE_ID,
        name: 'Barong Sleeveless Green',
        category: 'top', subcategory: 'inner', item_type: 'misc',
        color: 'Green', image_url: '', status: 'verified',
        purchase_date: '2026-09-05',
      },
      {
        user_id: USER_ID, wardrobe_id: WARDROBE_ID,
        name: 'White Graphic Tee',
        category: 'top', subcategory: 'inner', item_type: 't-shirt',
        color: 'White', image_url: '', status: 'verified',
        purchase_date: '2026-09-05',
      },
      {
        user_id: USER_ID, wardrobe_id: WARDROBE_ID,
        name: 'Sleeveless Black T-Shirt Anchor Graphic',
        category: 'top', subcategory: 'inner', item_type: 't-shirt',
        color: 'Black', image_url: '', status: 'verified',
        purchase_date: '2026-09-05',
      },
    ])
    .select('id, name')

  if (error) { console.error('Error:', error.message); process.exit(1) }
  console.log(`Inserted ${data?.length} items into Box Daily Clothes:`)
  data?.forEach(i => console.log(`  ✓ ${i.name} (${i.id})`))
}

seed()
