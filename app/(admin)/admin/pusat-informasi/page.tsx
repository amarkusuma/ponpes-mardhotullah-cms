'use client'

import { useRef, useState } from 'react'
import { Plus, Trash2, Edit2, FileText, Upload, ExternalLink } from 'lucide-react'
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
  usePustakaList,
  useCreatePustaka,
  useUpdatePustaka,
  useDeletePustaka,
  useUploadThumbnailPustaka,
  useUploadFilePustaka,
} from '@/hooks/use-pustaka'
import { STATUS_PUSTAKA, STATUS_PUSTAKA_LABELS, type PustakaItem, type StatusPustaka } from '@/lib/types/pustaka'

const MAX_PDF_SIZE = 25 * 1024 * 1024

const schema = z.object({
  judul: z.string().min(3, 'Min 3 karakter'),
  slug: z.string().min(1, 'Wajib diisi'),
  kategori: z.string().max(100, 'Maks 100 karakter'),
  thumbnail: z.string(),
  file_url: z.string().min(1, 'File PDF wajib diupload'),
  file_size: z.number(),
  status: z.enum(STATUS_PUSTAKA),
})
type PustakaForm = z.infer<typeof schema>

const EMPTY_FORM: PustakaForm = {
  judul: '', slug: '', kategori: '', thumbnail: '', file_url: '', file_size: 0, status: 'draft',
}

const STATUS_COLORS: Record<StatusPustaka, 'success' | 'warning' | 'secondary'> = {
  published: 'success',
  draft: 'warning',
  archived: 'secondary',
}
const STATUS_BADGE_LABELS: Record<StatusPustaka, string> = {
  published: 'Dipublikasikan',
  draft: 'Draf',
  archived: 'Diarsipkan',
}

function slugify(str: string) {
  return str.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-')
}

function formatBytes(bytes: number) {
  if (!bytes) return '-'
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const selectClass = 'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm'

function PdfUpload({
  url,
  size,
  onUploaded,
  onUploadingChange,
}: {
  url: string
  size: number
  onUploaded: (file: { url: string; size: number }) => void
  onUploadingChange: (uploading: boolean) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const uploadMutation = useUploadFilePustaka()

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (file.type && file.type !== 'application/pdf') {
      toast.error('File harus PDF')
      return
    }
    if (file.size > MAX_PDF_SIZE) {
      toast.error('Ukuran PDF maksimal 25MB')
      return
    }
    onUploadingChange(true)
    try {
      onUploaded(await uploadMutation.mutateAsync(file))
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Gagal mengupload PDF'
      toast.error(msg)
    } finally {
      onUploadingChange(false)
    }
  }

  const fileName = url ? decodeURIComponent(url.split('/').pop() ?? '') : ''

  return (
    <div className="flex items-center gap-3 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 p-3">
      <FileText className="h-8 w-8 shrink-0 text-red-600" />
      <div className="min-w-0 flex-1">
        {url ? (
          <>
            <p className="truncate text-sm font-medium">{fileName}</p>
            <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
              {formatBytes(size)} · Buka PDF <ExternalLink className="h-3 w-3" />
            </a>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Belum ada file. PDF • maks 25MB</p>
        )}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1.5"
        disabled={uploadMutation.isPending}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="h-3.5 w-3.5" />
        {uploadMutation.isPending ? 'Mengupload...' : url ? 'Ganti' : 'Upload PDF'}
      </Button>
      <input ref={inputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={handleChange} />
    </div>
  )
}

export default function PusatInformasiPage() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [mode, setMode] = useState<null | 'create' | 'edit'>(null)
  const [selected, setSelected] = useState<PustakaItem | null>(null)
  const [uploadingThumb, setUploadingThumb] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)

  const { data, isLoading } = usePustakaList(page, 10, statusFilter, search)
  const createMutation = useCreatePustaka()
  const updateMutation = useUpdatePustaka(selected?.id ?? '')
  const deleteMutation = useDeletePustaka()
  const uploadThumbMutation = useUploadThumbnailPustaka()

  const rows = data?.data ?? []
  const totalPages = data?.pagination?.total_pages ?? 1
  // Category is free text; suggest the ones already used on this page
  const kategoriSuggestions = Array.from(new Set(rows.map((r) => r.kategori).filter(Boolean)))

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<PustakaForm>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY_FORM,
  })
  const thumbnailValue = watch('thumbnail')
  const fileUrl = watch('file_url')
  const fileSize = watch('file_size')

  const openCreate = () => {
    reset(EMPTY_FORM)
    setSelected(null)
    setMode('create')
  }

  const openEdit = (d: PustakaItem) => {
    reset({
      judul: d.judul,
      slug: d.slug,
      kategori: d.kategori ?? '',
      thumbnail: d.thumbnail ?? '',
      file_url: d.file_url,
      file_size: d.file_size,
      status: d.status,
    })
    setSelected(d)
    setMode('edit')
  }

  const onSubmit = async (form: PustakaForm) => {
    try {
      if (mode === 'create') {
        await createMutation.mutateAsync(form)
        toast.success('Dokumen berhasil dibuat')
      } else if (mode === 'edit' && selected) {
        // Slug is fixed after creation (shared links must keep working)
        const { slug: _slug, ...changes } = form
        await updateMutation.mutateAsync(changes)
        toast.success('Dokumen berhasil diperbarui')
      }
      setMode(null)
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Gagal'
      toast.error(msg)
    }
  }

  const handleDelete = async (d: PustakaItem) => {
    if (!confirm(`Hapus dokumen "${d.judul}"?`)) return
    try {
      await deleteMutation.mutateAsync(d.id)
      toast.success('Dokumen dihapus')
    } catch {
      toast.error('Gagal menghapus dokumen')
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Pusat Informasi</h2>
          <p className="text-muted-foreground">Kelola dokumen PDF yang bisa dibaca di website.</p>
        </div>
        <Button size="sm" className="gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Tambah Dokumen
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          className="h-9 w-64"
          placeholder="Cari judul..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
        />
        <select
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
        >
          <option value="">Semua Status</option>
          {STATUS_PUSTAKA.map((s) => (
            <option key={s} value={s}>{STATUS_BADGE_LABELS[s]}</option>
          ))}
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Judul</th>
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Kategori</th>
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">File</th>
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Status</th>
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Tanggal</th>
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Aksi</th>
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
                  : rows.length === 0
                  ? <tr><td colSpan={6} className="h-24 text-center text-muted-foreground">Tidak ada data.</td></tr>
                  : rows.map((d) => (
                    <tr key={d.id} className="border-b hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-14 w-10 shrink-0 items-center justify-center overflow-hidden rounded bg-muted">
                            {d.thumbnail
                              ? <img src={d.thumbnail} alt="" className="h-full w-full object-cover" />
                              : <FileText className="h-5 w-5 text-muted-foreground" />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium line-clamp-1">{d.judul}</p>
                            <p className="text-xs text-muted-foreground">{d.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{d.kategori || '-'}</td>
                      <td className="px-4 py-3">
                        <a
                          href={d.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          PDF · {formatBytes(d.file_size)} <ExternalLink className="h-3 w-3" />
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={STATUS_COLORS[d.status]}>{STATUS_BADGE_LABELS[d.status]}</Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {new Date(d.created_at).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Edit" onClick={() => openEdit(d)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Hapus"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(d)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <p className="text-sm text-muted-foreground">Halaman {page} dari {totalPages}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Sebelumnya</Button>
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Selanjutnya</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!mode} onOpenChange={(o) => !o && setMode(null)}>
        <DialogContent className="max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
            <DialogTitle>{mode === 'create' ? 'Tambah Dokumen' : 'Edit Dokumen'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <div className="space-y-1.5">
                <Label>File PDF</Label>
                <PdfUpload
                  url={fileUrl}
                  size={fileSize}
                  onUploaded={({ url, size }) => {
                    setValue('file_url', url, { shouldValidate: true, shouldDirty: true })
                    setValue('file_size', size, { shouldDirty: true })
                  }}
                  onUploadingChange={setUploadingFile}
                />
                {errors.file_url && <p className="text-xs text-destructive">{errors.file_url.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Thumbnail <span className="font-normal text-muted-foreground">(opsional, sampul dokumen)</span></Label>
                <ThumbnailUpload
                  value={thumbnailValue}
                  onChange={(url) => setValue('thumbnail', url, { shouldDirty: true })}
                  upload={uploadThumbMutation.mutateAsync}
                  onUploadingChange={setUploadingThumb}
                  emptyText="Klik untuk upload sampul"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Judul</Label>
                <Input
                  {...register('judul')}
                  onChange={(e) => {
                    setValue('judul', e.target.value)
                    if (mode === 'create') setValue('slug', slugify(e.target.value))
                  }}
                  placeholder="Judul dokumen..."
                />
                {errors.judul && <p className="text-xs text-destructive">{errors.judul.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Slug</Label>
                  <Input {...register('slug')} placeholder="url-dokumen" disabled={mode === 'edit'} />
                  {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Kategori</Label>
                  <Input {...register('kategori')} list="kategori-pustaka" placeholder="Kurikulum, Panduan, dll." />
                  <datalist id="kategori-pustaka">
                    {kategoriSuggestions.map((k) => <option key={k} value={k} />)}
                  </datalist>
                  {errors.kategori && <p className="text-xs text-destructive">{errors.kategori.message}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Status</Label>
                <select className={selectClass} {...register('status')}>
                  {STATUS_PUSTAKA.map((s) => (
                    <option key={s} value={s}>{STATUS_PUSTAKA_LABELS[s]}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t shrink-0">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setMode(null)}>
                Batal
              </Button>
              <Button type="submit" className="flex-1" disabled={isPending || uploadingThumb || uploadingFile}>
                {isPending ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
