import { createServerFn } from "@tanstack/react-start";
import { getAllReportedCommits } from "./storage";
import os from "os";

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
