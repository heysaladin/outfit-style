'use client'

import React, { useMemo, useState, useRef } from 'react'
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
  fashionTotalInvested: number
  fashionWorthItAccum: number
  fashionProgressWorth: number
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

const PASSWORD = 'uang'

function FashionValueSection({ totalInvested, worthItAccum, progressWorth }: {
  totalInvested: number
  worthItAccum: number
  progressWorth: number
}) {
  const [visible, setVisible] = useState(false)
  const [pwOpen, setPwOpen] = useState(false)
  const [pwInput, setPwInput] = useState('')
  const [pwError, setPwError] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const amortized = worthItAccum + progressWorth
  const progressPct = Math.round((amortized / totalInvested) * 100)
  const remaining = Math.max(0, totalInvested - amortized)

  function openPrompt() {
    if (visible) { setVisible(false); return }
    setPwInput(''); setPwError(false); setPwOpen(true)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  function submitPassword() {
    if (pwInput === PASSWORD) {
      setVisible(true); setPwOpen(false)
    } else {
      setPwError(true)
      setPwInput('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">👔</span>
            <span className="text-sm font-semibold text-muted-foreground">fashion in value</span>
          </div>
          <button
            onClick={openPrompt}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            {visible ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            )}
          </button>
        </div>

        {visible && (
          <div className="border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3.5 flex items-center justify-between border-b border-border">
              <span className="text-sm text-muted-foreground">Total invested</span>
              <span className="text-sm font-mono font-semibold text-foreground">{formatIDR(totalInvested)}</span>
            </div>
            <div className="px-4 py-3.5 flex items-center justify-between border-b border-border">
              <span className="text-sm text-muted-foreground">Worth it</span>
              <span className="text-sm font-mono font-semibold text-green-600">−{formatIDR(worthItAccum)}</span>
            </div>
            <div className="px-4 py-3.5 flex items-center justify-between border-b border-border">
              <span className="text-sm text-muted-foreground">Progress worth</span>
              <span className="text-sm font-mono font-semibold text-foreground">{formatIDR(progressWorth)}</span>
            </div>
            <div className="px-4 py-3.5 flex items-center justify-between border-b border-border">
              <span className="text-sm font-medium text-foreground">Remaining</span>
              <span className="text-sm font-mono font-bold text-foreground">{formatIDR(remaining)}</span>
            </div>
            <div className="px-4 py-4 flex flex-col gap-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatIDR(worthItAccum + progressWorth)}</span>
                <span>{formatIDR(totalInvested)}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-foreground rounded-full transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {pwOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setPwOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative bg-background rounded-2xl shadow-xl p-5 w-[280px] flex flex-col gap-3"
            onClick={e => e.stopPropagation()}
          >
            <p className="text-sm font-semibold text-foreground text-center">Enter password</p>
            <input
              ref={inputRef}
              type="password"
              value={pwInput}
              onChange={e => { setPwInput(e.target.value); setPwError(false) }}
              onKeyDown={e => e.key === 'Enter' && submitPassword()}
              placeholder="Password"
              className={`w-full rounded-xl border px-3 h-11 text-sm bg-background outline-none focus:ring-2 focus:ring-ring text-center tracking-widest ${pwError ? 'border-red-400' : 'border-border'}`}
            />
            {pwError && <p className="text-xs text-red-500 text-center -mt-1">Wrong password</p>}
            <button
              onClick={submitPassword}
              className="w-full h-11 rounded-xl bg-foreground text-background text-sm font-bold"
            >
              Unlock
            </button>
          </div>
        </div>
      )}
    </>
  )
}

function formatIDR(n: number): string {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`
  if (n >= 1_000) return `Rp ${Math.round(n / 1_000)}rb`
  return `Rp ${Math.round(n)}`
}

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
  fashionTotalInvested,
  fashionWorthItAccum,
  fashionProgressWorth,
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
            <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0 text-base">👔</div>
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
                <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0 text-base">🏋️</div>
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
                <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0 text-base">📚</div>
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
                    <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0 text-base">
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
            <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0 text-base">👥</div>
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

        {fashionTotalInvested > 0 && <FashionValueSection
          totalInvested={fashionTotalInvested}
          worthItAccum={fashionWorthItAccum}
          progressWorth={fashionProgressWorth}
        />}
      </div>
    </>
  )
})

export default StatsTab
