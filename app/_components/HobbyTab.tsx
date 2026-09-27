'use client'

import React from 'react'
import Link from 'next/link'
import type { HobbyActivity } from '@/lib/types'

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
  hobbyProgress,
  onReorder,
}: HobbyTabProps) {
  return (
    <>
      <div style={{ background: '#0A0A0A', borderRadius: '0 0 28px 28px', padding: '0 12px 28px' }}>
        <div style={{ padding: '16px 8px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ fontSize: 14, lineHeight: '21px', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 500, color: 'rgb(163,163,163)', margin: 0 }}>{hobbyLinks.length} interests</p>
          <h1 style={{ fontSize: 30, lineHeight: '30px', letterSpacing: '-1px', fontWeight: 600, color: 'rgb(250,250,250)', margin: 0 }}>Hobbies</h1>
        </div>
      </div>

      <div className="px-[18px] pt-6 pb-28">
        <div className="flex items-baseline justify-between mb-3 mx-0.5">
          <h2 className="text-[20px] font-semibold text-foreground m-0">
            Interests <small className="text-[12px] text-muted-foreground font-medium ml-1">{hobbyLinks.length}</small>
          </h2>
          <button
            className="bg-transparent border-0 text-[14px] text-muted-foreground cursor-pointer px-1 py-1"
            onClick={onReorder}
          >
            Reorder
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {hobbyLinks.map(({ label, icon, href, value }) => {
            const progress = Math.min(100, hobbyProgress[value] ?? 0)
            const done = progress >= 100
            return (
              <Link key={label} href={href} className="block no-underline min-w-0">
                <div className="border border-border rounded-[8px] bg-card overflow-hidden">
                  <div className="bg-neutral-100 w-full aspect-[4/3] flex items-center justify-center">
                    <span className="text-4xl">{icon}</span>
                  </div>
                  <div className="p-3 pt-2.5 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-1.5 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate min-w-0">{label}</p>
                      {done && <span className="text-xs font-semibold text-foreground shrink-0">Done</span>}
                    </div>
                    <div className="h-1 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${progress}%`, background: done ? '#EEF040' : 'var(--foreground)' }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
})

export default HobbyTab
