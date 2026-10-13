'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { useAdminTagihan, useCreateTagihan, useCreatePembayaran } from '@/hooks/use-keuangan'
import { useUsers } from '@/hooks/use-users'
import { Plus, CreditCard } from 'lucide-react'
import type { TagihanAdminItem } from '@/hooks/use-keuangan'

const BULAN_NAMES = [
  '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

const STATUS_BADGE = {
  lunas: { label: 'Lunas', variant: 'success' as const },
  belum_bayar: { label: 'Belum Bayar', variant: 'destructive' as const },
  sebagian: { label: 'Cicilan', variant: 'warning' as const },
}

function formatRupiah(v: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v)
}

const tagihanSchema = z.object({
  santri_id: z.string().min(1, 'Wajib pilih santri'),
  jenis: z.string().min(1, 'Wajib diisi'),
  nominal: z.coerce.number().positive('Nominal harus > 0'),
  bulan: z.coerce.number().min(1).max(12),
  tahun: z.coerce.number().min(2000),
})

const pembayaranSchema = z.object({
  jumlah_bayar: z.coerce.number().positive('Jumlah harus > 0'),
  tanggal_bayar: z.string().min(1, 'Wajib diisi'),
  metode: z.enum(['tunai', 'transfer', 'qris']),
  keterangan: z.string().optional(),
})

type TagihanForm = z.infer<typeof tagihanSchema>
type PembayaranForm = z.infer<typeof pembayaranSchema>

export default function AdminKeuanganPage() {
  const now = new Date()
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [showTagihanDialog, setShowTagihanDialog] = useState(false)
  const [selectedTagihan, setSelectedTagihan] = useState<TagihanAdminItem | null>(null)

  const { data: tagihanData, isLoading } = useAdminTagihan({ page, status: statusFilter || undefined })
  const { data: santriData } = useUsers('', 'santri', 1, 100)
  const createTagihan = useCreateTagihan()
  const createPembayaran = useCreatePembayaran()

  const tagihan = tagihanData?.data ?? []
  const meta = tagihanData?.meta
  const santriList = santriData?.data ?? []

  const tagihanForm = useForm<TagihanForm>({
    resolver: zodResolver(tagihanSchema),
    defaultValues: { bulan: now.getMonth() + 1, tahun: now.getFullYear() },
  })

  const pembayaranForm = useForm<PembayaranForm>({
    resolver: zodResolver(pembayaranSchema),
    defaultValues: {
      tanggal_bayar: now.toISOString().split('T')[0],
      metode: 'tunai',
    },
  })

  async function onCreateTagihan(data: TagihanForm) {
    await createTagihan.mutateAsync(data)
    setShowTagihanDialog(false)
    tagihanForm.reset()
  }

  async function onCreatePembayaran(data: PembayaranForm) {
    if (!selectedTagihan) return
    await createPembayaran.mutateAsync({
      tagihan_id: selectedTagihan.id,
      ...data,
    })
    setSelectedTagihan(null)
    pembayaranForm.reset()
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Keuangan</h2>
          <p className="text-muted-foreground">Manajemen tagihan dan pembayaran santri.</p>
        </div>
        <Button onClick={() => setShowTagihanDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />Buat Tagihan
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm shrink-0">Status:</label>
        <select
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
        >
          <option value="">Semua</option>
          <option value="belum_bayar">Belum Bayar</option>
          <option value="sebagian">Cicilan</option>
          <option value="lunas">Lunas</option>
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Santri</th>
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Periode</th>
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Jenis</th>
                  <th className="h-10 px-4 text-right font-medium text-muted-foreground">Tagihan</th>
                  <th className="h-10 px-4 text-right font-medium text-muted-foreground">Dibayar</th>
                  <th className="h-10 px-4 text-right font-medium text-muted-foreground">Sisa</th>
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Status</th>
                  <th className="h-10 px-4 text-right font-medium text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b">
                        {Array.from({ length: 8 }).map((_, j) => (
                          <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                        ))}
                      </tr>
                    ))
                  : tagihan.length === 0
                  ? (
                      <tr>
                        <td colSpan={8} className="h-24 text-center text-muted-foreground">
                          Belum ada data tagihan.
                        </td>
                      </tr>
                    )
                  : tagihan.map((t) => (
                      <tr key={t.id} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-3">
                          <p className="font-medium">{t.nama_santri}</p>
                          {t.nik && <p className="text-xs text-muted-foreground font-mono">{t.nik}</p>}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{BULAN_NAMES[t.bulan]} {t.tahun}</td>
                        <td className="px-4 py-3 text-muted-foreground">{t.jenis}</td>
                        <td className="px-4 py-3 text-right font-mono">{formatRupiah(t.nominal)}</td>
                        <td className="px-4 py-3 text-right font-mono text-green-600 dark:text-green-400">
                          {formatRupiah(t.total_dibayar)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono">
                          <span className={t.sisa > 0 ? 'text-destructive' : ''}>{formatRupiah(t.sisa)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={STATUS_BADGE[t.status]?.variant ?? 'secondary'}>
                            {STATUS_BADGE[t.status]?.label ?? t.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {t.status !== 'lunas' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedTagihan(t)
                                pembayaranForm.setValue('jumlah_bayar', t.sisa)
                              }}
                            >
                              <CreditCard className="h-3 w-3 mr-1" />Bayar
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          {meta && meta.total_pages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3">
              <p className="text-xs text-muted-foreground">
                Hal {meta.page} dari {meta.total_pages} ({meta.total} tagihan)
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                  Sebelumnya
                </Button>
                <Button size="sm" variant="outline" disabled={page >= meta.total_pages} onClick={() => setPage(p => p + 1)}>
                  Berikutnya
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Tagihan Dialog */}
      <Dialog open={showTagihanDialog} onOpenChange={setShowTagihanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buat Tagihan Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={tagihanForm.handleSubmit(onCreateTagihan)} className="space-y-4">
            <div className="space-y-2">
              <Label>Santri</Label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                {...tagihanForm.register('santri_id')}
              >
                <option value="">-- Pilih Santri --</option>
                {santriList.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              {tagihanForm.formState.errors.santri_id && (
                <p className="text-xs text-destructive">{tagihanForm.formState.errors.santri_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Jenis Tagihan</Label>
              <Input placeholder="SPP, Seragam, dll." {...tagihanForm.register('jenis')} />
            </div>

            <div className="space-y-2">
              <Label>Nominal (Rp)</Label>
              <Input type="number" placeholder="500000" {...tagihanForm.register('nominal')} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Bulan</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                  {...tagihanForm.register('bulan')}
                >
                  {BULAN_NAMES.slice(1).map((b, i) => (
                    <option key={i + 1} value={i + 1}>{b}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Tahun</Label>
                <Input type="number" {...tagihanForm.register('tahun')} />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowTagihanDialog(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={createTagihan.isPending}>
                {createTagihan.isPending ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bayar Dialog */}
      <Dialog open={!!selectedTagihan} onOpenChange={(v) => { if (!v) setSelectedTagihan(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Catat Pembayaran</DialogTitle>
          </DialogHeader>
          {selectedTagihan && (
            <div className="mb-3 rounded-lg bg-muted/50 p-3 text-sm space-y-1">
              <p><span className="text-muted-foreground">Santri:</span> {selectedTagihan.nama_santri}</p>
              <p><span className="text-muted-foreground">Tagihan:</span> {formatRupiah(selectedTagihan.nominal)}</p>
              <p><span className="text-muted-foreground">Sisa:</span> <span className="text-destructive font-medium">{formatRupiah(selectedTagihan.sisa)}</span></p>
            </div>
          )}
          <form onSubmit={pembayaranForm.handleSubmit(onCreatePembayaran)} className="space-y-4">
            <div className="space-y-2">
              <Label>Jumlah Bayar (Rp)</Label>
              <Input type="number" {...pembayaranForm.register('jumlah_bayar')} />
            </div>

            <div className="space-y-2">
              <Label>Tanggal Bayar</Label>
              <Input type="date" {...pembayaranForm.register('tanggal_bayar')} />
            </div>

            <div className="space-y-2">
              <Label>Metode</Label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                {...pembayaranForm.register('metode')}
              >
                <option value="tunai">Tunai</option>
                <option value="transfer">Transfer</option>
                <option value="qris">QRIS</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Keterangan (opsional)</Label>
              <Input placeholder="Catatan pembayaran..." {...pembayaranForm.register('keterangan')} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSelectedTagihan(null)}>
                Batal
              </Button>
              <Button type="submit" disabled={createPembayaran.isPending}>
                {createPembayaran.isPending ? 'Menyimpan...' : 'Catat Pembayaran'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
