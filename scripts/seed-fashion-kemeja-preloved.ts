import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jotuoyzjekffadhrrroa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdHVveXpqZWtmZmFkaHJycm9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc1MTg2NCwiZXhwIjoyMDg4MzI3ODY0fQ.3HewsN4IIM_jIpQUnE6z7aJmc6jjjUcvxpqe46ZAkMM'
)

const USER_ID = 'e087bcb0-c8b9-4628-a309-55889a3f8edb'

async function seed() {
  const { data, error } = await supabase
    .from('wardrobe_items')
    .insert([{
      user_id: USER_ID,
      name: 'Kemeja Lengan Panjang Preloved',
      category: 'fashion',
      subcategory: 'atasan',
      color: 'Tidak Diketahui',
      price: 22000,
      image_url: 'https://down-id.img.susercontent.com/file/id-11134207-7ra0m-mbnn24fjnhxs14_tn',
      status: 'verified',
      wear_count: 0,
      target: 10,
    }])
    .select('id, name, price')

  if (error) { console.error(error.message); process.exit(1) }
  data?.forEach(i => console.log(`✓ ${i.name} — Rp${i.price} (${i.id})`))
}

seed()
