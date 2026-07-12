'use client'

import { useState } from 'react'
import type { HobbyValue } from '@/lib/types'
import { HOBBIES } from '@/lib/types'

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

const C = {
  bg: '#FDF7EE', card: '#FFFFFF', card2: '#F7F0E4', line: '#EFE6D6',
  ink: '#22190F', muted: '#8D8271',
  orange: '#FF7A2F',
  shadow: '0 6px 18px rgba(84,62,32,.08)',
  shadowLg: '0 14px 34px rgba(84,62,32,.14)',
}
const DP = 'var(--font-bricolage), system-ui, sans-serif'
const UI = "'Inter', -apple-system, system-ui, sans-serif"

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
    <>
      {/* Scrim */}
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(50,35,15,.4)', zIndex: 40 }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div style={{
        position: 'fixed', left: '50%', transform: 'translateX(-50%)',
        bottom: 0, width: '100%', maxWidth: 430,
        zIndex: 50, background: C.bg,
        borderRadius: '30px 30px 0 0',
        boxShadow: '0 -10px 40px rgba(60,40,15,.18)',
        maxHeight: '88dvh', display: 'flex', flexDirection: 'column',
        paddingBottom: 'env(safe-area-inset-bottom,0px)',
      }}>
        {/* Grab handle */}
        <div style={{ width: 40, height: 5, borderRadius: 99, background: C.line, margin: '10px auto 2px' }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 18px 12px' }}>
          <h2 style={{ fontFamily: DP, fontSize: 20, fontWeight: 800, letterSpacing: '-0.01em', margin: 0 }}>
            Reorder interests
          </h2>
          <button
            onClick={onClose}
            style={{
              width: 42, height: 42, borderRadius: 16, border: 'none',
              background: C.card, color: C.ink, cursor: 'pointer',
              display: 'grid', placeItems: 'center', boxShadow: C.shadow,
            }}
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18"/>
            </svg>
          </button>
        </div>

        {/* List */}
        <div style={{ overflowY: 'auto', padding: '0 18px 18px', flex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {items.map((h, i) => (
              <div key={h.value} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: C.card, boxShadow: C.shadow, borderRadius: 16,
                padding: '12px 14px',
              }}>
                <span style={{ fontSize: 19 }}>{h.icon}</span>
                <b style={{ flex: 1, fontSize: 14.5, fontWeight: 700, fontFamily: UI }}>{h.label}</b>
                <div style={{ display: 'flex', gap: 5 }}>
                  <button
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    style={{
                      width: 34, height: 34, borderRadius: 12, border: 'none',
                      background: i === 0 ? C.line : C.card2,
                      color: i === 0 ? C.muted : C.ink,
                      cursor: i === 0 ? 'default' : 'pointer',
                      fontSize: 14, fontWeight: 700, display: 'grid', placeItems: 'center',
                    }}
                  >↑</button>
                  <button
                    onClick={() => move(i, 1)}
                    disabled={i === items.length - 1}
                    style={{
                      width: 34, height: 34, borderRadius: 12, border: 'none',
                      background: i === items.length - 1 ? C.line : C.card2,
                      color: i === items.length - 1 ? C.muted : C.ink,
                      cursor: i === items.length - 1 ? 'default' : 'pointer',
                      fontSize: 14, fontWeight: 700, display: 'grid', placeItems: 'center',
                    }}
                  >↓</button>
                </div>
              </div>
            ))}
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            style={{
              width: '100%', border: 'none', borderRadius: 18, padding: 17,
              cursor: 'pointer', marginTop: 14,
              background: C.orange, color: '#fff',
              fontFamily: UI, fontSize: 15, fontWeight: 800,
              boxShadow: '0 10px 22px rgba(255,122,47,.35)',
            }}
          >
            Save order
          </button>
        </div>
      </div>
    </>
  )
}
