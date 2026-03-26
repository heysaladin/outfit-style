'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function uploadItem(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated. Please log in again.' }

  const name = formData.get('name') as string
  const category = formData.get('category') as string
  const color = formData.get('color') as string
  const file = formData.get('image') as File

  if (!file || !name || !category || !color) {
    return { error: 'Missing required fields.' }
  }

  const timestamp = Date.now()
  const ext = file.name.split('.').pop() || 'jpg'
  const originalPath = `${user.id}/${timestamp}_original.${ext}`

  const originalBytes = await file.arrayBuffer()
  const { error: uploadError } = await supabase.storage
    .from('wardrobe')
    .upload(originalPath, originalBytes, { contentType: file.type })

  if (uploadError) {
    console.error('[uploadItem] storage upload failed:', uploadError)
    return { error: `Storage error: ${uploadError.message}` }
  }

  const { data: { publicUrl: originalUrl } } = supabase.storage
    .from('wardrobe')
    .getPublicUrl(originalPath)

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
        await supabase.storage.from('wardrobe').upload(bgPath, bgBytes, {
          contentType: 'image/png',
        })
        const { data: { publicUrl: noBgUrl } } = supabase.storage
          .from('wardrobe')
          .getPublicUrl(bgPath)
        imageUrl = noBgUrl
      }
    } catch {
      // fallback to original
    }
  }

  const { error } = await supabase.from('wardrobe_items').insert({
    user_id: user.id,
    name,
    category,
    color,
    image_url: imageUrl,
    original_image_url: originalUrl,
  })

  if (error) {
    console.error('[uploadItem] db insert failed:', error)
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
    .from('wardrobe_items')
    .select('image_url, original_image_url')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (item) {
    const extractPath = (url: string) => {
      const match = url.match(/\/wardrobe\/(.+)$/)
      return match ? match[1] : null
    }
    const paths = [...new Set(
      [item.image_url, item.original_image_url]
        .filter(Boolean)
        .map(url => extractPath(url as string))
        .filter(Boolean) as string[]
    )]
    if (paths.length) {
      await supabase.storage.from('wardrobe').remove(paths)
    }
  }

  await supabase
    .from('wardrobe_items')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  revalidatePath('/')
}

export async function addToPlan(itemId: string, date: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase.from('weekly_plans').insert({
    user_id: user.id,
    item_id: itemId,
    planned_date: date,
  })

  if (error && error.code !== '23505') throw new Error(error.message)
  revalidatePath('/plan')
}

export async function removeFromPlan(planId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await supabase
    .from('weekly_plans')
    .delete()
    .eq('id', planId)
    .eq('user_id', user.id)

  revalidatePath('/plan')
}
