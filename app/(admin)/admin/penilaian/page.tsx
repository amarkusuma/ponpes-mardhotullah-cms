'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useKelasList, useMapelAll, useGuruRekapNilai } from '@/hooks/use-akademik'

function nilaiColor(nilai: number) {
  if (nilai >= 85) return 'text-green-600 dark:text-green-400'
  if (nilai >= 70) return 'text-blue-600 dark:text-blue-400'
  if (nilai >= 60) return 'text-yellow-600 dark:text-yellow-500'
  return 'text-destructive'
}

export default function AdminPenilaianPage() {
  const [kelasId, setKelasId] = useState('')
  const [mapelId, setMapelId] = useState('')

  const { data: kelasResponse } = useKelasList()
  const { data: mapelList = [] } = useMapelAll()
  const { data: rekap = [], isLoading } = useGuruRekapNilai(kelasId, mapelId)

  const kelasData = kelasResponse?.data ?? []

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Rekap Penilaian</h2>
        <p className="text-muted-foreground">Lihat rekap nilai santri per kelas dan mata pelajaran.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm shrink-0">Kelas:</label>
          <select
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
            value={kelasId}
            onChange={(e) => { setKelasId(e.target.value); setMapelId('') }}
          >
            <option value="">-- Pilih Kelas --</option>
            {kelasData.map((k) => (
              <option key={k.id} value={k.id}>{k.nama_kelas}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm shrink-0">Mata Pelajaran:</label>
          <select
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
            value={mapelId}
            onChange={(e) => setMapelId(e.target.value)}
          >
            <option value="">-- Pilih Mapel --</option>
            {mapelList.map((m) => (
              <option key={m.id} value={m.id}>{m.nama}</option>
            ))}
          </select>
        </div>
      </div>

      {!kelasId || !mapelId ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground text-sm">
            Pilih kelas dan mata pelajaran untuk melihat rekap nilai.
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      ) : rekap.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground text-sm">
            Belum ada data penilaian untuk kelas dan mapel ini.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Santri</th>
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">NIS</th>
                    {rekap[0]?.nilai?.map((n) => (
                      <th key={n.jenis} className="h-10 px-4 text-center font-medium text-muted-foreground">
                        {n.jenis}
                      </th>
                    ))}
                    <th className="h-10 px-4 text-center font-medium text-muted-foreground">Rata-rata</th>
                  </tr>
                </thead>
                <tbody>
                  {rekap.map((r, i) => (
                    <tr key={i} className="border-b hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">{r.nama_santri}</td>
                      <td className="px-4 py-3 font-mono text-muted-foreground">{r.nik}</td>
                      {r.nilai.map((n) => (
                        <td key={n.jenis} className="px-4 py-3 text-center">
                          <span className={`font-bold font-mono ${nilaiColor(n.nilai)}`}>{n.nilai}</span>
                        </td>
                      ))}
                      <td className="px-4 py-3 text-center">
                        <span className={`font-bold font-mono ${nilaiColor(r.rata_rata)}`}>{r.rata_rata.toFixed(1)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
