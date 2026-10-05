import { Link } from '@tanstack/react-router'

export function NotFound() {
  return (
    <div className="space-y-3">
      <p>Halaman ini tidak ada.</p>
      <Link to="/" className="text-accent hover:underline">
        Kembali ke Susun timesheet
      </Link>
    </div>
  )
}
