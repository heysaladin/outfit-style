'use client'

import React from 'react'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import type { HobbyActivity } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'

interface HobbyWithCount {
  value: string
  label: string
  icon: string | React.ReactNode
  count: number
}

interface StatsTabProps {
  user: User | null
  activities: HobbyActivity[]
  streak: number
  lastActive: Record<string, string>
  gearCounts: Record<string, number>
  fashionActivityCount: number
  socialActivityCount: number
  readingActivityCount: number
  workoutActivityCount: number
  hobbiesByActivity: HobbyWithCount[]
}

function EmptyState({ icon, title, desc, children }: { icon: string; title: string; desc: string; children?: React.ReactNode }) {
  return (
    <div className="py-7 text-center">
      <div className="w-13 h-13 rounded-[18px] bg-card border shadow-sm flex items-center justify-center mx-auto mb-2.5 text-[22px] w-[52px] h-[52px]">{icon}</div>
      <b className="block text-para-sm font-bold mb-1 font-sans">{title}</b>
      <p className="text-para-xs text-muted-foreground m-0">{desc}</p>
      {children}
    </div>
  )
}

const StatsTab = React.memo(function StatsTab({
  user,
  activities,
  streak,
  lastActive,
  gearCounts,
  fashionActivityCount,
  socialActivityCount,
  readingActivityCount,
  workoutActivityCount,
  hobbiesByActivity,
}: StatsTabProps) {
  return (
    <div className="px-[18px] pt-4">
      {!user ? (
        <EmptyState icon="📊" title="Sign in to see stats" desc="Track your hobby activity over time">
          <Link href="/login" className="font-bold text-para-sm mt-3 inline-block underline">Login</Link>
        </EmptyState>
      ) : activities.length === 0 ? (
        <EmptyState icon="📈" title="No activities yet" desc="Start logging activities in your hobbies" />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-[11px] mt-3.5">
            {[
              { v: streak, unit: 'days', l: 'Current streak' },
              { v: activities.length, unit: '', l: 'Total activities' },
              { v: Object.keys(lastActive).length, unit: '', l: 'Active hobbies' },
              { v: Object.values(gearCounts).reduce((a, b) => a + b, 0), unit: '', l: 'Items catalogued' },
            ].map((s, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="text-h2 font-extrabold leading-none font-sans">
                    {s.v}{s.unit ? <small className="text-para-sm text-muted-foreground font-semibold"> {s.unit}</small> : null}
                  </div>
                  <div className="text-caption font-bold tracking-caption uppercase text-muted-foreground/60 mt-2">{s.l}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {fashionActivityCount > 0 && (
            <Card className="mt-3">
              <CardContent className="p-[14px_13px]">
                <h3 className="font-bold text-para-md m-0 mb-2 font-sans">Fashion</h3>
                <div className="flex items-center gap-2">
                  <span className="w-[36px] h-[36px] rounded-[12px] flex items-center justify-center text-[18px] flex-shrink-0" style={{ background: 'var(--muted)' }}>👔</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-para-xs font-medium text-muted-foreground">{fashionActivityCount} activities</span>
                    <div className="h-[5px] rounded-full mt-1.5" style={{ background: 'var(--foreground)', width: '100%' }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {(readingActivityCount > 0 || workoutActivityCount > 0) && (
            <div className="grid grid-cols-2 gap-3 mt-3">
              {readingActivityCount > 0 && (
                <Card>
                  <CardContent className="p-[14px_13px]">
                    <h3 className="font-bold text-para-md m-0 mb-2 font-sans">Reading</h3>
                    <div className="flex items-center gap-2">
                      <span className="w-[36px] h-[36px] rounded-[12px] flex items-center justify-center text-[18px] flex-shrink-0" style={{ background: 'var(--muted)' }}>📚</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-para-xs font-medium text-muted-foreground">{readingActivityCount} activities</span>
                        <div className="h-[5px] rounded-full mt-1.5" style={{ background: 'var(--foreground)', width: '100%' }} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              {workoutActivityCount > 0 && (
                <Card>
                  <CardContent className="p-[14px_13px]">
                    <h3 className="font-bold text-para-md m-0 mb-2 font-sans">Workout</h3>
                    <div className="flex items-center gap-2">
                      <span className="w-[36px] h-[36px] rounded-[12px] flex items-center justify-center text-[18px] flex-shrink-0" style={{ background: 'var(--muted)' }}>🏋️</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-para-xs font-medium text-muted-foreground">{workoutActivityCount} activities</span>
                        <div className="h-[5px] rounded-full mt-1.5" style={{ background: 'var(--foreground)', width: '100%' }} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {hobbiesByActivity.length > 0 && (
            <Card className="mt-3">
              <CardContent className="p-[17px_15px]">
                <h3 className="font-bold text-para-md m-0 mb-1 font-sans">Interesting hobbies</h3>
                {hobbiesByActivity.map((h, i) => {
                  const maxC = hobbiesByActivity[0].count
                  const pct = maxC > 0 ? (h.count / maxC) * 100 : 0
                  return (
                    <div key={h.value} className={cn('flex items-center gap-3 py-3 px-0.5', i > 0 ? 'border-t' : '')}>
                      <span className="font-extrabold text-para-sm text-muted-foreground/60 w-[18px] font-sans">{i + 1}</span>
                      <span className="w-[38px] h-[38px] rounded-[13px] flex items-center justify-center text-[19px] flex-shrink-0" style={{ background: 'var(--muted)' }}>{h.icon}</span>
                      <div className="flex-1 min-w-0">
                        <b className="text-para-sm font-bold block">{h.label}</b>
                        <span className="text-para-xs font-medium text-muted-foreground">{h.count} activities</span>
                        <div className="h-[5px] rounded-full mt-1.5" style={{ background: 'var(--foreground)', width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}

          {socialActivityCount > 0 && (
            <Card className="mt-3">
              <CardContent className="p-[14px_13px]">
                <h3 className="font-bold text-para-md m-0 mb-2 font-sans">Life</h3>
                <div className="flex items-center gap-2">
                  <span className="w-[36px] h-[36px] rounded-[12px] flex items-center justify-center text-[18px] flex-shrink-0" style={{ background: 'var(--muted)' }}>👥</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-para-xs font-medium text-muted-foreground">{socialActivityCount} activities</span>
                    <div className="h-[5px] rounded-full mt-1.5" style={{ background: 'var(--foreground)', width: '100%' }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
})

export default StatsTab
