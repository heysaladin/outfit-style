import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function corsHeaders(request: Request) {
  const origin = request.headers.get('Origin') ?? '*'
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  }
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(request) })
}

export async function GET(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data, error } = await supabase
    .from('wardrobe_items')
    .select('id, name, category, image_url, price, wear_count')
    .eq('status', 'verified')
    .order('name', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders(request) })

  return NextResponse.json({ items: data ?? [] }, { headers: corsHeaders(request) })
}
