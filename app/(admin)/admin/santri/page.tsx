'use client'

import { useState } from 'react'
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
  useAdminSantriProfil, useUpdateSantriProfil, type SantriProfilItem,
} from '@/hooks/use-akademik'
import { Pencil, IdCard } from 'lucide-react'

const STATUS_VARIANT = {
  aktif: 'success',
  alumni: 'secondary',
  dropout: 'destructive',
  keluar: 'warning',
} as const

function EditDialog({ santri, onClose }: { santri: SantriProfilItem; onClose: () => void }) {
  const update = useUpdateSantriProfil(santri.user_id)
  const { register, handleSubmit } = useForm({
    defaultValues: {
      nik: santri.nik,
      tempat_lahir: santri.tempat_lahir,
      alamat: santri.alamat,
    },
  })

  async function onSubmit(data: { nik: string; tempat_lahir: string; alamat: string }) {
    await update.mutateAsync(data)
    onClose()
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit Profil Santri — {santri.nama}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label>NIK</Label>
          <Input placeholder="16 digit NIK" {...register('nik')} />
        </div>
        <div className="space-y-2">
          <Label>Tempat Lahir</Label>
          <Input {...register('tempat_lahir')} />
        </div>
        <div className="space-y-2">
          <Label>Alamat</Label>
          <Input {...register('alamat')} />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}

export default function AdminSantriPage() {
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<SantriProfilItem | null>(null)
  const { data: santriList = [], isLoading } = useAdminSantriProfil()

  const filtered = santriList.filter(
    (s) =>
      s.nama.toLowerCase().includes(search.toLowerCase()) ||
      (s.nik ?? '').includes(search) ||
      (s.email ?? '').toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Data Santri</h2>
        <p className="text-muted-foreground">Profil, NIS, dan NIK santri yang terdaftar.</p>
      </div>

      <Input
        className="max-w-sm"
        placeholder="Cari nama, NIK, atau email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Nama</th>
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">
                    <span className="flex items-center gap-1"><IdCard className="h-3.5 w-3.5" />NIK</span>
                  </th>
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Tempat Lahir</th>
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Status</th>
                  <th className="h-10 px-4 text-right font-medium text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                        ))}
                      </tr>
                    ))
                  : filtered.length === 0
                  ? <tr><td colSpan={5} className="h-24 text-center text-muted-foreground">Tidak ada data santri.</td></tr>
                  : filtered.map((s) => (
                      <tr key={s.id} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-3">
                          <p className="font-medium">{s.nama}</p>
                          <p className="text-xs text-muted-foreground">{s.email}</p>
                        </td>
                        <td className="px-4 py-3">
                          {s.nik
                            ? <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{s.nik}</span>
                            : <Badge variant="secondary">Belum diisi</Badge>}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{s.tempat_lahir || '-'}</td>
                        <td className="px-4 py-3">
                          <Badge variant={STATUS_VARIANT[s.status as keyof typeof STATUS_VARIANT] ?? 'secondary'}>
                            {s.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditing(s)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!editing} onOpenChange={(v) => { if (!v) setEditing(null) }}>
        {editing && <EditDialog santri={editing} onClose={() => setEditing(null)} />}
      </Dialog>
    </div>
  )
}
