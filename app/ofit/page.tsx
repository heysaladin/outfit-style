import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { WardrobeClient } from '@/components/wardrobe/WardrobeClient'
import type { WardrobeItem, Wardrobe } from '@/lib/types'

export default async function OfitPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: items }, { data: wardrobes }] = await Promise.all([
    supabase.from('wardrobe_items').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('wardrobes').select('*').eq('user_id', user.id).order('code', { ascending: true }),
  ])

  return (
    <WardrobeClient
      items={(items ?? []) as WardrobeItem[]}
      wardrobes={(wardrobes ?? []) as Wardrobe[]}
      user={user}
    />
  )
}
