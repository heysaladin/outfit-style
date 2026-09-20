import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jotuoyzjekffadhrrroa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdHVveXpqZWtmZmFkaHJycm9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc1MTg2NCwiZXhwIjoyMDg4MzI3ODY0fQ.3HewsN4IIM_jIpQUnE6z7aJmc6jjjUcvxpqe46ZAkMM'
)

const USER_ID = 'e087bcb0-c8b9-4628-a309-55889a3f8edb'

const items = [
  {
    user_id: USER_ID,
    name: 'Kaos Kaki Muslimah Jempol Panjang Selutut XL (Krem)',
    category: 'fashion',
    subcategory: 'aksesori',
    color: 'Krem',
    price: 11900,
    image_url: 'https://down-id.img.susercontent.com/file/sg-11134201-7rbkg-lm47zs935f6rfb_tn',
    status: 'verified',
    wear_count: 0,
    target: 10,
  },
  {
    user_id: USER_ID,
    name: 'Kaos Kaki Muslimah Jempol Panjang Selutut XL (Maroon)',
    category: 'fashion',
    subcategory: 'aksesori',
    color: 'Maroon',
    price: 11900,
    image_url: 'https://down-id.img.susercontent.com/file/sg-11134201-7rbms-lm47zsr4f0plfe_tn',
    status: 'verified',
    wear_count: 0,
    target: 10,
  },
  {
    user_id: USER_ID,
    name: 'Kaos Kaki Muslimah Jempol Panjang Selutut XL (Navy)',
    category: 'fashion',
    subcategory: 'aksesori',
    color: 'Navy',
    price: 11900,
    image_url: 'https://down-id.img.susercontent.com/file/sg-11134201-7rbl5-lm47ztepgimx51_tn',
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
    .select('id, name, price')

  if (error) { console.error(error.message); process.exit(1) }
  data?.forEach(i => console.log(`  ✓ ${i.name} — Rp${i.price} (${i.id})`))
}

seed()
