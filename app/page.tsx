import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { WardrobeClient } from '@/components/wardrobe/WardrobeClient'
import type { WardrobeItem } from '@/lib/types'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: items } = await supabase
    .from('wardrobe_items')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return <WardrobeClient items={(items ?? []) as WardrobeItem[]} user={user} />
}
