import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { getNotes, getServerInfo, postNote } from "~/server/info";

export const Route = createFileRoute("/tentang")({
    loader: async () => {
        const [info, catatan] = await Promise.all([
            getServerInfo(),
            getNotes(),
        ]);
        return { info, catatan };
    },
    component: AboutPage, //data siap, baru tampilin halaman
});

function AboutPage() {
    const { info, catatan } = Route.useLoaderData();
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
