const HIGH_VALUE_THRESHOLD = 100_000_000
const DEFAULT_OWNERSHIP_YEARS = 3
const FREE_TARGET_USES = 10

export type WorthItStatus = 'not_worth_it' | 'worth_it'

export interface WorthItResult {
  targetUses: number
  costPerUse: number | null
  worthItProgress: number
  isWorthIt: boolean
  status: WorthItStatus
  isFree: boolean
  isHighValue: boolean
  cpd: number | null
  daysOwned: number | null
}

export function calcWorthIt({
  purchasePrice,
  actualUses,
  usesPerWeek = 1,
  ownershipYears = DEFAULT_OWNERSHIP_YEARS,
  purchaseDate,
  targetOverride,
}: {
  purchasePrice: number | null | undefined
  actualUses?: number | null
  usesPerWeek?: number | null
  ownershipYears?: number
  purchaseDate?: string | null
  targetOverride?: number | null
}): WorthItResult {
  const price = purchasePrice ?? 0
  const uses = Math.max(0, actualUses ?? 0)
  const wpw = Math.max(0.1, usesPerWeek ?? 1)

  const isFree = price === 0
  const isHighValue = price > HIGH_VALUE_THRESHOLD

  let targetUses: number
  if (targetOverride && targetOverride > 0) {
    targetUses = targetOverride
  } else if (isFree) {
    targetUses = FREE_TARGET_USES
  } else if (!isHighValue) {
    targetUses = Math.max(10, Math.round(20 * Math.pow(price / 1_000_000, 0.6)))
  } else {
    targetUses = Math.round(ownershipYears * 52 * wpw)
  }

  let costPerUse: number | null
  if (isFree) {
    costPerUse = 0
  } else if (uses > 0) {
    costPerUse = price / uses
  } else {
    costPerUse = null
  }

  const worthItProgress = Math.min(uses / targetUses, 1) * 100
  const isWorthIt = uses >= targetUses
  const status: WorthItStatus = isWorthIt ? 'worth_it' : 'not_worth_it'

  let cpd: number | null = null
  let daysOwned: number | null = null
  if (price > 0 && purchaseDate) {
    const purchased = new Date(purchaseDate)
    const today = new Date()
    daysOwned = Math.max(1, Math.floor((today.getTime() - purchased.getTime()) / (1000 * 60 * 60 * 24)))
    cpd = price / daysOwned
  }

  return { targetUses, costPerUse, worthItProgress, isWorthIt, status, isFree, isHighValue, cpd, daysOwned }
}
