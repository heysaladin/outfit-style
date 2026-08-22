import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BlogsAdminClient } from '@/components/admin/BlogsAdminClient'

export const dynamic = 'force-dynamic'

export type Blog = {
  id: string
  user_id: string
  title: string
  slug: string | null
  content: string | null
  excerpt: string | null
  status: 'draft' | 'published'
  tags: string[] | null
  created_at: string
  updated_at: string
}

export default async function AdminBlogsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const res = await fetch('https://www.hyperfantasy.co/api/blogs', { cache: 'no-store' })
  const raw: Array<{
    id: string
    authorId: string | null
    title: string
    slug: string | null
    content: string | null
    excerpt: string | null
    isPublished: boolean
    tags: string[] | null
    createdAt: string
    updatedAt: string
  }> = res.ok ? await res.json() : []

  const blogs: Blog[] = raw.map(b => ({
    id: b.id,
    user_id: b.authorId ?? '',
    title: b.title,
    slug: b.slug,
    content: b.content,
    excerpt: b.excerpt,
    status: b.isPublished ? 'published' : 'draft',
    tags: b.tags,
    created_at: b.createdAt,
    updated_at: b.updatedAt,
  }))

  return <BlogsAdminClient blogs={blogs} />
}
