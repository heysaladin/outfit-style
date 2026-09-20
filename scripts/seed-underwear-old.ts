import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jotuoyzjekffadhrrroa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdHVveXpqZWtmZmFkaHJycm9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc1MTg2NCwiZXhwIjoyMDg4MzI3ODY0fQ.3HewsN4IIM_jIpQUnE6z7aJmc6jjjUcvxpqe46ZAkMM'
)

const USER_ID = 'e087bcb0-c8b9-4628-a309-55889a3f8edb'

const items = [
  {
    user_id: USER_ID,
    name: 'Celana Dalam Pria Agree CD2308 (Biru)',
    category: 'bottom',
    subcategory: null,
    item_type: 'underwear',
    color: 'blue',
    price: 0,
    wear_count: 5,
    purchase_date: '2019-03-24',
    image_url: 'https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full//101/MTA-9002997/agree_agree_-_celana_dalam_pria_dewasa_-_cd_2308_-_cd_cowok_1box_isi_3pcs_-_cd_pria_karet_sport_-_sici_busana_full04_e78u9f39.jpg',
    status: 'verified',
    target: 30,
  },
  {
    user_id: USER_ID,
    name: 'Celana Dalam Pria Agree CD2308 (Abu-abu)',
    category: 'bottom',
    subcategory: null,
    item_type: 'underwear',
    color: 'gray',
    price: 0,
    wear_count: 5,
    purchase_date: '2019-03-24',
    image_url: 'https://p16-oec-sg.ibyteimg.com/tos-alisg-i-aphluv4xwc-sg/30bc2c345bbf47a2865d40529f61c974~tplv-aphluv4xwc-crop-webp:1200:1200.webp?dr=15592&t=555f072d&ps=933b5bde&shp=8dbd94bf&shcp=e1be8f53&idc=my2&from=2378011839',
    status: 'verified',
    target: 30,
  },
]

async function seed() {
  console.log(`Inserting ${items.length} wardrobe items...`)
  const { data, error } = await supabase
    .from('wardrobe_items')
    .insert(items)
    .select('id, name, color')

  if (error) { console.error(error.message); process.exit(1) }
  data?.forEach(i => console.log(`  ✓ ${i.name} (${i.id})`))
}

seed()
