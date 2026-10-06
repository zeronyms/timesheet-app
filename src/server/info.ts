import { createServerFn } from "@tanstack/react-start";
import { getAllReportedCommits } from "./storage";
import os from "os";
import { z } from "zod";
import fs from "node:fs/promises";

const CATATAN = "data/catatan.txt";

export const getServerInfo = createServerFn({ method: "GET" }).handler(
    async () => {
        console.log("🍳 getServerInfo dipanggil di dapur!");
        const reported = await getAllReportedCommits();
        return {
            hostname: os.hostname(),
            totalReported: reported.length,
            jam: new Date().toLocaleTimeString("id-ID"),
        };
    },
);

export const getNotes = createServerFn({ method: "GET" }).handler(() =>
    fs.readFile(CATATAN, "utf8").catch(() => ""),
);

export const postNote = createServerFn({ method: "POST" })
    .validator(
        z.object({
            teks: z
                .string()
                .trim()
                .min(1, "Catatan tidak boleh kosong")
                .max(200),
        }),
    )
    .handler(async ({ data }) => {
        console.log("menyimpan catatan:", data.teks);
        await fs.writeFile(CATATAN, data.teks);
    });
