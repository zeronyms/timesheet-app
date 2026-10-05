import { useState } from 'react'

export interface Source {
  repos: string[]
  author: string
  since: string
  until: string
}

const fmt = (d: string) =>
  new Date(`${d}T00:00:00Z`).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })

/** Collapsed summary of where commits come from; expands into a form applied on submit. */
export function SourceFilter({
  value,
  allRepos,
  defaultRepos,
  onApply,
}: {
  value: Source
  allRepos: string[]
  defaultRepos: string[]
  onApply: (next: Source) => void
}) {
  const [draft, setDraft] = useState(value)
  const set = (patch: Partial<Source>) => setDraft({ ...draft, ...patch })
  const toggleRepo = (repo: string) =>
    set({ repos: draft.repos.includes(repo) ? draft.repos.filter((r) => r !== repo) : [...draft.repos, repo] })

  return (
    <details className="rounded-lg border bg-surface">
      <summary className="cursor-pointer px-4 py-2.5 text-sm">
        <span className="font-medium">Sumber commit:</span>{' '}
        <span className="text-muted">
          {value.repos.length} repo, author "{value.author}", {fmt(value.since)} sampai {fmt(value.until)}
        </span>
      </summary>
      <form
        className="space-y-4 border-t px-4 py-4"
        onSubmit={(e) => {
          e.preventDefault()
          onApply(draft)
        }}
      >
        <fieldset>
          <legend className="mb-2 flex w-full flex-wrap items-baseline gap-x-3 text-sm font-medium">
            Repository
            {(
              [
                ['Repo IHC', defaultRepos],
                ['Semua', allRepos],
                ['Kosongkan', []],
              ] satisfies [string, string[]][]
            ).map(([label, repos]) => (
              <button
                key={label}
                type="button"
                onClick={() => set({ repos })}
                className="text-sm font-normal text-accent hover:underline"
              >
                {label}
              </button>
            ))}
          </legend>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] gap-x-4 gap-y-1">
            {allRepos.map((repo) => (
              <label key={repo} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={draft.repos.includes(repo)} onChange={() => toggleRepo(repo)} className="accent-accent" />
                {repo}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-sm">
            <span className="mb-1 block text-muted">Dari</span>
            <input type="date" className="field" value={draft.since} onChange={(e) => set({ since: e.target.value })} required />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-muted">Sampai</span>
            <input type="date" className="field" value={draft.until} onChange={(e) => set({ until: e.target.value })} required />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-muted">Author git</span>
            <input className="field" value={draft.author} onChange={(e) => set({ author: e.target.value })} required />
          </label>
          <button type="submit" className="rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-paper">
            Tampilkan commit
          </button>
        </div>
      </form>
    </details>
  )
}
