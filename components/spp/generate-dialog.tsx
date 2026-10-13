'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useGenerateSPP } from '@/hooks/use-spp'

const schema = z.object({
  bulan: z.number().min(1).max(12),
  tahun: z.number().min(2000),
  nominal: z.number({ invalid_type_error: 'Wajib diisi' }).positive('Harus lebih dari 0'),
  jenis: z.string().default('SPP'),
})

type FormData = z.infer<typeof schema>

interface GenerateDialogProps {
  onSuccess: () => void
  onClose: () => void
}

const BULAN_OPTIONS = [
  { value: 1, label: 'Januari' }, { value: 2, label: 'Februari' },
  { value: 3, label: 'Maret' }, { value: 4, label: 'April' },
  { value: 5, label: 'Mei' }, { value: 6, label: 'Juni' },
  { value: 7, label: 'Juli' }, { value: 8, label: 'Agustus' },
  { value: 9, label: 'September' }, { value: 10, label: 'Oktober' },
  { value: 11, label: 'November' }, { value: 12, label: 'Desember' },
]

export function GenerateDialog({ onSuccess, onClose }: GenerateDialogProps) {
  const { mutateAsync, isPending } = useGenerateSPP()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      bulan: new Date().getMonth() + 1,
      tahun: new Date().getFullYear(),
      nominal: 0,
      jenis: 'SPP',
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      const result = await mutateAsync(data)
      toast.success(`${result.generated} tagihan berhasil dibuat, ${result.skipped} dilewati (sudah ada)`)
      onSuccess()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Gagal generate tagihan'
      toast.error(msg)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
        Generate tagihan SPP untuk semua santri aktif. Tagihan yang sudah ada tidak akan diduplikasi.
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="bulan">Bulan</Label>
          <select
            id="bulan"
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            {...register('bulan', { valueAsNumber: true })}
          >
            {BULAN_OPTIONS.map((b) => (
              <option key={b.value} value={b.value}>{b.label}</option>
            ))}
          </select>
          {errors.bulan && <p className="text-xs text-destructive">{errors.bulan.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="tahun">Tahun</Label>
          <Input id="tahun" type="number" {...register('tahun', { valueAsNumber: true })} />
          {errors.tahun && <p className="text-xs text-destructive">{errors.tahun.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="nominal">Nominal SPP (Rp)</Label>
        <div className="relative">
          <span className="absolute left-3 top-2 text-sm text-muted-foreground">Rp</span>
          <Input
            id="nominal"
            type="number"
            className="pl-9"
            placeholder="500000"
            {...register('nominal', { valueAsNumber: true })}
          />
        </div>
        {errors.nominal && <p className="text-xs text-destructive">{errors.nominal.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="jenis">Jenis Tagihan</Label>
        <Input id="jenis" placeholder="SPP" {...register('jenis')} />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={isPending}>
          Batal
        </Button>
        <Button type="submit" className="flex-1 gap-2" disabled={isPending}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Generate Tagihan
        </Button>
      </div>
    </form>
  )
}
