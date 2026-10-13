'use client'

import { useState } from 'react'
import { Plus, Trash2, Eye } from 'lucide-react'
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
import { useKelasList, useCreateKelas, useDeleteKelas, useKelasJadwal } from '@/hooks/use-akademik'
import { useTahunAjaran } from '@/hooks/use-akademik'

const schema = z.object({
  nama_kelas: z.string().min(2, 'Wajib diisi'),
  tingkat: z.number().min(1),
  tahun_ajaran_id: z.string().min(1, 'Pilih tahun ajaran'),
})
type KelasForm = z.infer<typeof schema>

export default function KelasPage() {
  const [page, setPage] = useState(1)
  const [showCreate, setShowCreate] = useState(false)
  const [jadwalKelasId, setJadwalKelasId] = useState<string | null>(null)

  const { data, isLoading } = useKelasList(undefined, page)
  const { data: tahunList = [] } = useTahunAjaran()
  const { data: jadwalList = [], isLoading: jadwalLoading } = useKelasJadwal(jadwalKelasId ?? '')
  const createMutation = useCreateKelas()
  const deleteMutation = useDeleteKelas()

  const rows = data?.data ?? []
  const totalPages = data?.pagination?.total_pages ?? 1

  const { register, handleSubmit, reset, formState: { errors } } = useForm<KelasForm>({
    resolver: zodResolver(schema),
    defaultValues: { nama_kelas: '', tingkat: 1, tahun_ajaran_id: '' },
  })

  const onSubmit = async (form: KelasForm) => {
    try {
      await createMutation.mutateAsync(form)
      toast.success('Kelas berhasil dibuat')
      setShowCreate(false)
      reset()
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Gagal'
      toast.error(msg)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus kelas "${name}"?`)) return
    try {
      await deleteMutation.mutateAsync(id)
      toast.success('Kelas dihapus')
    } catch {
      toast.error('Gagal menghapus kelas')
    }
  }

  const HARI_ORDER = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Ahad']
  const sortedJadwal = [...jadwalList].sort(
    (a, b) => HARI_ORDER.indexOf(a.hari) - HARI_ORDER.indexOf(b.hari) || a.jam_mulai.localeCompare(b.jam_mulai)
  )

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Manajemen Kelas</h2>
          <p className="text-muted-foreground">Kelola kelas dan jadwal pelajaran.</p>
        </div>
        <Button size="sm" className="gap-2" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" />
          Tambah Kelas
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Nama Kelas</th>
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Tingkat</th>
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Tahun Ajaran</th>
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
                  ? (
                    <tr>
                      <td colSpan={4} className="h-24 text-center text-muted-foreground">Tidak ada data.</td>
                    </tr>
                  )
                  : rows.map((k) => (
                    <tr key={k.id} className="border-b hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">{k.nama_kelas}</td>
                      <td className="px-4 py-3">Tingkat {k.tingkat}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {k.tahun_ajaran ? `${k.tahun_ajaran.tahun_mulai}/${k.tahun_ajaran.tahun_selesai}` : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Lihat Jadwal"
                            onClick={() => setJadwalKelasId(k.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(k.id, k.nama_kelas)}
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

      {/* Create Kelas Dialog */}
      <Dialog open={showCreate} onOpenChange={(o) => !o && setShowCreate(false)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Tambah Kelas</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nama Kelas</Label>
              <Input {...register('nama_kelas')} placeholder="Contoh: Kelas 7A" />
              {errors.nama_kelas && <p className="text-xs text-destructive">{errors.nama_kelas.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Tingkat</Label>
              <Input type="number" {...register('tingkat', { valueAsNumber: true })} min={1} />
            </div>
            <div className="space-y-1.5">
              <Label>Tahun Ajaran</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                {...register('tahun_ajaran_id')}
              >
                <option value="">-- Pilih --</option>
                {tahunList.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.tahun_mulai}/{t.tahun_selesai}{t.is_active ? ' (Aktif)' : ''}
                  </option>
                ))}
              </select>
              {errors.tahun_ajaran_id && <p className="text-xs text-destructive">{errors.tahun_ajaran_id.message}</p>}
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>Batal</Button>
              <Button type="submit" className="flex-1" disabled={createMutation.isPending}>Simpan</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Jadwal Dialog */}
      <Dialog open={!!jadwalKelasId} onOpenChange={(o) => !o && setJadwalKelasId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Jadwal Kelas</DialogTitle></DialogHeader>
          {jadwalLoading ? (
            <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : sortedJadwal.length === 0 ? (
            <p className="text-center text-muted-foreground py-6 text-sm">Belum ada jadwal</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {sortedJadwal.map((j) => (
                <div key={j.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                  <div>
                    <p className="font-medium">{j.nama_mapel}</p>
                    <p className="text-xs text-muted-foreground">{j.hari} · {j.jam_mulai}–{j.jam_selesai}</p>
                    <p className="text-xs text-muted-foreground">{j.nama_guru}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
