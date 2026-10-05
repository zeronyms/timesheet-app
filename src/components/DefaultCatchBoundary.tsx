import { ErrorComponent, useRouter } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
  const router = useRouter()
  console.error(error)

  return (
    <div className="space-y-4">
      <ErrorComponent error={error} />
      <button onClick={() => router.invalidate()} className="rounded-md border bg-surface px-3 py-1.5 text-sm hover:bg-paper">
        Coba lagi
      </button>
    </div>
  )
}
