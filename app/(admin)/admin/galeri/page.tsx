'use client'

import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  useGaleriList, useUploadGambarGaleri, useCreateGaleri, useUpdateGaleri, useDeleteGaleri,
} from '@/hooks/use-konten'
import type { GaleriItem, CreateGaleriForm } from '@/lib/types/konten'
import { ImagePlus, Pencil, Trash2, Eye, EyeOff, Upload, X } from 'lucide-react'

const KATEGORI_OPTIONS = ['Kegiatan', 'Fasilitas', 'Santri', 'Prestasi', 'Lainnya']

// ── Upload & Form Dialog ──────────────────────────────────────────────────────

function GaleriDialog({
  item,
  onClose,
}: {
  item?: GaleriItem
  onClose: () => void
}) {
  const isEdit = !!item
  const uploadMutation = useUploadGambarGaleri()
  const createMutation = useCreateGaleri()
  const updateMutation = useUpdateGaleri(item?.id ?? '')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string>(item?.gambar_url ?? '')
  const [uploading, setUploading] = useState(false)

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CreateGaleriForm>({
    defaultValues: {
      judul: item?.judul ?? '',
      deskripsi: item?.deskripsi ?? '',
      gambar_url: item?.gambar_url ?? '',
      kategori: item?.kategori ?? '',
      urutan: item?.urutan ?? 0,
      is_published: item?.is_published ?? true,
    },
  })

  const gambarUrl = watch('gambar_url')

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadMutation.mutateAsync(file)
      setValue('gambar_url', url)
      setPreview(url)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  async function onSubmit(data: CreateGaleriForm) {
    if (isEdit) {
      await updateMutation.mutateAsync(data)
    } else {
      await createMutation.mutateAsync(data)
    }
    onClose()
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Edit Foto Galeri' : 'Tambah Foto Galeri'}</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Image area */}
        <div className="space-y-2">
          <Label>Foto</Label>
          <div
            className="relative rounded-lg border-2 border-dashed border-muted-foreground/30 overflow-hidden bg-muted/30 cursor-pointer hover:border-primary/50 transition-colors"
            style={{ aspectRatio: '16/9' }}
            onClick={() => fileInputRef.current?.click()}
          >
            {preview || gambarUrl ? (
              <>
                <img
                  src={preview || gambarUrl}
                  alt="preview"
                  className="w-full h-full object-cover"
                  onError={() => setPreview('')}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Upload className="h-8 w-8 text-white" />
                  <span className="text-white text-sm ml-2">Ganti foto</span>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                {uploading ? (
                  <p className="text-sm animate-pulse">Mengupload...</p>
                ) : (
                  <>
                    <ImagePlus className="h-8 w-8" />
                    <p className="text-sm">Klik untuk upload foto</p>
                    <p className="text-xs">JPG, PNG, WebP, GIF • maks 5MB</p>
                  </>
                )}
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <p className="text-white text-sm animate-pulse">Mengupload...</p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleFileChange}
          />
          {/* URL manual fallback */}
          <Input
            placeholder="Atau masukkan URL gambar langsung"
            {...register('gambar_url', { required: 'Foto wajib diisi' })}
            onChange={(e) => {
              register('gambar_url').onChange(e)
              setPreview(e.target.value)
            }}
          />
          {errors.gambar_url && <p className="text-xs text-destructive">{errors.gambar_url.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Judul / Keterangan</Label>
          <Input placeholder="Nama kegiatan atau deskripsi singkat" {...register('judul', { required: 'Judul wajib diisi' })} />
          {errors.judul && <p className="text-xs text-destructive">{errors.judul.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Deskripsi <span className="text-muted-foreground text-xs">(opsional)</span></Label>
          <Input placeholder="Deskripsi detail..." {...register('deskripsi')} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Kategori</Label>
            <select
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
              {...register('kategori')}
            >
              <option value="">-- Pilih --</option>
              {KATEGORI_OPTIONS.map((k) => (
                <option key={k} value={k.toLowerCase()}>{k}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Urutan Tampil</Label>
            <Input type="number" min={0} placeholder="0" {...register('urutan', { valueAsNumber: true })} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_published"
            className="h-4 w-4 accent-primary"
            {...register('is_published')}
          />
          <Label htmlFor="is_published">Tampilkan di galeri publik</Label>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
          <Button type="submit" disabled={isPending || uploading}>
            {isPending ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambahkan'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}

// ── Delete Confirm Dialog ─────────────────────────────────────────────────────

function DeleteDialog({ item, onClose }: { item: GaleriItem; onClose: () => void }) {
  const deleteMutation = useDeleteGaleri()

  async function handleDelete() {
    await deleteMutation.mutateAsync(item.id)
    onClose()
  }

  return (
    <DialogContent className="max-w-sm">
      <DialogHeader>
        <DialogTitle>Hapus Foto</DialogTitle>
      </DialogHeader>
      <p className="text-sm text-muted-foreground">
        Hapus <span className="font-medium text-foreground">"{item.judul}"</span> dari galeri? Tindakan ini tidak bisa dibatalkan.
      </p>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Batal</Button>
        <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
          {deleteMutation.isPending ? 'Menghapus...' : 'Hapus'}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminGaleriPage() {
  const [page, setPage] = useState(1)
  const [kategori, setKategori] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<GaleriItem | null>(null)
  const [deleting, setDeleting] = useState<GaleriItem | null>(null)

  const { data: galeriData, isLoading } = useGaleriList(page, 12, kategori)
  const items = galeriData?.data ?? []
  const total = galeriData?.pagination?.total ?? 0
  const totalPages = Math.ceil(total / 12)

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(item: GaleriItem) {
    setEditing(item)
    setDialogOpen(true)
  }

  function closeDialog() {
    setDialogOpen(false)
    setEditing(null)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Galeri Foto</h2>
          <p className="text-muted-foreground">Kelola foto kegiatan dan fasilitas pesantren.</p>
        </div>
        <Button onClick={openCreate}>
          <ImagePlus className="h-4 w-4 mr-2" />
          Tambah Foto
        </Button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => { setKategori(''); setPage(1) }}
          className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${!kategori ? 'bg-primary text-primary-foreground border-primary' : 'border-muted hover:border-primary/50'}`}
        >
          Semua
        </button>
        {KATEGORI_OPTIONS.map((k) => (
          <button
            key={k}
            onClick={() => { setKategori(k.toLowerCase()); setPage(1) }}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${kategori === k.toLowerCase() ? 'bg-primary text-primary-foreground border-primary' : 'border-muted hover:border-primary/50'}`}
          >
            {k}
          </button>
        ))}
        {kategori && (
          <button onClick={() => { setKategori(''); setPage(1) }} className="text-xs text-muted-foreground flex items-center gap-1 hover:text-destructive">
            <X className="h-3 w-3" /> Reset filter
          </button>
        )}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/3] rounded-lg" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-16 flex flex-col items-center gap-3 text-muted-foreground">
            <ImagePlus className="h-10 w-10 opacity-40" />
            <p className="text-sm">Belum ada foto{kategori ? ` untuk kategori "${kategori}"` : ''}.</p>
            <Button size="sm" onClick={openCreate}>Tambah Foto Pertama</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div key={item.id} className="group relative rounded-lg overflow-hidden border bg-muted aspect-[4/3]">
              <img
                src={item.gambar_url}
                alt={item.judul}
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                onError={(e) => {
                  const img = e.target as HTMLImageElement
                  img.onerror = null
                  img.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%239ca3af'%3EGambar tidak tersedia%3C/text%3E%3C/svg%3E"
                }}
              />

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white text-xs font-medium line-clamp-1">{item.judul}</p>
                  {item.kategori && (
                    <span className="text-white/70 text-xs capitalize">{item.kategori}</span>
                  )}
                </div>
                <div className="absolute top-2 right-2 flex gap-1">
                  <button
                    onClick={() => openEdit(item)}
                    className="p-1.5 rounded-md bg-white/20 hover:bg-white/40 text-white transition-colors"
                    title="Edit"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleting(item)}
                    className="p-1.5 rounded-md bg-white/20 hover:bg-red-500/80 text-white transition-colors"
                    title="Hapus"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Published badge */}
              <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {item.is_published
                  ? <span className="flex items-center gap-1 text-xs bg-green-500/90 text-white px-2 py-0.5 rounded-full"><Eye className="h-3 w-3" />Publik</span>
                  : <span className="flex items-center gap-1 text-xs bg-muted/90 text-muted-foreground px-2 py-0.5 rounded-full"><EyeOff className="h-3 w-3" />Tersembunyi</span>
                }
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Sebelumnya
          </Button>
          <span className="text-sm text-muted-foreground">Halaman {page} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            Selanjutnya
          </Button>
        </div>
      )}

      {/* Total count */}
      {!isLoading && total > 0 && (
        <p className="text-xs text-muted-foreground text-center">{total} foto total</p>
      )}

      {/* Dialogs */}
      <Dialog open={dialogOpen} onOpenChange={(v) => { if (!v) closeDialog() }}>
        {dialogOpen && <GaleriDialog item={editing ?? undefined} onClose={closeDialog} />}
      </Dialog>

      <Dialog open={!!deleting} onOpenChange={(v) => { if (!v) setDeleting(null) }}>
        {deleting && <DeleteDialog item={deleting} onClose={() => setDeleting(null)} />}
      </Dialog>
    </div>
  )
}
