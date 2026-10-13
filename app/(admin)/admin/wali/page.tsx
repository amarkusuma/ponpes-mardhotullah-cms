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
  useAdminWaliProfil, useUpdateWaliProfil, useLinkWaliSantri, useUnlinkWaliSantri,
  type WaliProfilItem,
} from '@/hooks/use-akademik'
import { Pencil, Link2, Unlink, IdCard, Users } from 'lucide-react'

function EditDialog({ wali, onClose }: { wali: WaliProfilItem; onClose: () => void }) {
  const update = useUpdateWaliProfil(wali.user_id)
  const { register, handleSubmit } = useForm({
    defaultValues: {
      nik: wali.nik, hubungan: wali.hubungan,
      telepon: wali.telepon, pekerjaan: wali.pekerjaan, alamat: wali.alamat,
    },
  })

  async function onSubmit(data: { nik: string; hubungan: string; telepon: string; pekerjaan: string; alamat: string }) {
    await update.mutateAsync(data)
    onClose()
  }

  return (
    <DialogContent>
      <DialogHeader><DialogTitle>Edit Profil Wali — {wali.nama}</DialogTitle></DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label>NIK</Label>
          <Input placeholder="16 digit NIK" {...register('nik')} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Hubungan</Label>
            <Input placeholder="Ayah / Ibu / Wali" {...register('hubungan')} />
          </div>
          <div className="space-y-2">
            <Label>No. Telepon</Label>
            <Input placeholder="08123..." {...register('telepon')} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Pekerjaan</Label>
          <Input {...register('pekerjaan')} />
        </div>
        <div className="space-y-2">
          <Label>Alamat</Label>
          <Input {...register('alamat')} />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
          <Button type="submit" disabled={update.isPending}>{update.isPending ? 'Menyimpan...' : 'Simpan'}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}

function LinkDialog({ wali, onClose }: { wali: WaliProfilItem; onClose: () => void }) {
  const [nik, setNik] = useState('')
  const link = useLinkWaliSantri(wali.user_id)
  const unlink = useUnlinkWaliSantri(wali.user_id)

  async function handleLink() {
    if (!nik.trim()) return
    await link.mutateAsync(nik.trim())
    setNik('')
  }

  return (
    <DialogContent className="max-w-md">
      <DialogHeader><DialogTitle>Kelola Santri — {wali.nama}</DialogTitle></DialogHeader>

      {/* Link by NIK */}
      <div className="space-y-2">
        <Label>Hubungkan Santri via NIK</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Masukkan 16 digit NIK santri"
            value={nik}
            onChange={(e) => setNik(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleLink() } }}
            className="font-mono"
          />
          <Button onClick={handleLink} disabled={!nik.trim() || link.isPending}>
            <Link2 className="h-4 w-4 mr-1" />
            {link.isPending ? '...' : 'Hubungkan'}
          </Button>
        </div>
        {link.isError && (
          <p className="text-xs text-destructive">Santri dengan NIK tersebut tidak ditemukan.</p>
        )}
      </div>

      {/* Current santri list */}
      <div className="space-y-2">
        <Label className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" />
          Santri Terhubung ({wali.santri.length})
        </Label>
        {wali.santri.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">Belum ada santri yang dihubungkan.</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {wali.santri.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                <div>
                  <p className="text-sm font-medium">{s.nama}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {s.nik && <span className="font-mono text-xs text-muted-foreground">NIK: {s.nik}</span>}
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-destructive hover:text-destructive shrink-0"
                  disabled={unlink.isPending}
                  onClick={() => unlink.mutate(s.id)}
                >
                  <Unlink className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Tutup</Button>
      </DialogFooter>
    </DialogContent>
  )
}

export default function AdminWaliPage() {
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<WaliProfilItem | null>(null)
  const [linking, setLinking] = useState<WaliProfilItem | null>(null)
  const { data: waliList = [], isLoading } = useAdminWaliProfil()

  const filtered = waliList.filter(
    (w) =>
      w.nama.toLowerCase().includes(search.toLowerCase()) ||
      w.nik.includes(search) ||
      w.email.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Data Wali</h2>
        <p className="text-muted-foreground">Profil, NIK wali, dan relasi ke santri via kode NIS.</p>
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
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Hubungan</th>
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Telepon</th>
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Santri</th>
                  <th className="h-10 px-4 text-right font-medium text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i} className="border-b">
                        {Array.from({ length: 6 }).map((_, j) => (
                          <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                        ))}
                      </tr>
                    ))
                  : filtered.length === 0
                  ? <tr><td colSpan={6} className="h-24 text-center text-muted-foreground">Tidak ada data wali.</td></tr>
                  : filtered.map((w) => (
                      <tr key={w.id} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-3">
                          <p className="font-medium">{w.nama}</p>
                          <p className="text-xs text-muted-foreground">{w.email}</p>
                        </td>
                        <td className="px-4 py-3">
                          {w.nik
                            ? <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{w.nik}</span>
                            : <Badge variant="secondary">Belum diisi</Badge>}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{w.hubungan || '-'}</td>
                        <td className="px-4 py-3 text-muted-foreground">{w.telepon || '-'}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {w.santri.length === 0
                              ? <span className="text-muted-foreground text-xs">Belum ada</span>
                              : w.santri.map((s) => (
                                  <Badge key={s.id} variant="secondary" className="text-xs font-mono">
                                    {s.nik ?? s.nama}
                                  </Badge>
                                ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1">
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setLinking(w)}
                              title="Kelola relasi santri">
                              <Link2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditing(w)}
                              title="Edit profil">
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!editing} onOpenChange={(v) => { if (!v) setEditing(null) }}>
        {editing && <EditDialog wali={editing} onClose={() => setEditing(null)} />}
      </Dialog>

      <Dialog open={!!linking} onOpenChange={(v) => { if (!v) setLinking(null) }}>
        {linking && <LinkDialog wali={linking} onClose={() => setLinking(null)} />}
      </Dialog>
    </div>
  )
}
