import { createServerFn } from '@tanstack/react-start'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import path from 'node:path'
import fs from 'node:fs/promises'
import { z } from 'zod'
import { getAllReportedCommits, removeReportedCommit } from './storage'

const execFileAsync = promisify(execFile)
const DEV_DIR = '/home/suriyadharma/dev'

export interface CommitItem {
  hash: string
  repo: string
  date: string
  message: string
}

async function listRepos() {
  const entries = await fs.readdir(DEV_DIR, { withFileTypes: true })
  const checks = entries
    .filter((e) => e.isDirectory() && e.name !== 'timesheet-app')
    .map((e) =>
      fs.access(path.join(DEV_DIR, e.name, '.git')).then(
        () => e.name,
        () => null,
      ),
    )
  return (await Promise.all(checks)).filter((r) => r !== null).sort()
}

export const getAvailableRepos = createServerFn({ method: 'GET' }).handler(listRepos)

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)

export const fetchCommits = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      repos: z.array(z.string()),
      author: z.string(),
      since: date,
      until: date,
    }),
  )
  .handler(async ({ data }) => {
    // Only real repos under DEV_DIR; a crafted name like "../x" never reaches git.
    const known = new Set(await listRepos())
    const reported = new Set((await getAllReportedCommits()).map((r) => r.hash))

    const perRepo = await Promise.all(
      data.repos
        .filter((repo) => known.has(repo))
        .map(async (repo) => {
          const { stdout } = await execFileAsync(
            'git',
            [
              '-C', path.join(DEV_DIR, repo),
              'log', '--all', '--no-merges',
              `--author=${data.author}`,
              `--since=${data.since}`,
              `--until=${data.until}`,
              '--pretty=format:%ad|%h|%s',
              '--date=short',
            ],
            { maxBuffer: 10 * 1024 * 1024 },
          )
          return stdout
            .split('\n')
            .filter(Boolean)
            .map((line): CommitItem => {
              const [date, hash, ...rest] = line.split('|')
              return { date, hash, repo, message: rest.join('|').trim() }
            })
        })
        .map((p) =>
          // One broken repo (e.g. no commits yet) must not hide the others.
          p.catch((err) => {
            console.warn('git log failed:', err.message)
            return []
          }),
        ),
    )

    return perRepo
      .flat()
      .filter(
        (c) =>
          !reported.has(c.hash) &&
          // git stash entries show up in `--all`
          !c.message.startsWith('WIP on ') &&
          !c.message.startsWith('index on '),
      )
      .sort((a, b) => a.date.localeCompare(b.date))
  })

export const fetchReportedHistory = createServerFn({ method: 'GET' }).handler(getAllReportedCommits)

export const unlockCommit = createServerFn({ method: 'POST' })
  .validator(z.object({ hash: z.string() }))
  .handler(({ data }) => removeReportedCommit(data.hash))
