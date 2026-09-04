'use client'

import { useState } from 'react'
import { X, ChevronUp, ChevronDown } from 'lucide-react'
import type { ReactNode } from 'react'
import type { HobbyValue } from '@/lib/types'
import { HOBBIES } from '@/lib/types'
import { MobileButton } from '@/components/ui/mobile-shims'

export const HOBBY_ORDER_KEY = 'gear_hobby_order'

export function getOrderedHobbies() {
  if (typeof window === 'undefined') return [...HOBBIES]
  try {
    const saved = localStorage.getItem(HOBBY_ORDER_KEY)
    if (!saved) return [...HOBBIES]
    const order: HobbyValue[] = JSON.parse(saved)
    const ordered = order
      .map(v => HOBBIES.find(h => h.value === v))
      .filter(Boolean) as typeof HOBBIES[number][]
    const rest = HOBBIES.filter(h => !order.includes(h.value))
    return [...ordered, ...rest]
  } catch {
    return [...HOBBIES]
  }
}

interface ReorderHobbiesModalProps {
  initialOrder: typeof HOBBIES[number][]
  onClose: () => void
  onSave: (order: typeof HOBBIES[number][]) => void
}

export function ReorderHobbiesModal({ initialOrder, onClose, onSave }: ReorderHobbiesModalProps) {
  const [items, setItems] = useState(initialOrder)

  function move(index: number, dir: -1 | 1) {
    const next = index + dir
    if (next < 0 || next >= items.length) return
    setItems(prev => {
      const arr = [...prev]
      ;[arr[index], arr[next]] = [arr[next], arr[index]]
      return arr
    })
  }

  function handleSave() {
    localStorage.setItem(HOBBY_ORDER_KEY, JSON.stringify(items.map(h => h.value)))
    onSave(items)
    onClose()
  }

  return (
    <Sheet title="Reorder interests" onClose={onClose}>
      <div className="flex flex-col gap-2.5 pb-4">
        {items.map((h, i) => (
          <div key={h.value} className="flex items-center gap-3 bg-card rounded-2xl px-3.5 py-3">
            <span className="text-[19px]">{h.icon}</span>
            <b className="flex-1 text-[14.5px] font-bold">{h.label}</b>
            <div className="flex gap-1.5">
              <button
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-opacity disabled:opacity-30"
                style={{ background: 'var(--muted)' }}
              >
                <ChevronUp size={16} />
              </button>
              <button
                onClick={() => move(i, 1)}
                disabled={i === items.length - 1}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-opacity disabled:opacity-30"
                style={{ background: 'var(--muted)' }}
              >
                <ChevronDown size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <MobileButton fullWidth onClick={handleSave} className="rounded-xl">
        Save order
      </MobileButton>
    </Sheet>
  )
}

// ── Sheet primitive (fixed, Cubicle-styled) ────────────────────────────────

function Sheet({ children, onClose, title }: { children: ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full bg-background rounded-t-2xl max-h-[88dvh] flex flex-col shadow-2xl">
        <div className="mx-auto mt-2.5 h-1 w-9 rounded-full bg-muted-foreground/30 flex-shrink-0" />
        <div className="flex items-center justify-between px-5 pt-3 pb-2 flex-shrink-0">
          <h2 className="text-xl font-extrabold tracking-tight">{title}</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-card flex items-center justify-center text-foreground">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-5" style={{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom,0px))' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
