import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jotuoyzjekffadhrrroa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdHVveXpqZWtmZmFkaHJycm9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc1MTg2NCwiZXhwIjoyMDg4MzI3ODY0fQ.3HewsN4IIM_jIpQUnE6z7aJmc6jjjUcvxpqe46ZAkMM'
)

const items = [
  {
    name: 'Sapiens',
    description: 'A Brief History of Humankind — Yuval Noah Harari',
    category: 'reading',
    image_url: 'https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg',
    status: 'verified',
  },
  {
    name: 'Homo Deus',
    description: 'A Brief History of Tomorrow — Yuval Noah Harari',
    category: 'reading',
    image_url: 'https://covers.openlibrary.org/b/isbn/9780062464316-L.jpg',
    status: 'verified',
  },
  {
    name: 'Psychology of Money',
    description: 'Timeless Lessons on Wealth, Greed, and Happiness — Morgan Housel',
    category: 'reading',
    image_url: 'https://covers.openlibrary.org/b/isbn/9780857197689-L.jpg',
    status: 'verified',
  },
]

async function seed() {
  console.log(`Inserting ${items.length} books...`)

  const { data, error } = await supabase
    .from('hobby_items')
    .insert(items)
    .select('id, name')

  if (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }

  console.log('Inserted:')
  data?.forEach(item => console.log(`  ✓ ${item.name} (${item.id})`))
}

seed()
