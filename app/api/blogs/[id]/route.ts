import { createClient } from '@/lib/supabase/server'
import { createHyperfantasyAdminClient } from '@/lib/supabase/hyperfantasy'
import { NextResponse } from 'next/server'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const res = await fetch(`https://www.hyperfantasy.co/api/blogs/${id}`, { cache: 'no-store' })
  if (!res.ok) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const data = await res.json()
  return NextResponse.json({ data })
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const hf = createHyperfantasyAdminClient()
  const { data, error } = await hf
    .from('blogs')
    .update({
      title:        body.title,
      slug:         body.slug,
      excerpt:      body.excerpt ?? null,
      content:      body.content ?? null,
      tags:         body.tags ?? [],
      is_published: body.status === 'published',
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
