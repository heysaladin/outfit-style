'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X, Check } from 'lucide-react'
import { logOutfit, removeOutfitLog } from '@/app/actions'
import type { Outfit, OutfitLog, WardrobeItem } from '@/lib/types'
import { daysDiff } from '@/lib/date'
import { cn } from '@/lib/utils'
import { BottomNav } from '@/components/BottomNav'
import { UserAvatarMenu } from '@/components/UserAvatarMenu'

interface CalendarClientProps {
  logs: OutfitLog[]
  outfits: Outfit[]
  today: string
}

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export function CalendarClient({ logs, outfits, today }: CalendarClientProps) {
  const todayDate = new Date(today + 'T12:00:00')
  const [year, setYear]   = useState(todayDate.getFullYear())
  const [month, setMonth] = useState(todayDate.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const logMap = logs.reduce((m, l) => {
    m.set(l.date, [...(m.get(l.date) ?? []), l])
    return m
  }, new Map<string, OutfitLog[]>())

  const daysLoggedCount = logMap.size
  const thisWeekCount = [...logMap.keys()].filter(d => {
    const diff = daysDiff(d)
    return diff >= 0 && diff < 7
  }).length
  const dayStreak = (() => {
    let streak = 0
    const cur = new Date(today + 'T12:00:00')
    while (logMap.has(cur.toISOString().split('T')[0])) {
      streak++
      cur.setDate(cur.getDate() - 1)
    }
    return streak
  })()

  const firstOfMonth = new Date(year, month, 1)
  const startDayOfWeek = firstOfMonth.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (number | null)[] = [
    ...Array(startDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1)
  }

  function dateStr(day: number) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  function handleLog(outfitId?: string) {
    if (!selectedDate) return
    startTransition(async () => {
      await logOutfit(selectedDate, outfitId)
      setSelectedDate(null)
    })
  }

  function handleRemove(logId: string) {
    startTransition(async () => {
      await removeOutfitLog(logId)
    })
  }

  const selectedLogs = selectedDate ? (logMap.get(selectedDate) ?? []) : []

  const monthLabel = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const todayLogs = logMap.get(today) ?? []
  const todayLabel = new Date(today + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  return (
    <div className="h-dvh overflow-y-auto bg-background pb-24">
      <div
        className="bg-neutral-950 rounded-b-[28px] px-3 pb-[58px] flex flex-col"
        style={{ paddingTop: 'calc(16px + env(safe-area-inset-top, 0px))' }}
      >
        <div className="h-9 flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
            <Link
              href="/fashion"
              aria-label="Back to Interestory"
              className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-200 shrink-0"
            >
              <ChevronLeft size={16} strokeWidth={2} />
            </Link>
            <span className="text-xl font-semibold tracking-tight text-[#EEF040]">ofit</span>
          </div>
          <UserAvatarMenu buttonClassName="relative w-9 h-9 rounded-full bg-neutral-800 border-2 border-neutral-700 flex items-center justify-center overflow-hidden flex-shrink-0" />
        </div>

        <div className="pt-7 px-2 flex flex-col gap-2">
          <p className="text-sm font-medium uppercase tracking-[1.5px] text-neutral-400">Wear log</p>
          <h1 className="text-[30px] leading-[30px] tracking-[-1px] font-semibold text-neutral-50">Calendar</h1>
        </div>
      </div>

      <div className="-mt-[34px] mx-3 relative bg-neutral-800 rounded-xl px-4 py-3.5 grid grid-cols-3 gap-3 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)]">
        {[
          { label: 'Days logged', value: daysLoggedCount },
          { label: 'This week', value: thisWeekCount },
          { label: 'Day streak', value: dayStreak },
        ].map(stat => (
          <div key={stat.label} className="flex flex-col gap-0.5 min-w-0">
            <span className="text-2xl font-semibold tracking-[-0.5px] font-mono text-neutral-50">{stat.value}</span>
            <span className="text-xs text-neutral-400 truncate">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="px-5 pt-7 pb-28 flex flex-col gap-6">
        <div className="border border-border rounded-xl p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between px-1 pb-1">
            <button onClick={prevMonth} aria-label="Bulan sebelumnya" className="w-8 h-8 rounded-md border border-border flex items-center justify-center text-foreground">
              <ChevronLeft size={14} />
            </button>
            <span className="text-base font-semibold text-foreground">{monthLabel}</span>
            <button onClick={nextMonth} aria-label="Bulan berikutnya" className="w-8 h-8 rounded-md border border-border flex items-center justify-center text-foreground">
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-0.5">
            {DAYS.map((d, i) => (
              <div key={i} className="h-6 flex items-center justify-center text-xs text-muted-foreground">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((day, i) => {
              if (!day) return <div key={i} />
              const ds   = dateStr(day)
              const dayLogs = logMap.get(ds) ?? []
              const isToday = ds === today
              const isFuture = ds > today
              const isLogged = dayLogs.length > 0

              return (
                <button key={i} onClick={() => !isFuture && setSelectedDate(ds)}
                  disabled={isFuture}
                  title={isFuture ? 'Belum bisa di-log' : undefined}
                  className={cn(
                    'h-10 rounded-lg flex flex-col items-center justify-center gap-[3px] transition-all',
                    isFuture ? 'opacity-30 cursor-default' : '',
                    isToday ? 'bg-neutral-950' : '',
                    selectedDate === ds && !isToday ? 'ring-1 ring-foreground' : '',
                  )}
                >
                  <span className={cn('text-sm font-mono', isToday ? 'font-semibold text-neutral-50' : 'text-foreground')}>{day}</span>
                  <span
                    className="w-[5px] h-[5px] rounded-full"
                    style={{ background: isLogged ? (isToday ? '#EEF040' : 'currentColor') : 'transparent' }}
                  />
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-xl font-semibold text-foreground">{todayLabel}</h2>
            <span className="text-sm text-muted-foreground">Today</span>
          </div>

          {todayLogs.length > 0 ? (
            todayLogs.map(log => {
              const logItems = (log.outfits?.outfit_items?.map(oi => oi.wardrobe_items).filter(Boolean) ?? []) as WardrobeItem[]
              return (
                <button key={log.id} onClick={() => setSelectedDate(today)} className="border border-border rounded-xl p-3 flex items-center gap-3 text-left">
                  <div className="flex shrink-0">
                    {logItems.slice(0, 3).map((item, idx) => (
                      <div key={item.id} className={cn('w-10 h-[52px] rounded-lg overflow-hidden bg-muted border border-border relative shrink-0', idx > 0 && '-ml-3')}>
                        <Image src={item.image_url} alt="" fill className="object-cover" sizes="40px" />
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <p className="text-sm font-medium text-foreground truncate">{log.outfits?.name ?? 'Logged'}</p>
                    <p className="text-xs text-muted-foreground truncate">{logItems.map(i => i.name).join(', ')}</p>
                  </div>
                  <span className="h-6 px-2.5 rounded-full bg-neutral-950 text-[#EEF040] text-xs font-semibold flex items-center shrink-0">Worn</span>
                </button>
              )
            })
          ) : (
            <button onClick={() => setSelectedDate(today)} className="border border-dashed border-border rounded-xl p-4 text-left">
              <p className="text-muted-foreground text-sm">No outfit logged. Tap to log today.</p>
            </button>
          )}
        </div>
      </div>

      {/* Day modal */}
      {selectedDate && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end" onClick={() => setSelectedDate(null)}>
          <div className="w-full bg-background rounded-t-3xl max-h-[80vh] overflow-y-auto border-t border-border"
            onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-border rounded-full mx-auto mt-3 mb-1" />
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <h2 className="text-foreground font-bold text-base">
                {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h2>
              <button onClick={() => setSelectedDate(null)} aria-label="Tutup" className="text-muted-foreground hover:text-foreground p-1"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4 pb-8">
              {selectedLogs.length > 0 ? (
                <div className="space-y-4">
                  {selectedLogs.map((log, idx) => {
                    const items = log.outfits?.outfit_items?.map(oi => oi.wardrobe_items).filter(Boolean) ?? []
                    return (
                      <div key={log.id} className="space-y-2">
                        {idx > 0 && <div className="border-t border-border" />}
                        <div className="flex items-center justify-between">
                          <p className="text-foreground font-semibold text-sm">{log.outfits?.name ?? 'Logged'}</p>
                          <button onClick={() => handleRemove(log.id)} disabled={isPending}
                            className="text-muted-foreground hover:text-destructive text-xs transition-colors disabled:opacity-40">Remove</button>
                        </div>
                        {items.length > 0 && (
                          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                            {items.map((item) => item && (
                              <div key={(item as WardrobeItem).id} className="w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden border border-border relative">
                                <Image src={(item as WardrobeItem).image_url} alt="" fill className="object-cover" sizes="64px" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No outfit logged. Pick one:</p>
              )}

              {selectedLogs.length === 0 && (
                <>
                  <button onClick={() => handleLog()} disabled={isPending}
                    className="w-full py-3 rounded-xl border border-border text-muted-foreground text-sm disabled:opacity-40 hover:border-primary/50 transition-colors">
                    Log day (no outfit)
                  </button>
                  <div className="space-y-2">
                    {outfits.map(outfit => {
                      const items = outfit.outfit_items?.map(oi => oi.wardrobe_items).filter(Boolean) ?? []
                      return (
                        <button key={outfit.id} onClick={() => handleLog(outfit.id)} disabled={isPending}
                          className="w-full flex items-center gap-3 p-3 bg-muted rounded-xl border border-border hover:border-primary/50 transition-colors disabled:opacity-40">
                          {items[0] && (
                            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 relative">
                              <Image src={(items[0] as WardrobeItem).image_url} alt="" fill className="object-cover" sizes="40px" />
                            </div>
                          )}
                          <div className="text-left">
                            <p className="text-foreground text-sm font-medium">{outfit.name}</p>
                            {outfit.occasion && <p className="text-muted-foreground text-xs capitalize">{outfit.occasion}</p>}
                          </div>
                          <Check size={16} className="ml-auto text-muted-foreground" />
                        </button>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
