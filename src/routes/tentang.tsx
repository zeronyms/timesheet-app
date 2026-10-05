import { createFileRoute } from "@tanstack/react-router";
import { getServerInfo } from "~/server/info";

export const Route = createFileRoute("/tentang")({
    loader: () => {
        console.log("📦 loader /tentang jalan");
        return getServerInfo();
    },
    component: AboutPage, //data siap, baru tampilin halaman
});

function AboutPage() {
    const info = Route.useLoaderData();

    return (
        <div>
            <h1 className="text-xl font-semibold">Tentang aplikasi</h1>
            <ul className="mt-4 text-sm">
                <li>Nama komputer server: {info.hostname}</li>
                <li>Commit yang sudah dilaporkan: {info.totalReported}</li>
                <li>Jam di server: {info.jam}</li>
            </ul>
        </div>
    );
}
