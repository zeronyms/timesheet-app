import { monthDays, weekday } from '~/lib/timesheet'

const DAY_LABELS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

/** Month grid: click a day to mark it as a workday; ticks show how many tickets land on it. */
export function WorkdayCalendar({
  month,
  workdays,
  ticketsPerDay,
  onToggle,
}: {
  month: string
  workdays: string[]
  ticketsPerDay: Record<string, number>
  onToggle: (date: string) => void
}) {
  const days = monthDays(month)
  const leading = (weekday(days[0]) + 6) % 7 // Monday-first grid

  return (
    <div className="grid grid-cols-7 gap-1 text-center">
      {DAY_LABELS.map((d, i) => (
        <span key={d} className={`pb-1 text-xs ${i >= 5 ? 'text-warn' : 'text-muted'}`}>
          {d}
        </span>
      ))}
      {Array.from({ length: leading }, (_, i) => (
        <span key={i} />
      ))}
      {days.map((date) => {
        const on = workdays.includes(date)
        const tickets = ticketsPerDay[date] ?? 0
        return (
          <button
            key={date}
            type="button"
            aria-pressed={on}
            aria-label={`${date}, ${on ? 'masuk' : 'tidak masuk'}, ${tickets} tiket`}
            onClick={() => onToggle(date)}
            className={`flex h-11 flex-col items-center justify-center gap-1 rounded-md text-sm ${
              on ? 'bg-accent-soft font-medium text-ink' : 'text-muted/60 line-through decoration-muted/40 hover:bg-paper'
            }`}
          >
            {Number(date.slice(8))}
            <span className="flex h-1 gap-0.5" aria-hidden>
              {Array.from({ length: Math.min(tickets, 3) }, (_, i) => (
                <span key={i} className="h-1 w-2 rounded-full bg-accent" />
              ))}
            </span>
          </button>
        )
      })}
    </div>
  )
}
