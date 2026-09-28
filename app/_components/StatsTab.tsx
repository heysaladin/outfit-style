'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import type { HobbyActivity } from '@/lib/types'

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
  totalPoints: number
  lastActive: Record<string, string>
  gearCounts: Record<string, number>
  fashionActivityCount: number
  socialActivityCount: number
  readingActivityCount: number
  workoutActivityCount: number
  hobbiesByActivity: HobbyWithCount[]
  now: Date
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

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

const StatsTab = React.memo(function StatsTab({
  user,
  activities,
  streak,
  totalPoints,
  fashionActivityCount,
  socialActivityCount,
  readingActivityCount,
  workoutActivityCount,
  hobbiesByActivity,
  now,
}: StatsTabProps) {
  const weeklyBuckets = useMemo(() => {
    const nowMs = now.getTime()
    const weekStart = (n: number) => nowMs - (n + 1) * WEEK_MS
    const weekEnd = (n: number) => nowMs - n * WEEK_MS
    return Array.from({ length: 12 }, (_, i) => {
      const idx = 11 - i
      const start = weekStart(idx)
      const end = weekEnd(idx)
      const count = activities.filter(a => {
        const t = new Date(a.activity_at).getTime()
        return t >= start && t < end
      }).length
      return { count, monthLabel: new Date(end).toLocaleDateString('en-US', { month: 'short' }) }
    })
  }, [activities, now])

  const maxWeekly = Math.max(...weeklyBuckets.map(w => w.count), 1)
  const thisWeek = weeklyBuckets[weeklyBuckets.length - 1]?.count ?? 0
  const lastWeek = weeklyBuckets[weeklyBuckets.length - 2]?.count ?? 0
  const pctChange = lastWeek === 0 ? (thisWeek > 0 ? 100 : 0) : Math.round(((thisWeek - lastWeek) / lastWeek) * 100)

  const monthLabels = useMemo(() => {
    const labels = [weeklyBuckets[0]?.monthLabel, weeklyBuckets[5]?.monthLabel, weeklyBuckets[11]?.monthLabel]
    return [...new Set(labels)].filter(Boolean)
  }, [weeklyBuckets])

  const hero = (
    <div style={{ background: '#0A0A0A', borderRadius: '0 0 28px 28px', padding: '0 12px 46px' }}>
      <div style={{ padding: '16px 8px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <p style={{ fontSize: 14, lineHeight: '21px', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 500, color: 'rgb(163,163,163)', margin: 0 }}>Last 90 days</p>
        <h1 style={{ fontSize: 30, lineHeight: '30px', letterSpacing: '-1px', fontWeight: 600, color: 'rgb(250,250,250)', margin: 0 }}>
          Your <span style={{ color: 'rgb(238,240,64)' }}>story</span> so far
        </h1>
      </div>
    </div>
  )

  if (!user) {
    return (
      <>
        {hero}
        <div className="px-[18px] pt-4">
          <EmptyState icon="📊" title="Sign in to see stats" desc="Track your hobby activity over time">
            <Link href="/login" className="font-bold text-para-sm mt-3 inline-block underline">Login</Link>
          </EmptyState>
        </div>
      </>
    )
  }

  if (activities.length === 0) {
    return (
      <>
        {hero}
        <div className="px-[18px] pt-4">
          <EmptyState icon="📈" title="No activities yet" desc="Start logging activities in your hobbies" />
        </div>
      </>
    )
  }

  return (
    <>
      {hero}

      <div className="-mt-[22px] mx-3 relative bg-neutral-800 rounded-xl px-4 py-3.5 grid grid-cols-3 gap-3 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)]">
        {[
          { label: 'Points', value: totalPoints },
          { label: 'Day streak', value: streak },
          { label: 'Activities', value: activities.length },
        ].map(stat => (
          <div key={stat.label} className="flex flex-col gap-0.5 min-w-0">
            <span className="text-2xl font-semibold tracking-[-0.5px] font-mono text-neutral-50">{stat.value}</span>
            <span className="text-xs text-neutral-400 truncate">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="px-5 pt-7 pb-28 flex flex-col gap-4">
        <div className="border border-border rounded-xl p-4 flex flex-col gap-3">
          <div className="flex justify-between items-baseline">
            <span className="text-sm text-neutral-500">Activities per week</span>
            <span className="text-sm font-mono text-foreground">{pctChange >= 0 ? '+' : ''}{pctChange}%</span>
          </div>
          <div className="h-[120px] flex items-end gap-1.5">
            {weeklyBuckets.map((w, i) => {
              const isCurrent = i === weeklyBuckets.length - 1
              const heightPct = Math.max(4, (w.count / maxWeekly) * 100)
              return (
                <div
                  key={i}
                  className="flex-1 rounded-t"
                  style={{
                    height: `${heightPct}%`,
                    background: isCurrent ? '#EEF040' : 'rgb(10,10,10)',
                    border: isCurrent ? '1px solid rgb(10,10,10)' : 'none',
                    boxSizing: 'border-box',
                  }}
                />
              )
            })}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            {monthLabels.map((m, i) => <span key={i}>{m}</span>)}
          </div>
        </div>

        {fashionActivityCount > 0 && (
          <div className="border border-border rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-950 flex items-center justify-center shrink-0 text-base">👔</div>
            <div className="flex-1 min-w-0 flex flex-col gap-1.5">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-foreground">Fashion</span>
                <span className="text-sm font-mono text-neutral-500">{fashionActivityCount}</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-foreground rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
          </div>
        )}

        {(workoutActivityCount > 0 || readingActivityCount > 0) && (
          <div className="grid grid-cols-2 gap-4">
            {workoutActivityCount > 0 && (
              <div className="border border-border rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-neutral-950 flex items-center justify-center shrink-0 text-base">🏋️</div>
                <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-foreground">Workout</span>
                    <span className="text-sm font-mono text-neutral-500">{workoutActivityCount}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-foreground rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>
              </div>
            )}
            {readingActivityCount > 0 && (
              <div className="border border-border rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-neutral-950 flex items-center justify-center shrink-0 text-base">📚</div>
                <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-foreground">Reading</span>
                    <span className="text-sm font-mono text-neutral-500">{readingActivityCount}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-foreground rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {hobbiesByActivity.length > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold text-foreground">By interest</h2>
            <div className="border border-border rounded-xl flex flex-col">
              {hobbiesByActivity.map((h, i, arr) => {
                const maxC = arr[0].count
                const pct = maxC > 0 ? (h.count / maxC) * 100 : 0
                return (
                  <div key={h.value} className={`px-4 py-3 flex items-center gap-3 ${i < arr.length - 1 ? 'border-b border-border' : ''}`}>
                    <div className="w-8 h-8 rounded-lg bg-neutral-950 flex items-center justify-center shrink-0 text-base">
                      {h.icon}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-foreground">{h.label}</span>
                        <span className="text-sm font-mono text-neutral-500">{h.count}</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-foreground rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {socialActivityCount > 0 && (
          <div className="border border-border rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-950 flex items-center justify-center shrink-0 text-base">👥</div>
            <div className="flex-1 min-w-0 flex flex-col gap-1.5">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-foreground">Life</span>
                <span className="text-sm font-mono text-neutral-500">{socialActivityCount}</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-foreground rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
})

export default StatsTab
