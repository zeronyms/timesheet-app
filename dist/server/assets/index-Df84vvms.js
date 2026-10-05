import { jsxs, jsx } from "react/jsx-runtime";
import { c as createSsrRpc, R as Route, M as MONTHS } from "./router-VwyE4JWF.js";
import { useState, useMemo } from "react";
import { useRouter, useRouterState } from "@tanstack/react-router";
import { c as createServerFn } from "../server.js";
import { z } from "zod";
import { M as MAX_TICKETS, m as monthDays, w as weekday, d as defaultWorkdays, a as monthLabel, b as distributeDates, i as isWeekend, t as ticketNo } from "./timesheet-CfPCugbW.js";
import "node:async_hooks";
import "node:stream";
import "@tanstack/react-router/ssr/server";
const input = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
  ticketPrefix: z.string().trim().min(1),
  commits: z.array(z.object({
    hash: z.string(),
    repo: z.string(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    message: z.string()
  })).min(1, "Pilih minimal 1 commit.").max(MAX_TICKETS, `Maksimal ${MAX_TICKETS} tiket.`)
});
const generateTimesheet = createServerFn({
  method: "POST"
}).validator(input).handler(createSsrRpc("6a1e0d4c1c7e33d07a0b713c92fa008c4e68ed47537f2224306009f22d650a77"));
const fmt = (d) => (/* @__PURE__ */ new Date(`${d}T00:00:00Z`)).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
function SourceFilter({
  value,
  allRepos,
  defaultRepos,
  onApply
}) {
  const [draft, setDraft] = useState(value);
  const set = (patch) => setDraft({ ...draft, ...patch });
  const toggleRepo = (repo) => set({ repos: draft.repos.includes(repo) ? draft.repos.filter((r) => r !== repo) : [...draft.repos, repo] });
  return /* @__PURE__ */ jsxs("details", { className: "rounded-lg border bg-surface", children: [
    /* @__PURE__ */ jsxs("summary", { className: "cursor-pointer px-4 py-2.5 text-sm", children: [
      /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Sumber commit:" }),
      " ",
      /* @__PURE__ */ jsxs("span", { className: "text-muted", children: [
        value.repos.length,
        ' repo, author "',
        value.author,
        '", ',
        fmt(value.since),
        " sampai ",
        fmt(value.until)
      ] })
    ] }),
    /* @__PURE__ */ jsxs(
      "form",
      {
        className: "space-y-4 border-t px-4 py-4",
        onSubmit: (e) => {
          e.preventDefault();
          onApply(draft);
        },
        children: [
          /* @__PURE__ */ jsxs("fieldset", { children: [
            /* @__PURE__ */ jsxs("legend", { className: "mb-2 flex w-full flex-wrap items-baseline gap-x-3 text-sm font-medium", children: [
              "Repository",
              [
                ["Repo IHC", defaultRepos],
                ["Semua", allRepos],
                ["Kosongkan", []]
              ].map(([label, repos]) => /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => set({ repos }),
                  className: "text-sm font-normal text-accent hover:underline",
                  children: label
                },
                label
              ))
            ] }),
            /* @__PURE__ */ jsx("div", { className: "grid grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] gap-x-4 gap-y-1", children: allRepos.map((repo) => /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
              /* @__PURE__ */ jsx("input", { type: "checkbox", checked: draft.repos.includes(repo), onChange: () => toggleRepo(repo), className: "accent-accent" }),
              repo
            ] }, repo)) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-end gap-3", children: [
            /* @__PURE__ */ jsxs("label", { className: "text-sm", children: [
              /* @__PURE__ */ jsx("span", { className: "mb-1 block text-muted", children: "Dari" }),
              /* @__PURE__ */ jsx("input", { type: "date", className: "field", value: draft.since, onChange: (e) => set({ since: e.target.value }), required: true })
            ] }),
            /* @__PURE__ */ jsxs("label", { className: "text-sm", children: [
              /* @__PURE__ */ jsx("span", { className: "mb-1 block text-muted", children: "Sampai" }),
              /* @__PURE__ */ jsx("input", { type: "date", className: "field", value: draft.until, onChange: (e) => set({ until: e.target.value }), required: true })
            ] }),
            /* @__PURE__ */ jsxs("label", { className: "text-sm", children: [
              /* @__PURE__ */ jsx("span", { className: "mb-1 block text-muted", children: "Author git" }),
              /* @__PURE__ */ jsx("input", { className: "field", value: draft.author, onChange: (e) => set({ author: e.target.value }), required: true })
            ] }),
            /* @__PURE__ */ jsx("button", { type: "submit", className: "rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-paper", children: "Tampilkan commit" })
          ] })
        ]
      }
    )
  ] });
}
const DAY_LABELS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
function WorkdayCalendar({
  month,
  workdays,
  ticketsPerDay,
  onToggle
}) {
  const days = monthDays(month);
  const leading = (weekday(days[0]) + 6) % 7;
  return /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-7 gap-1 text-center", children: [
    DAY_LABELS.map((d, i) => /* @__PURE__ */ jsx("span", { className: `pb-1 text-xs ${i >= 5 ? "text-warn" : "text-muted"}`, children: d }, d)),
    Array.from({ length: leading }, (_, i) => /* @__PURE__ */ jsx("span", {}, i)),
    days.map((date) => {
      const on = workdays.includes(date);
      const tickets = ticketsPerDay[date] ?? 0;
      return /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          "aria-pressed": on,
          "aria-label": `${date}, ${on ? "masuk" : "tidak masuk"}, ${tickets} tiket`,
          onClick: () => onToggle(date),
          className: `flex h-11 flex-col items-center justify-center gap-1 rounded-md text-sm ${on ? "bg-accent-soft font-medium text-ink" : "text-muted/60 line-through decoration-muted/40 hover:bg-paper"}`,
          children: [
            Number(date.slice(8)),
            /* @__PURE__ */ jsx("span", { className: "flex h-1 gap-0.5", "aria-hidden": true, children: Array.from({ length: Math.min(tickets, 3) }, (_, i) => /* @__PURE__ */ jsx("span", { className: "h-1 w-2 rounded-full bg-accent" }, i)) })
          ]
        },
        date
      );
    })
  ] });
}
function ComposePage() {
  const {
    allRepos,
    defaultRepos,
    source,
    commits
  } = Route.useLoaderData();
  const {
    month
  } = Route.useSearch();
  const navigate = Route.useNavigate();
  const router = useRouter();
  const loading = useRouterState({
    select: (s) => s.isLoading
  });
  const [prefix, setPrefix] = useState("ITSM 5");
  const [workdaysByMonth, setWorkdaysByMonth] = useState({});
  const [selected, setSelected] = useState(/* @__PURE__ */ new Set());
  const [messageEdits, setMessageEdits] = useState({});
  const [dateEdits, setDateEdits] = useState({});
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState(null);
  const [generating, setGenerating] = useState(false);
  const workdays = workdaysByMonth[month] ?? defaultWorkdays(month);
  const label = monthLabel(month);
  const tickets = useMemo(() => {
    const chosen = commits.filter((c) => selected.has(c.hash));
    const slots = distributeDates(chosen.length, workdays);
    return chosen.map((c, i) => ({
      hash: c.hash,
      repo: c.repo,
      date: dateEdits[c.hash] ?? slots[i] ?? c.date,
      message: messageEdits[c.hash] ?? c.message
    })).sort((a, b) => a.date.localeCompare(b.date));
  }, [commits, selected, workdays, dateEdits, messageEdits]);
  const ticketIndex = new Map(tickets.map((t, i) => [t.hash, i]));
  const ticketsPerDay = {};
  for (const t of tickets) ticketsPerDay[t.date] = (ticketsPerDay[t.date] ?? 0) + 1;
  const daysUsed = Object.keys(ticketsPerDay).length;
  const doubleDays = Object.values(ticketsPerDay).filter((n) => n > 1).length;
  const weekendTickets = tickets.filter((t) => isWeekend(t.date)).length;
  const full = tickets.length >= MAX_TICKETS;
  const q = query.trim().toLowerCase();
  const visible = q ? commits.filter((c) => `${c.message} ${c.repo} ${c.date}`.toLowerCase().includes(q)) : commits;
  const toggleCommit = (hash) => {
    const next = new Set(selected);
    next.has(hash) ? next.delete(hash) : next.add(hash);
    setSelected(next);
  };
  const toggleWorkday = (date) => setWorkdaysByMonth({
    ...workdaysByMonth,
    [month]: workdays.includes(date) ? workdays.filter((d) => d !== date) : [...workdays, date]
  });
  const generate = async () => {
    if (!confirm(`Buat timesheet ${label}?

${tickets.length} tiket di ${daysUsed} hari kerja. Commit ini tidak akan muncul lagi di daftar.`)) return;
    setGenerating(true);
    setStatus(null);
    try {
      const res = await generateTimesheet({
        data: {
          month,
          ticketPrefix: prefix,
          commits: tickets
        }
      });
      setStatus({
        kind: "ok",
        text: `Timesheet dibuat: ${res.filePath}`
      });
      setSelected(/* @__PURE__ */ new Set());
      setDateEdits({});
      router.invalidate();
    } catch (err) {
      setStatus({
        kind: "error",
        text: `Timesheet gagal dibuat. ${err.message}`
      });
    } finally {
      setGenerating(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "grid items-start gap-6 lg:grid-cols-[1fr_22rem]", children: [
    /* @__PURE__ */ jsxs("aside", { className: "space-y-5 rounded-lg border bg-surface p-4 lg:sticky lg:top-4 lg:order-last", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxs("label", { className: "text-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "mb-1 block text-muted", children: "Periode" }),
          /* @__PURE__ */ jsx("select", { className: "field w-full", value: month, onChange: (e) => navigate({
            search: (s) => ({
              ...s,
              month: e.target.value,
              until: void 0
            })
          }), children: MONTHS.map((m) => /* @__PURE__ */ jsx("option", { value: m, children: monthLabel(m) }, m)) })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "text-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "mb-1 block text-muted", children: "Prefix tiket" }),
          /* @__PURE__ */ jsx("input", { className: "field w-full", value: prefix, onChange: (e) => setPrefix(e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("section", { children: [
        /* @__PURE__ */ jsxs("h2", { className: "mb-1 text-sm font-medium", children: [
          "Hari masuk: ",
          workdays.length,
          " hari"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mb-3 text-xs text-muted", children: "Klik tanggal untuk ubah masuk atau libur. Tiket dibagi rata, hari-hari awal dapat tiket lebih dulu." }),
        /* @__PURE__ */ jsx(WorkdayCalendar, { month, workdays, ticketsPerDay, onToggle: toggleWorkday })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "space-y-3 border-t pt-4", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-2xl font-semibold", children: [
          tickets.length,
          /* @__PURE__ */ jsxs("span", { className: "text-base font-normal text-muted", children: [
            " / ",
            MAX_TICKETS,
            " tiket"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("ul", { className: "space-y-1 text-sm text-muted", children: [
          /* @__PURE__ */ jsxs("li", { children: [
            daysUsed,
            " hari kerja terisi"
          ] }),
          doubleDays > 0 && /* @__PURE__ */ jsxs("li", { children: [
            doubleDays,
            " hari berisi lebih dari 1 tiket"
          ] }),
          weekendTickets > 0 && /* @__PURE__ */ jsxs("li", { className: "text-warn", children: [
            weekendTickets,
            " tiket jatuh di akhir pekan"
          ] })
        ] }),
        /* @__PURE__ */ jsx("button", { onClick: generate, disabled: generating || tickets.length === 0 || !prefix.trim(), className: "w-full rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 dark:text-paper", children: generating ? "Membuat timesheet…" : `Buat timesheet ${label}` }),
        status && /* @__PURE__ */ jsx("p", { role: "status", className: `break-words text-sm ${status.kind === "error" ? "text-danger" : "text-accent"}`, children: status.text })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "min-w-0 space-y-3", children: [
      /* @__PURE__ */ jsx(SourceFilter, { value: source, allRepos, defaultRepos, onApply: (next) => navigate({
        search: (s) => ({
          ...s,
          ...next
        })
      }) }, JSON.stringify(source)),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
        /* @__PURE__ */ jsxs("h1", { className: "mr-auto text-lg font-semibold", children: [
          "Commit belum dilaporkan ",
          /* @__PURE__ */ jsx("span", { className: "font-normal text-muted", children: commits.length })
        ] }),
        /* @__PURE__ */ jsx("input", { type: "search", className: "field w-56", placeholder: "Cari pesan, repo, tanggal", value: query, onChange: (e) => setQuery(e.target.value) }),
        /* @__PURE__ */ jsxs("button", { onClick: () => setSelected(new Set(visible.slice(0, MAX_TICKETS).map((c) => c.hash))), className: "rounded-md border bg-surface px-3 py-1.5 text-sm hover:bg-paper", children: [
          "Pilih ",
          MAX_TICKETS,
          " tertua"
        ] }),
        selected.size > 0 && /* @__PURE__ */ jsx("button", { onClick: () => setSelected(/* @__PURE__ */ new Set()), className: "text-sm text-muted hover:text-ink hover:underline", children: "Batalkan pilihan" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: `overflow-x-auto rounded-lg border bg-surface ${loading ? "opacity-60" : ""}`, children: [
        /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsx("thead", { className: "border-b text-left text-xs text-muted", children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { className: "w-10 px-3 py-2", children: /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Pilih" }) }),
            /* @__PURE__ */ jsx("th", { className: "w-28 px-3 py-2 font-normal", children: "Tiket" }),
            /* @__PURE__ */ jsx("th", { className: "w-40 px-3 py-2 font-normal", children: "Tanggal laporan" }),
            /* @__PURE__ */ jsx("th", { className: "px-3 py-2 font-normal", children: "Pekerjaan" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { className: "divide-y", children: visible.map((c) => {
            const i = ticketIndex.get(c.hash);
            const t = i === void 0 ? void 0 : tickets[i];
            return /* @__PURE__ */ jsxs("tr", { className: t ? "bg-accent-soft/50" : "", children: [
              /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsx("input", { type: "checkbox", "aria-label": `Pilih ${c.message}`, checked: !!t, disabled: !t && full, onChange: () => toggleCommit(c.hash), className: "size-4 accent-accent" }) }),
              /* @__PURE__ */ jsx("td", { className: "whitespace-nowrap px-3 py-2 text-muted", children: t && ticketNo(prefix, i) }),
              /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: t && /* @__PURE__ */ jsx("input", { type: "date", "aria-label": "Tanggal laporan", value: t.date, onChange: (e) => setDateEdits({
                ...dateEdits,
                [c.hash]: e.target.value
              }), className: `field py-1 ${isWeekend(t.date) ? "text-warn" : ""}` }) }),
              /* @__PURE__ */ jsxs("td", { className: "px-3 py-2", children: [
                /* @__PURE__ */ jsx("input", { "aria-label": "Pesan tugas", value: messageEdits[c.hash] ?? c.message, onChange: (e) => setMessageEdits({
                  ...messageEdits,
                  [c.hash]: e.target.value
                }), className: "w-full rounded border border-transparent bg-transparent px-1.5 py-0.5 hover:border-line focus:border-line focus:bg-surface" }),
                /* @__PURE__ */ jsxs("div", { className: "px-1.5 text-xs text-muted", children: [
                  c.repo,
                  " ",
                  /* @__PURE__ */ jsx("span", { className: "font-mono", children: c.hash }),
                  ", commit ",
                  c.date
                ] })
              ] })
            ] }, c.hash);
          }) })
        ] }),
        visible.length === 0 && /* @__PURE__ */ jsx("p", { className: "px-4 py-10 text-center text-sm text-muted", children: q ? `Tidak ada commit yang cocok dengan "${query}".` : 'Semua commit di rentang ini sudah dilaporkan. Mundurkan tanggal "Dari" di Sumber commit untuk mengambil sisa bulan sebelumnya.' })
      ] })
    ] })
  ] });
}
export {
  ComposePage as component
};
