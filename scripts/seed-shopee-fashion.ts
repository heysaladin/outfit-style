import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jotuoyzjekffadhrrroa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdHVveXpqZWtmZmFkaHJycm9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc1MTg2NCwiZXhwIjoyMDg4MzI3ODY0fQ.3HewsN4IIM_jIpQUnE6z7aJmc6jjjUcvxpqe46ZAkMM'
)

const USER_ID = 'e087bcb0-c8b9-4628-a309-55889a3f8edb'

const items = [
  {
    user_id: USER_ID,
    name: 'Tas Handbag Hitam (Bekas)',
    category: 'fashion',
    subcategory: 'tas',
    color: 'Hitam',
    price: 10000,
    image_url: 'https://down-id.img.susercontent.com/file/id-11134207-7rbk1-m70i20guzpc9f4_tn',
    status: 'verified',
    wear_count: 0,
    target: 10,
  },
  {
    user_id: USER_ID,
    name: 'Kemeja Polos Unisex Pink (Bekas)',
    category: 'fashion',
    subcategory: 'atasan',
    color: 'Pink',
    price: 15000,
    image_url: 'https://down-id.img.susercontent.com/file/id-11134207-7rbka-m6jlpghc4nzwde_tn',
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
