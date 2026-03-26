import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CalendarClient } from '@/components/calendar/CalendarClient'
import type { Outfit, OutfitLog } from '@/lib/types'

export default async function CalendarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const lastDay  = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

  const [{ data: logs }, { data: outfits }] = await Promise.all([
    supabase.from('outfit_logs')
      .select('*, outfits(*, outfit_items(item_id, wardrobe_items(*)))')
      .eq('user_id', user.id)
      .gte('date', firstDay)
      .lte('date', lastDay),
    supabase.from('outfits')
      .select('*, outfit_items(item_id, wardrobe_items(*))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  return (
    <CalendarClient
      logs={(logs ?? []) as OutfitLog[]}
      outfits={(outfits ?? []) as Outfit[]}
      today={now.toISOString().split('T')[0]}
    />
  )
}
