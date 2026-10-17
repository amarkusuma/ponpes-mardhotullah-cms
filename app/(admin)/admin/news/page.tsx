'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, Edit2, Eye } from 'lucide-react'
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
import RichTextEditor from '@/components/editor/RichTextEditor'
import ThumbnailUpload from '@/components/konten/thumbnail-upload'
import {
  useNewsList,
  useNewsDetail,
  useCreateNews,
  useUpdateNews,
  useDeleteNews,
  useUploadThumbnailNews,
} from '@/hooks/use-news'
import {
  KATEGORI_NEWS,
  KATEGORI_NEWS_LABELS,
  STATUS_NEWS,
  STATUS_NEWS_LABELS,
  type NewsItem,
  type StatusNews,
} from '@/lib/types/news'

const schema = z.object({
  judul: z.string().min(5, 'Min 5 karakter'),
  slug: z.string().min(1, 'Wajib diisi'),
  kategori: z.enum(KATEGORI_NEWS, { errorMap: () => ({ message: 'Pilih kategori' }) }),
  thumbnail: z.string().optional(),
  konten: z.string().min(1, 'Konten wajib diisi'),
  status: z.enum(STATUS_NEWS),
})
type NewsForm = z.infer<typeof schema>

const STATUS_COLORS: Record<StatusNews, 'success' | 'warning' | 'secondary'> = {
  published: 'success',
  draft: 'warning',
  archived: 'secondary',
}
// Badge labels describe the current state, the form select labels describe the action
const STATUS_BADGE_LABELS: Record<StatusNews, string> = {
  published: 'Dipublikasikan',
  draft: 'Draf',
  archived: 'Diarsipkan',
}

const EMPTY_FORM: Partial<NewsForm> = { status: 'draft', konten: '', thumbnail: '' }

function slugify(str: string) {
  return str.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-')
}

const selectClass = 'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm'

export default function NewsPage() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [kategoriFilter, setKategoriFilter] = useState('')
  const [mode, setMode] = useState<null | 'create' | 'edit' | 'preview'>(null)
  const [selected, setSelected] = useState<NewsItem | null>(null)
  const [uploading, setUploading] = useState(false)

  const { data, isLoading } = useNewsList(page, 10, statusFilter, kategoriFilter)
  // The list has no `konten`; edit and preview load the full item
  const { data: detail, isLoading: detailLoading } = useNewsDetail(mode === 'edit' || mode === 'preview' ? selected?.id ?? '' : '')
  const createMutation = useCreateNews()
  const updateMutation = useUpdateNews(selected?.id ?? '')
  const deleteMutation = useDeleteNews()
  const uploadMutation = useUploadThumbnailNews()

  const rows = data?.data ?? []
  const totalPages = data?.pagination?.total_pages ?? 1

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<NewsForm>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY_FORM,
  })

  const kontenValue = watch('konten')
  const thumbnailValue = watch('thumbnail')

  useEffect(() => {
    if (mode === 'edit' && detail) {
      reset({
        judul: detail.judul,
        slug: detail.slug,
        kategori: detail.kategori,
        thumbnail: detail.thumbnail ?? '',
        konten: detail.konten ?? '',
        status: detail.status,
      })
    }
  }, [mode, detail, reset])

  const openCreate = () => {
    reset(EMPTY_FORM)
    setSelected(null)
    setMode('create')
  }

  const openEdit = (n: NewsItem) => {
    setSelected(n)
    setMode('edit')
  }

  const onSubmit = async (form: NewsForm) => {
    try {
      if (mode === 'create') {
        await createMutation.mutateAsync(form)
        toast.success('Berita berhasil dibuat')
      } else if (mode === 'edit' && selected) {
        // Slug is fixed after creation (published links must keep working)
        const { slug: _slug, ...changes } = form
        await updateMutation.mutateAsync({ ...changes, thumbnail: form.thumbnail ?? '' })
        toast.success('Berita berhasil diperbarui')
      }
      setMode(null)
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Gagal'
      toast.error(msg)
    }
  }

  const handleDelete = async (id: string, judul: string) => {
    if (!confirm(`Hapus berita "${judul}"?`)) return
    try {
      await deleteMutation.mutateAsync(id)
      toast.success('Berita dihapus')
    } catch {
      toast.error('Gagal menghapus berita')
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending
  const formLoading = mode === 'edit' && detailLoading

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Kabar & Berita</h2>
          <p className="text-muted-foreground">Kelola kabar dan berita pesantren.</p>
        </div>
        <Button size="sm" className="gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Tulis Berita
        </Button>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-3">
        <select
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
          value={kategoriFilter}
          onChange={(e) => { setKategoriFilter(e.target.value); setPage(1) }}
        >
          <option value="">Semua Kategori</option>
          {KATEGORI_NEWS.map((k) => (
            <option key={k} value={k}>{KATEGORI_NEWS_LABELS[k]}</option>
          ))}
        </select>
        <select
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
        >
          <option value="">Semua Status</option>
          {STATUS_NEWS.map((s) => (
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
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Status</th>
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Penulis</th>
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
                  : rows.map((n) => (
                    <tr key={n.id} className="border-b hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-16 shrink-0 overflow-hidden rounded bg-muted">
                            {n.thumbnail && (
                              <img src={n.thumbnail} alt="" className="h-full w-full object-cover" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium line-clamp-1">{n.judul}</p>
                            <p className="text-xs text-muted-foreground">{n.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{KATEGORI_NEWS_LABELS[n.kategori] ?? n.kategori}</td>
                      <td className="px-4 py-3">
                        <Badge variant={STATUS_COLORS[n.status]}>{STATUS_BADGE_LABELS[n.status]}</Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{n.penulis}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {new Date(n.created_at).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Pratinjau" onClick={() => { setSelected(n); setMode('preview') }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Edit" onClick={() => openEdit(n)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Hapus"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(n.id, n.judul)}
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

      {/* Create / Edit Dialog */}
      <Dialog open={mode === 'create' || mode === 'edit'} onOpenChange={(o) => !o && setMode(null)}>
        <DialogContent className="max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
            <DialogTitle>{mode === 'create' ? 'Tulis Berita Baru' : 'Edit Berita'}</DialogTitle>
          </DialogHeader>

          {formLoading ? (
            <div className="space-y-4 px-6 py-6">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-2/3" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <div className="space-y-1.5">
                <Label>Judul</Label>
                <Input
                  {...register('judul')}
                  onChange={(e) => {
                    setValue('judul', e.target.value)
                    if (mode === 'create') setValue('slug', slugify(e.target.value))
                  }}
                  placeholder="Judul berita..."
                />
                {errors.judul && <p className="text-xs text-destructive">{errors.judul.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Slug</Label>
                  <Input {...register('slug')} placeholder="url-berita" disabled={mode === 'edit'} />
                  {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Kategori</Label>
                  <select className={selectClass} {...register('kategori')}>
                    <option value="">Pilih kategori</option>
                    {KATEGORI_NEWS.map((k) => (
                      <option key={k} value={k}>{KATEGORI_NEWS_LABELS[k]}</option>
                    ))}
                  </select>
                  {errors.kategori && <p className="text-xs text-destructive">{errors.kategori.message}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Thumbnail</Label>
                <ThumbnailUpload
                  value={thumbnailValue}
                  onChange={(url) => setValue('thumbnail', url, { shouldDirty: true })}
                  upload={uploadMutation.mutateAsync}
                  onUploadingChange={setUploading}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Status</Label>
                <select className={selectClass} {...register('status')}>
                  {STATUS_NEWS.map((s) => (
                    <option key={s} value={s}>{STATUS_NEWS_LABELS[s]}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label>Konten</Label>
                <RichTextEditor
                  value={kontenValue}
                  onChange={(val) => setValue('konten', val, { shouldValidate: true })}
                  disabled={isPending}
                />
                {errors.konten && <p className="text-xs text-destructive">{errors.konten.message}</p>}
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t shrink-0">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setMode(null)}>
                Batal
              </Button>
              <Button type="submit" className="flex-1" disabled={isPending || uploading}>
                {isPending ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={mode === 'preview' && !!selected} onOpenChange={(o) => !o && setMode(null)}>
        <DialogContent className="max-w-3xl w-full max-h-[88vh] flex flex-col overflow-hidden p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
            <DialogTitle className="text-lg leading-snug">{selected?.judul}</DialogTitle>
            <div className="flex gap-3 text-muted-foreground text-xs mt-1">
              <span>{selected ? KATEGORI_NEWS_LABELS[selected.kategori] : '-'}</span>
              <span>·</span>
              <span>{selected?.penulis}</span>
              <span>·</span>
              <Badge variant={selected ? STATUS_COLORS[selected.status] : 'default'}>
                {selected ? STATUS_BADGE_LABELS[selected.status] : ''}
              </Badge>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {selected?.thumbnail && (
              <img
                src={selected.thumbnail}
                alt={selected.judul}
                className="mb-5 w-full rounded-lg object-cover"
                style={{ aspectRatio: '16/9' }}
              />
            )}
            {detailLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : detail?.konten ? (
              <div className="artikel-preview text-sm" dangerouslySetInnerHTML={{ __html: detail.konten }} />
            ) : (
              <p className="text-muted-foreground text-sm">Tidak ada konten.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
