// Pure timesheet rules, shared by the UI and the server functions.

export const MAX_TICKETS = 25

/** "2026-09" -> ["2026-09-01", ..., "2026-09-30"] */
export function monthDays(ym: string): string[] {
  const [y, m] = ym.split('-').map(Number)
  const count = new Date(Date.UTC(y, m, 0)).getUTCDate()
  return Array.from({ length: count }, (_, i) => `${ym}-${String(i + 1).padStart(2, '0')}`)
}

/** 0 = Sunday ... 6 = Saturday. UTC so the server timezone never shifts the day. */
export function weekday(date: string): number {
  return new Date(`${date}T00:00:00Z`).getUTCDay()
}

export const isWeekend = (date: string) => weekday(date) % 6 === 0

export const defaultWorkdays = (ym: string) => monthDays(ym).filter((d) => !isWeekend(d))

/** "2026-09" -> "September 2026" */
export function monthLabel(ym: string): string {
  const [y, m] = ym.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleString('id-ID', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

/** The `count` months up to and including the month of `today`, newest first, as "YYYY-MM". */
export function recentMonths(today: Date, count: number): string[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(Date.UTC(today.getFullYear(), today.getMonth() - i, 1))
    return d.toISOString().slice(0, 7)
  })
}

export const ticketNo = (prefix: string, index: number) =>
  `${prefix} - ${String(index + 1).padStart(3, '0')}`

/**
 * Spread `ticketCount` tickets over the sorted workdays, earliest days first.
 * 25 tickets on 19 days -> the first 6 days get 2 tickets, the rest get 1.
 */
export function distributeDates(ticketCount: number, workdays: string[]): string[] {
  const days = [...workdays].sort()
  if (days.length === 0) return []
  const base = Math.floor(ticketCount / days.length)
  const extra = ticketCount % days.length
  return days.flatMap((day, i) => Array(base + (i < extra ? 1 : 0)).fill(day))
}
