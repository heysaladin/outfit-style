'use client'

import { calcWorth, formatWPStatus, wpStatusColor } from '@/lib/worth'

interface WorthCardProps {
  purchasePrice: number | null | undefined
  purchaseDate: string | null | undefined
  totalUses?: number | null
}

function fmt(n: number): string {
  if (n >= 1000) return n.toLocaleString('id-ID', { maximumFractionDigits: 0 })
  return n.toLocaleString('id-ID', { maximumFractionDigits: 2 })
}

export function WorthCard({ purchasePrice, purchaseDate, totalUses }: WorthCardProps) {
  if (!purchasePrice) return null

  const { cpu, cpuPercent, cpd, daysOwned, wpStatus, remainingToWP } = calcWorth({
    purchasePrice,
    purchaseDate,
    totalUses,
  })

  const hasCPU = cpuPercent !== null
  const hasCPD = cpd !== null

  if (!hasCPU && !hasCPD) return null

  return (
    <div className="bg-muted rounded-xl p-3.5 space-y-3">
      <p className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">Worth</p>

      {hasCPU && wpStatus && (
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-bold ${wpStatusColor(wpStatus)}`}>
              {formatWPStatus(wpStatus)}
            </p>
            <p className="text-muted-foreground text-[10px] mt-0.5">
              CPU {cpuPercent!.toFixed(1)}%
            </p>
          </div>
          <div className="text-right">
            {cpu !== null && (
              <p className="text-foreground text-xs font-semibold">{fmt(cpu)}/use</p>
            )}
            {remainingToWP! > 0 ? (
              <p className="text-muted-foreground text-[10px] mt-0.5">
                {remainingToWP} more to WP
              </p>
            ) : (
              <p className="text-green-500 text-[10px] font-semibold mt-0.5">WP Achieved</p>
            )}
          </div>
        </div>
      )}

      {hasCPD && (
        <div className="flex items-center justify-between border-t border-border/40 pt-2.5">
          <div>
            <p className="text-foreground text-xs font-semibold">{fmt(cpd!)}/day</p>
            <p className="text-muted-foreground text-[10px] mt-0.5">Cost Per Day</p>
          </div>
          {daysOwned !== null && (
            <p className="text-muted-foreground text-[10px]">{daysOwned} days owned</p>
          )}
        </div>
      )}
    </div>
  )
}
