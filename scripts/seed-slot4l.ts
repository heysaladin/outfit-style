import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jotuoyzjekffadhrrroa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdHVveXpqZWtmZmFkaHJycm9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc1MTg2NCwiZXhwIjoyMDg4MzI3ODY0fQ.3HewsN4IIM_jIpQUnE6z7aJmc6jjjUcvxpqe46ZAkMM'
)

const USER_ID     = 'e087bcb0-c8b9-4628-a309-55889a3f8edb'
const WARDROBE_ID = 'fee01474-5ea8-4945-9569-130c86e017cd' // Slot-4L

async function seed() {
  const { data, error } = await supabase
    .from('wardrobe_items')
    .insert([
      {
        user_id: USER_ID,
        wardrobe_id: WARDROBE_ID,
        name: 'Short Sleeve Shirt Shanghai Collar Gray Pattern',
        category: 'top',
        subcategory: 'inner',
        item_type: 'shirt',
        color: 'Gray Pattern',
        image_url: '',
        status: 'verified',
        purchase_date: '2026-09-05',
      },
      {
        user_id: USER_ID,
        wardrobe_id: WARDROBE_ID,
        name: 'Kemeja Dress Shirt Blue Stripe White',
        category: 'top',
        subcategory: 'inner',
        item_type: 'shirt',
        color: 'Blue White Stripe',
        image_url: '',
        status: 'verified',
        purchase_date: '2026-09-05',
      },
      {
        user_id: USER_ID,
        wardrobe_id: WARDROBE_ID,
        name: 'Kemeja Blue Mind Stanley Adam',
        category: 'top',
        subcategory: 'inner',
        item_type: 'shirt',
        color: 'Blue',
        image_url: '',
        status: 'verified',
        purchase_date: '2026-09-05',
      },
    ])
    .select('id, name')

  if (error) { console.error('Error:', error.message); process.exit(1) }
  console.log(`Inserted ${data?.length} items into Slot-4L:`)
  data?.forEach(i => console.log(`  ✓ ${i.name} (${i.id})`))
}

seed()
