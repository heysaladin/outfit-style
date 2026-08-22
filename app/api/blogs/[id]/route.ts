import { createClient } from '@/lib/supabase/server'
import { createHyperfantasyClient, createHyperfantasyAdminClient } from '@/lib/supabase/hyperfantasy'
import { NextResponse } from 'next/server'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const hf = createHyperfantasyClient()

  const { data, error } = await hf
    .from('blogs')
    .select('*')
    .eq('id', id)
    .eq('status', 'published')
    .single()

  if (error) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ data })
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body    = await request.json()
  const updates: Record<string, unknown> = {}
  if (body.title   !== undefined) updates.title   = (body.title as string).trim()
  if (body.slug    !== undefined) updates.slug    = body.slug
  if (body.content !== undefined) updates.content = body.content
  if (body.excerpt !== undefined) updates.excerpt = body.excerpt
  if (body.status  !== undefined) updates.status  = body.status
  if (body.tags    !== undefined) updates.tags    = body.tags

  const hf = createHyperfantasyAdminClient()
  const { data, error } = await hf
    .from('blogs')
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

  const hf = createHyperfantasyAdminClient()
  const { error } = await hf
    .from('blogs')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
