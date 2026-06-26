import { createClient } from '@/lib/supabase/server'
import type { HobbyActivity, HobbyPhoto } from '@/lib/types'
import { FashionClient } from '@/components/fashion/FashionClient'

export const dynamic = 'force-dynamic'

export default async function FashionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: activities }, { data: photos }] = await Promise.all([
    user
      ? supabase.from('hobby_activities').select('*')
          .eq('user_id', user.id).eq('hobby', 'fashion')
          .order('activity_at', { ascending: false })
      : Promise.resolve({ data: [] }),
    user
      ? supabase.from('hobby_photos').select('*')
          .eq('user_id', user.id).eq('hobby', 'fashion')
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: [] }),
  ])

  return (
    <FashionClient
      user={user ?? null}
      activities={(activities ?? []) as HobbyActivity[]}
      photos={(photos ?? []) as HobbyPhoto[]}
    />
  )
}
