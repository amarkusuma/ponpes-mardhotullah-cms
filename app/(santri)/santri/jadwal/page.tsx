'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useSantriJadwal } from '@/hooks/use-akademik'

const HARI_ORDER = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Ahad']

export default function SantriJadwalPage() {
  const [kelasId, setKelasId] = useState('')

  const { data: jadwalList = [], isLoading } = useSantriJadwal(kelasId)

  const grouped = HARI_ORDER.reduce<Record<string, typeof jadwalList>>((acc, hari) => {
    acc[hari] = jadwalList
      .filter((j) => j.hari === hari)
      .sort((a, b) => a.jam_mulai.localeCompare(b.jam_mulai))
    return acc
  }, {})

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Jadwal Pelajaran</h2>
        <p className="text-muted-foreground">Jadwal belajar kelas Anda.</p>
      </div>

      {/* Kelas ID input */}
      <div className="flex items-center gap-3 max-w-sm">
        <Label className="shrink-0 text-sm">Kelas ID:</Label>
        <Input
          placeholder="Masukkan ID kelas..."
          value={kelasId}
          onChange={(e) => setKelasId(e.target.value)}
          className="font-mono text-xs"
        />
      </div>

      {!kelasId ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground text-sm">
            Masukkan ID kelas untuk melihat jadwal pelajaran.
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      ) : jadwalList.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground text-sm">
            Tidak ada jadwal untuk kelas ini.
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
                        <p className="text-xs text-muted-foreground">{j.nama_guru}</p>
                      </div>
                      <Badge variant="outline">{j.jam_mulai}–{j.jam_selesai}</Badge>
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
