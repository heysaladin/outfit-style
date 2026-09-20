import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jotuoyzjekffadhrrroa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdHVveXpqZWtmZmFkaHJycm9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc1MTg2NCwiZXhwIjoyMDg4MzI3ODY0fQ.3HewsN4IIM_jIpQUnE6z7aJmc6jjjUcvxpqe46ZAkMM'
)

const items = [
  {
    name: 'Teropong Binocular 8x21',
    description: 'Teropong Jarak Jauh Binocular 8x21',
    category: 'outdoor',
    image_url: 'https://down-id.img.susercontent.com/file/id-11134207-7rasl-m53xqcfi17i835_tn',
    purchase_price: 39999,
    status: 'verified',
  },
  {
    name: 'Korek Api Sumbu Chrome',
    description: 'Korek Api Sumbu Chrome Polos, Mancis Pemantik Lighter',
    category: 'outdoor',
    image_url: 'https://down-id.img.susercontent.com/file/a16385f9c49ef92bb86db3bea7892f84_tn',
    purchase_price: 14999,
    status: 'verified',
  },
  {
    name: 'TrailTop Kursi Lipat Bulat Khaki',
    description: 'Kursi Lipat Outdoor Portable Camping Santai 150KG – Kursi Bulat Khaki',
    category: 'outdoor',
    image_url: 'https://down-id.img.susercontent.com/file/id-11134207-81zte-mfnfh6gxllag35_tn',
    purchase_price: 88986,
    status: 'verified',
  },
  {
    name: 'TrailTop Kursi Lipat L-Meja Kayu',
    description: 'Kursi Lipat Outdoor Portable Camping Santai 150KG – L-Meja Warna Kayu',
    category: 'outdoor',
    image_url: 'https://down-id.img.susercontent.com/file/id-11134207-7rbk3-ma3wa8iiih0288_tn',
    purchase_price: 88991,
    status: 'verified',
  },
  {
    name: 'Trackpro Azure Carrier 45+5L',
    description: 'Tas Carrier 45+5L Camping Gunung – Army Hitam Kuning',
    category: 'outdoor',
    image_url: 'https://down-id.img.susercontent.com/file/id-11134207-7r992-lpyll4dk0ucyfe_tn',
    purchase_price: 137610,
    status: 'verified',
  },
  {
    name: 'Mug Enamel Blirik Hijau',
    description: 'Cangkir Mug Enamel Lurik / Blirik Hijau',
    category: 'outdoor',
    image_url: 'https://down-id.img.susercontent.com/file/c362489b57314e67f98424df5ce41357_tn',
    purchase_price: 9000,
    status: 'verified',
  },
  {
    name: 'Emergency Blanket Thermal',
    description: 'Selimut Darurat Emergency Blanket Thermal – Putih',
    category: 'outdoor',
    image_url: 'https://down-id.img.susercontent.com/file/id-11134207-7r98s-loqa0ynhvjve9d_tn',
    purchase_price: 5998,
    status: 'verified',
  },
  {
    name: 'Kantong Air Portable 5L',
    description: 'Kantong Air Minum Portable Camping Water Storage 5L – Biru',
    category: 'outdoor',
    image_url: 'https://down-id.img.susercontent.com/file/sg-11134201-7ra17-m4n3bpvx5sacec_tn',
    purchase_price: 11800,
    status: 'verified',
  },
  {
    name: 'Pisau Lipat Stainless',
    description: 'Alat Dapur Serbaguna Pisau Lipat Stainless Anti Karat',
    category: 'outdoor',
    image_url: 'https://down-id.img.susercontent.com/file/id-11134207-7rbkc-m7kbdifqqa5of4_tn',
    purchase_price: 1830,
    status: 'verified',
  },
  {
    name: 'Set Alat Makan Stainless',
    description: 'Set Sendok Garpu Sumpit + Box Stainless Steel – Hijau',
    category: 'outdoor',
    image_url: 'https://down-id.img.susercontent.com/file/sg-11134201-7ra0u-mbhjy6j18w9ib4_tn',
    purchase_price: 5140,
    status: 'verified',
  },
  {
    name: 'Tali Paracord 7 Core 4mm',
    description: 'Tali Paracord 7 Core 4mm – Green Camouflage',
    category: 'outdoor',
    image_url: 'https://down-id.img.susercontent.com/file/id-11134207-7ra0h-mbwwxjv6i6hje1_tn',
    purchase_price: 1990,
    status: 'verified',
  },
  {
    name: 'Sedotan Stainless + Sikat',
    description: 'Sedotan Stainless Steel Ramah Lingkungan + Sikat Sedotan',
    category: 'outdoor',
    image_url: 'https://down-id.img.susercontent.com/file/575ab69d433d27e4ec3c7f275994e6ab_tn',
    purchase_price: 747,
    status: 'verified',
  },
  {
    name: 'Sedotan Stainless Bengkok',
    description: 'Sedotan Stainless Steel Bengkok Ramah Lingkungan',
    category: 'outdoor',
    image_url: 'https://down-id.img.susercontent.com/file/68403fcba2547ef0328d67cbcbe9576c_tn',
    purchase_price: 949,
    status: 'verified',
  },
  {
    name: 'DJDPlus Headlamp COB 2in1',
    description: 'Headlamp COB XPE Waterproof USB Rechargeable 1000mAh, Camping Hiking',
    category: 'outdoor',
    image_url: 'https://down-id.img.susercontent.com/file/id-11134207-7rbk1-ma25lc5levxs9d_tn',
    purchase_price: 13899,
    status: 'verified',
  },
  {
    name: 'Pasak Tenda 20cm',
    description: 'Pasak Tenda Pramuka & Barak 20cm',
    category: 'outdoor',
    image_url: 'https://down-id.img.susercontent.com/file/id-11134207-82251-mh1psu859mod9f_tn',
    purchase_price: 1346,
    status: 'verified',
  },
]

async function seed() {
  console.log(`Inserting ${items.length} outdoor items...`)

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
