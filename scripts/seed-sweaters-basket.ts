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
      wardrobe_id: '44dbef3f-f4bb-4611-9576-9a262fa07560', // Sweaters Basket
      name: 'Jogger Pants Converse Black M',
      category: 'bottom',
      subcategory: null,
      item_type: 'jogger',
      color: 'Black',
      brand: 'Converse',
      price: 150000,
      purchase_date: '2024-01-01',
      image_url: '',
      status: 'verified',
    })
    .select('id, name')
    .single()

  if (error) { console.error('Error:', error.message); process.exit(1) }
  console.log(`✓ ${data.name} (${data.id}) → Sweaters Basket`)
}

seed()
