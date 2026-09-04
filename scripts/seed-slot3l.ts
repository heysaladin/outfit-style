import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jotuoyzjekffadhrrroa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdHVveXpqZWtmZmFkaHJycm9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc1MTg2NCwiZXhwIjoyMDg4MzI3ODY0fQ.3HewsN4IIM_jIpQUnE6z7aJmc6jjjUcvxpqe46ZAkMM'
)

const USER_ID     = 'e087bcb0-c8b9-4628-a309-55889a3f8edb'
const WARDROBE_ID = '941919b7-29ab-4a4e-923f-4836282dbd71' // Slot-3L

async function seed() {
  const { data, error } = await supabase
    .from('wardrobe_items')
    .insert([
      {
        user_id: USER_ID, wardrobe_id: WARDROBE_ID,
        name: 'Brief Underwear Black',
        category: 'bottom', subcategory: null, item_type: 'underwear',
        color: 'Black', price: 15000, purchase_date: '2024-01-01',
        image_url: '', status: 'verified',
      },
      {
        user_id: USER_ID, wardrobe_id: WARDROBE_ID,
        name: 'Brief Underwear Navy',
        category: 'bottom', subcategory: null, item_type: 'underwear',
        color: 'Navy', price: 15000, purchase_date: '2024-01-01',
        image_url: '', status: 'verified',
      },
      {
        user_id: USER_ID, wardrobe_id: WARDROBE_ID,
        name: 'Brief Underwear Dark Grey',
        category: 'bottom', subcategory: null, item_type: 'underwear',
        color: 'Dark Gray', price: 15000, purchase_date: '2024-01-01',
        image_url: '', status: 'verified',
      },
    ])
    .select('id, name')

  if (error) { console.error('Error:', error.message); process.exit(1) }
  console.log(`Inserted ${data?.length} items into Slot-3L:`)
  data?.forEach(i => console.log(`  ✓ ${i.name} (${i.id})`))
}

seed()
