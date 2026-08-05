import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jotuoyzjekffadhrrroa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdHVveXpqZWtmZmFkaHJycm9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc1MTg2NCwiZXhwIjoyMDg4MzI3ODY0fQ.3HewsN4IIM_jIpQUnE6z7aJmc6jjjUcvxpqe46ZAkMM'
)

const USER_ID = 'e087bcb0-c8b9-4628-a309-55889a3f8edb'

const items = [
  {
    user_id: USER_ID,
    name: 'Field Jacket',
    category: 'top',
    subcategory: 'outer',
    item_type: 'jacket',
    color: 'Olive Green',
    image_url: 'https://www.alphaindustries.com/cdn/shop/products/m-65-field-jacket-heritage-outerwear-olive-xxs-819354.jpg',
    original_image_url: 'https://www.alphaindustries.com/cdn/shop/products/m-65-field-jacket-heritage-outerwear-olive-xxs-819354.jpg',
  },
  {
    user_id: USER_ID,
    name: 'Navy Blazer',
    category: 'top',
    subcategory: 'outer',
    item_type: 'formal-jacket',
    color: 'Navy Blue',
    image_url: 'https://turnbullandasser.com/cdn/shop/files/1a3f045e-d6a9-4db2-a499-773e35c646f7.jpg?v=1720801691&width=1500',
    original_image_url: 'https://turnbullandasser.com/cdn/shop/files/1a3f045e-d6a9-4db2-a499-773e35c646f7.jpg?v=1720801691&width=1500',
  },
  {
    user_id: USER_ID,
    name: 'Kemeja Denim',
    category: 'top',
    subcategory: 'inner',
    item_type: 'shirt',
    color: 'Denim Blue',
    image_url: 'https://lsco.scene7.com/is/image/lsco/565100207-front-pdp?fmt=jpg&qlt=70&resMode=sharp2&wid=600&hei=600',
    original_image_url: 'https://lsco.scene7.com/is/image/lsco/565100207-front-pdp?fmt=jpg&qlt=70&resMode=sharp2&wid=600&hei=600',
  },
  {
    user_id: USER_ID,
    name: 'Kemeja Garis-Garis Kuning Putih',
    category: 'top',
    subcategory: 'inner',
    item_type: 'shirt',
    color: 'Yellow White Stripe',
    image_url: 'https://images.tailorstore.com/YToxOntzOjU6IndpZHRoIjtpOjU3Njt9/images%252Fcatalog%252F14406-lawrence-yellow-men-s-shirt-32d2c2-catalogue_main-tailor-store.jpg',
    original_image_url: 'https://images.tailorstore.com/YToxOntzOjU6IndpZHRoIjtpOjU3Njt9/images%252Fcatalog%252F14406-lawrence-yellow-men-s-shirt-32d2c2-catalogue_main-tailor-store.jpg',
  },
  {
    user_id: USER_ID,
    name: 'Knitwear Putih Half-Zip',
    category: 'top',
    subcategory: 'inner',
    item_type: 'misc',
    color: 'White',
    image_url: 'https://cdn.suitsupply.com/image/upload/t_pdp-hero-default-mobile/f_auto,q_auto,w_1290/products/knitwear/default/winter/sw2153_1',
    original_image_url: 'https://cdn.suitsupply.com/image/upload/t_pdp-hero-default-mobile/f_auto,q_auto,w_1290/products/knitwear/default/winter/sw2153_1',
  },
  {
    user_id: USER_ID,
    name: 'Celana Bahan Cokelat',
    category: 'bottom',
    subcategory: null,
    item_type: 'trousers',
    color: 'Brown',
    image_url: 'https://cdn.shopify.com/s/files/1/1025/3059/files/lJP85-v3n6Ta1Ig6h9uMbFddtTNlu-E_aGkiYJzovNQ_1500x2000_crop_center.jpg?v=1728358845',
    original_image_url: 'https://cdn.shopify.com/s/files/1/1025/3059/files/lJP85-v3n6Ta1Ig6h9uMbFddtTNlu-E_aGkiYJzovNQ_1500x2000_crop_center.jpg?v=1728358845',
  },
  {
    user_id: USER_ID,
    name: 'Celana Bahan Abu-Abu',
    category: 'bottom',
    subcategory: null,
    item_type: 'trousers',
    color: 'Mid Grey',
    image_url: 'https://cdn.shopify.com/s/files/1/1025/3059/files/CharcoalGray_Pants_Front_1500x2000_crop_center.jpg?v=1764895608',
    original_image_url: 'https://cdn.shopify.com/s/files/1/1025/3059/files/CharcoalGray_Pants_Front_1500x2000_crop_center.jpg?v=1764895608',
  },
  {
    user_id: USER_ID,
    name: 'Celana Bahan Putih',
    category: 'bottom',
    subcategory: null,
    item_type: 'trousers',
    color: 'Off-White',
    image_url: 'https://cdn.suitsupply.com/image/upload/t_pdp-hero-trousers-desktop/f_auto,q_auto,w_1290/products/trousers/default/summer/b17059_1',
    original_image_url: 'https://cdn.suitsupply.com/image/upload/t_pdp-hero-trousers-desktop/f_auto,q_auto,w_1290/products/trousers/default/summer/b17059_1',
  },
  {
    user_id: USER_ID,
    name: 'Jeans Biru Muda',
    category: 'bottom',
    subcategory: null,
    item_type: 'jeans',
    color: 'Light Blue',
    image_url: 'https://www.mottandbow.com/cdn/shop/products/slim_benson_19_mo_12666_960px_1396px.jpg?v=1640260204&width=2400',
    original_image_url: 'https://www.mottandbow.com/cdn/shop/products/slim_benson_19_mo_12666_960px_1396px.jpg?v=1640260204&width=2400',
  },
  {
    user_id: USER_ID,
    name: 'Loafers Cokelat Tua',
    category: 'footwear',
    subcategory: null,
    item_type: 'shoes',
    color: 'Chocolate Brown',
    image_url: 'https://marcnolan.com/cdn/shop/files/Chocolate_Pebble_01.jpg?v=1749850513&width=3000',
    original_image_url: 'https://marcnolan.com/cdn/shop/files/Chocolate_Pebble_01.jpg?v=1749850513&width=3000',
  },
  {
    user_id: USER_ID,
    name: 'Tan Tassel Loafers',
    category: 'footwear',
    subcategory: null,
    item_type: 'shoes',
    color: 'Brown Suede',
    image_url: 'https://www.charlestyrwhitt.com/dw/image/v2/AAWJ_PRD/on/demandware.static/-/Sites-ctshirts-master/default/dwb42460ce/hi-res/SHB0272CBR_SIDE.jpg',
    original_image_url: 'https://www.charlestyrwhitt.com/dw/image/v2/AAWJ_PRD/on/demandware.static/-/Sites-ctshirts-master/default/dwb42460ce/hi-res/SHB0272CBR_SIDE.jpg',
  },
  {
    user_id: USER_ID,
    name: 'Sneakers Putih Minimalis',
    category: 'footwear',
    subcategory: null,
    item_type: 'sneakers',
    color: 'White',
    image_url: 'https://media.veja-store.com/images/t_sfcc-pdp-mobile-v2/f_auto/v1736126062/VEJA/PACKSHOTS/VX0503298_1/veja-sneakers-v-10-leather-white-vx0503298_1.jpg',
    original_image_url: 'https://media.veja-store.com/images/t_sfcc-pdp-mobile-v2/f_auto/v1736126062/VEJA/PACKSHOTS/VX0503298_1/veja-sneakers-v-10-leather-white-vx0503298_1.jpg',
  },
]

async function seed() {
  console.log(`Inserting ${items.length} wardrobe items...`)

  const { data, error } = await supabase
    .from('wardrobe_items')
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
