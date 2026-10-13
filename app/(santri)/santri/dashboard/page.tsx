'use client'

import Link from 'next/link'
import { CreditCard, BookOpen, ClipboardList, User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'
import { useSantriProfil, useSantriNilai } from '@/hooks/use-akademik'
import { useSPPList } from '@/hooks/use-spp'

export default function SantriDashboardPage() {
  const { user } = useAuth()
  const { data: profil, isLoading: profilLoading } = useSantriProfil()
  const { data: nilaiList = [], isLoading: nilaiLoading } = useSantriNilai()
  const { data: tagihanData, isLoading: tagihanLoading } = useSPPList({ jenis: 'SPP' }, 1, 5)

  const tagihanList = tagihanData?.data ?? []
  const tagihanBelumBayar = tagihanList.filter((t) => t.status !== 'lunas').length

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Selamat datang, {user?.name ?? 'Santri'}</h2>
        <p className="text-muted-foreground">Dashboard santri — ringkasan informasi Anda.</p>
      </div>

      {/* Profile card */}
      {profilLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : profil ? (
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="flex-shrink-0 w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-lg">{profil.nama}</p>
              {profil.nik && <p className="text-sm text-muted-foreground font-mono">NIK: {profil.nik}</p>}
              <Badge variant={profil.status === 'aktif' ? 'success' : 'secondary'} className="mt-1">
                {profil.status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Quick stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Entri Nilai</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {nilaiLoading ? <Skeleton className="h-8 w-16" /> : <p className="text-2xl font-bold">{nilaiList.length}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tagihan Aktif</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {tagihanLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className={`text-2xl font-bold ${tagihanBelumBayar > 0 ? 'text-destructive' : ''}`}>
                {tagihanBelumBayar}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rata-rata Nilai</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {nilaiLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : nilaiList.length > 0 ? (
              <p className="text-2xl font-bold">
                {(nilaiList.reduce((s, n) => s + n.nilai, 0) / nilaiList.length).toFixed(1)}
              </p>
            ) : (
              <p className="text-2xl font-bold text-muted-foreground">-</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { label: 'Jadwal Pelajaran', href: '/santri/jadwal', desc: 'Lihat jadwal kelas Anda' },
          { label: 'Nilai Saya', href: '/santri/nilai', desc: 'Rekap nilai per mata pelajaran' },
          { label: 'Tagihan SPP', href: '/santri/tagihan', desc: 'Status pembayaran bulanan' },
          { label: 'Profil Saya', href: '/santri/profil', desc: 'Data diri dan status' },
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
