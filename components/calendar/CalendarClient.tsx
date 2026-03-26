'use client'

import { useState, useTransition } from 'react'
import { ChevronLeft, ChevronRight, X, Check } from 'lucide-react'
import { logOutfit, removeOutfitLog } from '@/app/actions'
import type { Outfit, OutfitLog, WardrobeItem } from '@/lib/types'
import { BottomNav } from '@/components/BottomNav'

interface CalendarClientProps {
  logs: OutfitLog[]
  outfits: Outfit[]
  today: string
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function CalendarClient({ logs, outfits, today }: CalendarClientProps) {
  const todayDate = new Date(today + 'T12:00:00')
  const [year, setYear]   = useState(todayDate.getFullYear())
  const [month, setMonth] = useState(todayDate.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const logMap = new Map(logs.map(l => [l.date, l]))

  const firstOfMonth = new Date(year, month, 1)
  // Monday-based week: 0=Mon…6=Sun
  const startDayOfWeek = (firstOfMonth.getDay() + 6) % 7
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

  function handleRemove() {
    if (!selectedDate) return
    const log = logMap.get(selectedDate)
    if (!log) return
    startTransition(async () => {
      await removeOutfitLog(log.id)
      setSelectedDate(null)
    })
  }

  const selectedLog = selectedDate ? logMap.get(selectedDate) : null
  const selectedOutfitItems = selectedLog?.outfits?.outfit_items?.map(oi => oi.wardrobe_items).filter(Boolean) ?? []

  const monthLabel = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-16">
      <header className="sticky top-0 z-10 bg-[#0A0A0A]/95 backdrop-blur border-b border-[#1F1F1F] px-4 py-3 flex items-center justify-between">
        <button onClick={prevMonth} className="text-[#555555] hover:text-white transition-colors p-1">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-white font-bold text-base">{monthLabel}</h1>
        <button onClick={nextMonth} className="text-[#555555] hover:text-white transition-colors p-1">
          <ChevronRight size={20} />
        </button>
      </header>

      <div className="p-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {DAYS.map(d => (
            <div key={d} className="text-center text-[#444444] text-xs font-medium py-1">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (!day) return <div key={i} />
            const ds  = dateStr(day)
            const log = logMap.get(ds)
            const isToday = ds === today
            const isFuture = ds > today
            const coverImg = log?.outfits?.outfit_items?.[0]?.wardrobe_items?.image_url

            return (
              <button key={i} onClick={() => !isFuture && setSelectedDate(ds)}
                disabled={isFuture}
                className={`aspect-square rounded-xl overflow-hidden relative flex items-center justify-center transition-all ${
                  isFuture ? 'opacity-30 cursor-default' :
                  isToday  ? 'ring-1 ring-white' : ''
                } ${selectedDate === ds ? 'ring-2 ring-white' : ''}`}>
                {coverImg ? (
                  <>
                    <img src={coverImg} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30" />
                    <span className={`relative z-10 text-xs font-semibold ${isToday ? 'text-white' : 'text-white/80'}`}>{day}</span>
                  </>
                ) : (
                  <div className={`w-full h-full flex items-center justify-center rounded-xl ${
                    isToday ? 'bg-[#2A2A2A]' : 'bg-[#1A1A1A]'
                  }`}>
                    <span className={`text-xs font-medium ${isToday ? 'text-white' : 'text-[#555555]'}`}>{day}</span>
                  </div>
                )}
                {log && !coverImg && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Day modal */}
      {selectedDate && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end" onClick={() => setSelectedDate(null)}>
          <div className="w-full bg-[#0F0F0F] rounded-t-3xl max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-[#2A2A2A] rounded-full mx-auto mt-3 mb-1" />
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#1F1F1F]">
              <h2 className="text-white font-bold text-base">
                {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h2>
              <button onClick={() => setSelectedDate(null)} className="text-[#555555] hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4 pb-8">
              {selectedLog ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-white font-semibold">{selectedLog.outfits?.name ?? 'Logged'}</p>
                    <button onClick={handleRemove} disabled={isPending}
                      className="text-[#555555] hover:text-red-400 text-xs transition-colors disabled:opacity-40">Remove</button>
                  </div>
                  {selectedOutfitItems.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {selectedOutfitItems.map((item) => item && (
                        <div key={(item as WardrobeItem).id} className="aspect-square rounded-xl overflow-hidden border border-[#2A2A2A]">
                          <img src={(item as WardrobeItem).image_url} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-[#666666] text-sm">No outfit logged. Pick one:</p>
              )}

              {!selectedLog && (
                <>
                  <button onClick={() => handleLog()} disabled={isPending}
                    className="w-full py-3 rounded-xl border border-[#2A2A2A] text-[#666666] text-sm disabled:opacity-40 hover:border-[#3A3A3A] transition-colors">
                    Log day (no outfit)
                  </button>
                  <div className="space-y-2">
                    {outfits.map(outfit => {
                      const items = outfit.outfit_items?.map(oi => oi.wardrobe_items).filter(Boolean) ?? []
                      return (
                        <button key={outfit.id} onClick={() => handleLog(outfit.id)} disabled={isPending}
                          className="w-full flex items-center gap-3 p-3 bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] hover:border-[#3A3A3A] transition-colors disabled:opacity-40">
                          {items[0] && (
                            <img src={(items[0] as WardrobeItem).image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                          )}
                          <div className="text-left">
                            <p className="text-white text-sm font-medium">{outfit.name}</p>
                            {outfit.occasion && <p className="text-[#555555] text-xs capitalize">{outfit.occasion}</p>}
                          </div>
                          <Check size={16} className="ml-auto text-[#333333]" />
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
