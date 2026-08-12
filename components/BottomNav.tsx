'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, Layers, CalendarDays, BarChart2, Archive, Package2, Backpack } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { href: '/ofit',      icon: LayoutGrid,   label: 'Closet'    },
  { href: '/outfits',   icon: Layers,       label: 'Outfits'   },
  { href: '/gear',      icon: Backpack,     label: 'Gear'      },
  { href: '/calendar',  icon: CalendarDays, label: 'Calendar'  },
  { href: '/stats',     icon: BarChart2,    label: 'Stats'     },
  { href: '/declutter', icon: Archive,      label: 'Declutter' },
  { href: '/wardrobes', icon: Package2,     label: 'Storage'   },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <>
      {/* Background fill for safe area below nav (PWA fix) */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-20 bg-background"
        style={{ height: 'env(safe-area-inset-bottom, 0px)' }}
      />
      <nav
        className="fixed left-1/2 -translate-x-1/2 w-full max-w-[430px] z-20 bg-background border-t border-border flex"
        style={{ bottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {tabs.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link key={href} href={href}
              className={cn(
                'flex-1 flex flex-col items-center pt-2 pb-2 gap-0.5 transition-colors',
                active ? 'text-[var(--app-orange)]' : 'text-muted-foreground/40'
              )}>
              <span className={cn(
                'w-16 h-8 rounded-full flex items-center justify-center transition-all duration-200',
                active ? 'bg-[var(--app-orange-soft)]' : ''
              )}>
                <Icon size={20} strokeWidth={active ? 2 : 1.5} />
              </span>
              <span className={cn('text-[9px] font-medium tracking-wide', active ? 'opacity-100' : 'opacity-60')}>
                {label}
              </span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
