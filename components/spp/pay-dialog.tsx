'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import type { TagihanSPP } from '@/lib/types/spp'
import { usePaySPP } from '@/hooks/use-spp'

const BULAN_NAMES = [
  '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

function formatRupiah(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)
}

const paySchema = z.object({
  jumlah_bayar: z.number({ invalid_type_error: 'Wajib diisi' }).positive('Harus lebih dari 0'),
  metode: z.enum(['tunai', 'transfer', 'qris'], { required_error: 'Pilih metode' }),
  tanggal_bayar: z.string().min(1, 'Pilih tanggal'),
  keterangan: z.string().optional(),
})

type PayForm = z.infer<typeof paySchema>

interface PayDialogProps {
  tagihan: TagihanSPP
  onSuccess: () => void
  onClose: () => void
}

export function PayDialog({ tagihan, onSuccess, onClose }: PayDialogProps) {
  const { mutateAsync, isPending } = usePaySPP(tagihan.id)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PayForm>({
    resolver: zodResolver(paySchema),
    defaultValues: {
      jumlah_bayar: tagihan.sisa,
      metode: 'tunai',
      tanggal_bayar: new Date().toISOString().slice(0, 10),
    },
  })

  const onSubmit = async (data: PayForm) => {
    try {
      await mutateAsync({
        ...data,
        tanggal_bayar: new Date(data.tanggal_bayar).toISOString(),
      })
      toast.success('Pembayaran berhasil dicatat')
      onSuccess()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Gagal memproses pembayaran'
      toast.error(msg)
    }
  }

  return (
    <div className="space-y-5">
      {/* Info tagihan */}
      <div className="rounded-lg bg-muted/50 p-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Santri</span>
          <span className="font-medium">{tagihan.nama_santri}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Periode</span>
          <span>{BULAN_NAMES[tagihan.bulan]} {tagihan.tahun}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total Tagihan</span>
          <span>{formatRupiah(tagihan.nominal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Sudah Dibayar</span>
          <span className="text-green-600 dark:text-green-400">{formatRupiah(tagihan.total_dibayar)}</span>
        </div>
        <div className="flex justify-between font-medium">
          <span>Sisa Tagihan</span>
          <span className="text-destructive">{formatRupiah(tagihan.sisa)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Status</span>
          <Badge variant={tagihan.status === 'lunas' ? 'success' : tagihan.status === 'sebagian' ? 'warning' : 'destructive'}>
            {tagihan.status === 'lunas' ? 'Lunas' : tagihan.status === 'sebagian' ? 'Cicilan' : 'Belum Bayar'}
          </Badge>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Jumlah Bayar */}
        <div className="space-y-1.5">
          <Label htmlFor="jumlah_bayar">Jumlah Bayar</Label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-sm text-muted-foreground">Rp</span>
            <Input
              id="jumlah_bayar"
              type="number"
              className="pl-9"
              {...register('jumlah_bayar', { valueAsNumber: true })}
            />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setValue('jumlah_bayar', tagihan.sisa)}
              className="text-xs text-primary underline-offset-2 hover:underline">
              Bayar penuh ({formatRupiah(tagihan.sisa)})
            </button>
          </div>
          {errors.jumlah_bayar && <p className="text-xs text-destructive">{errors.jumlah_bayar.message}</p>}
        </div>

        {/* Metode */}
        <div className="space-y-1.5">
          <Label htmlFor="metode">Metode Pembayaran</Label>
          <select
            id="metode"
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            {...register('metode')}
          >
            <option value="tunai">Tunai</option>
            <option value="transfer">Transfer Bank</option>
            <option value="qris">QRIS</option>
          </select>
          {errors.metode && <p className="text-xs text-destructive">{errors.metode.message}</p>}
        </div>

        {/* Tanggal */}
        <div className="space-y-1.5">
          <Label htmlFor="tanggal_bayar">Tanggal Bayar</Label>
          <Input id="tanggal_bayar" type="date" {...register('tanggal_bayar')} />
          {errors.tanggal_bayar && <p className="text-xs text-destructive">{errors.tanggal_bayar.message}</p>}
        </div>

        {/* Keterangan */}
        <div className="space-y-1.5">
          <Label htmlFor="keterangan">Keterangan (opsional)</Label>
          <Input id="keterangan" placeholder="Catatan pembayaran..." {...register('keterangan')} />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={isPending}>
            Batal
          </Button>
          <Button type="submit" className="flex-1" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan Pembayaran
          </Button>
        </div>
      </form>
    </div>
  )
}
