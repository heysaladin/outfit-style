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
        name: 'V-Neck T-Shirt Navy',
        category: 'top', subcategory: 'inner', item_type: 't-shirt',
        color: 'Navy', price: 25000, purchase_date: '2018-01-01',
        image_url: '', status: 'verified',
      },
      {
        user_id: USER_ID, wardrobe_id: WARDROBE_ID,
        name: 'V-Neck T-Shirt Black',
        category: 'top', subcategory: 'inner', item_type: 't-shirt',
        color: 'Black', price: 25000, purchase_date: '2018-01-01',
        image_url: '', status: 'verified',
      },
    ])
    .select('id, name')

  if (error) { console.error('Error:', error.message); process.exit(1) }
  data?.forEach(i => console.log(`  ✓ ${i.name} (${i.id})`))
}

seed()
