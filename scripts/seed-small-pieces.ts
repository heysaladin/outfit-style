import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jotuoyzjekffadhrrroa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdHVveXpqZWtmZmFkaHJycm9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc1MTg2NCwiZXhwIjoyMDg4MzI3ODY0fQ.3HewsN4IIM_jIpQUnE6z7aJmc6jjjUcvxpqe46ZAkMM'
)

const USER_ID = 'e087bcb0-c8b9-4628-a309-55889a3f8edb'

async function seed() {
  // 1. Insert wardrobe "small pieces"
  const { data: wardrobe, error: wardrobeError } = await supabase
    .from('wardrobes')
    .insert({
      user_id: USER_ID,
      code: 'small-pieces',
      name: 'Small Pieces',
    })
    .select('id, name')
    .single()

  if (wardrobeError) {
    console.error('Error inserting wardrobe:', wardrobeError.message)
    process.exit(1)
  }

  console.log(`Created wardrobe: ${wardrobe.name} (${wardrobe.id})`)

  // 2. Insert wardrobe items
  const items = [
    {
      user_id: USER_ID,
      wardrobe_id: wardrobe.id,
      name: 'Kaos Kaki Sepak Bola Hitam',
      category: 'footwear',
      subcategory: null,
      item_type: 'socks',
      color: 'Black',
      price: 20000,
      purchase_date: '2024-01-01',
      image_url: '',
    },
    {
      user_id: USER_ID,
      wardrobe_id: wardrobe.id,
      name: 'Shawl Beige',
      category: 'accessories',
      subcategory: null,
      item_type: 'shawl',
      color: 'Beige',
      price: 35000,
      purchase_date: '2024-01-01',
      image_url: '',
    },
    {
      user_id: USER_ID,
      wardrobe_id: wardrobe.id,
      name: 'Red Slayer',
      category: 'accessories',
      subcategory: null,
      item_type: 'bandana',
      color: 'Red',
      price: 10000,
      purchase_date: '2024-01-01',
      image_url: '',
    },
    {
      user_id: USER_ID,
      wardrobe_id: wardrobe.id,
      name: 'Baff Gray',
      category: 'accessories',
      subcategory: null,
      item_type: 'neck-gaiter',
      color: 'Gray',
      price: 10000,
      purchase_date: '2012-01-01',
      image_url: '',
    },
    {
      user_id: USER_ID,
      wardrobe_id: wardrobe.id,
      name: 'Udeng Bali Coklat',
      category: 'accessories',
      subcategory: null,
      item_type: 'headwear',
      color: 'Brown',
      price: 50000,
      purchase_date: '2018-01-01',
      image_url: '',
    },
  ]

  const { data, error } = await supabase
    .from('wardrobe_items')
    .insert(items)
    .select('id, name')

  if (error) {
    console.error('Error inserting items:', error.message)
    process.exit(1)
  }

  console.log('Inserted items:')
  data?.forEach(item => console.log(`  ✓ ${item.name} (${item.id})`))
}

seed()
