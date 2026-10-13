'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { useGuruJadwal } from '@/hooks/use-akademik'

const HARI_ORDER = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Ahad']

export default function GuruJadwalPage() {
  const { data: jadwalList = [], isLoading } = useGuruJadwal()

  const grouped = HARI_ORDER.reduce<Record<string, typeof jadwalList>>((acc, hari) => {
    acc[hari] = jadwalList
      .filter((j) => j.hari === hari)
      .sort((a, b) => a.jam_mulai.localeCompare(b.jam_mulai))
    return acc
  }, {})

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Jadwal Mengajar</h2>
        <p className="text-muted-foreground">Daftar lengkap jadwal mengajar Anda.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      ) : jadwalList.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground text-sm">
            Belum ada jadwal mengajar.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {HARI_ORDER.map((hari) => {
            const items = grouped[hari]
            if (!items.length) return null
            return (
              <Card key={hari}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">{hari}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {items.map((j) => (
                    <div key={j.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                      <div>
                        <p className="font-medium">{j.nama_mapel}</p>
                        <p className="text-xs text-muted-foreground">{j.nama_kelas}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{j.jam_mulai}–{j.jam_selesai}</Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
