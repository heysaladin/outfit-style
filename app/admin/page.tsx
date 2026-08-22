import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Layers, PenLine, ExternalLink } from 'lucide-react'
import { UserAvatarMenu } from '@/components/UserAvatarMenu'
import { BottomNav } from '@/components/BottomNav'

export const dynamic = 'force-dynamic'

const PROJECTS = [
  {
    href: '/admin/backlog',
    external: 'https://zopavo.vercel.app',
    icon: Layers,
    name: 'Zopavo',
    description: 'Backlog management',
    api: '/api/backlog',
  },
  {
    href: '/admin/blogs',
    external: 'https://hyperfantasy.co/blogs',
    icon: PenLine,
    name: 'Hyperfantasy',
    description: 'Blog posts',
    api: '/api/blogs',
  },
]

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="h-dvh overflow-y-auto bg-background pb-24">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="text-foreground font-bold text-lg">Admin</h1>
        <UserAvatarMenu />
      </header>

      <div className="px-4 py-4 space-y-3 max-w-2xl mx-auto">
        {PROJECTS.map(({ href, external, icon: Icon, name, description, api }) => (
          <div key={href} className="bg-card border border-border rounded-2xl overflow-hidden">
            <Link href={href} className="flex items-center gap-3 px-4 py-4 hover:bg-muted transition-colors">
              <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                <Icon size={16} className="text-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-foreground font-semibold text-sm">{name}</p>
                <p className="text-muted-foreground text-xs">{description}</p>
              </div>
              <span className="text-muted-foreground text-xs">Manage →</span>
            </Link>

            <div className="border-t border-border px-4 py-2.5 flex items-center justify-between">
              <code className="text-muted-foreground text-[11px]">{api}</code>
              <a
                href={external}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-muted-foreground text-[11px] hover:text-foreground transition-colors"
              >
                <ExternalLink size={11} />
                {new URL(external).hostname}
              </a>
            </div>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  )
}
