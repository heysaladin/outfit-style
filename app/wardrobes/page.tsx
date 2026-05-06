import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { WardrobesClient } from '@/components/wardrobes/WardrobesClient'
import type { Wardrobe, WardrobeItem } from '@/lib/types'

export default async function WardrobesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: wardrobes }, { data: items }] = await Promise.all([
    supabase.from('wardrobes').select('*').eq('user_id', user.id).order('code', { ascending: true }),
    supabase.from('wardrobe_items').select('id, name, image_url, category, color, wardrobe_id').eq('user_id', user.id),
  ])

  return (
    <WardrobesClient
      wardrobes={(wardrobes ?? []) as Wardrobe[]}
      items={(items ?? []) as Pick<WardrobeItem, 'id' | 'name' | 'image_url' | 'category' | 'color' | 'wardrobe_id'>[]}
    />
  )
}
