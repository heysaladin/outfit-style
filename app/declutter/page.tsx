import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DeclutterClient } from '@/components/declutter/DeclutterClient'
import type { WardrobeItem } from '@/lib/types'

export default async function DeclutterPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: items } = await supabase
    .from('wardrobe_items')
    .select('*')
    .eq('user_id', user.id)
    .order('wear_count', { ascending: true })

  return (
    <DeclutterClient
      items={(items ?? []) as WardrobeItem[]}
      cutoffDate={thirtyDaysAgo.toISOString().split('T')[0]}
    />
  )
}
