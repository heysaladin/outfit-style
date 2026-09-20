import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jotuoyzjekffadhrrroa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdHVveXpqZWtmZmFkaHJycm9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc1MTg2NCwiZXhwIjoyMDg4MzI3ODY0fQ.3HewsN4IIM_jIpQUnE6z7aJmc6jjjUcvxpqe46ZAkMM'
)

const WARDROBE_ID = '332cac3c-c8cb-4406-99cd-f6c17c1bb2d2'

async function run() {
  // Insert into hobby_items
  const { data: inserted, error: insertErr } = await supabase
    .from('hobby_items')
    .insert({
      name: 'Apron/Celemek Anti Air dan Minyak',
      description: 'Celemek anti air dan minyak – Sakura Coksu',
      category: 'cooking',
      image_url: 'https://gw.alicdn.com/imgextra/O1CN016L11jd1x3kzfnqXZL_!!6000000006388-0-yinhe.jpg_540x540.jpg',
      purchase_price: 25000,
      purchase_date: '2025-12-12',
      status: 'verified',
    })
    .select('id, name, category')
    .single()

  if (insertErr) { console.error('Insert error:', insertErr.message); process.exit(1) }
  console.log(`✓ Inserted into hobby_items: [${inserted.category}] ${inserted.name} (${inserted.id})`)

  // Delete from wardrobe_items
  const { error: deleteErr } = await supabase
    .from('wardrobe_items')
    .delete()
    .eq('id', WARDROBE_ID)

  if (deleteErr) { console.error('Delete error:', deleteErr.message); process.exit(1) }
  console.log(`✓ Deleted from wardrobe_items (${WARDROBE_ID})`)
}

run()
