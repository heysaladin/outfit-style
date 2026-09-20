import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jotuoyzjekffadhrrroa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdHVveXpqZWtmZmFkaHJycm9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc1MTg2NCwiZXhwIjoyMDg4MzI3ODY0fQ.3HewsN4IIM_jIpQUnE6z7aJmc6jjjUcvxpqe46ZAkMM'
)

const items = [
  // Social
  {
    name: 'Kabel Ties 2.5x100mm 100pcs',
    description: 'Nylon Cable Tie 10cm 2.5x100mm Insulock – Hitam',
    category: 'social',
    image_url: 'https://down-id.img.susercontent.com/file/id-11134207-7qul1-ljb1qev0841685_tn',
    purchase_price: 2699,
    status: 'verified',
  },
  {
    name: 'Sikat Sepatu Bulu Kuda Bulat',
    description: 'Sikat Premium Kuda Bulat Shoe Brush Cleaner Detailing Sepatu',
    category: 'social',
    image_url: 'https://down-id.img.susercontent.com/file/id-11134207-7r98x-ln4cptb73iie7e_tn',
    purchase_price: 22250,
    status: 'verified',
  },

  // Workout
  {
    name: 'SPEEDS Wrist Supporter XL',
    description: 'Pelindung Pergelangan Tangan Wrist Supporter Fitness 051-5 XL',
    category: 'workout',
    image_url: 'https://down-id.img.susercontent.com/file/cd15336810b1d677dac7236f8c15f804_tn',
    purchase_price: 10250,
    status: 'verified',
  },
  {
    name: 'Katrol Pulley Cable Home Gym 88mm',
    description: 'Single Katrol Pulley Cable Home Gym Bearing Pulley Wheel 88mm',
    category: 'workout',
    image_url: 'https://down-id.img.susercontent.com/file/sg-11134201-7rdyb-mbp1xwwltlwc6e_tn',
    purchase_price: 47999,
    status: 'verified',
  },
  {
    name: 'Hook Gantungan Tipe S',
    description: 'Gantungan Serba Guna Tipe S / Hook Letter Pendek',
    category: 'workout',
    image_url: 'https://down-id.img.susercontent.com/file/f5ca41ecdee8b5d9ffacdafe73c7432f_tn',
    purchase_price: 1800,
    status: 'verified',
  },
  {
    name: 'Tali Tambang Plastik PE 3mm 10m',
    description: 'Tali Tambang Plastik PE 3mm 10 Meter – HTBM',
    category: 'workout',
    image_url: 'https://down-id.img.susercontent.com/file/sg-11134201-22110-bf4k7rzlnikv3b_tn',
    purchase_price: 4700,
    status: 'verified',
  },
  {
    name: 'Alat Push Up Manual',
    description: 'Alat Push Up Manual Kuat dan Estetik (Satu Set)',
    category: 'workout',
    image_url: 'https://down-id.img.susercontent.com/file/id-11134207-7ra0s-md3b8nysbj24c5_tn',
    purchase_price: 35000,
    status: 'verified',
  },
  {
    name: 'Pull Up Bar 6 Grip + Samsak',
    description: 'Pull Up Bar Tebal + Gantungan Samsak 6 Grip',
    category: 'workout',
    image_url: 'https://down-id.img.susercontent.com/file/id-11134207-7r98z-ln51wf6hj09z03_tn',
    purchase_price: 112500,
    status: 'verified',
  },

  // Outdoor
  {
    name: 'Karet Ujung Tongkat Hiking',
    description: 'Karet Penutup Ujung Tongkat Hiking / Rubber End Tip Trekingpole T Pole 01',
    category: 'outdoor',
    image_url: 'https://down-id.img.susercontent.com/file/id-11134207-7r990-ltkmwez1s74232_tn',
    purchase_price: 5500,
    status: 'verified',
  },
  {
    name: 'Tracking Pole 135cm',
    description: 'Tongkat Pendakian Tracking Pole 135cm Second Like New',
    category: 'outdoor',
    image_url: 'https://down-id.img.susercontent.com/file/id-11134207-8224x-mjdgn1cb52pv8d_tn',
    purchase_price: 180000,
    status: 'verified',
  },
  {
    name: 'Waring Koja Ikan 60cm',
    description: 'Waring Koja Ikan Hitam / Karung Damil 60cm',
    category: 'outdoor',
    image_url: 'https://down-id.img.susercontent.com/file/id-11134207-81ztg-mejqfcug8qh069_tn',
    purchase_price: 5299,
    status: 'verified',
  },
  {
    name: 'Soft Lure Umpan Ikan Teri',
    description: 'Soft Lure Silicone Umpan Pancing Ikan Teri Menyala dalam Gelap',
    category: 'outdoor',
    image_url: 'https://down-id.img.susercontent.com/file/0f57a528be7efa8cadb4f9ee6e5cded4_tn',
    purchase_price: 3500,
    status: 'verified',
  },
]

async function seed() {
  console.log(`Inserting ${items.length} items...`)

  const { data, error } = await supabase
    .from('hobby_items')
    .insert(items)
    .select('id, name, category')

  if (error) { console.error('Error:', error.message); process.exit(1) }

  console.log('Inserted:')
  data?.forEach(i => console.log(`  ✓ [${i.category}] ${i.name} (${i.id})`))
}

seed()
