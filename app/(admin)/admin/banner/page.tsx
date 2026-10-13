'use client'

import { useState } from 'react'
import { Plus, Trash2, Edit2 } from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useBannerList, useCreateBanner, useUpdateBanner, useDeleteBanner } from '@/hooks/use-konten'
import type { BannerItem } from '@/lib/types/konten'

const schema = z.object({
  judul: z.string().min(1, 'Wajib diisi'),
  gambar_url: z.string().url('URL tidak valid'),
  link: z.string().optional(),
  urutan: z.number().min(0),
  is_active: z.boolean(),
  tanggal_mulai: z.string().min(1, 'Wajib diisi'),
  tanggal_selesai: z.string().min(1, 'Wajib diisi'),
})
type BannerForm = z.infer<typeof schema>

export default function BannerPage() {
  const [mode, setMode] = useState<null | 'create' | 'edit'>(null)
  const [selected, setSelected] = useState<BannerItem | null>(null)

  const { data: banners = [], isLoading } = useBannerList()
  const createMutation = useCreateBanner()
  const updateMutation = useUpdateBanner(selected?.id ?? '')
  const deleteMutation = useDeleteBanner()

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<BannerForm>({
    resolver: zodResolver(schema),
    defaultValues: { urutan: 0, is_active: true },
  })

  const openCreate = () => {
    reset({ urutan: 0, is_active: true })
    setSelected(null)
    setMode('create')
  }

  const openEdit = (b: BannerItem) => {
    setValue('judul', b.judul)
    setValue('gambar_url', b.gambar_url)
    setValue('link', b.link ?? '')
    setValue('urutan', b.urutan)
    setValue('is_active', b.is_active)
    setValue('tanggal_mulai', b.tanggal_mulai.slice(0, 10))
    setValue('tanggal_selesai', b.tanggal_selesai.slice(0, 10))
    setSelected(b)
    setMode('edit')
  }

  const onSubmit = async (form: BannerForm) => {
    const payload = {
      ...form,
      tanggal_mulai: new Date(form.tanggal_mulai).toISOString(),
      tanggal_selesai: new Date(form.tanggal_selesai).toISOString(),
    }
    try {
      if (mode === 'create') {
        await createMutation.mutateAsync(payload)
        toast.success('Banner berhasil dibuat')
      } else if (mode === 'edit') {
        await updateMutation.mutateAsync(payload)
        toast.success('Banner berhasil diperbarui')
      }
      setMode(null)
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Gagal'
      toast.error(msg)
    }
  }

  const handleDelete = async (id: string, judul: string) => {
    if (!confirm(`Hapus banner "${judul}"?`)) return
    try {
      await deleteMutation.mutateAsync(id)
      toast.success('Banner dihapus')
    } catch {
      toast.error('Gagal menghapus banner')
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Banner</h2>
          <p className="text-muted-foreground">Kelola banner website pesantren.</p>
        </div>
        <Button size="sm" className="gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Tambah Banner
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      ) : banners.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground text-sm">
            Belum ada banner.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {banners.map((b) => (
            <Card key={b.id} className="overflow-hidden">
              {b.gambar_url && (
                <div className="aspect-video bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={b.gambar_url} alt={b.judul} className="h-full w-full object-cover" />
                </div>
              )}
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-sm line-clamp-1">{b.judul}</p>
                  <Badge variant={b.is_active ? 'success' : 'secondary'}>{b.is_active ? 'Aktif' : 'Nonaktif'}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(b.tanggal_mulai).toLocaleDateString('id-ID')} – {new Date(b.tanggal_selesai).toLocaleDateString('id-ID')}
                </p>
                <p className="text-xs text-muted-foreground">Urutan: {b.urutan}</p>
                <div className="flex gap-2 pt-1">
                  <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => openEdit(b)}>
                    <Edit2 className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(b.id, b.judul)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Hapus
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!mode} onOpenChange={(o) => !o && setMode(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{mode === 'create' ? 'Tambah Banner' : 'Edit Banner'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Judul</Label>
              <Input {...register('judul')} />
              {errors.judul && <p className="text-xs text-destructive">{errors.judul.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>URL Gambar</Label>
              <Input {...register('gambar_url')} placeholder="https://..." />
              {errors.gambar_url && <p className="text-xs text-destructive">{errors.gambar_url.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Link (opsional)</Label>
              <Input {...register('link')} placeholder="https://..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Urutan</Label>
                <Input type="number" {...register('urutan', { valueAsNumber: true })} min={0} />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" {...register('is_active')} />
                  <span className="text-sm">Aktifkan</span>
                </label>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Tanggal Mulai</Label>
                <Input type="date" {...register('tanggal_mulai')} />
              </div>
              <div className="space-y-1.5">
                <Label>Tanggal Selesai</Label>
                <Input type="date" {...register('tanggal_selesai')} />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setMode(null)}>Batal</Button>
              <Button type="submit" className="flex-1" disabled={isPending}>
                {isPending ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
