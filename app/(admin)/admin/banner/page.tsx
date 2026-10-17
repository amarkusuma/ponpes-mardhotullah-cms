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
import ThumbnailUpload from '@/components/konten/thumbnail-upload'
import {
  useBannerList,
  useCreateBanner,
  useUpdateBanner,
  useDeleteBanner,
  useUploadGambarBanner,
} from '@/hooks/use-konten'
import { HALAMAN_BANNER, HALAMAN_BANNER_LABELS, type BannerItem } from '@/lib/types/konten'

const schema = z.object({
  gambar_url: z.string().min(1, 'Gambar wajib diisi'),
  judul: z.string().max(255, 'Maks 255 karakter'),
  halaman: z.enum(HALAMAN_BANNER, { errorMap: () => ({ message: 'Pilih halaman' }) }),
  urutan: z.number({ invalid_type_error: 'Wajib angka' }).int().min(0),
  is_active: z.boolean(),
})
type BannerForm = z.infer<typeof schema>

const EMPTY_FORM: Partial<BannerForm> = { gambar_url: '', judul: '', urutan: 0, is_active: true }

const selectClass = 'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm'

export default function BannerPage() {
  const [mode, setMode] = useState<null | 'create' | 'edit'>(null)
  const [selected, setSelected] = useState<BannerItem | null>(null)
  const [halamanFilter, setHalamanFilter] = useState('')
  const [uploading, setUploading] = useState(false)

  const { data: banners = [], isLoading } = useBannerList()
  const createMutation = useCreateBanner()
  const updateMutation = useUpdateBanner(selected?.id ?? '')
  const deleteMutation = useDeleteBanner()
  const uploadMutation = useUploadGambarBanner()

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<BannerForm>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY_FORM,
  })
  const gambarUrl = watch('gambar_url')

  const shown = halamanFilter ? banners.filter((b) => b.halaman === halamanFilter) : banners

  const openCreate = () => {
    reset({ ...EMPTY_FORM, halaman: (halamanFilter || undefined) as BannerForm['halaman'] })
    setSelected(null)
    setMode('create')
  }

  const openEdit = (b: BannerItem) => {
    reset({
      gambar_url: b.gambar_url,
      judul: b.judul ?? '',
      halaman: b.halaman,
      urutan: b.urutan,
      is_active: b.is_active,
    })
    setSelected(b)
    setMode('edit')
  }

  const onSubmit = async (form: BannerForm) => {
    try {
      if (mode === 'create') {
        await createMutation.mutateAsync(form)
        toast.success('Banner berhasil dibuat')
      } else if (mode === 'edit') {
        await updateMutation.mutateAsync(form)
        toast.success('Banner berhasil diperbarui')
      }
      setMode(null)
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Gagal'
      toast.error(msg)
    }
  }

  const handleDelete = async (b: BannerItem) => {
    const nama = b.judul || `banner ${HALAMAN_BANNER_LABELS[b.halaman] ?? b.halaman}`
    if (!confirm(`Hapus "${nama}"?`)) return
    try {
      await deleteMutation.mutateAsync(b.id)
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
          <p className="text-muted-foreground">Gambar header untuk setiap halaman website.</p>
        </div>
        <Button size="sm" className="gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Tambah Banner
        </Button>
      </div>

      <select
        className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
        value={halamanFilter}
        onChange={(e) => setHalamanFilter(e.target.value)}
      >
        <option value="">Semua Halaman</option>
        {HALAMAN_BANNER.map((h) => (
          <option key={h} value={h}>{HALAMAN_BANNER_LABELS[h]}</option>
        ))}
      </select>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      ) : shown.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground text-sm">
            Belum ada banner{halamanFilter ? ` untuk halaman ${HALAMAN_BANNER_LABELS[halamanFilter as BannerItem['halaman']]}` : ''}.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((b) => (
            <Card key={b.id} className="overflow-hidden">
              <div className="relative aspect-video bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.gambar_url} alt={b.judul} className="h-full w-full object-cover" />
                <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2.5 py-0.5 text-xs font-medium text-white">
                  {HALAMAN_BANNER_LABELS[b.halaman] ?? b.halaman}
                </span>
              </div>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm line-clamp-1 ${b.judul ? 'font-medium' : 'italic text-muted-foreground'}`}>
                    {b.judul || 'Tanpa judul'}
                  </p>
                  <Badge variant={b.is_active ? 'success' : 'secondary'}>{b.is_active ? 'Aktif' : 'Nonaktif'}</Badge>
                </div>
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
                    onClick={() => handleDelete(b)}
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
        <DialogContent className="max-w-lg max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{mode === 'create' ? 'Tambah Banner' : 'Edit Banner'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Gambar</Label>
              <ThumbnailUpload
                value={gambarUrl}
                onChange={(url) => setValue('gambar_url', url, { shouldValidate: true, shouldDirty: true })}
                upload={uploadMutation.mutateAsync}
                onUploadingChange={setUploading}
                emptyText="Klik untuk upload gambar banner"
                className=""
              />
              <Input placeholder="Atau tempel URL gambar" {...register('gambar_url')} />
              {errors.gambar_url && <p className="text-xs text-destructive">{errors.gambar_url.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Judul <span className="font-normal text-muted-foreground">(opsional)</span></Label>
              <Input {...register('judul')} placeholder="Keterangan banner" />
              {errors.judul && <p className="text-xs text-destructive">{errors.judul.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Halaman</Label>
              <select className={selectClass} {...register('halaman')}>
                <option value="">Pilih halaman</option>
                {HALAMAN_BANNER.map((h) => (
                  <option key={h} value={h}>{HALAMAN_BANNER_LABELS[h]}</option>
                ))}
              </select>
              {errors.halaman && <p className="text-xs text-destructive">{errors.halaman.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Urutan</Label>
                <Input type="number" {...register('urutan', { valueAsNumber: true })} min={0} />
                {errors.urutan && <p className="text-xs text-destructive">{errors.urutan.message}</p>}
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" {...register('is_active')} />
                  <span className="text-sm">Aktifkan</span>
                </label>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Jika satu halaman punya beberapa banner aktif, gambar ditampilkan bergantian sesuai urutan.
            </p>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setMode(null)}>Batal</Button>
              <Button type="submit" className="flex-1" disabled={isPending || uploading}>
                {isPending ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
