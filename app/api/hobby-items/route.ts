import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body          = await request.formData()
  const name          = (body.get('name') as string)?.trim()
  const notes         = (body.get('notes') as string)?.trim() || null
  const category      = (body.get('category') as string)?.trim()
  const imageUrl      = (body.get('image_url') as string)?.trim() || null
  const file          = body.get('image') as File | null
  const priceRaw      = (body.get('purchase_price') as string)?.trim() || null
  const purchase_price = priceRaw ? parseFloat(priceRaw) : null
  const purchase_date  = (body.get('purchase_date') as string)?.trim() || null

  if (!name || !category) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  let image_url = imageUrl

  if (!image_url && file && file.size > 0) {
    const ext  = file.name.split('.').pop() || 'jpg'
    const path = `${user.id}/gear/${Date.now()}.${ext}`
    const bytes = await file.arrayBuffer()
    const { error: upErr } = await supabase.storage
      .from('wardrobe').upload(path, bytes, { contentType: file.type })
    if (!upErr) {
      const { data: { publicUrl } } = supabase.storage.from('wardrobe').getPublicUrl(path)
      image_url = publicUrl
    }
  }

  const { error } = await supabase.from('hobby_items').insert({
    name,
    description: notes,
    category,
    image_url: image_url || null,
    purchase_price,
    purchase_date: purchase_date || null,
    status: 'verified',
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
