import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { OutfitsClient } from '@/components/outfits/OutfitsClient'
import type { Outfit, OutfitLog, WardrobeCollection, WardrobeItem, Lookbook } from '@/lib/types'

export default async function OutfitsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: outfits }, { data: items }, { data: collections }, { data: logs }, { data: lookbooks }] = await Promise.all([
    supabase.from('outfits')
      .select('*, outfit_items(item_id, sort_order, wardrobe_items(*))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase.from('wardrobe_items')
      .select('*').eq('user_id', user.id)
      .eq('status', 'verified')
      .is('declutter_status', null)
      .order('created_at', { ascending: false }),
    supabase.from('wardrobe_collections')
      .select('*, wardrobe_collection_items(item_id, sort_order, wardrobe_items(*))')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false }),
    supabase.from('outfit_logs')
      .select('id, user_id, outfit_id, date, notes, created_at')
      .eq('user_id', user.id),
    supabase.from('lookbooks')
      .select('*, lookbook_photos(*, lookbook_photo_outfits(outfit_id, outfits(id, name, outfit_items(item_id, sort_order, wardrobe_items(*)))))')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false }),
  ])

  return (
    <OutfitsClient
      outfits={(outfits ?? []) as Outfit[]}
      allItems={(items ?? []).sort((a, b) => (a.status === 'verified' ? -1 : 1) - (b.status === 'verified' ? -1 : 1)) as WardrobeItem[]}
      wardrobeCollections={(collections ?? []) as WardrobeCollection[]}
      logs={(logs ?? []) as OutfitLog[]}
      lookbooks={(lookbooks ?? []) as Lookbook[]}
    />
  )
}
