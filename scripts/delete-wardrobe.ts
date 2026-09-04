import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jotuoyzjekffadhrrroa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdHVveXpqZWtmZmFkaHJycm9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc1MTg2NCwiZXhwIjoyMDg4MzI3ODY0fQ.3HewsN4IIM_jIpQUnE6z7aJmc6jjjUcvxpqe46ZAkMM'
)

async function run() {
  const { error } = await supabase
    .from('wardrobes')
    .delete()
    .eq('id', '8407af62-42c4-41b8-bc02-7ea195e1ced2') // Hanging-Jacket-Big

  if (error) { console.error('Error:', error.message); process.exit(1) }
  console.log('✓ Hanging-Jacket-Big deleted')
}

run()
