'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { DAY_NAMES, addDays, formatDate, formatMonthDay } from '@/lib/week'
import { BottomNav } from '@/components/BottomNav'
import { DayRow } from './DayRow'
import { ItemPickerModal } from './ItemPickerModal'
import type { WardrobeItem, PlanEntry } from '@/lib/types'

interface WeeklyPlanClientProps {
  weekStart: string
  plans: PlanEntry[]
  allItems: WardrobeItem[]
  today: string
}

export function WeeklyPlanClient({ weekStart, plans, allItems, today }: WeeklyPlanClientProps) {
  const router = useRouter()
  const [pickerDay, setPickerDay] = useState<string | null>(null)

  const monday = new Date(weekStart + 'T00:00:00')
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i))

  const plansByDate = plans.reduce<Record<string, PlanEntry[]>>((acc, plan) => {
    const d = plan.planned_date
    acc[d] = acc[d] ? [...acc[d], plan] : [plan]
    return acc
  }, {})

  function navigate(dir: number) {
    const newMonday = addDays(monday, dir * 7)
    router.push(`/plan?week=${formatDate(newMonday)}`)
  }

  const weekLabel = `${formatMonthDay(monday)} – ${formatMonthDay(addDays(monday, 6))}`
  const pickerDayPlans = pickerDay ? (plansByDate[pickerDay] ?? []) : []

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#0A0A0A]/95 backdrop-blur border-b border-[#1F1F1F] px-4 pt-3 pb-3">
        <h1 className="text-white font-bold text-lg tracking-tight mb-2">Weekly Plan</h1>
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 flex items-center justify-center text-[#555555] hover:text-white transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-white text-sm font-medium">{weekLabel}</span>
          <button
            onClick={() => navigate(1)}
            className="w-8 h-8 flex items-center justify-center text-[#555555] hover:text-white transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </header>

      {/* Day rows */}
      <div className="divide-y divide-[#1A1A1A]">
        {days.map((date, i) => {
          const dateStr = formatDate(date)
          return (
            <DayRow
              key={dateStr}
              date={date}
              dateStr={dateStr}
              dayLabel={DAY_NAMES[i]}
              isToday={dateStr === today}
              plans={plansByDate[dateStr] ?? []}
              onAdd={() => setPickerDay(dateStr)}
            />
          )
        })}
      </div>

      <BottomNav />

      <ItemPickerModal
        open={pickerDay !== null}
        date={pickerDay ?? ''}
        dayPlans={pickerDayPlans}
        allItems={allItems}
        onClose={() => setPickerDay(null)}
      />
    </div>
  )
}
