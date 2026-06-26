import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileClient } from './ProfileClient'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [wardrobeRes, gearRes] = await Promise.all([
    supabase.from('wardrobe_items').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('gear_items').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
  ])

  return (
    <ProfileClient
      user={user}
      wardrobeCount={wardrobeRes.count ?? 0}
      gearCount={gearRes.count ?? 0}
    />
  )
}
