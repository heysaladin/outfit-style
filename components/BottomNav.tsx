'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, Layers, CalendarDays, BarChart2, Archive, Package2, Backpack } from 'lucide-react'

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
    <nav
      className="fixed bottom-0 inset-x-0 z-20 bg-background border-t border-border flex"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {tabs.map(({ href, icon: Icon, label }) => {
        const active = pathname === href || pathname.startsWith(href + '/')
        return (
          <Link key={href} href={href}
            className={`flex-1 flex flex-col items-center pt-3 pb-2 gap-0.5 transition-colors ${
              active ? 'text-foreground' : 'text-muted-foreground/40'
            }`}>
            <Icon size={20} strokeWidth={active ? 2 : 1.5} />
            <span className={`text-[9px] font-medium tracking-wide mt-0.5 ${active ? 'opacity-100' : 'opacity-60'}`}>
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
