import Link from 'next/link'

export function Navbar() {
  return (
    <nav className="border-b border-slate-200 bg-white px-4 py-4 shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="text-lg font-bold text-slate-900">
          SIMPEG
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            Dashboard
          </Link>
          <Link href="/auth/login" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
            Login
          </Link>
        </div>
      </div>
    </nav>
  )
}
