import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jotuoyzjekffadhrrroa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdHVveXpqZWtmZmFkaHJycm9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc1MTg2NCwiZXhwIjoyMDg4MzI3ODY0fQ.3HewsN4IIM_jIpQUnE6z7aJmc6jjjUcvxpqe46ZAkMM'
)

const toOutdoor = [
  '10917369-e05a-48f7-96b8-51b0c8b47d97',
  '2f6c1f89-451a-459f-a56d-031d565e0471',
  '72e9104c-5e1f-426c-98d1-4c7dc6caa99c',
  '990f9235-2c71-413b-8d27-539f56de4611',
]

const toSocial = [
  '03e3c17b-2954-49a5-8f46-991ed7220cf4',
  '54ae4702-d367-417e-8298-94c59d3c269c',
]

async function moveItems(ids: string[], targetCategory: string) {
  const { data: items, error: fetchErr } = await supabase
    .from('wardrobe_items')
    .select('id, name, image_url, price, purchase_date')
    .in('id', ids)

  if (fetchErr) { console.error('Fetch error:', fetchErr.message); process.exit(1) }

  const toInsert = items!.map(i => ({
    name: i.name,
    category: targetCategory,
    image_url: i.image_url ?? null,
    purchase_price: i.price ?? null,
    purchase_date: i.purchase_date ?? null,
    status: 'verified',
  }))

  const { data: inserted, error: insertErr } = await supabase
    .from('hobby_items')
    .insert(toInsert)
    .select('id, name, category')

  if (insertErr) { console.error('Insert error:', insertErr.message); process.exit(1) }

  inserted!.forEach(i => console.log(`  ✓ [${i.category}] ${i.name} (${i.id})`))

  const { error: deleteErr } = await supabase
    .from('wardrobe_items')
    .delete()
    .in('id', ids)

  if (deleteErr) { console.error('Delete error:', deleteErr.message); process.exit(1) }
  console.log(`  → Deleted ${ids.length} items from wardrobe_items`)
}

async function run() {
  console.log('Moving to outdoor:')
  await moveItems(toOutdoor, 'outdoor')

  console.log('Moving to social:')
  await moveItems(toSocial, 'social')
}

run()
