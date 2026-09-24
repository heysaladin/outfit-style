import { createClient } from '@/lib/supabase/server'
import type { HobbyActivity, HobbyPhoto, WardrobeItem } from '@/lib/types'
import { FashionClient } from '@/components/fashion/FashionClient'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Fashion' }

export default async function FashionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: activities }, { data: photos }, { data: items }] = await Promise.all([
    user
      ? supabase.from('hobby_activities')
          .select('*, outfits(id, name, outfit_items(item_id, wardrobe_items(*)))')
          .eq('user_id', user.id).eq('hobby', 'fashion')
          .order('activity_at', { ascending: false })
      : Promise.resolve({ data: [] }),
    user
      ? supabase.from('hobby_photos').select('*')
          .eq('user_id', user.id).eq('hobby', 'fashion')
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: [] }),
    supabase.from('wardrobe_items')
      .select('*')
      .eq('status', 'verified')
      .is('declutter_status', null)
      .order('wear_count', { ascending: true })
      .order('created_at', { ascending: false }),
  ])

  return (
    <FashionClient
      user={user ?? null}
      activities={(activities ?? []) as HobbyActivity[]}
      photos={(photos ?? []) as HobbyPhoto[]}
      items={(items ?? []) as WardrobeItem[]}
    />
  )
}
