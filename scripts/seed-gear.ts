import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jotuoyzjekffadhrrroa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdHVveXpqZWtmZmFkaHJycm9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc1MTg2NCwiZXhwIjoyMDg4MzI3ODY0fQ.3HewsN4IIM_jIpQUnE6z7aJmc6jjjUcvxpqe46ZAkMM'
)

const items = [
  // Workout
  {
    name: 'Kettlebell 12KG',
    description: 'Bettergrow Neoprene Soft Kettlebell Hitam',
    category: 'workout',
    image_url: 'https://down-id.img.susercontent.com/file/id-11134207-81ztg-msdkr3ivcqgw84_tn',
    purchase_price: 223003,
    status: 'verified',
  },

  // Outdoor
  {
    name: 'Trosten Double Wall Glass 250ml',
    description: 'Borosilicate 2-layer heat-resistant glass',
    category: 'outdoor',
    image_url: 'https://down-id.img.susercontent.com/file/id-11134207-7r991-lueqq6a293h26c_tn',
    purchase_price: 32000,
    status: 'verified',
  },

  // Workspace
  {
    name: 'Polytron Audivo PHS 5B',
    description: 'Active Bookshelf Speaker',
    category: 'workspace',
    image_url: 'https://down-id.img.susercontent.com/file/id-11134207-81zth-mqplo0mtufpf37_tn',
    purchase_price: 1109000,
    status: 'verified',
  },
  {
    name: 'Synology HAT3300-4T 4TB',
    description: '3.5" SATA HDD Plus Series for NAS',
    category: 'workspace',
    image_url: 'https://down-id.img.susercontent.com/file/id-11134207-7ra0q-mdpifxez33wub4_tn',
    purchase_price: 4669000,
    status: 'verified',
  },
  {
    name: 'Synology DS723+',
    description: '2-Bay NAS (tanpa HDD)',
    category: 'workspace',
    image_url: 'https://down-id.img.susercontent.com/file/id-11134207-81ztk-mqtvgz8ew55903_tn',
    purchase_price: 5250000,
    status: 'verified',
  },
  {
    name: 'HDMI Virtual Dummy Plug',
    description: 'SANJI DDC EDID 4K UHD 1.4 Adapter',
    category: 'workspace',
    image_url: 'https://down-id.img.susercontent.com/file/id-11134207-822wo-mlcvntuii5tve6_tn',
    purchase_price: 11750,
    status: 'verified',
  },
  {
    name: 'Mac Mini M4 Pro',
    description: 'Apple Mac Mini M4 Pro 24GB/512GB 2024',
    category: 'workspace',
    image_url: 'https://down-id.img.susercontent.com/file/id-11134207-7rasi-m255ljqcu0fcbd_tn',
    purchase_price: 24999000,
    status: 'verified',
  },
]

async function seed() {
  console.log(`Inserting ${items.length} gear items...`)

  const { data, error } = await supabase
    .from('hobby_items')
    .insert(items)
    .select('id, name, category')

  if (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }

  console.log('Inserted:')
  data?.forEach(item => console.log(`  ✓ [${item.category}] ${item.name} (${item.id})`))
}

seed()
