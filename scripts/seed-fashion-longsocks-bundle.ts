import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jotuoyzjekffadhrrroa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdHVveXpqZWtmZmFkaHJycm9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc1MTg2NCwiZXhwIjoyMDg4MzI3ODY0fQ.3HewsN4IIM_jIpQUnE6z7aJmc6jjjUcvxpqe46ZAkMM'
)

const USER_ID = 'e087bcb0-c8b9-4628-a309-55889a3f8edb'

const base = {
  user_id: USER_ID,
  category: 'fashion',
  subcategory: 'aksesori',
  price: 3960,
  purchase_date: '2024-09-09',
  image_url: 'https://down-id.img.susercontent.com/file/id-11134207-7r991-lzivm535ctns2e_tn',
  status: 'verified',
  wear_count: 0,
  target: 10,
}

const items = [
  { ...base, name: 'Kaos Kaki Panjang Polos Unisex (Putih) #1', color: 'Putih' },
  { ...base, name: 'Kaos Kaki Panjang Polos Unisex (Putih) #2', color: 'Putih' },
  { ...base, name: 'Kaos Kaki Panjang Polos Unisex (Hitam) #1', color: 'Hitam' },
  { ...base, name: 'Kaos Kaki Panjang Polos Unisex (Hitam) #2', color: 'Hitam' },
  { ...base, name: 'Kaos Kaki Panjang Polos Unisex (Abu-abu)', color: 'Abu-abu' },
]

async function seed() {
  console.log(`Inserting ${items.length} wardrobe items...`)
  const { data, error } = await supabase
    .from('wardrobe_items')
    .insert(items)
    .select('id, name, price')

  if (error) { console.error(error.message); process.exit(1) }
  data?.forEach(i => console.log(`  ✓ ${i.name} — Rp${i.price} (${i.id})`))
}

seed()
