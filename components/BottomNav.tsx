'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, Layers, CalendarDays, BarChart2, Archive } from 'lucide-react'

const tabs = [
  { href: '/',          icon: LayoutGrid,  label: 'Wardrobe'  },
  { href: '/outfits',   icon: Layers,      label: 'Outfits'   },
  { href: '/calendar',  icon: CalendarDays, label: 'Calendar'  },
  { href: '/stats',     icon: BarChart2,   label: 'Stats'     },
  { href: '/declutter', icon: Archive,     label: 'Declutter' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 inset-x-0 z-10 bg-[#0A0A0A]/95 backdrop-blur border-t border-[#1F1F1F] flex" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {tabs.map(({ href, icon: Icon, label }) => (
        <Link key={href} href={href}
          className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-colors ${
            pathname === href ? 'text-white' : 'text-[#3A3A3A]'
          }`}>
          <Icon size={20} />
          <span className="text-[9px] font-medium">{label}</span>
        </Link>
      ))}
    </nav>
  )
}
