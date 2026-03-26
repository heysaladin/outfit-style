'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// ─── Auth ─────────────────────────────────────────────────────────────────

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

// ─── Wardrobe Items ───────────────────────────────────────────────────────

export async function uploadItem(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated. Please log in again.' }

  const name       = formData.get('name') as string
  const category   = formData.get('category') as string
  const subcategory = formData.get('subcategory') as string || null
  const item_type  = formData.get('item_type') as string || null
  const color      = formData.get('color') as string
  const brand      = (formData.get('brand') as string) || null
  const priceRaw   = formData.get('price') as string
  const price      = priceRaw ? parseFloat(priceRaw) : null
  const seasons    = formData.getAll('seasons') as string[]
  const occasions  = formData.getAll('occasions') as string[]
  const tagsRaw    = (formData.get('tags') as string) || ''
  const tags       = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : []
  const file       = formData.get('image') as File

  if (!file || !name || !category || !color) return { error: 'Missing required fields.' }

  const timestamp    = Date.now()
  const ext          = file.name.split('.').pop() || 'jpg'
  const originalPath = `${user.id}/${timestamp}_original.${ext}`

  const originalBytes = await file.arrayBuffer()
  const { error: uploadError } = await supabase.storage
    .from('wardrobe')
    .upload(originalPath, originalBytes, { contentType: file.type })

  if (uploadError) {
    console.error('[uploadItem] storage:', uploadError)
    return { error: `Storage error: ${uploadError.message}` }
  }

  const { data: { publicUrl: originalUrl } } = supabase.storage.from('wardrobe').getPublicUrl(originalPath)
  let imageUrl = originalUrl

  const apiKey = process.env.REMOVE_BG_API_KEY
  if (apiKey && apiKey !== 'your_remove_bg_key') {
    try {
      const bgForm = new FormData()
      bgForm.append('image_file', file)
      bgForm.append('size', 'auto')
      const bgRes = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: { 'X-Api-Key': apiKey },
        body: bgForm,
      })
      if (bgRes.ok) {
        const bgBytes = await bgRes.arrayBuffer()
        const bgPath = `${user.id}/${timestamp}_nobg.png`
        await supabase.storage.from('wardrobe').upload(bgPath, bgBytes, { contentType: 'image/png' })
        const { data: { publicUrl: noBgUrl } } = supabase.storage.from('wardrobe').getPublicUrl(bgPath)
        imageUrl = noBgUrl
      }
    } catch { /* fallback to original */ }
  }

  const { error } = await supabase.from('wardrobe_items').insert({
    user_id: user.id, name, category, subcategory, item_type, color, brand, price,
    seasons: seasons.length > 0 ? seasons : null,
    occasions: occasions.length > 0 ? occasions : null,
    tags: tags.length > 0 ? tags : null,
    image_url: imageUrl,
    original_image_url: originalUrl,
  }).select()

  if (error) {
    console.error('[uploadItem] db:', JSON.stringify(error))
    return { error: `Database error: ${error.message}` }
  }

  revalidatePath('/')
  return {}
}

export async function deleteItem(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: item } = await supabase
    .from('wardrobe_items').select('image_url, original_image_url')
    .eq('id', id).eq('user_id', user.id).single()

  if (item) {
    const extractPath = (url: string) => url.match(/\/wardrobe\/(.+)$/)?.[1] ?? null
    const paths = [...new Set(
      [item.image_url, item.original_image_url].filter(Boolean)
        .map(u => extractPath(u as string)).filter(Boolean) as string[]
    )]
    if (paths.length) await supabase.storage.from('wardrobe').remove(paths)
  }

  await supabase.from('wardrobe_items').delete().eq('id', id).eq('user_id', user.id)
  revalidatePath('/')
  revalidatePath('/stats')
  revalidatePath('/declutter')
}

export async function wearItem(itemId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: item } = await supabase
    .from('wardrobe_items').select('wear_count').eq('id', itemId).eq('user_id', user.id).single()

  const { error } = await supabase.from('wardrobe_items').update({
    wear_count: (item?.wear_count ?? 0) + 1,
    last_worn: new Date().toISOString().split('T')[0],
  }).eq('id', itemId).eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/')
  revalidatePath('/stats')
  return {}
}

export async function flagDeclutter(
  itemId: string, status: 'donate' | 'sell' | 'giveaway' | null, note?: string
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase.from('wardrobe_items')
    .update({ declutter_status: status, declutter_note: note ?? null })
    .eq('id', itemId).eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/')
  revalidatePath('/declutter')
  return {}
}

// ─── Outfits ──────────────────────────────────────────────────────────────

export async function createOutfit(
  name: string, itemIds: string[], occasion?: string
): Promise<{ error?: string; id?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: outfit, error } = await supabase
    .from('outfits')
    .insert({ user_id: user.id, name, occasion: occasion || null })
    .select().single()

  if (error || !outfit) return { error: error?.message ?? 'Failed' }

  if (itemIds.length > 0) {
    await supabase.from('outfit_items').insert(
      itemIds.map(item_id => ({ outfit_id: outfit.id, item_id }))
    )
  }

  revalidatePath('/outfits')
  return { id: outfit.id }
}

export async function deleteOutfit(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  await supabase.from('outfits').delete().eq('id', id).eq('user_id', user.id)
  revalidatePath('/outfits')
  return {}
}

// ─── Calendar / Outfit Logs ───────────────────────────────────────────────

export async function logOutfit(
  date: string, outfitId?: string
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase.from('outfit_logs')
    .upsert(
      { user_id: user.id, date, outfit_id: outfitId || null },
      { onConflict: 'user_id,date' }
    )

  if (error) return { error: error.message }

  // Increment wear_count for outfit items
  if (outfitId) {
    const { data: outfitItems } = await supabase
      .from('outfit_items').select('item_id').eq('outfit_id', outfitId)
    for (const oi of outfitItems ?? []) {
      const { data: item } = await supabase.from('wardrobe_items')
        .select('wear_count').eq('id', oi.item_id).single()
      await supabase.from('wardrobe_items').update({
        wear_count: (item?.wear_count ?? 0) + 1,
        last_worn: date,
      }).eq('id', oi.item_id)
    }
  }

  revalidatePath('/calendar')
  revalidatePath('/stats')
  return {}
}

export async function removeOutfitLog(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  await supabase.from('outfit_logs').delete().eq('id', id).eq('user_id', user.id)
  revalidatePath('/calendar')
  return {}
}

// ─── Weekly Plan (legacy) ─────────────────────────────────────────────────

export async function addToPlan(itemId: string, date: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase.from('weekly_plans')
    .insert({ user_id: user.id, item_id: itemId, planned_date: date })

  if (error && error.code !== '23505') throw new Error(error.message)
  revalidatePath('/plan')
}

export async function removeFromPlan(planId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await supabase.from('weekly_plans').delete().eq('id', planId).eq('user_id', user.id)
  revalidatePath('/plan')
}
