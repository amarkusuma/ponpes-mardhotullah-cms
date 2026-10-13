'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useWaliProfil } from '@/hooks/use-akademik'
import apiClient from '@/lib/api/client'
import { useQuery } from '@tanstack/react-query'
import type { ApiResponse } from '@/lib/types/spp'

const BULAN_NAMES = [
  '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

type StatusTagihan = 'belum_bayar' | 'sebagian' | 'lunas'

interface TagihanItem {
  id: string
  santri_id: string
  nama_santri: string
  nik: string
  jenis: string
  nominal: number
  bulan: number
  tahun: number
  status: StatusTagihan
  total_dibayar: number
  sisa: number
}

const STATUS_BADGE: Record<StatusTagihan, { label: string; variant: 'success' | 'destructive' | 'warning' }> = {
  lunas: { label: 'Lunas', variant: 'success' },
  belum_bayar: { label: 'Belum Bayar', variant: 'destructive' },
  sebagian: { label: 'Cicilan', variant: 'warning' },
}

function formatRupiah(v: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v)
}

function WaliTagihanContent() {
  const searchParams = useSearchParams()
  const initSantriId = searchParams.get('santri_user_id') ?? ''
  const [selectedSantriId, setSelectedSantriId] = useState(initSantriId)

  const { data: anakList = [] } = useWaliProfil()

  const { data: tagihan = [], isLoading } = useQuery({
    queryKey: ['wali', 'tagihan', selectedSantriId],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<TagihanItem[]>>('/wali/tagihan-anak', {
        params: { santri_user_id: selectedSantriId },
      })
      return res.data.data ?? []
    },
    enabled: !!selectedSantriId,
  })

  const totalTagihan = tagihan.reduce((s, r) => s + r.nominal, 0)
  const totalDibayar = tagihan.reduce((s, r) => s + r.total_dibayar, 0)
  const totalSisa = tagihan.reduce((s, r) => s + r.sisa, 0)

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Tagihan Anak</h2>
        <p className="text-muted-foreground">Status pembayaran SPP putra-putri Anda.</p>
      </div>

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
            Pilih anak untuk melihat tagihan.
          </CardContent>
        </Card>
      ) : (
        <>
          {!isLoading && tagihan.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: 'Total Tagihan', value: formatRupiah(totalTagihan), cls: '' },
                { label: 'Sudah Dibayar', value: formatRupiah(totalDibayar), cls: 'text-green-600 dark:text-green-400' },
                { label: 'Sisa Tagihan', value: formatRupiah(totalSisa), cls: totalSisa > 0 ? 'text-destructive' : 'text-green-600 dark:text-green-400' },
              ].map(({ label, value, cls }) => (
                <Card key={label}>
                  <CardContent className="pt-4 pb-4">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className={`text-xl font-bold mt-1 ${cls}`}>{value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="h-10 px-4 text-left font-medium text-muted-foreground">Periode</th>
                      <th className="h-10 px-4 text-left font-medium text-muted-foreground">Jenis</th>
                      <th className="h-10 px-4 text-right font-medium text-muted-foreground">Tagihan</th>
                      <th className="h-10 px-4 text-right font-medium text-muted-foreground">Dibayar</th>
                      <th className="h-10 px-4 text-right font-medium text-muted-foreground">Sisa</th>
                      <th className="h-10 px-4 text-left font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading
                      ? Array.from({ length: 5 }).map((_, i) => (
                          <tr key={i} className="border-b">
                            {Array.from({ length: 6 }).map((_, j) => (
                              <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                            ))}
                          </tr>
                        ))
                      : tagihan.length === 0
                      ? <tr><td colSpan={6} className="h-24 text-center text-muted-foreground">Belum ada tagihan.</td></tr>
                      : tagihan.map((r) => (
                        <tr key={r.id} className="border-b hover:bg-muted/50">
                          <td className="px-4 py-3 font-medium">{BULAN_NAMES[r.bulan]} {r.tahun}</td>
                          <td className="px-4 py-3 text-muted-foreground">{r.jenis}</td>
                          <td className="px-4 py-3 text-right font-mono">{formatRupiah(r.nominal)}</td>
                          <td className="px-4 py-3 text-right font-mono text-green-600 dark:text-green-400">{formatRupiah(r.total_dibayar)}</td>
                          <td className="px-4 py-3 text-right font-mono">
                            <span className={r.sisa > 0 ? 'text-destructive' : ''}>{formatRupiah(r.sisa)}</span>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={STATUS_BADGE[r.status]?.variant ?? 'secondary'}>
                              {STATUS_BADGE[r.status]?.label ?? r.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

export default function WaliTagihanPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <WaliTagihanContent />
    </Suspense>
  )
}
