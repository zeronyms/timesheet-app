import fs from 'node:fs/promises'
import path from 'node:path'

export interface ReportedCommit {
  hash: string
  repo: string
  date: string
  message: string
  ticketNo: string
  timesheetFile: string
  reportedAt: string
}

// ponytail: whole-file JSON rewrite, fine for one user; move to SQLite if records reach tens of thousands.
const DB_PATH = path.resolve(process.cwd(), 'data/reported_commits.json')

export async function getAllReportedCommits(): Promise<ReportedCommit[]> {
  try {
    return JSON.parse(await fs.readFile(DB_PATH, 'utf-8'))
  } catch (err: any) {
    if (err.code === 'ENOENT') return []
    throw err // a corrupt file must not silently read as "nothing reported"
  }
}

async function writeAll(records: ReportedCommit[]) {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true })
  await fs.writeFile(DB_PATH, JSON.stringify(records, null, 2), 'utf-8')
}

export async function saveReportedCommits(newCommits: ReportedCommit[]) {
  const byHash = new Map((await getAllReportedCommits()).map((r) => [r.hash, r]))
  for (const c of newCommits) byHash.set(c.hash, c)
  await writeAll([...byHash.values()])
}

export async function removeReportedCommit(hash: string) {
  const records = await getAllReportedCommits()
  const kept = records.filter((r) => r.hash !== hash)
  if (kept.length === records.length) return false
  await writeAll(kept)
  return true
}
