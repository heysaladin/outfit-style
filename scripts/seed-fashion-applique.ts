import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jotuoyzjekffadhrrroa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdHVveXpqZWtmZmFkaHJycm9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc1MTg2NCwiZXhwIjoyMDg4MzI3ODY0fQ.3HewsN4IIM_jIpQUnE6z7aJmc6jjjUcvxpqe46ZAkMM'
)

const USER_ID = 'e087bcb0-c8b9-4628-a309-55889a3f8edb'

const items = [
  {
    user_id: USER_ID,
    name: 'Aplikasi Bunga Bludru Import Korea 6cm - Maroon',
    category: 'fashion',
    subcategory: 'aksesori',
    color: 'Maroon',
    brand: 'tokomgstore_id',
    price: 7200,
    purchase_date: '2024-01-01',
    image_url: 'https://down-id.img.susercontent.com/file/8e7b089c6d58b66d4de38df30e0a3737_tn',
    status: 'verified',
    wear_count: 0,
    target: 10,
  },
  {
    user_id: USER_ID,
    name: 'Aplikasi Bunga Jeans Import - H (5cm)',
    category: 'fashion',
    subcategory: 'aksesori',
    color: 'Biru Denim',
    brand: 'tokomgstore_id',
    price: 8550,
    purchase_date: '2024-01-01',
    image_url: 'https://down-id.img.susercontent.com/file/cf03344ab23594b0a0852038492dd5ea_tn',
    status: 'verified',
    wear_count: 0,
    target: 10,
  },
]

async function seed() {
  console.log(`Inserting ${items.length} wardrobe items...`)

  const { data, error } = await supabase
    .from('wardrobe_items')
    .insert(items)
    .select('id, name, category, price')

  if (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }

  console.log('Inserted:')
  data?.forEach(item => console.log(`  ✓ [${item.category}] ${item.name} — Rp${item.price} (${item.id})`))
}

seed()
