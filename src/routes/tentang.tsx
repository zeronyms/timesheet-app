import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import z from "zod";
import { getAvailableRepos } from "~/server/git";
import { getNotes, getServerInfo, postNote } from "~/server/info";

export const Route = createFileRoute("/tentang")({
    validateSearch: z.object({ cari: z.string().optional() }),
    loader: async () => {
        console.log("LOADER");
        const [info, catatan, repos] = await Promise.all([
            getServerInfo(),
            getNotes(),
            getAvailableRepos(),
        ]);
        return { info, catatan, repos };
    },
    component: AboutPage, //data siap, baru tampilin halaman
});

function AboutPage() {
    const { info, catatan, repos } = Route.useLoaderData();
    const { cari = "" } = Route.useSearch();
    const navigate = Route.useNavigate();
    const repoTampil = repos.filter((r) =>
        r.toLowerCase().includes(cari.toLowerCase()),
    );

    const router = useRouter();
    const [teks, setTeks] = useState(""); // state UI: isi kotak input
    const [error, setError] = useState("");

    const simpan = async () => {
        setError("");
        try {
            await postNote({ data: { teks } }); // ① kirim ke server
            setTeks("");
            router.invalidate(); // ② segarkan data loader
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-semibold">Tentang aplikasi</h1>
                <p className="mt-1 text-sm text-muted">
                    Server: {info.hostname} · jam {info.jam}
                </p>
            </div>

            <div>
                <h2 className="font-medium">Catatan tersimpan</h2>
                <p className="mt-1 text-sm">
                    {catatan || <span className="text-muted">(belum ada)</span>}
                </p>
            </div>

            <div>
                <h2 className="font-medium">
                    Repo di komputer ({repoTampil.length} dari {repos.length})
                </h2>
                <input
                    value={cari}
                    onChange={(e) =>
                        navigate({
                            search: { cari: e.target.value || undefined },
                            replace: true,
                        })
                    }
                    placeholder="Cari repo..."
                    className="mt-2 w-72 rounded-md border px-3 py-1.5 text-sm"
                />
                <ul className="mt-2 text-sm">
                    {repoTampil.map((r) => (
                        <li key={r}>{r}</li>
                    ))}
                </ul>
            </div>

            <div className="flex gap-2">
                <input
                    value={teks}
                    onChange={(e) => setTeks(e.target.value)}
                    placeholder="Tulis catatan..."
                    className="w-72 rounded-md border px-3 py-1.5 text-sm"
                />
                <button
                    onClick={simpan}
                    className="rounded-md border px-3 py-1.5 text-sm"
                >
                    Simpan
                </button>
            </div>
            {error && <p className="text-sm text-danger">{error}</p>}
        </div>
    );
}
