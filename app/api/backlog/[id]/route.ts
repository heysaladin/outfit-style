import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

async function zopavoAuth(): Promise<string> {
  const res = await fetch('https://zopavo.vercel.app/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: process.env.ZOPAVO_PASSWORD ?? 'creative' }),
  })
  // set-cookie is like "zopavo_auth=authenticated; Path=/; HttpOnly; ..."
  // Cookie header needs just "name=value" pairs
  const setCookie = res.headers.get('set-cookie') ?? ''
  return setCookie.split(';')[0] ?? ''
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookie = await zopavoAuth()
  const res = await fetch(`https://zopavo.vercel.app/api/backlog/${id}`, {
    headers: { Cookie: cookie },
    cache: 'no-store',
  })
  if (!res.ok) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const data = await res.json()
  return NextResponse.json({ data })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const cookie = await zopavoAuth()
  const res = await fetch(`https://zopavo.vercel.app/api/backlog/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify(body),
  })
  const text = await res.text()
  const data = text ? JSON.parse(text) : {}
  if (!res.ok) return NextResponse.json({ error: data.error ?? `Zopavo error ${res.status}` }, { status: res.status })
  return NextResponse.json({ data })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const cookie = await zopavoAuth()
  const res = await fetch(`https://zopavo.vercel.app/api/backlog/${id}`, {
    method: 'DELETE',
    headers: { Cookie: cookie },
  })
  if (!res.ok) return NextResponse.json({ error: `Zopavo error ${res.status}` }, { status: res.status })
  return NextResponse.json({ ok: true })
}
