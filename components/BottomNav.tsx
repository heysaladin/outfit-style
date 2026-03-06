'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, CalendarDays } from 'lucide-react'

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 inset-x-0 z-10 bg-[#0A0A0A]/95 backdrop-blur border-t border-[#1F1F1F] flex">
      <Link
        href="/"
        className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors ${
          pathname === '/' ? 'text-white' : 'text-[#444444]'
        }`}
      >
        <LayoutGrid size={22} />
        <span className="text-[10px] font-medium">Wardrobe</span>
      </Link>
      <Link
        href="/plan"
        className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors ${
          pathname === '/plan' ? 'text-white' : 'text-[#444444]'
        }`}
      >
        <CalendarDays size={22} />
        <span className="text-[10px] font-medium">Weekly</span>
      </Link>
    </nav>
  )
}
