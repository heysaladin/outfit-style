import { createClient } from '@/lib/supabase/server'
import type { HobbyItem, BookProgress } from '@/lib/types'
import { LiteracyClient } from '@/components/literacy/LiteracyClient'

export const dynamic = 'force-dynamic'

export default async function LiteracyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: books }, { data: progressRows }] = await Promise.all([
    supabase
      .from('hobby_items')
      .select('*')
      .eq('category', 'reading')
      .order('created_at', { ascending: false }),
    user
      ? supabase
          .from('book_progress')
          .select('*')
          .eq('user_id', user.id)
      : Promise.resolve({ data: [] }),
  ])

  const progressMap: Record<string, BookProgress> = {}
  for (const row of (progressRows ?? []) as BookProgress[]) {
    progressMap[row.hobby_item_id] = row
  }

  return (
    <LiteracyClient
      user={user ?? null}
      books={(books ?? []) as HobbyItem[]}
      progressMap={progressMap}
    />
  )
}
