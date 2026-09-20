import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jotuoyzjekffadhrrroa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdHVveXpqZWtmZmFkaHJycm9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc1MTg2NCwiZXhwIjoyMDg4MzI3ODY0fQ.3HewsN4IIM_jIpQUnE6z7aJmc6jjjUcvxpqe46ZAkMM'
)

const ids = [
  '504a23de-f108-4b84-b54b-f0582f5aece3',
  '6918f7ca-1fd7-4d2e-bebc-7bfde58544cd',
  '267fb713-17f9-43be-894e-a95842b467d4',
  '796ea5df-68c2-4610-ac20-fee5c6e202b9',
  '2d2b236f-d056-4fd1-9c1e-4409d9d7b543',
  'a950a380-6679-4295-b8ab-eafa86c6c3b3',
  '69a7cb95-ff83-4164-982b-953ace446564',
  '46ce494d-d10b-4ddf-a9ba-126290a272cc',
]

async function run() {
  const { data, error } = await supabase
    .from('hobby_items')
    .update({ category: 'outdoor' })
    .in('id', ids)
    .select('id, name, category')

  if (error) { console.error('Error:', error.message); process.exit(1) }

  console.log(`Updated ${data?.length} items to outdoor:`)
  data?.forEach(i => console.log(`  ✓ ${i.name} (${i.id})`))
}

run()
