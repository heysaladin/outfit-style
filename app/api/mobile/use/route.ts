import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS })
}

// POST /api/mobile/use
// body: { items: [{ id: string, type: 'hobby' | 'wardrobe' }] }
export async function POST(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const body = await request.json()
  const items: { id: string; type: 'hobby' | 'wardrobe' }[] = body.items ?? []
  if (!items.length) return NextResponse.json({ error: 'No items' }, { status: 400, headers: CORS })

  const hobbyIds    = items.filter(i => i.type === 'hobby').map(i => i.id)
  const wardrobeIds = items.filter(i => i.type === 'wardrobe').map(i => i.id)
  const now         = new Date().toISOString()
  let updated       = 0

  if (hobbyIds.length) {
    const { data } = await supabase
      .from('hobby_items').select('id, use_count').in('id', hobbyIds)
    for (const item of data ?? []) {
      const { error } = await supabase.from('hobby_items')
        .update({ use_count: item.use_count + 1, last_used: now })
        .eq('id', item.id)
      if (!error) updated++
    }
  }

  if (wardrobeIds.length) {
    const { data } = await supabase
      .from('wardrobe_items').select('id, wear_count').in('id', wardrobeIds)
    for (const item of data ?? []) {
      const { error } = await supabase.from('wardrobe_items')
        .update({ wear_count: item.wear_count + 1, last_worn: now })
        .eq('id', item.id)
      if (!error) updated++
    }
  }

  return NextResponse.json({ ok: true, updated }, { headers: CORS })
}
