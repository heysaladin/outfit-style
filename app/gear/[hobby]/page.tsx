import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { HOBBIES } from '@/lib/types'
import type { HobbyItem, HobbyActivity, HobbyPhoto } from '@/lib/types'
import { HobbyDetailClient } from '@/components/gear/HobbyDetailClient'

export default async function HobbyPage({
  params,
}: {
  params: Promise<{ hobby: string }>
}) {
  const { hobby } = await params
  const hobbyDef = HOBBIES.find(h => h.value === hobby)
  if (!hobbyDef) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: items } = await supabase
    .from('hobby_items')
    .select('*')
    .eq('category', hobby)
    .order('created_at', { ascending: false })

  const [{ data: activities }, { data: photos }] = user
    ? await Promise.all([
        supabase.from('hobby_activities').select('*')
          .eq('user_id', user.id).eq('hobby', hobby)
          .order('activity_at', { ascending: false }),
        supabase.from('hobby_photos').select('*')
          .eq('user_id', user.id).eq('hobby', hobby)
          .order('created_at', { ascending: false }),
      ])
    : [{ data: [] }, { data: [] }]

  return (
    <HobbyDetailClient
      hobby={hobbyDef as { value: string; label: string; icon: string; category: string }}
      items={(items ?? []) as HobbyItem[]}
      activities={(activities ?? []) as HobbyActivity[]}
      photos={(photos ?? []) as HobbyPhoto[]}
      user={user ?? null}
    />
  )
}
