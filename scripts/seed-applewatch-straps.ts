import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jotuoyzjekffadhrrroa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdHVveXpqZWtmZmFkaHJycm9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc1MTg2NCwiZXhwIjoyMDg4MzI3ODY0fQ.3HewsN4IIM_jIpQUnE6z7aJmc6jjjUcvxpqe46ZAkMM'
)

const USER_ID = 'e087bcb0-c8b9-4628-a309-55889a3f8edb'

async function seed() {
  const { data, error } = await supabase
    .from('wardrobe_items')
    .insert([
      {
        user_id: USER_ID,
        name: 'Apple Watch Nike Sport Band Anthracite Black',
        category: 'accessories',
        subcategory: 'strap',
        color: 'Hitam Anthracite',
        purchase_date: '2023-03-24',
        price: 0,
        image_url: 'https://static.alaneesqatar.qa/2021/10/Apple-Watch-40mm-Anthracite-Black-Nike-Sport-Band-Regular-new-1.png',
        status: 'verified',
        wear_count: 0,
        target: 0,
      },
      {
        user_id: USER_ID,
        name: 'Keyo Apple Watch Silicone Strap',
        category: 'accessories',
        subcategory: 'strap',
        color: 'Hitam',
        purchase_date: '2023-03-24',
        price: 0,
        image_url: 'https://upload.jaknot.com/2025/06/images/products/4c0dd6/original/keyo-strap-apple-watch-se-ultra-silikon-42mm-44mm-45mm-49mm-s-m-k-49.jpg',
        status: 'verified',
        wear_count: 0,
        target: 0,
      },
      {
        user_id: USER_ID,
        name: 'Apple Watch Sport Band Pink Sand',
        category: 'accessories',
        subcategory: 'strap',
        color: 'Pink Sand',
        purchase_date: '2023-03-24',
        price: 0,
        image_url: 'https://images.mobilefun.co.uk/graphics/450pixelp/86803.jpg',
        status: 'verified',
        wear_count: 0,
        target: 0,
      },
    ])
    .select('id, name, color, purchase_date')

  if (error) { console.error(error.message); process.exit(1) }
  data?.forEach(i => console.log(`✓ ${i.name} — ${i.color} — ${i.purchase_date} (${i.id})`))
}

seed()
