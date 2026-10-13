'use client'

import { useState } from 'react'
import { Plus, Search, Trash2, Shield } from 'lucide-react'
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
import {
  useUsers, useRoles, useCreateUser, useDeleteUser, useAssignRoles
} from '@/hooks/use-users'

const createSchema = z.object({
  name: z.string().min(2, 'Min 2 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Min 8 karakter'),
  role_ids: z.array(z.string()).min(1, 'Pilih minimal 1 role'),
})
type CreateForm = z.infer<typeof createSchema>

const ROLE_COLORS: Record<string, string> = {
  admin: 'default',
  guru: 'secondary',
  santri: 'outline',
  wali: 'warning',
}

export default function PenggunaPage() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [page, setPage] = useState(1)
  const [showCreate, setShowCreate] = useState(false)
  const [assignUser, setAssignUser] = useState<{ id: string; name: string } | null>(null)
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])

  const { data, isLoading } = useUsers(search, roleFilter, page)
  const { data: roles = [] } = useRoles()
  const createMutation = useCreateUser()
  const deleteMutation = useDeleteUser()
  const assignMutation = useAssignRoles(assignUser?.id ?? '')

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { name: '', email: '', password: '', role_ids: [] },
  })
  const watchedRoles = watch('role_ids')

  const users = data?.data ?? []
  const total = data?.pagination?.total ?? 0
  const totalPages = data?.pagination?.total_pages ?? 1

  const onCreateSubmit = async (form: CreateForm) => {
    try {
      await createMutation.mutateAsync(form)
      toast.success('Pengguna berhasil dibuat')
      setShowCreate(false)
      reset()
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Gagal membuat pengguna'
      toast.error(msg)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus pengguna "${name}"?`)) return
    try {
      await deleteMutation.mutateAsync(id)
      toast.success('Pengguna dihapus')
    } catch {
      toast.error('Gagal menghapus pengguna')
    }
  }

  const handleAssign = async () => {
    if (!assignUser) return
    try {
      await assignMutation.mutateAsync(selectedRoles)
      toast.success('Role berhasil diperbarui')
      setAssignUser(null)
    } catch {
      toast.error('Gagal memperbarui role')
    }
  }

  const toggleRole = (id: string, current: string[]) => {
    const next = current.includes(id) ? current.filter((r) => r !== id) : [...current, id]
    setValue('role_ids', next)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Manajemen Pengguna</h2>
          <p className="text-muted-foreground">Kelola akun dan role pengguna sistem.</p>
        </div>
        <Button size="sm" className="gap-2" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" />
          Tambah Pengguna
        </Button>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48 max-w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama / email..."
            className="pl-8"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <select
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }}
        >
          <option value="">Semua Role</option>
          {roles.map((r) => <option key={r.id} value={r.name}>{r.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Nama</th>
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Email</th>
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Role</th>
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Status</th>
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Aksi</th>
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
                  : users.length === 0
                  ? (
                    <tr>
                      <td colSpan={5} className="h-24 text-center text-muted-foreground">
                        Tidak ada data.
                      </td>
                    </tr>
                  )
                  : users.map((u) => (
                    <tr key={u.id} className="border-b hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">{u.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {u.roles.map((r) => (
                            <Badge key={r.id} variant={(ROLE_COLORS[r.name] as 'default' | 'secondary' | 'outline' | 'warning') || 'outline'}>
                              {r.name}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={u.is_active ? 'success' : 'destructive'}>
                          {u.is_active ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Atur Role"
                            onClick={() => { setAssignUser({ id: u.id, name: u.name }); setSelectedRoles(u.roles.map((r) => r.id)) }}
                          >
                            <Shield className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(u.id, u.name)}
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
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <p className="text-sm text-muted-foreground">
                Halaman {page} dari {totalPages} ({total} pengguna)
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  Sebelumnya
                </Button>
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                  Selanjutnya
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={(o) => !o && setShowCreate(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Pengguna Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onCreateSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nama Lengkap</Label>
              <Input {...register('name')} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" {...register('email')} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Password</Label>
              <Input type="password" {...register('password')} />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <div className="flex flex-wrap gap-2">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => toggleRole(r.id, watchedRoles)}
                    className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                      watchedRoles.includes(r.id)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-input hover:bg-muted'
                    }`}
                  >
                    {r.name}
                  </button>
                ))}
              </div>
              {errors.role_ids && <p className="text-xs text-destructive">{errors.role_ids.message}</p>}
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>
                Batal
              </Button>
              <Button type="submit" className="flex-1" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Role Dialog */}
      <Dialog open={!!assignUser} onOpenChange={(o) => !o && setAssignUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atur Role — {assignUser?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {roles.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() =>
                    setSelectedRoles((prev) =>
                      prev.includes(r.id) ? prev.filter((x) => x !== r.id) : [...prev, r.id]
                    )
                  }
                  className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                    selectedRoles.includes(r.id)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-input hover:bg-muted'
                  }`}
                >
                  {r.name}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setAssignUser(null)}>
                Batal
              </Button>
              <Button className="flex-1" disabled={assignMutation.isPending} onClick={handleAssign}>
                Simpan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
