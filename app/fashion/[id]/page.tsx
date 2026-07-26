import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { WardrobeItem } from '@/lib/types'
import { FashionItemDetailClient } from '@/components/fashion/FashionItemDetailClient'

export const dynamic = 'force-dynamic'

export default async function FashionItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: item } = await supabase
    .from('wardrobe_items')
    .select('*')
    .eq('id', id)
    .single()

  if (!item) notFound()

  return <FashionItemDetailClient item={item as WardrobeItem} user={user ?? null} />
}
