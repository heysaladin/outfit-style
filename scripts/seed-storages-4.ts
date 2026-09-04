import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jotuoyzjekffadhrrroa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdHVveXpqZWtmZmFkaHJycm9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc1MTg2NCwiZXhwIjoyMDg4MzI3ODY0fQ.3HewsN4IIM_jIpQUnE6z7aJmc6jjjUcvxpqe46ZAkMM'
)

const USER_ID = 'e087bcb0-c8b9-4628-a309-55889a3f8edb'

async function seed() {
  const { data, error } = await supabase
    .from('wardrobes')
    .insert([
      { user_id: USER_ID, code: 'all-black', name: 'ALL-BLACK' },
      { user_id: USER_ID, code: 'all-white', name: 'ALL-WHITE' },
    ])
    .select('id, name')

  if (error) { console.error('Error:', error.message); process.exit(1) }
  data?.forEach(w => console.log(`  ✓ ${w.name} (${w.id})`))
}

seed()
