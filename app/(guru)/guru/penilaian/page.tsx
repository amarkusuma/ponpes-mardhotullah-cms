'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
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
import {
  useGuruJadwal, useGuruSantri, useTahunAjaran, useCreatePenilaian
} from '@/hooks/use-akademik'

const schema = z.object({
  santri_id: z.string().min(1, 'Pilih santri'),
  mapel_id: z.string().min(1, 'Pilih mata pelajaran'),
  kelas_id: z.string().min(1, 'Pilih kelas'),
  jenis_penilaian_id: z.string().min(1, 'Pilih jenis penilaian'),
  tahun_ajaran_id: z.string().min(1, 'Pilih tahun ajaran'),
  nilai: z.number({ invalid_type_error: 'Wajib diisi' }).min(0).max(100),
  semester: z.number().min(1).max(2),
})
type PenilaianForm = z.infer<typeof schema>

const JENIS_PENILAIAN_DUMMY = [
  { id: 'tugas', label: 'Tugas' },
  { id: 'ulangan-harian', label: 'Ulangan Harian' },
  { id: 'uts', label: 'UTS' },
  { id: 'uas', label: 'UAS' },
]

export default function GuruPenilaianPage() {
  const [showCreate, setShowCreate] = useState(false)
  const [selectedKelasId, setSelectedKelasId] = useState('')

  const { data: jadwalList = [], isLoading: jadwalLoading } = useGuruJadwal()
  const { data: santriList = [], isLoading: santriLoading } = useGuruSantri(selectedKelasId)
  const { data: tahunList = [] } = useTahunAjaran()
  const createMutation = useCreatePenilaian()

  const kelasList = Array.from(
    new Map(jadwalList.map((j) => [j.kelas_id, { id: j.kelas_id, nama: j.nama_kelas }])).values()
  )

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<PenilaianForm>({
    resolver: zodResolver(schema),
    defaultValues: { nilai: 0, semester: 1 },
  })

  const onSubmit = async (form: PenilaianForm) => {
    try {
      await createMutation.mutateAsync(form)
      toast.success('Penilaian berhasil disimpan')
      setShowCreate(false)
      reset()
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Gagal'
      toast.error(msg)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Input Penilaian</h2>
          <p className="text-muted-foreground">Catat nilai santri per mata pelajaran.</p>
        </div>
        <Button size="sm" className="gap-2" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" />
          Input Nilai
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
            <option key={k.id} value={k.id}>{k.nama}</option>
          ))}
        </select>
      </div>

      {/* Santri list */}
      {!selectedKelasId ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground text-sm">
            Pilih kelas untuk melihat daftar santri.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">NIS</th>
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Nama Santri</th>
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {santriLoading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="border-b">
                          {Array.from({ length: 3 }).map((_, j) => (
                            <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                          ))}
                        </tr>
                      ))
                    : santriList.length === 0
                    ? <tr><td colSpan={3} className="h-24 text-center text-muted-foreground">Tidak ada santri.</td></tr>
                    : santriList.map((s) => (
                      <tr key={s.id} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-3 font-mono text-xs">{s.nik ?? '-'}</td>
                        <td className="px-4 py-3 font-medium">{s.nama}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${
                            s.status === 'aktif'
                              ? 'border-green-200 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                              : 'border-muted bg-muted/50 text-muted-foreground'
                          }`}>
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={showCreate} onOpenChange={(o) => !o && setShowCreate(false)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Input Nilai Santri</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Kelas</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                onChange={(e) => {
                  setValue('kelas_id', e.target.value)
                  setSelectedKelasId(e.target.value)
                }}
              >
                <option value="">-- Pilih --</option>
                {kelasList.map((k) => <option key={k.id} value={k.id}>{k.nama}</option>)}
              </select>
              {errors.kelas_id && <p className="text-xs text-destructive">{errors.kelas_id.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Santri</Label>
              <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm" {...register('santri_id')}>
                <option value="">-- Pilih --</option>
                {santriList.map((s) => <option key={s.id} value={s.id}>{s.nama}{s.nik ? ` (${s.nik})` : ''}</option>)}
              </select>
              {errors.santri_id && <p className="text-xs text-destructive">{errors.santri_id.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Mata Pelajaran</Label>
              <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm" {...register('mapel_id')}>
                <option value="">-- Pilih --</option>
                {Array.from(new Map(jadwalList.filter((j) => !selectedKelasId || j.kelas_id === selectedKelasId).map((j) => [j.nama_mapel, j])).values()).map((j) => (
                  <option key={j.id} value={j.id}>{j.nama_mapel}</option>
                ))}
              </select>
              {errors.mapel_id && <p className="text-xs text-destructive">{errors.mapel_id.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Jenis Penilaian</Label>
              <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm" {...register('jenis_penilaian_id')}>
                <option value="">-- Pilih --</option>
                {JENIS_PENILAIAN_DUMMY.map((j) => <option key={j.id} value={j.id}>{j.label}</option>)}
              </select>
              {errors.jenis_penilaian_id && <p className="text-xs text-destructive">{errors.jenis_penilaian_id.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Tahun Ajaran</Label>
              <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm" {...register('tahun_ajaran_id')}>
                <option value="">-- Pilih --</option>
                {tahunList.map((t) => <option key={t.id} value={t.id}>{t.tahun_mulai}/{t.tahun_selesai}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Nilai (0–100)</Label>
                <Input type="number" min={0} max={100} {...register('nilai', { valueAsNumber: true })} />
                {errors.nilai && <p className="text-xs text-destructive">{errors.nilai.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Semester</Label>
                <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm" {...register('semester', { valueAsNumber: true })}>
                  <option value={1}>Semester 1</option>
                  <option value={2}>Semester 2</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>Batal</Button>
              <Button type="submit" className="flex-1" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
