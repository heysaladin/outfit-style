'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Layers, PenLine } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { href: '/admin/backlog', icon: Layers,  label: 'Zopavo'       },
  { href: '/admin/blogs',   icon: PenLine, label: 'Hyperfantasy' },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <>
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-20 bg-background"
        style={{ height: 'env(safe-area-inset-bottom, 0px)' }}
      />
      <nav
        className="fixed left-1/2 -translate-x-1/2 w-full max-w-[430px] z-20 flex border border-border bg-background rounded-t-[24px]"
        style={{ bottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {tabs.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center h-[52px] gap-[5px] transition-colors',
                active ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              <Icon size={20} strokeWidth={active ? 2 : 1.5} />
              <span className="text-[11px] font-medium">{label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
