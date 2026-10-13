'use client'

import Link from 'next/link'
import { UserCircle, CreditCard, ClipboardList, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/use-auth'
import { useWaliProfil } from '@/hooks/use-akademik'

export default function WaliDashboardPage() {
  const { user } = useAuth()
  const { data: anakList = [], isLoading } = useWaliProfil()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Selamat datang, {user?.name ?? 'Wali'}</h2>
        <p className="text-muted-foreground">Pantau perkembangan putra-putri Anda.</p>
      </div>

      {/* Anak cards */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      ) : anakList.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Belum ada data santri yang terhubung.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {anakList.map((s) => (
            <Card key={s.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{s.nama}</CardTitle>
                    {s.nik && <p className="text-xs text-muted-foreground font-mono mt-0.5">NIK: {s.nik}</p>}
                  </div>
                  <Badge variant={s.status === 'aktif' ? 'success' : 'secondary'}>{s.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex gap-3 flex-wrap">
                <Link href={`/wali/nilai?santri_id=${s.id}`} className="text-sm text-primary hover:underline flex items-center gap-1">
                  <ClipboardList className="h-3.5 w-3.5" />
                  Lihat Nilai
                </Link>
                <Link href={`/wali/tagihan?santri_user_id=${s.id}`} className="text-sm text-primary hover:underline flex items-center gap-1">
                  <CreditCard className="h-3.5 w-3.5" />
                  Lihat Tagihan
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { label: 'Profil Anak', href: '/wali/santri', desc: 'Data diri putra-putri' },
          { label: 'Nilai Anak', href: '/wali/nilai', desc: 'Rekap nilai akademik' },
          { label: 'Tagihan Anak', href: '/wali/tagihan', desc: 'Status pembayaran SPP' },
        ].map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
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
