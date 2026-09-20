import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jotuoyzjekffadhrrroa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdHVveXpqZWtmZmFkaHJycm9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc1MTg2NCwiZXhwIjoyMDg4MzI3ODY0fQ.3HewsN4IIM_jIpQUnE6z7aJmc6jjjUcvxpqe46ZAkMM'
)

const items = [
  {
    name: 'Pepsodent Sikat Gigi Lipat Travel',
    description: 'Sikat gigi lipat untuk travel/camping',
    category: 'outdoor',
    image_url: 'https://down-id.img.susercontent.com/file/id-11134207-7r98o-lp6bsdy0bt6b8c_tn',
    purchase_price: 15100,
    status: 'verified',
  },
  {
    name: 'Lifebuoy Body Wash + Shampoo + Face Wash 3in1 250mL',
    description: 'Sabun mandi cair 3in1 lawan 99.9% kuman — travel size',
    category: 'outdoor',
    image_url: 'https://down-id.img.susercontent.com/file/239c3013adab15fcdebbc1faaa29fa52_tn',
    purchase_price: 36700,
    status: 'verified',
  },
  {
    name: 'MWB Handuk Morning Whistle Bamboo 34x80cm - Brown',
    description: 'Handuk sport/travel bambu 34x80cm warna Brown — Morning Whistle Bandung',
    category: 'outdoor',
    image_url: 'https://down-id.img.susercontent.com/file/505a00b891ee72d226007c002bd9dfd5_tn',
    purchase_price: 24900,
    status: 'verified',
  },
]

async function seed() {
  console.log(`Inserting ${items.length} items...`)

  const { data, error } = await supabase
    .from('hobby_items')
    .insert(items)
    .select('id, name, category')

  if (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }

  console.log('Inserted:')
  data?.forEach(item => console.log(`  ✓ [${item.category}] ${item.name} (${item.id})`))
}

seed()
