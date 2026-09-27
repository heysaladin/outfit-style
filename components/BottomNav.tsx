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
    <div
      className="fixed left-1/2 -translate-x-1/2 w-full z-20 px-4"
      style={{ maxWidth: 430, bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))' }}
    >
      <nav
        className="h-16 rounded-full bg-neutral-900 px-1.5 flex items-center shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)]"
        style={{ display: 'grid', gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}
      >
        {tabs.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-[5px] h-12 transition-colors ${active ? 'text-neutral-50' : 'text-neutral-500'}`}
            >
              <Icon size={20} strokeWidth={active ? 2 : 1.5} />
              <span className="text-[11px] font-medium">{label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
