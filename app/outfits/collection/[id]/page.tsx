import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { CollectionDetailClient } from '@/components/outfits/CollectionDetailClient'
import type { WardrobeCollection, WardrobeItem, Outfit, OutfitLog } from '@/lib/types'

export default async function CollectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: collection }, { data: allItems }, { data: outfits }, { data: logs }] = await Promise.all([
    supabase.from('wardrobe_collections')
      .select('*, wardrobe_collection_items(item_id, sort_order, wardrobe_items(*))')
      .eq('id', id).eq('user_id', user.id)
      .single(),
    supabase.from('wardrobe_items')
      .select('*').eq('user_id', user.id)
      .eq('status', 'verified')
      .is('declutter_status', null)
      .order('created_at', { ascending: false }),
    supabase.from('outfits')
      .select('*, outfit_items(item_id, sort_order, wardrobe_items(*))')
      .eq('user_id', user.id)
      .eq('collection_id', id)
      .order('created_at', { ascending: false }),
    supabase.from('outfit_logs')
      .select('id, user_id, outfit_id, date, notes, created_at')
      .eq('user_id', user.id),
  ])

  if (!collection) notFound()

  return (
    <CollectionDetailClient
      collection={collection as WardrobeCollection}
      allItems={(allItems ?? []) as WardrobeItem[]}
      outfits={(outfits ?? []) as Outfit[]}
      logs={(logs ?? []) as OutfitLog[]}
    />
  )
}
