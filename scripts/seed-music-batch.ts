import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jotuoyzjekffadhrrroa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdHVveXpqZWtmZmFkaHJycm9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc1MTg2NCwiZXhwIjoyMDg4MzI3ODY0fQ.3HewsN4IIM_jIpQUnE6z7aJmc6jjjUcvxpqe46ZAkMM'
)

const items = [
  {
    name: 'Cadenza Bass 30B Ampli Akustik Elektrik (Putih)',
    description: 'Amplifier bass electric acoustic speaker 6 inch 20 watt custom',
    category: 'music',
    image_url: 'https://down-id.img.susercontent.com/file/id-11134207-7qul6-lizlelgirkh6a8_tn',
    purchase_price: 547500,
    status: 'verified',
  },
  {
    name: 'TaffSTUDIO Mount Gantungan Dinding Gitar GF-011 (Black)',
    description: 'Back holder rack gitar dinding',
    category: 'music',
    image_url: 'https://down-id.img.susercontent.com/file/dce7da24b1eb8dbbf5ab54f19841a98f_tn',
    purchase_price: 18700,
    status: 'verified',
  },
  {
    name: 'TaffSTUDIO Headphone Stand Hanger NB-Z3 (Black)',
    description: 'Universal gaming studio headphone stand bracket',
    category: 'music',
    image_url: 'https://down-id.img.susercontent.com/file/56c62e3d0fd68a511153f31bd9128fd9_tn',
    purchase_price: 33700,
    status: 'verified',
  },
  {
    name: 'TaffSTUDIO Stand Gitar Long Neck HK00433 (Black)',
    description: 'Stand gitar long neck',
    category: 'music',
    image_url: 'https://down-id.img.susercontent.com/file/50acc723625b4f85c1b4e0360e93e5cf_tn',
    purchase_price: 59700,
    status: 'verified',
  },
  {
    name: 'BABYBOZ AUX Connector 3.5mm to 6.35mm (Type 1)',
    description: 'TRS plug to jack audio stereo adapter converter gold plated',
    category: 'music',
    image_url: 'https://down-id.img.susercontent.com/file/c0dcb0f154cd35bca3a632e4e757f0fc_tn',
    purchase_price: 5700,
    status: 'verified',
  },
  {
    name: 'BABYBOZ AUX Connector 3.5mm to 6.35mm (Type 2)',
    description: 'TRS plug to jack audio stereo adapter converter gold plated',
    category: 'music',
    image_url: 'https://down-id.img.susercontent.com/file/86d9c4861d5d39ea42f8f93bd5c888bc_tn',
    purchase_price: 8500,
    status: 'verified',
  },
  {
    name: 'BABYBOZ SLOZZ Capo Gitar Aluminum Alloy (Dark Wood)',
    description: 'Capo gitar dengan bridge pin remover',
    category: 'music',
    image_url: 'https://down-id.img.susercontent.com/file/7e649126ae3bd724cdb420da11882c3e_tn',
    purchase_price: 24500,
    status: 'verified',
  },
  {
    name: 'Rubber Strap Lock Gitar Skuffs (Hitam)',
    description: 'Strap lock karet untuk gitar akustik, elektrik, dan bass',
    category: 'music',
    image_url: 'https://down-id.img.susercontent.com/file/id-11134201-23020-b5v07konq2nvb5_tn',
    purchase_price: 10000,
    status: 'verified',
  },
  {
    name: 'Strap Gitar & Bass Army Deluxe Skuffs (Standard)',
    description: 'Strap gitar dan bass army deluxe',
    category: 'music',
    image_url: 'https://down-id.img.susercontent.com/file/sg-11134201-22100-g6w4r6sbmkiv9d_tn',
    purchase_price: 45000,
    status: 'verified',
  },
  {
    name: 'Advance Microphone Double Wireless MIC-206',
    description: 'Microphone wireless double',
    category: 'music',
    image_url: 'https://down-id.img.susercontent.com/file/id-11134207-7r98r-lndj0nsq4m8618_tn',
    purchase_price: 190500,
    status: 'verified',
  },
  {
    name: 'Tas Gitar Jumbo Import',
    description: 'Tas gitar model jumbo berkualitas original',
    category: 'music',
    image_url: 'https://down-id.img.susercontent.com/file/5e0fb88b9b28cfac3129e8f5ddaddac5_tn',
    purchase_price: 195000,
    status: 'verified',
  },
]

async function seed() {
  console.log(`Inserting ${items.length} music items...`)
  const { data, error } = await supabase
    .from('hobby_items')
    .insert(items)
    .select('id, name, purchase_price')

  if (error) { console.error(error.message); process.exit(1) }
  data?.forEach(i => console.log(`  ✓ ${i.name} — Rp${i.purchase_price} (${i.id})`))
}

seed()
