'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useMapelList, useCreateMapel, useDeleteMapel } from '@/hooks/use-akademik'

const schema = z.object({
  nama: z.string().min(2, 'Wajib diisi'),
  kode: z.string().min(1, 'Wajib diisi'),
  deskripsi: z.string().optional(),
})
type MapelForm = z.infer<typeof schema>

export default function MataPelajaranPage() {
  const [page, setPage] = useState(1)
  const [showCreate, setShowCreate] = useState(false)
  const { data, isLoading } = useMapelList(page)
  const createMutation = useCreateMapel()
  const deleteMutation = useDeleteMapel()

  const rows = data?.data ?? []
  const totalPages = data?.pagination?.total_pages ?? 1

  const { register, handleSubmit, reset, formState: { errors } } = useForm<MapelForm>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (form: MapelForm) => {
    try {
      await createMutation.mutateAsync(form)
      toast.success('Mata pelajaran berhasil dibuat')
      setShowCreate(false)
      reset()
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Gagal'
      toast.error(msg)
    }
  }

  const handleDelete = async (id: string, nama: string) => {
    if (!confirm(`Hapus mata pelajaran "${nama}"?`)) return
    try {
      await deleteMutation.mutateAsync(id)
      toast.success('Mata pelajaran dihapus')
    } catch {
      toast.error('Gagal menghapus')
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Mata Pelajaran</h2>
          <p className="text-muted-foreground">Kelola daftar mata pelajaran.</p>
        </div>
        <Button size="sm" className="gap-2" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" />
          Tambah Mapel
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Kode</th>
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Nama</th>
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Deskripsi</th>
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b">
                        {Array.from({ length: 4 }).map((_, j) => (
                          <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                        ))}
                      </tr>
                    ))
                  : rows.length === 0
                  ? <tr><td colSpan={4} className="h-24 text-center text-muted-foreground">Tidak ada data.</td></tr>
                  : rows.map((m) => (
                    <tr key={m.id} className="border-b hover:bg-muted/50">
                      <td className="px-4 py-3 font-mono text-xs">{m.kode}</td>
                      <td className="px-4 py-3 font-medium">{m.nama}</td>
                      <td className="px-4 py-3 text-muted-foreground">{m.deskripsi || '-'}</td>
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(m.id, m.nama)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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

      <Dialog open={showCreate} onOpenChange={(o) => !o && setShowCreate(false)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Tambah Mata Pelajaran</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Kode</Label>
              <Input {...register('kode')} placeholder="Contoh: MTK" />
              {errors.kode && <p className="text-xs text-destructive">{errors.kode.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Nama</Label>
              <Input {...register('nama')} placeholder="Contoh: Matematika" />
              {errors.nama && <p className="text-xs text-destructive">{errors.nama.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Deskripsi (opsional)</Label>
              <Input {...register('deskripsi')} />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>Batal</Button>
              <Button type="submit" className="flex-1" disabled={createMutation.isPending}>Simpan</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
