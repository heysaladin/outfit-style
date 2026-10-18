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
      name: 'Apple Watch Leather Link',
      category: 'accessories',
      subcategory: 'strap',
      color: 'Tan',
      purchase_date: '2023-03-24',
      price: 0,
      image_url: 'https://strapology.co.uk/cdn/shop/products/9.png?v=1738042186',
      status: 'verified',
      wear_count: 0,
      target: 0,
    }])
    .select('id, name, color, purchase_date')

  if (error) { console.error(error.message); process.exit(1) }
  data?.forEach(i => console.log(`✓ ${i.name} — ${i.color} — ${i.purchase_date} (${i.id})`))
}

seed()
