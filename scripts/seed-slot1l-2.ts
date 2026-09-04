import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jotuoyzjekffadhrrroa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdHVveXpqZWtmZmFkaHJycm9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc1MTg2NCwiZXhwIjoyMDg4MzI3ODY0fQ.3HewsN4IIM_jIpQUnE6z7aJmc6jjjUcvxpqe46ZAkMM'
)

async function seed() {
  const { data, error } = await supabase
    .from('wardrobe_items')
    .insert({
      user_id: 'e087bcb0-c8b9-4628-a309-55889a3f8edb',
      wardrobe_id: 'a5fb3ae2-40c1-49a1-9a83-dd3b06b65fc5', // Slot-1L
      name: 'Navy Polo Shirt Dari Kantor',
      category: 'top',
      subcategory: 'inner',
      item_type: 'polo',
      color: 'Navy',
      image_url: '',
      status: 'verified',
      price: 0,
      purchase_date: '2017-01-01',
    })
    .select('id, name')
    .single()

  if (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }

  console.log(`✓ ${data.name} (${data.id})`)
}

seed()
