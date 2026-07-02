export type WPStatus = 'not-worth' | 'almost-worth' | 'worth' | 'great' | 'excellent'

export interface WorthResult {
  cpu: number | null
  cpuPercent: number | null
  cpd: number | null
  daysOwned: number | null
  wpStatus: WPStatus | null
  remainingToWP: number | null
  wpTarget: number
}

export function calcWorth({
  purchasePrice,
  purchaseDate,
  totalUses,
  wpTargetPercent = 5,
}: {
  purchasePrice: number | null | undefined
  purchaseDate: string | null | undefined
  totalUses?: number | null
  wpTargetPercent?: number
}): WorthResult {
  const price = purchasePrice ?? null
  const wpTarget = Math.ceil(100 / wpTargetPercent)

  // CPD
  let cpd: number | null = null
  let daysOwned: number | null = null
  if (price && purchaseDate) {
    const purchased = new Date(purchaseDate)
    const today = new Date()
    daysOwned = Math.max(1, Math.floor((today.getTime() - purchased.getTime()) / (1000 * 60 * 60 * 24)))
    cpd = price / daysOwned
  }

  // CPU
  let cpu: number | null = null
  let cpuPercent: number | null = null
  let wpStatus: WPStatus | null = null
  let remainingToWP: number | null = null

  if (price && totalUses != null) {
    if (totalUses > 0) {
      cpu = price / totalUses
      cpuPercent = 100 / totalUses
      remainingToWP = Math.max(0, wpTarget - totalUses)

      if (cpuPercent <= 1) wpStatus = 'excellent'
      else if (cpuPercent <= 2) wpStatus = 'great'
      else if (cpuPercent <= 5) wpStatus = 'worth'
      else if (cpuPercent <= 10) wpStatus = 'almost-worth'
      else wpStatus = 'not-worth'
    } else {
      cpuPercent = 100
      wpStatus = 'not-worth'
      remainingToWP = wpTarget
    }
  }

  return { cpu, cpuPercent, cpd, daysOwned, wpStatus, remainingToWP, wpTarget }
}

export function formatWPStatus(status: WPStatus): string {
  switch (status) {
    case 'not-worth':    return 'Not Worth'
    case 'almost-worth': return 'Almost Worth'
    case 'worth':        return 'Worth'
    case 'great':        return 'Great'
    case 'excellent':    return 'Excellent'
  }
}

export function wpStatusColor(status: WPStatus): string {
  switch (status) {
    case 'not-worth':    return 'text-muted-foreground'
    case 'almost-worth': return 'text-yellow-500'
    case 'worth':        return 'text-green-500'
    case 'great':        return 'text-blue-500'
    case 'excellent':    return 'text-purple-500'
  }
}
