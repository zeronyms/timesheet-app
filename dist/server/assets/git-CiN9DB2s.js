import { c as createServerRpc, g as getAllReportedCommits, r as removeReportedCommit } from "./storage-DebVIUSn.js";
import { c as createServerFn } from "../server.js";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import fs from "node:fs/promises";
import { z } from "zod";
import "node:async_hooks";
import "node:stream";
import "react";
import "@tanstack/react-router";
import "react/jsx-runtime";
import "@tanstack/react-router/ssr/server";
const execFileAsync = promisify(execFile);
const DEV_DIR = "/home/suriyadharma/dev";
async function listRepos() {
  const entries = await fs.readdir(DEV_DIR, {
    withFileTypes: true
  });
  const checks = entries.filter((e) => e.isDirectory() && e.name !== "timesheet-app").map((e) => fs.access(path.join(DEV_DIR, e.name, ".git")).then(() => e.name, () => null));
  return (await Promise.all(checks)).filter((r) => r !== null).sort();
}
const getAvailableRepos_createServerFn_handler = createServerRpc({
  id: "7a292620280c2cdd3cf4e1acc1038febb79fc510c4e3bd1d5d13adf6e9dd8ef8",
  name: "getAvailableRepos",
  filename: "src/server/git.ts"
}, (opts) => getAvailableRepos.__executeServer(opts));
const getAvailableRepos = createServerFn({
  method: "GET"
}).handler(getAvailableRepos_createServerFn_handler, listRepos);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const fetchCommits_createServerFn_handler = createServerRpc({
  id: "6f5c5eeebd5a205d9c0e92a4c4cbf3a059714596557ef31d74dcbed104bc0f40",
  name: "fetchCommits",
  filename: "src/server/git.ts"
}, (opts) => fetchCommits.__executeServer(opts));
const fetchCommits = createServerFn({
  method: "POST"
}).validator(z.object({
  repos: z.array(z.string()),
  author: z.string(),
  since: date,
  until: date
})).handler(fetchCommits_createServerFn_handler, async ({
  data
}) => {
  const known = new Set(await listRepos());
  const reported = new Set((await getAllReportedCommits()).map((r) => r.hash));
  const perRepo = await Promise.all(data.repos.filter((repo) => known.has(repo)).map(async (repo) => {
    const {
      stdout
    } = await execFileAsync("git", ["-C", path.join(DEV_DIR, repo), "log", "--all", "--no-merges", `--author=${data.author}`, `--since=${data.since}`, `--until=${data.until}`, "--pretty=format:%ad|%h|%s", "--date=short"], {
      maxBuffer: 10 * 1024 * 1024
    });
    return stdout.split("\n").filter(Boolean).map((line) => {
      const [date2, hash, ...rest] = line.split("|");
      return {
        date: date2,
        hash,
        repo,
        message: rest.join("|").trim()
      };
    });
  }).map((p) => (
    // One broken repo (e.g. no commits yet) must not hide the others.
    p.catch((err) => {
      console.warn("git log failed:", err.message);
      return [];
    })
  )));
  return perRepo.flat().filter((c) => !reported.has(c.hash) && // git stash entries show up in `--all`
  !c.message.startsWith("WIP on ") && !c.message.startsWith("index on ")).sort((a, b) => a.date.localeCompare(b.date));
});
const fetchReportedHistory_createServerFn_handler = createServerRpc({
  id: "7ecddef10021a9cf3b2688dc335207149e53204db6ff8baf38829a36c1a1c3b5",
  name: "fetchReportedHistory",
  filename: "src/server/git.ts"
}, (opts) => fetchReportedHistory.__executeServer(opts));
const fetchReportedHistory = createServerFn({
  method: "GET"
}).handler(fetchReportedHistory_createServerFn_handler, getAllReportedCommits);
const unlockCommit_createServerFn_handler = createServerRpc({
  id: "9d96d2f9e2e201cd0a6bd903db169c4477b36301abdcc1459e1e99de1c0db8ba",
  name: "unlockCommit",
  filename: "src/server/git.ts"
}, (opts) => unlockCommit.__executeServer(opts));
const unlockCommit = createServerFn({
  method: "POST"
}).validator(z.object({
  hash: z.string()
})).handler(unlockCommit_createServerFn_handler, ({
  data
}) => removeReportedCommit(data.hash));
export {
  fetchCommits_createServerFn_handler,
  fetchReportedHistory_createServerFn_handler,
  getAvailableRepos_createServerFn_handler,
  unlockCommit_createServerFn_handler
};
