'use client'

import { calcWorth, type WPStatus } from '@/lib/worth'

interface WorthCardProps {
  purchasePrice: number | null | undefined
  purchaseDate: string | null | undefined
  totalUses?: number | null
}

function fmt(n: number): string {
  if (n >= 1000) return n.toLocaleString('id-ID', { maximumFractionDigits: 0 })
  return n.toLocaleString('id-ID', { maximumFractionDigits: 2 })
}

const STATUS_META: Record<WPStatus, { label: string; icon: string; bar: string; text: string }> = {
  'not-worth':    { label: 'Not Worth',    icon: '🌱', bar: 'bg-muted-foreground/40', text: 'text-muted-foreground' },
  'almost-worth': { label: 'Almost Worth', icon: '⚡', bar: 'bg-yellow-500',          text: 'text-yellow-500' },
  'worth':        { label: 'Worth It',     icon: '✅', bar: 'bg-green-500',            text: 'text-green-500' },
  'great':        { label: 'Great',        icon: '🔥', bar: 'bg-blue-500',             text: 'text-blue-500' },
  'excellent':    { label: 'Excellent',    icon: '💎', bar: 'bg-purple-500',           text: 'text-purple-500' },
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
    <div className="rounded-xl overflow-hidden border border-border">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 bg-muted/50">
        <p className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider mb-3">Worth Score</p>

        {hasCPU && meta && (
          <>
            {/* Status */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl leading-none">{meta.icon}</span>
                <div>
                  <p className={`text-base font-bold leading-tight ${meta.text}`}>{meta.label}</p>
                  {cpu !== null && (
                    <p className="text-muted-foreground text-[11px]">
                      Rp {fmt(cpu)} / use
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-foreground font-bold text-lg leading-tight">{uses}</p>
                <p className="text-muted-foreground text-[10px]">uses</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="h-2 bg-border rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${meta.bar}`}
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-[10px]">
                  {wpAchieved
                    ? '🎉 Worth Point achieved!'
                    : `${remainingToWP} more uses to Worth Point`}
                </p>
                <p className="text-muted-foreground text-[10px]">
                  {uses}/{wpTarget}
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* CPD footer */}
      {hasCPD && (
        <div className="px-4 py-3 flex items-center justify-between border-t border-border bg-muted/30">
          <div>
            <p className="text-foreground text-xs font-semibold">Rp {fmt(cpd!)}/hari</p>
            <p className="text-muted-foreground text-[10px]">Cost per day</p>
          </div>
          {daysOwned !== null && (
            <p className="text-muted-foreground text-[10px]">{daysOwned} hari dimiliki</p>
          )}
        </div>
      )}
    </div>
  )
}
