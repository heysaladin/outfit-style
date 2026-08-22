import { createClient } from '@/lib/supabase/server'
import { createZopavoClient, createZopavoAdminClient } from '@/lib/supabase/zopavo'
import { NextResponse } from 'next/server'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const zp = createZopavoClient()

  const { data, error } = await zp
    .from('backlog')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ data })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body    = await request.json()
  const updates: Record<string, unknown> = {}
  if (body.title       !== undefined) updates.title       = (body.title as string).trim()
  if (body.description !== undefined) updates.description = body.description
  if (body.status      !== undefined) updates.status      = body.status
  if (body.priority    !== undefined) updates.priority    = body.priority
  if (body.tags        !== undefined) updates.tags        = body.tags

  const zp = createZopavoAdminClient()
  const { data, error } = await zp
    .from('backlog')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const zp = createZopavoAdminClient()
  const { error } = await zp
    .from('backlog')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
