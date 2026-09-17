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
      name: 'Silicone Ocean Strap Iwatch Apple Watch',
      category: 'fashion',
      subcategory: 'aksesori',
      color: 'Biru',
      purchase_date: '2023-03-24',
      price: 18200,
      image_url: 'https://images.tokopedia.net/img/cache/700/o3syd0/1997/1/1/43768d90a0c240f1a735306cb1369c79~.jpeg.webp',
      status: 'verified',
      wear_count: 5,
      target: 10,
    }])
    .select('id, name, price, purchase_date')

  if (error) { console.error(error.message); process.exit(1) }
  data?.forEach(i => console.log(`✓ ${i.name} — Rp${i.price} — ${i.purchase_date} (${i.id})`))
}

seed()
