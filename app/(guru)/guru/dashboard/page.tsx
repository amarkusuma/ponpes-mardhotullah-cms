'use client'

import { Calendar, Users, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'
import { useGuruJadwal } from '@/hooks/use-akademik'

const HARI_ORDER = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Ahad']

export default function GuruDashboardPage() {
  const { user } = useAuth()
  const { data: jadwalList = [], isLoading } = useGuruJadwal()

  const hariIni = new Date().toLocaleDateString('id-ID', { weekday: 'long' })
  const jadwalHariIni = jadwalList.filter((j) => j.hari === hariIni)
  const kelasUnik = new Set(jadwalList.map((j) => j.kelas_id)).size

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Selamat datang, {user?.name ?? 'Guru'}</h2>
        <p className="text-muted-foreground">Ringkasan aktivitas mengajar Anda.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Kelas</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : <p className="text-2xl font-bold">{kelasUnik}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Jadwal</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : <p className="text-2xl font-bold">{jadwalList.length}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Mengajar Hari Ini</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : <p className="text-2xl font-bold">{jadwalHariIni.length}</p>}
          </CardContent>
        </Card>
      </div>

      {/* Jadwal hari ini */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Jadwal Hari Ini ({hariIni})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : jadwalHariIni.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Tidak ada jadwal hari ini.</p>
          ) : (
            <div className="space-y-2">
              {jadwalHariIni
                .sort((a, b) => a.jam_mulai.localeCompare(b.jam_mulai))
                .map((j) => (
                  <div key={j.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                    <div>
                      <p className="font-medium">{j.nama_mapel}</p>
                      <p className="text-xs text-muted-foreground">{j.nama_kelas} · {j.jam_mulai}–{j.jam_selesai}</p>
                    </div>
                    <Badge variant="outline">{j.jam_mulai}</Badge>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { label: 'Jadwal Mengajar', href: '/guru/jadwal', desc: 'Lihat semua jadwal mengajar' },
          { label: 'Input Penilaian', href: '/guru/penilaian', desc: 'Catat nilai santri' },
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
