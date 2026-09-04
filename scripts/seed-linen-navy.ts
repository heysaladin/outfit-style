import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jotuoyzjekffadhrrroa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdHVveXpqZWtmZmFkaHJycm9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc1MTg2NCwiZXhwIjoyMDg4MzI3ODY0fQ.3HewsN4IIM_jIpQUnE6z7aJmc6jjjUcvxpqe46ZAkMM'
)

const WRONG_ID    = '12c5b37f-114d-4105-b30e-e6ad09df021d' // created from wrong source, delete this
const ORIGINAL_ID = 'e268602d-d16d-4d46-801f-bf68a876e1ae' // Linen Shirt Olive Topten
const SLOT_4L_ID  = 'fee01474-5ea8-4945-9569-130c86e017cd'

async function seed() {
  // Delete wrong item
  const { error: delError } = await supabase.from('wardrobe_items').delete().eq('id', WRONG_ID)
  if (delError) { console.error('Delete error:', delError.message); process.exit(1) }
  console.log('Deleted wrong item.')

  // Fetch the correct original
  const { data: original, error: fetchError } = await supabase
    .from('wardrobe_items')
    .select('*')
    .eq('id', ORIGINAL_ID)
    .single()
  if (fetchError) { console.error('Fetch error:', fetchError.message); process.exit(1) }
  console.log('Original:', original.name)

  // Insert duplicate with navy color into Slot-4L
  const { id, created_at, updated_at, ...rest } = original
  const { data, error } = await supabase
    .from('wardrobe_items')
    .insert({
      ...rest,
      name: 'Linen Shirt Navy',
      color: 'Navy',
      wardrobe_id: SLOT_4L_ID,
      status: 'verified',
      image_url: '',
      original_image_url: null,
      wear_count: 0,
      last_worn: null,
    })
    .select('id, name')
    .single()

  if (error) { console.error('Insert error:', error.message); process.exit(1) }
  console.log(`✓ ${data.name} (${data.id}) → Slot-4L`)
}

seed()
