import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jotuoyzjekffadhrrroa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdHVveXpqZWtmZmFkaHJycm9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc1MTg2NCwiZXhwIjoyMDg4MzI3ODY0fQ.3HewsN4IIM_jIpQUnE6z7aJmc6jjjUcvxpqe46ZAkMM'
)

async function run() {
  const { data, error } = await supabase
    .from('hobby_items')
    .insert({
      name: 'Arctic Hunter B00120 Backpack Laptop',
      description: 'Tas Ransel Backpack Laptop Kerja 15.6 Inch USB – Grey',
      category: 'outdoor',
      image_url: null,
      purchase_price: 200000,
      purchase_date: '2020-12-01',
      status: 'verified',
    })
    .select('id, name, category')
    .single()

  if (error) { console.error('Error:', error.message); process.exit(1) }
  console.log(`✓ [${data.category}] ${data.name} (${data.id})`)
}

run()
