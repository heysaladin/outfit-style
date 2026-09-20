import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jotuoyzjekffadhrrroa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdHVveXpqZWtmZmFkaHJycm9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc1MTg2NCwiZXhwIjoyMDg4MzI3ODY0fQ.3HewsN4IIM_jIpQUnE6z7aJmc6jjjUcvxpqe46ZAkMM'
)

async function run() {
  const { data, error } = await supabase
    .from('hobby_items')
    .update({ category: 'cooking' })
    .eq('id', '332cac3c-c8cb-4406-99cd-f6c17c1bb2d2')
    .select('id, name, category')

  if (error) { console.error('Error:', error.message); process.exit(1) }
  data?.forEach(i => console.log(`✓ [${i.category}] ${i.name} (${i.id})`))
}

run()
