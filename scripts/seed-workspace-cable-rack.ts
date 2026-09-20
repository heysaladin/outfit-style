import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jotuoyzjekffadhrrroa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdHVveXpqZWtmZmFkaHJycm9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc1MTg2NCwiZXhwIjoyMDg4MzI3ODY0fQ.3HewsN4IIM_jIpQUnE6z7aJmc6jjjUcvxpqe46ZAkMM'
)

const items = [
  {
    name: 'POSTIGA Rak Kabel Cable Management Under Desk - Putih',
    description: 'Rak penyimpanan kabel under desk stainless steel — All For Work Indonesia',
    category: 'workspace',
    image_url: 'https://down-id.img.susercontent.com/file/sg-11134201-23010-sv33hmdbf1lva5_tn',
    purchase_price: 178620,
    purchase_date: '2023-12-01',
    status: 'verified',
  },
]

async function seed() {
  console.log(`Inserting ${items.length} item...`)

  const { data, error } = await supabase
    .from('hobby_items')
    .insert(items)
    .select('id, name, category')

  if (error) { console.error('Error:', error.message); process.exit(1) }
  data?.forEach(i => console.log(`  ✓ [${i.category}] ${i.name} (${i.id})`))
}

seed()
