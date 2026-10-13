import { useCurrentUser } from '../../hooks/useCurrentUser'

export default function DashboardPage() {
  const { data, isLoading } = useCurrentUser()

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          {isLoading ? (
            <p className="mt-4 text-slate-500">Memuat data pengguna...</p>
          ) : (
            <div className="mt-4 space-y-2 text-slate-700">
              <p>Nama: {data?.name ?? 'Tamu'}</p>
              <p>Role: {data?.role ?? 'Tidak tersedia'}</p>
              <p>Email: {data?.email ?? 'Tidak tersedia'}</p>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
