import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jotuoyzjekffadhrrroa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdHVveXpqZWtmZmFkaHJycm9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc1MTg2NCwiZXhwIjoyMDg4MzI3ODY0fQ.3HewsN4IIM_jIpQUnE6z7aJmc6jjjUcvxpqe46ZAkMM'
)

const USER_ID = 'e087bcb0-c8b9-4628-a309-55889a3f8edb'
const BASE_URL = 'https://down-id.img.susercontent.com/file'

const hobbyItems = [
  // --- WORKOUT ---
  {
    name: 'Door Anchor & Resistance Band Set',
    description: '3pcs handle pegangan pull cable — Bigstore-W',
    category: 'workout',
    image_url: `${BASE_URL}/id-11134207-7r98s-lnqjcrkw1xj5fb_tn`,
    purchase_price: 38500,
    status: 'verified',
  },
  {
    name: 'Loading Pin Dumbbell',
    description: 'Dumbbell tray 100kg capacity — INDOGAS TEKNIK',
    category: 'workout',
    image_url: `${BASE_URL}/id-11134207-7rbk9-m9rcas5yzegd41_tn`,
    purchase_price: 28197,
    status: 'verified',
  },
  {
    name: 'Roda Pagar V 50mm',
    description: 'Galvanis kuningan dengan bearing — Market Alat Bangunan',
    category: 'workout',
    image_url: `${BASE_URL}/id-11134207-7r990-lrtoq3r7q5ix45_tn`,
    purchase_price: 13871,
    status: 'verified',
  },
  {
    name: 'Miniwell L630 Water Filter',
    description: 'Portable personal straw survival kit — BOGABOOINDONESIA',
    category: 'workout',
    image_url: `${BASE_URL}/sg-11134201-23010-da7kk6s3ykmvb6_tn`,
    purchase_price: 299999,
    status: 'verified',
  },
  {
    name: 'Fish Lip Gripper Stainless',
    description: 'Penjepit mulut ikan — YYK BAGUS 2',
    category: 'workout',
    image_url: `${BASE_URL}/262403015427898ffb356592f57313a1_tn`,
    purchase_price: 15300,
    status: 'verified',
  },
  {
    name: 'Tutup Joran M',
    description: 'Pengaman ujung joran/walesan — homishop',
    category: 'workout',
    image_url: `${BASE_URL}/48b0a40eaef3a17b3a764c95cac77a02_tn`,
    purchase_price: 6300,
    status: 'verified',
  },
  {
    name: 'Sleeping Bag Bunaken',
    description: 'Big Adventure bulu angsa seri tertinggi — az_corp',
    category: 'workout',
    image_url: `${BASE_URL}/id-11134207-8224w-mh9h5tzsyzgv19_tn`,
    purchase_price: 260000,
    status: 'verified',
  },
  {
    name: 'Backpack Leafhopper 22L',
    description: 'Ultralight Lighttrack abu-abu — Khaffa.Adventure',
    category: 'workout',
    image_url: `${BASE_URL}/id-11134207-82250-mj9jfy3n2fwh9b_tn`,
    purchase_price: 155000,
    status: 'verified',
  },
  {
    name: 'Rantang 2in1 Camping',
    description: 'Peralatan memasak serbaguna stainless — Gadjah offisial store',
    category: 'workout',
    image_url: `${BASE_URL}/sg-11134201-22120-ktrr0qrn3nkva5_tn`,
    purchase_price: 25151,
    status: 'verified',
  },
  {
    name: 'Pasak Tenda',
    description: 'x2 pcs — Triple Anq Outdoor Shop',
    category: 'workout',
    image_url: `${BASE_URL}/70a21d7bde2f1bbda99fe67a739076fd_tn`,
    purchase_price: 963,
    status: 'verified',
  },
  {
    name: 'Matras Aluminium Foil 200x100cm',
    description: 'Ultralight alas tikar tenda — mahesa outdoor',
    category: 'workout',
    image_url: `${BASE_URL}/sg-11134201-22120-7gjspga6hjkv4c_tn`,
    purchase_price: 34303,
    status: 'verified',
  },

  // --- OUTDOOR ---
  {
    name: 'Soft Flask 500ml',
    description: 'Botol lipat TPU running bottle gray — Calyas Store',
    category: 'outdoor',
    image_url: `${BASE_URL}/id-11134207-81ztd-mfkunwfwu9l5fa_tn`,
    purchase_price: 35900,
    status: 'verified',
  },
  {
    name: 'Langseng DS101',
    description: 'Sarangan cooking set untuk DS200/300/301/308 — Dandelion Outdoor Gear',
    category: 'outdoor',
    image_url: `${BASE_URL}/id-11134207-7r98w-lyywms2zda8812_tn`,
    purchase_price: 16500,
    status: 'verified',
  },
  {
    name: 'Lap Kanebo Serat Mini',
    description: '16x21cm — Meryhung',
    category: 'outdoor',
    image_url: `${BASE_URL}/id-11134207-23020-rmsd9iulh7mvb0_tn`,
    purchase_price: 4750,
    status: 'verified',
  },
  {
    name: 'Sleeping Foam Pad Dhaulagiri',
    description: 'Matras lipat foil alas tidur camping orange — outdoor_jakarta',
    category: 'outdoor',
    image_url: `${BASE_URL}/id-11134207-7r98t-lo4zlomdp9fnf5_tn`,
    purchase_price: 275000,
    status: 'verified',
  },

  // --- SOCIAL/LIFE ---
  {
    name: 'Tenwas Down Cleaner 100ml',
    description: 'Sabun khusus jaket & sleeping bag bulu — Tenwas Official Store',
    category: 'social',
    image_url: `${BASE_URL}/id-11134207-7rbk7-m8lfvk7locwu54_tn`,
    purchase_price: 79000,
    status: 'verified',
  },
]

const wardrobeItem = {
  user_id: USER_ID,
  name: 'Patch Bendera Indonesia',
  category: 'accessories',
  subcategory: 'misc',
  item_type: 'misc',
  color: 'Merah Putih',
  image_url: `${BASE_URL}/sg-11134201-82266-mhiulz6hfhmw42_tn`,
  original_image_url: `${BASE_URL}/sg-11134201-82266-mhiulz6hfhmw42_tn`,
}

async function seed() {
  console.log(`Inserting ${hobbyItems.length} hobby items...`)

  const { data: hobbyData, error: hobbyError } = await supabase
    .from('hobby_items')
    .insert(hobbyItems)
    .select('id, name, category')

  if (hobbyError) {
    console.error('Hobby items error:', hobbyError.message)
    process.exit(1)
  }

  console.log('Inserted:')
  hobbyData?.forEach(item => console.log(`  ✓ [${item.category}] ${item.name}`))

  console.log(`\nInserting wardrobe item...`)

  const { data: wardrobeData, error: wardrobeError } = await supabase
    .from('wardrobe_items')
    .insert(wardrobeItem)
    .select('id, name, category')

  if (wardrobeError) {
    console.error('Wardrobe item error:', wardrobeError.message)
    process.exit(1)
  }

  console.log(`  ✓ [fashion/${wardrobeData?.[0].category}] ${wardrobeData?.[0].name}`)
}

seed()
