import { useMemo, useState } from "react";
import {
    createFileRoute,
    useRouter,
    useRouterState,
} from "@tanstack/react-router";
import { z } from "zod";
import { fetchCommits, getAvailableRepos } from "~/server/git";
import { generateTimesheet } from "~/server/excel";
import { SourceFilter } from "~/components/SourceFilter";
import { WorkdayCalendar } from "~/components/WorkdayCalendar";
import {
    MAX_TICKETS,
    defaultWorkdays,
    distributeDates,
    isWeekend,
    monthDays,
    monthLabel,
    recentMonths,
    ticketNo,
} from "~/lib/timesheet";

const IHC_REPOS = [
    "super-app-fe",
    "super-app-be",
    "ihc-office-fe",
    "ihc-office-be",
    "ihc-portal-fe",
    "ihc-portal-be",
];
const MONTHS = recentMonths(new Date(), 6);
const lastDay = (ym: string) => monthDays(ym).at(-1)!;

// Report month defaults to last month; commits are searched from the oldest month in the list,
// so leftovers from earlier months can fill this month's quota.
const searchSchema = z.object({
    month: z
        .string()
        .regex(/^\d{4}-\d{2}$/)
        .catch(MONTHS[1]),
    since: z.string().catch(`${MONTHS.at(-1)}-01`),
    until: z.string().optional(),
    author: z.string().catch("kristian"),
    repos: z.array(z.string()).optional(),
    query: z.string().optional(),
});

export const Route = createFileRoute("/")({
    validateSearch: searchSchema,
    loaderDeps: ({ search: { query, ...rest } }) => rest,
    loader: async ({ deps }) => {
        const allRepos = await getAvailableRepos();
        const defaultRepos = allRepos.filter((r) => IHC_REPOS.includes(r));
        const source = {
            repos: deps.repos ?? defaultRepos,
            author: deps.author,
            since: deps.since,
            until: deps.until ?? lastDay(deps.month),
        };
        const commits = await fetchCommits({ data: source });
        return { allRepos, defaultRepos, source, commits };
    },
    component: ComposePage,
});

type Status = { kind: "ok" | "error"; text: string } | null;

function ComposePage() {
    const { allRepos, defaultRepos, source, commits } = Route.useLoaderData();
    const { month, query = "" } = Route.useSearch();
    const navigate = Route.useNavigate();
    const router = useRouter();
    const loading = useRouterState({ select: (s) => s.isLoading });

    const [prefix, setPrefix] = useState("ITSM 5");
    const [workdaysByMonth, setWorkdaysByMonth] = useState<
        Record<string, string[]>
    >({});
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [messageEdits, setMessageEdits] = useState<Record<string, string>>(
        {},
    );
    const [dateEdits, setDateEdits] = useState<Record<string, string>>({});
    const [status, setStatus] = useState<Status>(null);
    const [generating, setGenerating] = useState(false);

    const workdays = workdaysByMonth[month] ?? defaultWorkdays(month);
    const label = monthLabel(month);

    // Selected commits keep their chronological order and get dates from the workday spread,
    // unless a date was set by hand. Ticket numbers then follow the final dates.
    const tickets = useMemo(() => {
        const chosen = commits.filter((c) => selected.has(c.hash));
        const slots = distributeDates(chosen.length, workdays);
        return chosen
            .map((c, i) => ({
                hash: c.hash,
                repo: c.repo,
                date: dateEdits[c.hash] ?? slots[i] ?? c.date,
                message: messageEdits[c.hash] ?? c.message,
            }))
            .sort((a, b) => a.date.localeCompare(b.date));
    }, [commits, selected, workdays, dateEdits, messageEdits]);

    const ticketIndex = new Map(tickets.map((t, i) => [t.hash, i]));
    const ticketsPerDay: Record<string, number> = {};
    for (const t of tickets)
        ticketsPerDay[t.date] = (ticketsPerDay[t.date] ?? 0) + 1;
    const daysUsed = Object.keys(ticketsPerDay).length;
    const doubleDays = Object.values(ticketsPerDay).filter((n) => n > 1).length;
    const weekendTickets = tickets.filter((t) => isWeekend(t.date)).length;
    const full = tickets.length >= MAX_TICKETS;

    const q = query.trim().toLowerCase();
    const visible = q
        ? commits.filter((c) =>
              `${c.message} ${c.repo} ${c.date}`.toLowerCase().includes(q),
          )
        : commits;

    const toggleCommit = (hash: string) => {
        const next = new Set(selected);
        next.has(hash) ? next.delete(hash) : next.add(hash);
        setSelected(next);
    };

    const toggleWorkday = (date: string) =>
        setWorkdaysByMonth({
            ...workdaysByMonth,
            [month]: workdays.includes(date)
                ? workdays.filter((d) => d !== date)
                : [...workdays, date],
        });

    const generate = async () => {
        if (
            !confirm(
                `Buat timesheet ${label}?\n\n${tickets.length} tiket di ${daysUsed} hari kerja. Commit ini tidak akan muncul lagi di daftar.`,
            )
        )
            return;
        setGenerating(true);
        setStatus(null);
        try {
            const res = await generateTimesheet({
                data: { month, ticketPrefix: prefix, commits: tickets },
            });
            setStatus({
                kind: "ok",
                text: `Timesheet dibuat: ${res.filePath}`,
            });
            setSelected(new Set());
            setDateEdits({});
            router.invalidate();
        } catch (err: any) {
            setStatus({
                kind: "error",
                text: `Timesheet gagal dibuat. ${err.message}`,
            });
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_22rem]">
            <aside className="space-y-5 rounded-lg border bg-surface p-4 lg:sticky lg:top-4 lg:order-last">
                <div className="grid grid-cols-2 gap-3">
                    <label className="text-sm">
                        <span className="mb-1 block text-muted">Periode</span>
                        <select
                            className="field w-full"
                            value={month}
                            onChange={(e) =>
                                navigate({
                                    search: (s) => ({
                                        ...s,
                                        month: e.target.value,
                                        until: undefined,
                                    }),
                                })
                            }
                        >
                            {MONTHS.map((m) => (
                                <option key={m} value={m}>
                                    {monthLabel(m)}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="text-sm">
                        <span className="mb-1 block text-muted">
                            Prefix tiket
                        </span>
                        <input
                            className="field w-full"
                            value={prefix}
                            onChange={(e) => setPrefix(e.target.value)}
                        />
                    </label>
                </div>

                <section>
                    <h2 className="mb-1 text-sm font-medium">
                        Hari masuk: {workdays.length} hari
                    </h2>
                    <p className="mb-3 text-xs text-muted">
                        Klik tanggal untuk ubah masuk atau libur. Tiket dibagi
                        rata, hari-hari awal dapat tiket lebih dulu.
                    </p>
                    <WorkdayCalendar
                        month={month}
                        workdays={workdays}
                        ticketsPerDay={ticketsPerDay}
                        onToggle={toggleWorkday}
                    />
                </section>

                <section className="space-y-3 border-t pt-4">
                    <p className="text-2xl font-semibold">
                        {tickets.length}
                        <span className="text-base font-normal text-muted">
                            {" "}
                            / {MAX_TICKETS} tiket
                        </span>
                    </p>
                    <ul className="space-y-1 text-sm text-muted">
                        <li>{daysUsed} hari kerja terisi</li>
                        {doubleDays > 0 && (
                            <li>{doubleDays} hari berisi lebih dari 1 tiket</li>
                        )}
                        {weekendTickets > 0 && (
                            <li className="text-warn">
                                {weekendTickets} tiket jatuh di akhir pekan
                            </li>
                        )}
                    </ul>
                    <button
                        onClick={generate}
                        disabled={
                            generating || tickets.length === 0 || !prefix.trim()
                        }
                        className="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 dark:text-paper"
                    >
                        {generating
                            ? "Membuat timesheet…"
                            : `Buat timesheet ${label}`}
                    </button>
                    {status && (
                        <p
                            role="status"
                            className={`warp-break-words text-sm ${status.kind === "error" ? "text-danger" : "text-accent"}`}
                        >
                            {status.text}
                        </p>
                    )}
                </section>
            </aside>

            <div className="min-w-0 space-y-3">
                <SourceFilter
                    key={JSON.stringify(source)}
                    value={source}
                    allRepos={allRepos}
                    defaultRepos={defaultRepos}
                    onApply={(next) =>
                        navigate({ search: (s) => ({ ...s, ...next }) })
                    }
                />

                <div className="flex flex-wrap items-center gap-3">
                    <h1 className="mr-auto text-lg font-semibold">
                        Commit belum dilaporkan{" "}
                        <span className="font-normal text-muted">
                            {commits.length}
                        </span>
                    </h1>
                    <input
                        type="search"
                        className="field w-56"
                        placeholder="Cari pesan, repo, tanggal"
                        value={query}
                        onChange={(e) =>
                            navigate({
                                search: (s) => ({
                                    ...s,
                                    query: e.target.value || undefined,
                                }),
                                replace: true,
                            })
                        }
                    />
                    <button
                        onClick={() =>
                            setSelected(
                                new Set(
                                    visible
                                        .slice(0, MAX_TICKETS)
                                        .map((c) => c.hash),
                                ),
                            )
                        }
                        className="rounded-md border bg-surface px-3 py-1.5 text-sm hover:bg-paper"
                    >
                        Pilih {MAX_TICKETS} tertua
                    </button>
                    {selected.size > 0 && (
                        <button
                            onClick={() => setSelected(new Set())}
                            className="text-sm text-muted hover:text-ink hover:underline"
                        >
                            Batalkan pilihan
                        </button>
                    )}
                </div>

                <div
                    className={`overflow-x-auto rounded-lg border bg-surface ${loading ? "opacity-60" : ""}`}
                >
                    <table className="w-full text-sm">
                        <thead className="border-b text-left text-xs text-muted">
                            <tr>
                                <th className="w-10 px-3 py-2">
                                    <span className="sr-only">Pilih</span>
                                </th>
                                <th className="w-28 px-3 py-2 font-normal">
                                    Tiket
                                </th>
                                <th className="w-40 px-3 py-2 font-normal">
                                    Tanggal laporan
                                </th>
                                <th className="px-3 py-2 font-normal">
                                    Pekerjaan
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {visible.map((c) => {
                                const i = ticketIndex.get(c.hash);
                                const t =
                                    i === undefined ? undefined : tickets[i];
                                return (
                                    <tr
                                        key={c.hash}
                                        className={t ? "bg-accent-soft/50" : ""}
                                    >
                                        <td className="px-3 py-2">
                                            <input
                                                type="checkbox"
                                                aria-label={`Pilih ${c.message}`}
                                                checked={!!t}
                                                disabled={!t && full}
                                                onChange={() =>
                                                    toggleCommit(c.hash)
                                                }
                                                className="size-4 accent-accent"
                                            />
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-2 text-muted">
                                            {t && ticketNo(prefix, i!)}
                                        </td>
                                        <td className="px-3 py-2">
                                            {t && (
                                                <input
                                                    type="date"
                                                    aria-label="Tanggal laporan"
                                                    value={t.date}
                                                    onChange={(e) =>
                                                        setDateEdits({
                                                            ...dateEdits,
                                                            [c.hash]:
                                                                e.target.value,
                                                        })
                                                    }
                                                    className={`field py-1 ${isWeekend(t.date) ? "text-warn" : ""}`}
                                                />
                                            )}
                                        </td>
                                        <td className="px-3 py-2">
                                            <input
                                                aria-label="Pesan tugas"
                                                value={
                                                    messageEdits[c.hash] ??
                                                    c.message
                                                }
                                                onChange={(e) =>
                                                    setMessageEdits({
                                                        ...messageEdits,
                                                        [c.hash]:
                                                            e.target.value,
                                                    })
                                                }
                                                className="w-full rounded border border-transparent bg-transparent px-1.5 py-0.5 hover:border-line focus:border-line focus:bg-surface"
                                            />
                                            <div className="px-1.5 text-xs text-muted">
                                                {c.repo}{" "}
                                                <span className="font-mono">
                                                    {c.hash}
                                                </span>
                                                , commit {c.date}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {visible.length === 0 && (
                        <p className="px-4 py-10 text-center text-sm text-muted">
                            {q
                                ? `Tidak ada commit yang cocok dengan "${query}".`
                                : 'Semua commit di rentang ini sudah dilaporkan. Mundurkan tanggal "Dari" di Sumber commit untuk mengambil sisa bulan sebelumnya.'}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
