import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jotuoyzjekffadhrrroa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdHVveXpqZWtmZmFkaHJycm9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc1MTg2NCwiZXhwIjoyMDg4MzI3ODY0fQ.3HewsN4IIM_jIpQUnE6z7aJmc6jjjUcvxpqe46ZAkMM'
)

const USER_ID = 'e087bcb0-c8b9-4628-a309-55889a3f8edb'

const wardrobes = [
  { code: 'sweaters-basket',      name: 'Sweaters Basket' },
  { code: 'box-bench',            name: 'Box Bench' },
  { code: 'box-military',         name: 'Box Military' },
  { code: 'box-outdoor-quickdry', name: 'Box Outdoor-Quickdry' },
  { code: 'box-daily-clothes',    name: 'Box Daily Clothes' },
  { code: 'slot-4l',              name: 'Slot-4L' },
  { code: 'slot-4r',              name: 'Slot-4R' },
  { code: 'slot-3l',              name: 'Slot-3L' },
  { code: 'slot-3r',              name: 'Slot-3R' },
  { code: 'slot-2l',              name: 'Slot-2L' },
  { code: 'slot-2r',              name: 'Slot-2R' },
  { code: 'slot-1l',              name: 'Slot-1L' },
  { code: 'slot-1r',              name: 'Slot-1R' },
  { code: 'shoe-glass',           name: 'Shoe-Glass' },
  { code: 'hat-shoe-cabinet',     name: 'Hat-Shoe Cabinet' },
  { code: 'hat-hanging',          name: 'Hat-Hanging' },
  { code: 'hanging-jacket-big',   name: 'Hanging-Jacket-Big' },
  { code: 'hanging-stopped',      name: 'Hanging-Stopped' },
]

async function seed() {
  const rows = wardrobes.map(w => ({ user_id: USER_ID, ...w }))

  const { data, error } = await supabase
    .from('wardrobes')
    .insert(rows)
    .select('id, name')

  if (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }

  console.log(`Inserted ${data?.length} wardrobes:`)
  data?.forEach(w => console.log(`  ✓ ${w.name} (${w.id})`))
}

seed()
