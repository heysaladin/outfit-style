import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GearClient } from '@/components/gear/GearClient'
import type { GearItem } from '@/lib/types'

export default async function GearPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: items } = await supabase
    .from('gear_items')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return <GearClient items={(items ?? []) as GearItem[]} user={user} />
}
