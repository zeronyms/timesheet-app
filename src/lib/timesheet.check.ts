// Run: node src/lib/timesheet.check.ts
import assert from 'node:assert/strict'
import { defaultWorkdays, distributeDates, monthDays, monthLabel, recentMonths, ticketNo } from './timesheet.ts'

assert.equal(monthDays('2026-09').length, 30)
assert.equal(monthDays('2028-02').length, 29)
assert.equal(defaultWorkdays('2026-09').length, 22)
assert.equal(monthLabel('2026-09'), 'September 2026')
assert.deepEqual(recentMonths(new Date(2026, 0, 15), 2), ['2026-01', '2025-12'])
assert.equal(ticketNo('ITSM 5', 0), 'ITSM 5 - 001')

const days = defaultWorkdays('2026-09').slice(0, 19)
const slots = distributeDates(25, days)
assert.equal(slots.length, 25)
assert.deepEqual(slots.slice(0, 3), [days[0], days[0], days[1]])
assert.equal(new Set(slots).size, 19)
assert.deepEqual(distributeDates(3, days), days.slice(0, 3))
assert.deepEqual(distributeDates(5, []), [])

console.log('timesheet checks ok')
