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
  useAdminGuruProfil, useUpdateGuruProfil, type GuruProfilItem,
} from '@/hooks/use-akademik'
import { Pencil, IdCard } from 'lucide-react'

function EditDialog({ guru, onClose }: { guru: GuruProfilItem; onClose: () => void }) {
  const update = useUpdateGuruProfil(guru.user_id)
  const { register, handleSubmit } = useForm({
    defaultValues: { nik: guru.nik, spesialisasi: guru.spesialisasi },
  })

  async function onSubmit(data: { nik: string; spesialisasi: string }) {
    await update.mutateAsync(data)
    onClose()
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit Profil Guru — {guru.nama}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label>NIK</Label>
          <Input placeholder="16 digit NIK" {...register('nik')} />
        </div>
        <div className="space-y-2">
          <Label>Spesialisasi</Label>
          <Input placeholder="Al-Quran & Tajwid" {...register('spesialisasi')} />
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

export default function AdminGuruPage() {
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<GuruProfilItem | null>(null)
  const { data: guruList = [], isLoading } = useAdminGuruProfil()

  const filtered = guruList.filter(
    (g) =>
      g.nama.toLowerCase().includes(search.toLowerCase()) ||
      g.email.toLowerCase().includes(search.toLowerCase()) ||
      g.nik.includes(search),
  )

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Data Guru</h2>
        <p className="text-muted-foreground">Profil dan NIK guru yang terdaftar.</p>
      </div>

      <Input
        className="max-w-sm"
        placeholder="Cari nama, email, atau NIK..."
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
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Email</th>
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Spesialisasi</th>
                  <th className="h-10 px-4 text-right font-medium text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="border-b">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                        ))}
                      </tr>
                    ))
                  : filtered.length === 0
                  ? <tr><td colSpan={5} className="h-24 text-center text-muted-foreground">Tidak ada data guru.</td></tr>
                  : filtered.map((g) => (
                      <tr key={g.id} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-3 font-medium">{g.nama}</td>
                        <td className="px-4 py-3">
                          {g.nik
                            ? <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{g.nik}</span>
                            : <Badge variant="secondary">Belum diisi</Badge>}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{g.email}</td>
                        <td className="px-4 py-3 text-muted-foreground">{g.spesialisasi || '-'}</td>
                        <td className="px-4 py-3 text-right">
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditing(g)}>
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
        {editing && <EditDialog guru={editing} onClose={() => setEditing(null)} />}
      </Dialog>
    </div>
  )
}
