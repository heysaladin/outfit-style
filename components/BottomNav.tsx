'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, Layers, CalendarDays, BarChart2, Archive } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { href: '/ofit',      icon: LayoutGrid,   label: 'Closet'   },
  { href: '/wardrobes', icon: Archive,      label: 'Storage'  },
  { href: '/outfits',   icon: Layers,       label: 'Outfits'  },
  { href: '/calendar',  icon: CalendarDays, label: 'Calendar' },
  { href: '/stats',     icon: BarChart2,    label: 'Stats'    },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <>
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-20 bg-background"
        style={{ height: 'env(safe-area-inset-bottom, 0px)' }}
      />
      <nav
        className="fixed left-1/2 -translate-x-1/2 w-full max-w-[430px] z-20 flex border-t border-border bg-background"
        style={{ bottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {tabs.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
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
