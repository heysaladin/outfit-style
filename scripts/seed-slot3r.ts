import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jotuoyzjekffadhrrroa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdHVveXpqZWtmZmFkaHJycm9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc1MTg2NCwiZXhwIjoyMDg4MzI3ODY0fQ.3HewsN4IIM_jIpQUnE6z7aJmc6jjjUcvxpqe46ZAkMM'
)

const USER_ID     = 'e087bcb0-c8b9-4628-a309-55889a3f8edb'
const WARDROBE_ID = 'b5af7325-7359-49cb-bc94-881da69de878' // Slot-3R

async function seed() {
  const { data, error } = await supabase
    .from('wardrobe_items')
    .insert([
      {
        user_id: USER_ID, wardrobe_id: WARDROBE_ID,
        name: 'Shorts Black Denim Stretch',
        category: 'bottom', subcategory: null, item_type: 'shorts',
        color: 'Black', image_url: '', status: 'verified', purchase_date: '2026-09-05',
      },
      {
        user_id: USER_ID, wardrobe_id: WARDROBE_ID,
        name: 'Shorts Khaki',
        category: 'bottom', subcategory: null, item_type: 'shorts',
        color: 'Khaki', image_url: '', status: 'verified', purchase_date: '2026-09-05',
      },
      {
        user_id: USER_ID, wardrobe_id: WARDROBE_ID,
        name: 'Shorts Broken White',
        category: 'bottom', subcategory: null, item_type: 'shorts',
        color: 'Off-White', image_url: '', status: 'verified', purchase_date: '2026-09-05',
      },
      {
        user_id: USER_ID, wardrobe_id: WARDROBE_ID,
        name: 'Shorts Mid-Gray Elastic',
        category: 'bottom', subcategory: null, item_type: 'shorts',
        color: 'Mid Gray', image_url: '', status: 'verified', purchase_date: '2026-09-05',
      },
      {
        user_id: USER_ID, wardrobe_id: WARDROBE_ID,
        name: 'Shorts Dark-Gray Elastic',
        category: 'bottom', subcategory: null, item_type: 'shorts',
        color: 'Dark Gray', image_url: '', status: 'verified', purchase_date: '2026-09-05',
      },
      {
        user_id: USER_ID, wardrobe_id: WARDROBE_ID,
        name: 'Sarung Olive',
        category: 'bottom', subcategory: null, item_type: 'sarung',
        color: 'Olive', image_url: '', status: 'verified', purchase_date: '2026-09-05',
      },
      {
        user_id: USER_ID, wardrobe_id: WARDROBE_ID,
        name: 'Sarung Greeny Beige Black Flowy',
        category: 'bottom', subcategory: null, item_type: 'sarung',
        color: 'Green Beige Black', image_url: '', status: 'verified', purchase_date: '2026-09-05',
      },
      {
        user_id: USER_ID, wardrobe_id: WARDROBE_ID,
        name: 'Sarung Burgundy',
        category: 'bottom', subcategory: null, item_type: 'sarung',
        color: 'Burgundy', image_url: '', status: 'verified', purchase_date: '2026-09-05',
      },
    ])
    .select('id, name')

  if (error) { console.error('Error:', error.message); process.exit(1) }
  console.log(`Inserted ${data?.length} items into Slot-3R:`)
  data?.forEach(i => console.log(`  ✓ ${i.name} (${i.id})`))
}

seed()
