import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { FamilySchedule } from '@/lib/types'
import { FamilyClient } from '@/components/family/FamilyClient'

export const dynamic = 'force-dynamic'

export default async function FamilyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: schedules } = await supabase
    .from('family_schedules')
    .select('*')
    .eq('user_id', user.id)
    .order('day_of_week', { ascending: true })
    .order('start_time', { ascending: true })

  return (
    <FamilyClient
      user={user}
      schedules={(schedules ?? []) as FamilySchedule[]}
    />
  )
}
