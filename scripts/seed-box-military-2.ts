import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jotuoyzjekffadhrrroa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdHVveXpqZWtmZmFkaHJycm9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc1MTg2NCwiZXhwIjoyMDg4MzI3ODY0fQ.3HewsN4IIM_jIpQUnE6z7aJmc6jjjUcvxpqe46ZAkMM'
)

const USER_ID     = 'e087bcb0-c8b9-4628-a309-55889a3f8edb'
const WARDROBE_ID = 'a3fb9b61-7081-4138-8caf-8b15150c4cc3' // Box Military

async function seed() {
  const { data, error } = await supabase
    .from('wardrobe_items')
    .insert([
      {
        user_id: USER_ID, wardrobe_id: WARDROBE_ID,
        name: 'Shorts Camo Dark Green',
        category: 'bottom', subcategory: null, item_type: 'shorts',
        color: 'Dark Green Camo', image_url: '', status: 'verified',
        purchase_date: '2026-09-05',
      },
      {
        user_id: USER_ID, wardrobe_id: WARDROBE_ID,
        name: 'Pants Combat Chocochip Pattern Desert',
        category: 'bottom', subcategory: null, item_type: 'trousers',
        color: 'Desert Chocochip', image_url: '', status: 'verified',
        purchase_date: '2026-09-05',
      },
    ])
    .select('id, name')

  if (error) { console.error('Error:', error.message); process.exit(1) }
  data?.forEach(i => console.log(`  ✓ ${i.name} (${i.id})`))
}

seed()
