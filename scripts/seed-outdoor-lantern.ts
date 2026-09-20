import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jotuoyzjekffadhrrroa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdHVveXpqZWtmZmFkaHJycm9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc1MTg2NCwiZXhwIjoyMDg4MzI3ODY0fQ.3HewsN4IIM_jIpQUnE6z7aJmc6jjjUcvxpqe46ZAkMM'
)

const items = [
  {
    name: 'TaffLED Lampu Lentera Camping Rechargeable',
    description: 'Senter lampu tenda charger — Malang Outdoor Store',
    category: 'outdoor',
    image_url: 'https://down-id.img.susercontent.com/file/id-11134207-7qul4-ljm01kbuao5rad_tn',
    purchase_price: 32500,
    status: 'verified',
  },
]

async function seed() {
  console.log(`Inserting ${items.length} item...`)

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
