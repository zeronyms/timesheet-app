import { createFileRoute, useRouter } from "@tanstack/react-router";
import { fetchReportedHistory, unlockCommit } from "~/server/git";
import type { ReportedCommit } from "~/server/storage";

export const Route = createFileRoute("/riwayat")({
    loader: () => fetchReportedHistory(),
    component: HistoryPage,
});

function HistoryPage() {
    const records = Route.useLoaderData();
    const router = useRouter();

    // Group by timesheet file, newest report first.
    const groups = Map.groupBy(records, (r) => r.timesheetFile);
    const files = [...groups.keys()].sort((a, b) =>
        groups
            .get(b)![0]
            .reportedAt.localeCompare(groups.get(a)![0].reportedAt),
    );

    const unlock = async (r: ReportedCommit) => {
        if (
            !confirm(
                `Kembalikan commit ini ke daftar yang bisa dilaporkan?\n\n${r.message}`,
            )
        )
            return;
        await unlockCommit({ data: { hash: r.hash } });
        router.invalidate();
    };

    if (records.length === 0) {
        return (
            <p className="text-muted">
                Belum ada commit yang dilaporkan. Buat timesheet pertama di
                halaman Susun timesheet.
            </p>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-xl font-semibold">Riwayat laporan Saya</h1>
                <p className="mt-1 max-w-prose text-sm text-muted">
                    Commit di sini tidak muncul lagi saat menyusun timesheet.
                    Kembalikan commit jika ingin melaporkannya ulang.
                </p>
            </div>
            {files.map((file) => (
                <section key={file}>
                    <h2 className="mb-2 text-sm font-medium">
                        {file}{" "}
                        <span className="font-normal text-muted">
                            ({groups.get(file)!.length} tiket)
                        </span>
                    </h2>
                    <div className="overflow-x-auto rounded-lg border bg-surface">
                        <table className="w-full text-sm">
                            <tbody className="divide-y">
                                {groups.get(file)!.map((r) => (
                                    <tr key={r.hash}>
                                        <td className="whitespace-nowrap px-3 py-2 text-muted">
                                            {r.ticketNo}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-2">
                                            {r.date}
                                        </td>
                                        <td className="px-3 py-2">
                                            {r.message}
                                            <div className="text-xs text-muted">
                                                {r.repo}{" "}
                                                <span className="font-mono">
                                                    {r.hash}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 text-right">
                                            <button
                                                onClick={() => unlock(r)}
                                                className="text-sm text-muted hover:text-danger hover:underline"
                                            >
                                                Kembalikan
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            ))}
        </div>
    );
}
