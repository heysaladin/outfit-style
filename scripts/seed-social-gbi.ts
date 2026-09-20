import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jotuoyzjekffadhrrroa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdHVveXpqZWtmZmFkaHJycm9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc1MTg2NCwiZXhwIjoyMDg4MzI3ODY0fQ.3HewsN4IIM_jIpQUnE6z7aJmc6jjjUcvxpqe46ZAkMM'
)

const items = [
  {
    name: 'Pengait Restleting Universal (Silver)',
    description: 'Cantelan Retsleting Alloy Steel Kait Zipper serbaguna',
    category: 'social',
    image_url: 'https://down-id.img.susercontent.com/file/sg-11134201-7rbmw-ln1cxqyzabju42_tn',
    purchase_price: 1148,
    status: 'verified',
  },
  {
    name: 'Sikat Pembersih Sepatu 4in1 (Hitam Putih)',
    description: 'Sikat pembersih kain tas jaket kulit shoes brush nubuck suede',
    category: 'social',
    image_url: 'https://down-id.img.susercontent.com/file/sg-11134201-7rd3r-lu7jhcdoyj5u40_tn',
    purchase_price: 2024,
    status: 'verified',
  },
  {
    name: 'Botol Parfum Refill Mini 5ml (Silver)',
    description: 'Botol spray aluminium travel size atomizer isi ulang minyak wangi',
    category: 'social',
    image_url: 'https://down-id.img.susercontent.com/file/id-11134201-7qul3-ljdv9hlqqj8td3_tn',
    purchase_price: 5391,
    status: 'verified',
  },
  {
    name: 'Tali Sepatu Silikon Elastis 16pcs (Putih)',
    description: 'Tali sepatu karet silikon lazy lace shoelaces unisex',
    category: 'social',
    image_url: 'https://down-id.img.susercontent.com/file/sg-11134201-7rbk5-lpvwo81mwc9y89_tn',
    purchase_price: 6423,
    status: 'verified',
  },
  {
    name: 'Travel Bag Storage Kosmetik (Cream)',
    description: 'Tas penyimpanan kosmetik perlengkapan mandi serbaguna bahan tebal',
    category: 'social',
    image_url: 'https://down-id.img.susercontent.com/file/id-11134201-7qul0-ljdv8ezd96gd6f_tn',
    purchase_price: 22695,
    status: 'verified',
  },
]

async function seed() {
  console.log(`Inserting ${items.length} items...`)
  const { data, error } = await supabase
    .from('hobby_items')
    .insert(items)
    .select('id, name, purchase_price')

  if (error) { console.error(error.message); process.exit(1) }
  data?.forEach(i => console.log(`  ✓ ${i.name} — Rp${i.purchase_price} (${i.id})`))
}

seed()
