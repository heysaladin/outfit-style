import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jotuoyzjekffadhrrroa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdHVveXpqZWtmZmFkaHJycm9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc1MTg2NCwiZXhwIjoyMDg4MzI3ODY0fQ.3HewsN4IIM_jIpQUnE6z7aJmc6jjjUcvxpqe46ZAkMM'
)

const items = [
  // Outdoor
  {
    name: 'Sekop Mini Taman',
    description: 'Skop Taman Mini Gagang Plastik',
    category: 'outdoor',
    image_url: 'https://down-id.img.susercontent.com/file/9e2638bd3840cdbc80a71ead9f177e43_tn',
    purchase_price: 8820,
    status: 'verified',
  },
  {
    name: 'Naturehike NH20PJ025 Matras Duduk',
    description: 'Matras Duduk Lipat Empuk – Army Green',
    category: 'outdoor',
    image_url: 'https://down-id.img.susercontent.com/file/id-11134207-7rbkd-m66mvkzrc3a595_tn',
    purchase_price: 50000,
    status: 'verified',
  },
  {
    name: 'Firemaple Frost 900ml',
    description: 'Panci Camping Gantung Aluminium Hanging Pot',
    category: 'outdoor',
    image_url: 'https://down-id.img.susercontent.com/file/sg-11134201-7rdwp-mcivyfdrtv7y75_tn',
    purchase_price: 249000,
    status: 'verified',
  },

  // Workout
  {
    name: 'Handle Pull Up',
    description: 'Alat Handle Pull Up Olahraga di Rumah',
    category: 'workout',
    image_url: 'https://down-id.img.susercontent.com/file/id-11134207-8224q-mh1l7rznug3x80_tn',
    purchase_price: 37000,
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
