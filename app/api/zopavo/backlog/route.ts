import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

async function getAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return { supabase, user }
}

export async function GET() {
  const { supabase, user } = await getAuth()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('zopavo_backlog')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(request: Request) {
  const { supabase, user } = await getAuth()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body        = await request.json()
  const title       = (body.title as string)?.trim()
  const description = (body.description as string)?.trim() || null
  const status      = (body.status as string)?.trim() || 'backlog'
  const priority    = (body.priority as string)?.trim() || null
  const tags        = body.tags ?? null

  if (!title) return NextResponse.json({ error: 'Missing title' }, { status: 400 })

  const { data, error } = await supabase
    .from('zopavo_backlog')
    .insert({ user_id: user.id, title, description, status, priority, tags })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}

export async function PATCH(request: Request) {
  const { supabase, user } = await getAuth()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const body    = await request.json()
  const updates: Record<string, unknown> = {}
  if (body.title       !== undefined) updates.title       = (body.title as string).trim()
  if (body.description !== undefined) updates.description = body.description
  if (body.status      !== undefined) updates.status      = body.status
  if (body.priority    !== undefined) updates.priority    = body.priority
  if (body.tags        !== undefined) updates.tags        = body.tags

  const { data, error } = await supabase
    .from('zopavo_backlog')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function DELETE(request: Request) {
  const { supabase, user } = await getAuth()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { error } = await supabase
    .from('zopavo_backlog')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
