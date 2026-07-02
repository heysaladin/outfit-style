import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { HOBBIES } from '@/lib/types'
import type { HobbyItem } from '@/lib/types'
import { HobbyItemDetailClient } from '@/components/gear/HobbyItemDetailClient'

export const dynamic = 'force-dynamic'

export default async function HobbyItemPage({
  params,
}: {
  params: Promise<{ hobby: string; itemId: string }>
}) {
  const { hobby, itemId } = await params
  const hobbyDef = HOBBIES.find(h => h.value === hobby)
  if (!hobbyDef) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: item } = await supabase
    .from('hobby_items')
    .select('*')
    .eq('id', itemId)
    .single()

  if (!item) notFound()

  return (
    <HobbyItemDetailClient
      item={item as HobbyItem}
      hobby={hobby}
      user={user}
    />
  )
}
