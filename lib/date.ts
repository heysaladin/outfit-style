const TZ = 'Asia/Jakarta'

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: TZ })
}

export function formatDate(iso: string, opts?: Intl.DateTimeFormatOptions): string {
  return new Date(iso).toLocaleDateString('en-US', { timeZone: TZ, ...opts })
}

/** Returns 0 = today, 1 = yesterday, etc. based on WIB calendar day */
export function daysDiff(iso: string, now: Date = new Date()): number {
  const todayStr = now.toLocaleDateString('en-CA', { timeZone: TZ })
  const thatStr  = new Date(iso).toLocaleDateString('en-CA', { timeZone: TZ })
  const ms = new Date(todayStr).getTime() - new Date(thatStr).getTime()
  return Math.round(ms / 86400000)
}

export function formatRelative(iso: string): string {
  const diff = daysDiff(iso)
  const timeStr = formatTime(iso)
  if (diff === 0) return `Today · ${timeStr}`
  if (diff === 1) return `Yesterday · ${timeStr}`
  return formatDate(iso, { weekday: 'short', month: 'short', day: 'numeric' }) + ` · ${timeStr}`
}

export function formatDateLabel(iso: string, now: Date = new Date()): string {
  const diff = daysDiff(iso, now)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  return formatDate(iso, { month: 'short', day: 'numeric' })
}

export function nowWIB(): Date {
  return new Date()
}

export function dateStrWIB(now: Date = new Date()): string {
  return now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', timeZone: TZ })
}

export function isSameDayWIB(iso: string, date: Date): boolean {
  const a = new Date(iso).toLocaleDateString('en-CA', { timeZone: TZ })
  const b = date.toLocaleDateString('en-CA', { timeZone: TZ })
  return a === b
}

export function defaultDatetimeLocal(date: Date = new Date()): string {
  // Returns datetime-local string in WIB (YYYY-MM-DDTHH:mm)
  const s = date.toLocaleString('sv-SE', { timeZone: TZ }) // "2024-01-15 14:30:00"
  return s.slice(0, 16).replace(' ', 'T')
}
