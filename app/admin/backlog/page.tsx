import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BacklogAdminClient } from '@/components/admin/BacklogAdminClient'

export const dynamic = 'force-dynamic'

export type ZopavoNote = {
  id: string
  content: string
  color: string
  boardId: string
  workingOnBy: string | null
  done: boolean
  createdAt: string
  updatedAt: string
}

async function fetchZopavoBacklog(): Promise<ZopavoNote[]> {
  try {
    const authRes = await fetch('https://zopavo.vercel.app/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: process.env.ZOPAVO_PASSWORD ?? 'creative' }),
    })
    const cookie = (authRes.headers.get('set-cookie') ?? '').split(';')[0]

    const res = await fetch('https://zopavo.vercel.app/api/backlog', {
      headers: { Cookie: cookie },
      cache: 'no-store',
    })
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

export default async function AdminBacklogPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const notes = await fetchZopavoBacklog()
  return <BacklogAdminClient notes={notes} />
}
