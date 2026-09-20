import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jotuoyzjekffadhrrroa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdHVveXpqZWtmZmFkaHJycm9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc1MTg2NCwiZXhwIjoyMDg4MzI3ODY0fQ.3HewsN4IIM_jIpQUnE6z7aJmc6jjjUcvxpqe46ZAkMM'
)

async function run() {
  // 1. Insert new item
  const { data, error } = await supabase
    .from('hobby_items')
    .insert([{
      name: 'Tas Kabel Data USB Charger Travel Pouch Organizer Earphone',
      description: 'Dompet pouch organizer kabel, earphone, charger untuk travel — Ming Kopi Jakarta',
      category: 'outdoor',
      image_url: 'https://down-id.img.susercontent.com/file/cb97c7f33b23773ae82c08cdb628f922_tn',
      purchase_price: 29500,
      status: 'verified',
    }])
    .select('id, name, category')

  if (error) { console.error('Insert error:', error.message); process.exit(1) }
  data?.forEach(i => console.log(`  ✓ [${i.category}] ${i.name} (${i.id})`))

  // 2. Move Travel Bag Storage Kosmetik from social to outdoor
  const { data: found, error: findErr } = await supabase
    .from('hobby_items')
    .select('id, name, category')
    .ilike('name', '%Travel Bag Storage Kosmetik%')
    .eq('category', 'social')

  if (findErr) { console.error('Find error:', findErr.message); process.exit(1) }
  if (!found?.length) { console.log('  ⚠ Travel Bag Storage Kosmetik not found in social'); return }

  const { error: updateErr } = await supabase
    .from('hobby_items')
    .update({ category: 'outdoor' })
    .in('id', found.map(i => i.id))

  if (updateErr) { console.error('Update error:', updateErr.message); process.exit(1) }
  found.forEach(i => console.log(`  → Moved [social→outdoor] ${i.name} (${i.id})`))
}

run()
