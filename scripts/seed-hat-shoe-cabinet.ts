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
      wardrobe_id: '2cb74193-ab1c-4eaf-9229-fdd8ca3e73f9', // Hat-Shoe Cabinet
      name: 'Espadrille Upper Toms',
      category: 'footwear',
      subcategory: null,
      item_type: 'shoes',
      color: 'Natural',
      brand: 'TOMS',
      image_url: '',
      status: 'verified',
      purchase_date: '2026-09-05',
    })
    .select('id, name')
    .single()

  if (error) { console.error('Error:', error.message); process.exit(1) }
  console.log(`✓ ${data.name} (${data.id}) → Hat-Shoe Cabinet`)
}

seed()
