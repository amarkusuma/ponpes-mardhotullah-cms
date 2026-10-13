'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useWaliProfil, useWaliNilai } from '@/hooks/use-akademik'

function nilaiColor(nilai: number) {
  if (nilai >= 85) return 'text-green-600 dark:text-green-400'
  if (nilai >= 70) return 'text-blue-600 dark:text-blue-400'
  if (nilai >= 60) return 'text-yellow-600 dark:text-yellow-500'
  return 'text-destructive'
}

function WaliNilaiContent() {
  const searchParams = useSearchParams()
  const initSantriId = searchParams.get('santri_id') ?? ''
  const [selectedSantriId, setSelectedSantriId] = useState(initSantriId)

  const { data: anakList = [] } = useWaliProfil()
  const { data: nilaiList = [], isLoading } = useWaliNilai(selectedSantriId)

  const avg = nilaiList.length > 0
    ? (nilaiList.reduce((s, n) => s + n.nilai, 0) / nilaiList.length).toFixed(1)
    : '-'

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Nilai Anak</h2>
          <p className="text-muted-foreground">Rekap nilai akademik putra-putri Anda.</p>
        </div>
        {nilaiList.length > 0 && (
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Rata-rata</p>
            <p className={`text-2xl font-bold ${nilaiColor(parseFloat(avg))}`}>{avg}</p>
          </div>
        )}
      </div>

      {/* Santri selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm shrink-0">Pilih Anak:</label>
        <select
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
          value={selectedSantriId}
          onChange={(e) => setSelectedSantriId(e.target.value)}
        >
          <option value="">-- Pilih --</option>
          {anakList.map((a) => (
            <option key={a.id} value={a.id}>{a.nama}</option>
          ))}
        </select>
      </div>

      {!selectedSantriId ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground text-sm">
            Pilih anak untuk melihat nilai.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Mata Pelajaran</th>
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Jenis</th>
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Semester</th>
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Tahun Ajaran</th>
                    <th className="h-10 px-4 text-center font-medium text-muted-foreground">Nilai</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="border-b">
                          {Array.from({ length: 5 }).map((_, j) => (
                            <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                          ))}
                        </tr>
                      ))
                    : nilaiList.length === 0
                    ? <tr><td colSpan={5} className="h-24 text-center text-muted-foreground">Belum ada data nilai.</td></tr>
                    : nilaiList.map((n) => (
                      <tr key={n.id} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-3 font-medium">{n.nama_mapel}</td>
                        <td className="px-4 py-3 text-muted-foreground">{n.jenis_penilaian}</td>
                        <td className="px-4 py-3 text-muted-foreground">Sem {n.semester}</td>
                        <td className="px-4 py-3 text-muted-foreground">{n.tahun_ajaran}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-bold font-mono text-base ${nilaiColor(n.nilai)}`}>{n.nilai}</span>
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

export default function WaliNilaiPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <WaliNilaiContent />
    </Suspense>
  )
}
