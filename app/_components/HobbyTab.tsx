'use client'

import React from 'react'
import Link from 'next/link'
import type { HobbyActivity } from '@/lib/types'
import { isSameDayWIB } from '@/lib/date'

interface HobbyLink {
  label: string
  icon: string
  href: string
  value: string
}

interface HobbyTabProps {
  hobbyLinks: HobbyLink[]
  gearCounts: Record<string, number>
  hobbyProgress: Record<string, number>
  lastActive: Record<string, string>
  weekDays: Date[]
  activities: HobbyActivity[]
  onReorder: () => void
}

const HobbyTab = React.memo(function HobbyTab({
  hobbyLinks,
  gearCounts,
  hobbyProgress,
  lastActive,
  weekDays,
  activities,
  onReorder,
}: HobbyTabProps) {
  return (
    <div className="px-[18px]">
      <div className="flex items-baseline justify-between mt-5 mb-3 mx-0.5">
        <h2 className="text-[16px] font-semibold text-foreground m-0">
          Interests <small className="text-[12px] text-muted-foreground font-medium ml-1">{hobbyLinks.length}</small>
        </h2>
        <button
          className="bg-transparent border-0 text-[13px] text-muted-foreground cursor-pointer px-1 py-1"
          onClick={onReorder}
        >
          Reorder
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
        {hobbyLinks.map(({ label, icon, href, value }) => {
          const progress = hobbyProgress[value] ?? 0
          const dots = weekDays.map(d =>
            activities.some(a => a.hobby === value && isSameDayWIB(a.activity_at, d))
          )
          return (
            <Link key={label} href={href} className="block no-underline min-w-0">
              <div className="border border-border rounded-[8px] bg-card hover:bg-neutral-50 transition-colors h-full overflow-hidden">
                <div className="bg-neutral-100 w-full aspect-[4/3] flex items-center justify-center text-[48px]">{icon}</div>
                <div className="p-3 pt-2.5">
                  <p className="text-[14px] font-semibold text-foreground m-0 mb-1 overflow-hidden text-ellipsis whitespace-nowrap min-w-0">
                    {label}
                  </p>
                  <div className="h-1 bg-neutral-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{
                      width: `${progress}%`,
                      background: progress >= 100 ? '#059669' : progress >= 75 ? '#d97706' : 'var(--foreground)',
                    }} />
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
})

export default HobbyTab
