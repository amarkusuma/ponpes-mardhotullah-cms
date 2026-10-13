'use client'

import Link from 'next/link'
import { Users, GraduationCap, UserCircle, CreditCard, CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useDashboardStats } from '@/hooks/use-users'

function StatCard({
  title,
  value,
  icon: Icon,
  loading,
  href,
  colorClass = '',
}: {
  title: string
  value: string | number
  icon: React.ElementType
  loading: boolean
  href?: string
  colorClass?: string
}) {
  const inner = (
    <Card className={href ? 'hover:shadow-md transition-shadow cursor-pointer' : ''}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <p className={`text-2xl font-bold ${colorClass}`}>
            {typeof value === 'number' ? value.toLocaleString('id-ID') : value}
          </p>
        )}
      </CardContent>
    </Card>
  )
  return href ? <Link href={href}>{inner}</Link> : inner
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useDashboardStats()

  const formatRupiah = (v: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard Admin</h2>
        <p className="text-muted-foreground">Ringkasan data pesantren hari ini.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Santri"
          value={stats?.total_santri ?? 0}
          icon={GraduationCap}
          loading={isLoading}
          href="/admin/santri"
        />
        <StatCard
          title="Total Guru"
          value={stats?.total_guru ?? 0}
          icon={UserCircle}
          loading={isLoading}
          href="/admin/guru"
        />
        <StatCard
          title="Total Wali"
          value={stats?.total_wali ?? 0}
          icon={Users}
          loading={isLoading}
          href="/admin/wali"
        />
        <StatCard
          title="Tagihan Bulan Ini"
          value={formatRupiah(stats?.total_tagihan_bulan_ini ?? 0)}
          icon={CreditCard}
          loading={isLoading}
          href="/admin/spp"
        />
        <StatCard
          title="Tagihan Lunas"
          value={stats?.tagihan_lunas ?? 0}
          icon={CheckCircle}
          loading={isLoading}
          colorClass="text-green-600 dark:text-green-400"
        />
        <StatCard
          title="Tagihan Belum Bayar"
          value={stats?.tagihan_belum_bayar ?? 0}
          icon={XCircle}
          loading={isLoading}
          colorClass="text-destructive"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Manajemen Pengguna', href: '/admin/pengguna', desc: 'Kelola akun & role' },
          { label: 'Manajemen Kelas', href: '/admin/kelas', desc: 'Kelas & jadwal pelajaran' },
          { label: 'Manajemen SPP', href: '/admin/spp', desc: 'Tagihan & pembayaran' },
          { label: 'Konten Web', href: '/admin/artikel', desc: 'Artikel & banner' },
        ].map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">{item.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
