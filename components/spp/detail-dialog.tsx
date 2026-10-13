'use client'

import { Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useSPPDetail } from '@/hooks/use-spp'
import type { TagihanSPP } from '@/lib/types/spp'

const BULAN_NAMES = [
  '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

function formatRupiah(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
}

const METODE_LABEL: Record<string, string> = {
  tunai: 'Tunai',
  transfer: 'Transfer Bank',
  qris: 'QRIS',
}

interface DetailDialogProps {
  tagihan: TagihanSPP
}

export function DetailDialog({ tagihan }: DetailDialogProps) {
  const { data: detail, isLoading } = useSPPDetail(tagihan.id)

  return (
    <div className="space-y-5">
      {/* Header info */}
      <div className="rounded-lg border p-4 space-y-2.5 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Santri</span>
          <div className="text-right">
            <p className="font-medium">{tagihan.nama_santri}</p>
            {tagihan.nik && <p className="text-xs text-muted-foreground font-mono">NIK: {tagihan.nik}</p>}
          </div>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Kelas</span>
          <span>{tagihan.kelas_nama || '-'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Jenis</span>
          <span>{tagihan.jenis}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Periode</span>
          <span>{BULAN_NAMES[tagihan.bulan]} {tagihan.tahun}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Nominal</span>
          <span className="font-mono">{formatRupiah(tagihan.nominal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Terbayar</span>
          <span className="font-mono text-green-600 dark:text-green-400">{formatRupiah(tagihan.total_dibayar)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Sisa</span>
          <span className={`font-mono font-semibold ${tagihan.sisa > 0 ? 'text-destructive' : 'text-green-600 dark:text-green-400'}`}>
            {formatRupiah(tagihan.sisa)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Status</span>
          <Badge variant={tagihan.status === 'lunas' ? 'success' : tagihan.status === 'sebagian' ? 'warning' : 'destructive'}>
            {tagihan.status === 'lunas' ? 'Lunas' : tagihan.status === 'sebagian' ? 'Cicilan' : 'Belum Bayar'}
          </Badge>
        </div>
      </div>

      {/* Payment history */}
      <div>
        <h4 className="text-sm font-medium mb-3">Riwayat Pembayaran</h4>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
          </div>
        ) : !detail?.pembayaran?.length ? (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            Belum ada pembayaran
          </div>
        ) : (
          <div className="space-y-2">
            {detail.pembayaran.map((p) => (
              <div key={p.id} className="rounded-lg border p-3 text-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium font-mono">{formatRupiah(p.jumlah_bayar)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {METODE_LABEL[p.metode] || p.metode} · {formatDate(p.tanggal_bayar)}
                    </p>
                    {p.keterangan && <p className="text-xs text-muted-foreground mt-0.5 italic">{p.keterangan}</p>}
                  </div>
                  <Badge variant="outline" className="text-xs">{METODE_LABEL[p.metode] || p.metode}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
