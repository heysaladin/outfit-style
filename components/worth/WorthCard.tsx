'use client'

import { calcWorthIt } from '@/lib/worth'

const C = {
  bg: 'var(--background)', card: 'var(--card)', line: 'var(--border)',
  ink: 'var(--foreground)', muted: 'var(--muted-foreground)',
  shadow: '0 6px 18px rgba(84,62,32,.08)',
  mint: '#059669', mintSoft: '#ECFDF5',
  yellow: '#F59E0B', yellowSoft: '#FEF3C7',
}
const DP = 'var(--font-sans), system-ui, sans-serif'
const UI = "'Inter', -apple-system, system-ui, sans-serif"

interface WorthCardProps {
  purchasePrice: number | null | undefined
  purchaseDate: string | null | undefined
  totalUses?: number | null
  usesPerWeek?: number | null
  ownershipYears?: number
  targetOverride?: number | null
}

function fmt(n: number): string {
  if (n >= 1000) return n.toLocaleString('id-ID', { maximumFractionDigits: 0 })
  return n.toLocaleString('id-ID', { maximumFractionDigits: 2 })
}

function progressColor(pct: number, isWorthIt: boolean): string {
  if (isWorthIt) return C.mint
  if (pct >= 75) return C.yellow
  return 'var(--muted-foreground)'
}

export function WorthCard({ purchasePrice, purchaseDate, totalUses, usesPerWeek, ownershipYears, targetOverride }: WorthCardProps) {
  if (purchasePrice == null) return (
    <div style={{
      background: 'var(--card)', borderRadius: 22, overflow: 'hidden',
      boxShadow: C.shadow, fontFamily: UI, marginBottom: 12, padding: '16px 16px 14px',
    }}>
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--muted-foreground)', marginBottom: 10 }}>
        Worth Score
      </p>
      <p style={{ fontSize: 13, color: 'var(--muted-foreground)', margin: 0 }}>No purchase price — add one to see the worth score.</p>
    </div>
  )

  const { targetUses, costPerUse, worthItProgress, isWorthIt, isFree, cpd, daysOwned } = calcWorthIt({
    purchasePrice,
    actualUses: totalUses,
    usesPerWeek,
    ownershipYears,
    purchaseDate,
    targetOverride,
  })

  const uses = Math.max(0, totalUses ?? 0)
  const remaining = Math.max(0, targetUses - uses)
  const barColor = progressColor(worthItProgress, isWorthIt)
  const hasCPD = cpd !== null

  return (
    <div style={{
      background: C.card, borderRadius: 22, overflow: 'hidden',
      boxShadow: C.shadow, fontFamily: UI, marginBottom: 12,
    }}>
      <div style={{ padding: '16px 16px 14px' }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: C.muted, marginBottom: 14 }}>
          Worth Score
        </p>

        {/* Status row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14, fontSize: 20,
              background: isWorthIt ? C.mintSoft : 'var(--muted)',
              display: 'grid', placeItems: 'center', flexShrink: 0,
            }}>
              {isWorthIt ? '✅' : isFree ? '🎁' : '🌱'}
            </div>
            <div>
              <p style={{ fontFamily: DP, fontSize: 15, fontWeight: 800, color: isWorthIt ? C.mint : C.ink, lineHeight: 1.1, margin: 0 }}>
                {isWorthIt ? 'Worth It' : isFree ? 'Free Item' : 'In Progress'}
              </p>
              {!isFree && costPerUse != null && (
                <p style={{ fontSize: 11, fontWeight: 600, color: C.muted, margin: '2px 0 0' }}>
                  Rp {fmt(costPerUse)} / use
                </p>
              )}
              {isFree && (
                <p style={{ fontSize: 11, fontWeight: 600, color: C.muted, margin: '2px 0 0' }}>
                  Free
                </p>
              )}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontFamily: DP, fontSize: 22, fontWeight: 800, color: C.ink, lineHeight: 1, margin: 0 }}>{uses}</p>
            <p style={{ fontSize: 10, fontWeight: 600, color: C.muted, marginTop: 1 }}>uses</p>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div style={{ height: 7, background: 'var(--border)', borderRadius: 99, overflow: 'hidden', marginBottom: 6 }}>
            <div style={{
              height: '100%', borderRadius: 99,
              background: barColor,
              width: `${worthItProgress}%`,
              transition: 'width 0.5s ease',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: 10.5, fontWeight: 600, color: C.muted, margin: 0 }}>
              {isWorthIt ? '🎉 Worth It achieved!' : `${remaining} more uses to Worth It`}
            </p>
            <p style={{ fontSize: 10.5, fontWeight: 700, color: C.muted, margin: 0 }}>
              {uses}/{targetUses}
            </p>
          </div>
        </div>
      </div>

      {hasCPD && (
        <div style={{
          padding: '11px 16px', borderTop: `1px solid ${C.line}`,
          background: 'var(--muted)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 800, color: C.ink, margin: 0 }}>Rp {fmt(cpd!)}/day</p>
            <p style={{ fontSize: 10, fontWeight: 600, color: C.muted, margin: '1px 0 0' }}>Cost per day</p>
          </div>
          {daysOwned !== null && (
            <p style={{ fontSize: 10.5, fontWeight: 600, color: C.muted, margin: 0 }}>{daysOwned} days owned</p>
          )}
        </div>
      )}
    </div>
  )
}
