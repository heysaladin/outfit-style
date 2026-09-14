import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jotuoyzjekffadhrrroa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdHVveXpqZWtmZmFkaHJycm9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc1MTg2NCwiZXhwIjoyMDg4MzI3ODY0fQ.3HewsN4IIM_jIpQUnE6z7aJmc6jjjUcvxpqe46ZAkMM'
)

async function seed() {
  const { data, error } = await supabase.from('hobby_items').insert([
    {
      name: 'ENCHEN Mini 6 Portable Mini Shaver Alat Cukur Jenggot Elektrik Waterproof',
      category: 'social',
      image_url: 'https://down-id.img.susercontent.com/file/id-11134207-7r98r-lws0h5e8zqtmbf_tn',
      purchase_price: 68900,
      status: 'verified',
    },
    {
      name: 'Tas Laptop Kerja Kantor Pria Cowok Reven Asgard Bag Kulit Sapi Asli Original Premium Leather Branded',
      category: 'outdoor',
      image_url: 'https://down-id.img.susercontent.com/file/id-11134207-8224x-mi2ogdzj9m9ub4',
      status: 'verified',
    },
  ]).select('id, name, category')

  if (error) { console.error(error.message); process.exit(1) }
  data?.forEach(i => console.log(`✓ [${i.category}] ${i.name} (${i.id})`))
}

seed()
