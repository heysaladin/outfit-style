import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StatsClient } from '@/components/stats/StatsClient'
import type { WardrobeItem } from '@/lib/types'

export default async function StatsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: items } = await supabase
    .from('wardrobe_items')
    .select('*')
    .eq('user_id', user.id)
    .order('wear_count', { ascending: false })

  return <StatsClient items={(items ?? []) as WardrobeItem[]} />
}
