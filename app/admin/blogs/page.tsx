import { createClient } from '@/lib/supabase/server'
import { createHyperfantasyAdminClient } from '@/lib/supabase/hyperfantasy'
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

  const hf = createHyperfantasyAdminClient()
  const { data: blogs } = await hf
    .from('blogs')
    .select('*')
    .order('created_at', { ascending: false })

  return <BlogsAdminClient blogs={(blogs ?? []) as Blog[]} />
}
