import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jotuoyzjekffadhrrroa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdHVveXpqZWtmZmFkaHJycm9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc1MTg2NCwiZXhwIjoyMDg4MzI3ODY0fQ.3HewsN4IIM_jIpQUnE6z7aJmc6jjjUcvxpqe46ZAkMM'
)

const USER_ID    = 'e087bcb0-c8b9-4628-a309-55889a3f8edb'
const WARDROBE_ID = '01adb4c7-da8f-460b-96cc-6cc22742a8a0' // Slot-2L
const TODAY      = '2026-09-05'

const items = [
  {
    name: 'Denim Jacket Type II Raw Denim',
    category: 'top',
    subcategory: 'outer',
    item_type: 'jacket',
    color: 'Raw Denim',
    price: 275000,
    purchase_date: TODAY,
  },
  {
    name: 'Denim Jacket Type I Medium Wash',
    category: 'top',
    subcategory: 'outer',
    item_type: 'jacket',
    color: 'Medium Wash Blue',
    price: 230000,
    purchase_date: TODAY,
  },
  {
    name: 'Khaki Chino Loose',
    category: 'bottom',
    subcategory: null,
    item_type: 'chino',
    color: 'Khaki',
    price: null,
    purchase_date: TODAY,
  },
  {
    name: 'Khaki Chino Slim Fit',
    category: 'bottom',
    subcategory: null,
    item_type: 'chino',
    color: 'Khaki',
    price: null,
    purchase_date: TODAY,
  },
  {
    name: 'Plaid Micro Black White Short Sleeve Shirt',
    category: 'top',
    subcategory: 'inner',
    item_type: 'shirt',
    color: 'Black White Plaid',
    price: null,
    purchase_date: TODAY,
  },
  {
    name: 'Floral Black Shirt Shortsleeve',
    category: 'top',
    subcategory: 'inner',
    item_type: 'shirt',
    color: 'Black Floral',
    price: null,
    purchase_date: TODAY,
  },
  {
    name: 'Sarung Hitam Shaphere',
    category: 'bottom',
    subcategory: null,
    item_type: 'sarung',
    color: 'Black',
    price: 100000,
    purchase_date: '2014-01-01',
  },
  {
    name: 'Sarung Hijau',
    category: 'bottom',
    subcategory: null,
    item_type: 'sarung',
    color: 'Green',
    price: 0,
    purchase_date: '2023-01-01',
  },
]

async function seed() {
  const rows = items.map(item => ({
    user_id: USER_ID,
    wardrobe_id: WARDROBE_ID,
    image_url: '',
    status: 'verified',
    ...item,
  }))

  const { data, error } = await supabase
    .from('wardrobe_items')
    .insert(rows)
    .select('id, name')

  if (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }

  console.log(`Inserted ${data?.length} items into Slot-2L:`)
  data?.forEach(i => console.log(`  ✓ ${i.name} (${i.id})`))
}

seed()
