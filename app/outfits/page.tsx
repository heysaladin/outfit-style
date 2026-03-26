import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { OutfitsClient } from '@/components/outfits/OutfitsClient'
import type { Outfit, WardrobeItem } from '@/lib/types'

export default async function OutfitsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: outfits }, { data: items }] = await Promise.all([
    supabase.from('outfits')
      .select('*, outfit_items(item_id, wardrobe_items(*))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase.from('wardrobe_items')
      .select('*').eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  return (
    <OutfitsClient
      outfits={(outfits ?? []) as Outfit[]}
      allItems={(items ?? []) as WardrobeItem[]}
    />
  )
}
