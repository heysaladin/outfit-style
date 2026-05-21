'use client'

import { useTransition } from 'react'
import { Plus, X } from 'lucide-react'
import { removeFromPlan } from '@/app/actions'
import { formatMonthDay } from '@/lib/week'
import type { PlanEntry } from '@/lib/types'

interface DayRowProps {
  date: Date
  dateStr: string
  dayLabel: string
  isToday: boolean
  plans: PlanEntry[]
  onAdd: () => void
}

export function DayRow({ date, dayLabel, isToday, plans, onAdd }: DayRowProps) {
  const [isPending, startTransition] = useTransition()

  function handleRemove(planId: string) {
    startTransition(async () => {
      try { await removeFromPlan(planId) } catch { /* silently fail */ }
    })
  }

  return (
    <div className={`flex gap-3 p-4 ${isToday ? 'bg-primary/5' : ''}`}>
      {/* Day label */}
      <div className="w-11 flex-shrink-0 pt-0.5">
        <p className={`text-xs font-bold ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
          {dayLabel}
        </p>
        <p className={`text-xs mt-0.5 ${isToday ? 'text-muted-foreground' : 'text-muted-foreground/50'}`}>
          {formatMonthDay(date)}
        </p>
        {isToday && <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />}
      </div>

      {/* Items row */}
      <div className="flex gap-2 overflow-x-auto flex-1 items-center" style={{ scrollbarWidth: 'none' }}>
        {plans.map(plan => (
          <div
            key={plan.id}
            className="relative flex-shrink-0 w-16 h-[84px] rounded-xl overflow-hidden bg-muted border border-border"
          >
            <img
              src={plan.wardrobe_items.image_url}
              alt={plan.wardrobe_items.name}
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => handleRemove(plan.id)}
              disabled={isPending}
              className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/70 flex items-center justify-center"
            >
              <X size={9} className="text-white" />
            </button>
          </div>
        ))}

        <button
          onClick={onAdd}
          className="flex-shrink-0 w-16 h-[84px] rounded-xl border border-dashed border-border flex items-center justify-center hover:border-primary/50 transition-colors"
        >
          <Plus size={18} className="text-muted-foreground" />
        </button>
      </div>
    </div>
  )
}
