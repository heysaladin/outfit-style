'use client'

import { calcWorth, type WPStatus } from '@/lib/worth'

const C = {
  bg: '#FDF7EE', card: '#FFFFFF', line: '#EFE6D6',
  ink: '#22190F', muted: '#8D8271', faint: '#B8AD9A',
  orange: '#FF7A2F', orangeSoft: '#FFE9DB',
  mint: '#3FBF8F', mintSoft: '#DDF4EA',
  yellow: '#F59E0B', yellowSoft: '#FEF3C7',
  blue: '#3B82F6', blueSoft: '#EFF6FF',
  purple: '#8B5CF6', purpleSoft: '#F5F3FF',
  shadow: '0 6px 18px rgba(84,62,32,.08)',
}
const DP = 'var(--font-bricolage), system-ui, sans-serif'
const UI = "'Inter', -apple-system, system-ui, sans-serif"

interface WorthCardProps {
  purchasePrice: number | null | undefined
  purchaseDate: string | null | undefined
  totalUses?: number | null
}

function fmt(n: number): string {
  if (n >= 1000) return n.toLocaleString('id-ID', { maximumFractionDigits: 0 })
  return n.toLocaleString('id-ID', { maximumFractionDigits: 2 })
}

const STATUS_META: Record<WPStatus, { label: string; icon: string; bar: string; textColor: string; softBg: string }> = {
  'not-worth':    { label: 'Not Worth',    icon: '🌱', bar: C.faint,   textColor: C.muted,  softBg: '#F5F0E8' },
  'almost-worth': { label: 'Almost Worth', icon: '⚡', bar: C.yellow,  textColor: '#B45309', softBg: C.yellowSoft },
  'worth':        { label: 'Worth It',     icon: '✅', bar: C.mint,    textColor: '#059669', softBg: C.mintSoft },
  'great':        { label: 'Great',        icon: '🔥', bar: C.blue,    textColor: C.blue,   softBg: C.blueSoft },
  'excellent':    { label: 'Excellent',    icon: '💎', bar: C.purple,  textColor: C.purple, softBg: C.purpleSoft },
}

export function WorthCard({ purchasePrice, purchaseDate, totalUses }: WorthCardProps) {
  if (!purchasePrice) return null

  const { cpu, cpd, daysOwned, wpStatus, remainingToWP, wpTarget } = calcWorth({
    purchasePrice,
    purchaseDate,
    totalUses,
  })

  const hasCPU = wpStatus !== null
  const hasCPD = cpd !== null
  if (!hasCPU && !hasCPD) return null

  const uses = totalUses ?? 0
  const progressPct = Math.min((uses / wpTarget) * 100, 100)
  const meta = wpStatus ? STATUS_META[wpStatus] : null
  const wpAchieved = remainingToWP === 0

  return (
    <div style={{
      background: C.card, borderRadius: 22, overflow: 'hidden',
      boxShadow: C.shadow, fontFamily: UI, marginBottom: 12,
    }}>
      {/* Main body */}
      <div style={{ padding: '16px 16px 14px' }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: C.faint, marginBottom: 14 }}>
          Worth Score
        </p>

        {hasCPU && meta && (
          <>
            {/* Status row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 14, fontSize: 20,
                  background: meta.softBg, display: 'grid', placeItems: 'center', flexShrink: 0,
                }}>
                  {meta.icon}
                </div>
                <div>
                  <p style={{ fontFamily: DP, fontSize: 15, fontWeight: 800, color: meta.textColor, lineHeight: 1.1, margin: 0 }}>
                    {meta.label}
                  </p>
                  {cpu !== null && (
                    <p style={{ fontSize: 11, fontWeight: 600, color: C.muted, margin: '2px 0 0' }}>
                      Rp {fmt(cpu)} / use
                    </p>
                  )}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontFamily: DP, fontSize: 22, fontWeight: 800, color: C.ink, lineHeight: 1, margin: 0 }}>{uses}</p>
                <p style={{ fontSize: 10, fontWeight: 600, color: C.faint, marginTop: 1 }}>uses</p>
              </div>
            </div>

            {/* Progress bar */}
            <div>
              <div style={{ height: 7, background: C.line, borderRadius: 99, overflow: 'hidden', marginBottom: 6 }}>
                <div style={{
                  height: '100%', borderRadius: 99,
                  background: meta.bar,
                  width: `${progressPct}%`,
                  transition: 'width 0.5s ease',
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontSize: 10.5, fontWeight: 600, color: C.muted, margin: 0 }}>
                  {wpAchieved ? '🎉 Worth Point achieved!' : `${remainingToWP} more uses to Worth Point`}
                </p>
                <p style={{ fontSize: 10.5, fontWeight: 700, color: C.faint, margin: 0 }}>
                  {uses}/{wpTarget}
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* CPD footer */}
      {hasCPD && (
        <div style={{
          padding: '11px 16px', borderTop: `1px solid ${C.line}`,
          background: '#FAF4EB',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 800, color: C.ink, margin: 0 }}>Rp {fmt(cpd!)}/hari</p>
            <p style={{ fontSize: 10, fontWeight: 600, color: C.faint, margin: '1px 0 0' }}>Cost per day</p>
          </div>
          {daysOwned !== null && (
            <p style={{ fontSize: 10.5, fontWeight: 600, color: C.muted, margin: 0 }}>{daysOwned} hari dimiliki</p>
          )}
        </div>
      )}
    </div>
  )
}
