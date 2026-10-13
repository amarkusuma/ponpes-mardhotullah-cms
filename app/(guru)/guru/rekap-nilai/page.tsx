'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useGuruJadwal, useGuruRekapNilai } from '@/hooks/use-akademik'

export default function GuruRekapNilaiPage() {
  const [selectedKelasId, setSelectedKelasId] = useState('')
  const [selectedMapelId, setSelectedMapelId] = useState('')

  const { data: jadwalList = [] } = useGuruJadwal()
  const { data: rekapList = [], isLoading } = useGuruRekapNilai(selectedKelasId, selectedMapelId)

  const kelasList = Array.from(
    new Map(jadwalList.map((j) => [j.kelas_id, { id: j.kelas_id, nama: j.nama_kelas }])).values()
  )
  const mapelList = Array.from(
    new Map(
      jadwalList
        .filter((j) => !selectedKelasId || j.kelas_id === selectedKelasId)
        .map((j) => [j.id, { id: j.id, nama: j.nama_mapel }])
    ).values()
  )

  const jenisLabels = rekapList.length > 0 ? rekapList[0].nilai.map((n) => n.jenis) : []

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Rekap Nilai</h2>
        <p className="text-muted-foreground">Ringkasan nilai santri per kelas dan mata pelajaran.</p>
      </div>

      {/* Selector */}
      <div className="flex flex-wrap gap-3">
        <select
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
          value={selectedKelasId}
          onChange={(e) => { setSelectedKelasId(e.target.value); setSelectedMapelId('') }}
        >
          <option value="">-- Pilih Kelas --</option>
          {kelasList.map((k) => <option key={k.id} value={k.id}>{k.nama}</option>)}
        </select>
        <select
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
          value={selectedMapelId}
          onChange={(e) => setSelectedMapelId(e.target.value)}
          disabled={!selectedKelasId}
        >
          <option value="">-- Pilih Mapel --</option>
          {mapelList.map((m) => <option key={m.id} value={m.id}>{m.nama}</option>)}
        </select>
      </div>

      {!selectedKelasId || !selectedMapelId ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground text-sm">
            Pilih kelas dan mata pelajaran untuk melihat rekap nilai.
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
      ) : rekapList.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground text-sm">
            Belum ada data penilaian.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Rekap Nilai Santri</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">NIS</th>
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Nama</th>
                    {jenisLabels.map((j) => (
                      <th key={j} className="h-10 px-4 text-center font-medium text-muted-foreground">{j}</th>
                    ))}
                    <th className="h-10 px-4 text-center font-medium text-muted-foreground">Rata-rata</th>
                  </tr>
                </thead>
                <tbody>
                  {rekapList.map((r) => (
                    <tr key={r.nik || r.nama_santri} className="border-b hover:bg-muted/50">
                      <td className="px-4 py-3 font-mono text-xs">{r.nik}</td>
                      <td className="px-4 py-3 font-medium">{r.nama_santri}</td>
                      {r.nilai.map((n) => (
                        <td key={n.jenis} className="px-4 py-3 text-center font-mono">
                          {n.nilai > 0 ? n.nilai : '-'}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-center font-bold">
                        <span className={r.rata_rata >= 75 ? 'text-green-600 dark:text-green-400' : r.rata_rata >= 60 ? 'text-yellow-600' : 'text-destructive'}>
                          {r.rata_rata.toFixed(1)}
                        </span>
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
