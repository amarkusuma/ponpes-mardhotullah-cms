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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  useKelasList, useMapelAll, useTahunAjaran,
  useKelasJadwal, useCreateJadwal, useDeleteJadwal
} from '@/hooks/use-akademik'
import { useUsers } from '@/hooks/use-users'

const HARI_OPTIONS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Ahad']

const schema = z.object({
  kelas_id: z.string().min(1, 'Pilih kelas'),
  mapel_id: z.string().min(1, 'Pilih mapel'),
  guru_id: z.string().min(1, 'Pilih guru'),
  hari: z.string().min(1, 'Pilih hari'),
  jam_mulai: z.string().min(1, 'Wajib diisi'),
  jam_selesai: z.string().min(1, 'Wajib diisi'),
})
type JadwalForm = z.infer<typeof schema>

export default function JadwalPage() {
  const [selectedKelasId, setSelectedKelasId] = useState('')
  const [showCreate, setShowCreate] = useState(false)

  const { data: kelasData } = useKelasList()
  const { data: mapelList = [] } = useMapelAll()
  const { data: guruData } = useUsers('', 'guru', 1, 200)
  const { data: jadwalList = [], isLoading: jadwalLoading } = useKelasJadwal(selectedKelasId)
  const createMutation = useCreateJadwal()
  const deleteMutation = useDeleteJadwal()

  const kelasList = kelasData?.data ?? []
  const guruList = guruData?.data ?? []

  const { register, handleSubmit, reset, formState: { errors } } = useForm<JadwalForm>({
    resolver: zodResolver(schema),
    defaultValues: { kelas_id: selectedKelasId, hari: 'Senin' },
  })

  const onSubmit = async (form: JadwalForm) => {
    try {
      await createMutation.mutateAsync(form)
      toast.success('Jadwal berhasil dibuat')
      setShowCreate(false)
      reset()
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Gagal'
      toast.error(msg)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus jadwal ini?')) return
    try {
      await deleteMutation.mutateAsync(id)
      toast.success('Jadwal dihapus')
    } catch {
      toast.error('Gagal menghapus jadwal')
    }
  }

  const HARI_ORDER = HARI_OPTIONS
  const sortedJadwal = [...jadwalList].sort(
    (a, b) => HARI_ORDER.indexOf(a.hari) - HARI_ORDER.indexOf(b.hari) || a.jam_mulai.localeCompare(b.jam_mulai)
  )

  const groupedJadwal = HARI_ORDER.reduce<Record<string, typeof jadwalList>>((acc, hari) => {
    acc[hari] = sortedJadwal.filter((j) => j.hari === hari)
    return acc
  }, {})

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Jadwal Pelajaran</h2>
          <p className="text-muted-foreground">Kelola jadwal pelajaran per kelas.</p>
        </div>
        <Button size="sm" className="gap-2" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" />
          Tambah Jadwal
        </Button>
      </div>

      {/* Kelas selector */}
      <div className="flex items-center gap-3">
        <Label className="shrink-0">Pilih Kelas:</Label>
        <select
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm flex-1 max-w-64"
          value={selectedKelasId}
          onChange={(e) => setSelectedKelasId(e.target.value)}
        >
          <option value="">-- Pilih Kelas --</option>
          {kelasList.map((k) => (
            <option key={k.id} value={k.id}>{k.nama_kelas}</option>
          ))}
        </select>
      </div>

      {/* Jadwal per hari */}
      {!selectedKelasId ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground text-sm">
            Pilih kelas untuk melihat jadwal.
          </CardContent>
        </Card>
      ) : jadwalLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : (
        <div className="space-y-4">
          {HARI_ORDER.map((hari) => {
            const items = groupedJadwal[hari]
            if (items.length === 0) return null
            return (
              <Card key={hari}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">{hari}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {items.map((j) => (
                    <div key={j.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                      <div>
                        <p className="font-medium">{j.nama_mapel}</p>
                        <p className="text-xs text-muted-foreground">{j.jam_mulai}–{j.jam_selesai} · {j.nama_guru}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(j.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )
          })}
          {sortedJadwal.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground text-sm">
                Belum ada jadwal untuk kelas ini.
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={(o) => !o && setShowCreate(false)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Tambah Jadwal</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Kelas</Label>
              <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm" {...register('kelas_id')}>
                <option value="">-- Pilih --</option>
                {kelasList.map((k) => <option key={k.id} value={k.id}>{k.nama_kelas}</option>)}
              </select>
              {errors.kelas_id && <p className="text-xs text-destructive">{errors.kelas_id.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Mata Pelajaran</Label>
              <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm" {...register('mapel_id')}>
                <option value="">-- Pilih --</option>
                {mapelList.map((m) => <option key={m.id} value={m.id}>{m.nama}</option>)}
              </select>
              {errors.mapel_id && <p className="text-xs text-destructive">{errors.mapel_id.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Guru</Label>
              <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm" {...register('guru_id')}>
                <option value="">-- Pilih --</option>
                {guruList.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
              {errors.guru_id && <p className="text-xs text-destructive">{errors.guru_id.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Hari</Label>
              <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm" {...register('hari')}>
                {HARI_OPTIONS.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Jam Mulai</Label>
                <Input type="time" {...register('jam_mulai')} />
              </div>
              <div className="space-y-1.5">
                <Label>Jam Selesai</Label>
                <Input type="time" {...register('jam_selesai')} />
              </div>
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
