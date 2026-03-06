import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { WeeklyPlanClient } from '@/components/plan/WeeklyPlanClient'
import { getMonday, formatDate, addDays } from '@/lib/week'
import type { WardrobeItem, PlanEntry } from '@/lib/types'

export default async function PlanPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = new Date()
  const monday = params.week
    ? new Date(params.week + 'T00:00:00')
    : getMonday(today)

  const weekStart = formatDate(monday)
  const weekEnd = formatDate(addDays(monday, 6))

  const [{ data: plans }, { data: items }] = await Promise.all([
    supabase
      .from('weekly_plans')
      .select('*, wardrobe_items(*)')
      .eq('user_id', user.id)
      .gte('planned_date', weekStart)
      .lte('planned_date', weekEnd),
    supabase
      .from('wardrobe_items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  return (
    <WeeklyPlanClient
      weekStart={weekStart}
      plans={(plans ?? []) as PlanEntry[]}
      allItems={(items ?? []) as WardrobeItem[]}
      today={formatDate(today)}
    />
  )
}
