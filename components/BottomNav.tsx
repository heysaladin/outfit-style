'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, Layers, CalendarDays, BarChart2, Archive } from 'lucide-react'

const tabs = [
  { href: '/ofit',      icon: LayoutGrid,   label: 'Closet'   },
  { href: '/wardrobes', icon: Archive,       label: 'Wardrobes'},
  { href: '/outfits',   icon: Layers,        label: 'Outfits'  },
  { href: '/calendar',  icon: CalendarDays,  label: 'Calendar' },
  { href: '/stats',     icon: BarChart2,     label: 'Stats'    },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed left-1/2 -translate-x-1/2 w-full z-20 bg-background border-t border-border"
      style={{
        bottom: 0,
        maxWidth: 480,
        height: 80,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        display: 'grid',
        gridTemplateColumns: `repeat(${tabs.length}, 1fr)`,
        alignItems: 'center',
      }}
    >
      {tabs.map(({ href, icon: Icon, label }) => {
        const active = pathname === href || pathname.startsWith(href + '/')
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center justify-center gap-[5px] h-11 transition-colors ${active ? 'text-foreground' : 'text-muted-foreground'}`}
          >
            <Icon size={20} strokeWidth={active ? 2 : 1.5} />
            <span className="text-[11px] font-medium">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
