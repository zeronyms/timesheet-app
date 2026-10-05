import { T as TSS_SERVER_FUNCTION } from "../server.js";
import fs from "node:fs/promises";
import path from "node:path";
var createServerRpc = (serverFnMeta, splitImportFn) => {
  const url = "/_serverFn/" + serverFnMeta.id;
  return Object.assign(splitImportFn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
const DB_PATH = path.resolve(process.cwd(), "data/reported_commits.json");
async function getAllReportedCommits() {
  try {
    return JSON.parse(await fs.readFile(DB_PATH, "utf-8"));
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
}
async function writeAll(records) {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
  await fs.writeFile(DB_PATH, JSON.stringify(records, null, 2), "utf-8");
}
async function saveReportedCommits(newCommits) {
  const byHash = new Map((await getAllReportedCommits()).map((r) => [r.hash, r]));
  for (const c of newCommits) byHash.set(c.hash, c);
  await writeAll([...byHash.values()]);
}
async function removeReportedCommit(hash) {
  const records = await getAllReportedCommits();
  const kept = records.filter((r) => r.hash !== hash);
  if (kept.length === records.length) return false;
  await writeAll(kept);
  return true;
}
export {
  createServerRpc as c,
  getAllReportedCommits as g,
  removeReportedCommit as r,
  saveReportedCommits as s
};
