'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, Layers, CalendarDays, BarChart2, Archive, Package2, Backpack } from 'lucide-react'

const tabs = [
  { href: '/ofit',      icon: LayoutGrid,   label: 'Wardrobe'  },
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
      className="fixed bottom-0 inset-x-0 z-10 bg-background/95 backdrop-blur-md border-t border-border flex"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {tabs.map(({ href, icon: Icon, label }) => {
        const active = pathname === href
        return (
          <Link key={href} href={href}
            className={`flex-1 flex flex-col items-center pt-2.5 pb-2 gap-1 transition-colors ${
              active ? 'text-primary' : 'text-muted-foreground/60 hover:text-muted-foreground'
            }`}>
            <Icon size={18} strokeWidth={active ? 2.2 : 1.6} />
            <span className={`text-[9px] font-medium tracking-wide ${active ? 'opacity-100' : 'opacity-70'}`}>
              {label}
            </span>
            {active && (
              <span className="absolute bottom-0 w-4 h-0.5 rounded-t-full bg-primary" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
