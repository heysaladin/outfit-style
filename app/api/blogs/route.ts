import { createClient } from '@/lib/supabase/server'
import { createHyperfantasyClient, createHyperfantasyAdminClient } from '@/lib/supabase/hyperfantasy'
import { NextResponse } from 'next/server'

export async function GET() {
  const hf = createHyperfantasyClient()

  const { data, error } = await hf
    .from('blogs')
    .select('id, title, slug, excerpt, status, tags, created_at, updated_at')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body    = await request.json()
  const title   = (body.title as string)?.trim()
  const slug    = (body.slug as string)?.trim() || null
  const content = (body.content as string)?.trim() || null
  const excerpt = (body.excerpt as string)?.trim() || null
  const status  = (body.status as string)?.trim() || 'draft'
  const tags    = body.tags ?? null

  if (!title) return NextResponse.json({ error: 'Missing title' }, { status: 400 })

  const hf = createHyperfantasyAdminClient()
  const { data, error } = await hf
    .from('blogs')
    .insert({ title, slug, content, excerpt, status, tags })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
