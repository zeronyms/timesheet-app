const MAX_TICKETS = 25;
function monthDays(ym) {
  const [y, m] = ym.split("-").map(Number);
  const count = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return Array.from({ length: count }, (_, i) => `${ym}-${String(i + 1).padStart(2, "0")}`);
}
function weekday(date) {
  return (/* @__PURE__ */ new Date(`${date}T00:00:00Z`)).getUTCDay();
}
const isWeekend = (date) => weekday(date) % 6 === 0;
const defaultWorkdays = (ym) => monthDays(ym).filter((d) => !isWeekend(d));
function monthLabel(ym) {
  const [y, m] = ym.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleString("id-ID", {
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  });
}
function recentMonths(today, count) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(Date.UTC(today.getFullYear(), today.getMonth() - i, 1));
    return d.toISOString().slice(0, 7);
  });
}
const ticketNo = (prefix, index) => `${prefix} - ${String(index + 1).padStart(3, "0")}`;
function distributeDates(ticketCount, workdays) {
  const days = [...workdays].sort();
  if (days.length === 0) return [];
  const base = Math.floor(ticketCount / days.length);
  const extra = ticketCount % days.length;
  return days.flatMap((day, i) => Array(base + (i < extra ? 1 : 0)).fill(day));
}
export {
  MAX_TICKETS as M,
  monthLabel as a,
  distributeDates as b,
  defaultWorkdays as d,
  isWeekend as i,
  monthDays as m,
  recentMonths as r,
  ticketNo as t,
  weekday as w
};
