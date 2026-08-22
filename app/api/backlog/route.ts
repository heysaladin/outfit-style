import { createClient } from '@/lib/supabase/server'
import { createZopavoClient, createZopavoAdminClient } from '@/lib/supabase/zopavo'
import { NextResponse } from 'next/server'

export async function GET() {
  const zp = createZopavoClient()

  const { data, error } = await zp
    .from('backlog')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body        = await request.json()
  const title       = (body.title as string)?.trim()
  const description = (body.description as string)?.trim() || null
  const status      = (body.status as string)?.trim() || 'backlog'
  const priority    = (body.priority as string)?.trim() || null
  const tags        = body.tags ?? null

  if (!title) return NextResponse.json({ error: 'Missing title' }, { status: 400 })

  const zp = createZopavoAdminClient()
  const { data, error } = await zp
    .from('backlog')
    .insert({ title, description, status, priority, tags })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
