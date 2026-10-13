'use client'

import { User, Calendar, MapPin, IdCard } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useSantriProfil } from '@/hooks/use-akademik'

export default function SantriProfilPage() {
  const { data: profil, isLoading } = useSantriProfil()

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Profil Saya</h2>
        <p className="text-muted-foreground">Data diri dan informasi santri.</p>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : !profil ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground text-sm">
            Data profil tidak tersedia.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Avatar area */}
          <Card className="lg:col-span-1">
            <CardContent className="pt-8 flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-12 w-12 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold">{profil.nama}</p>
                {profil.nik && <p className="text-sm text-muted-foreground font-mono">NIK: {profil.nik}</p>}
              </div>
              <Badge variant={profil.status === 'aktif' ? 'success' : 'secondary'} className="text-sm">
                {profil.status}
              </Badge>
            </CardContent>
          </Card>

          {/* Detail info */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Informasi Pribadi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profil.nik && (
                <div className="flex items-center gap-3">
                  <IdCard className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">NIK</p>
                    <p className="text-sm font-medium font-mono">{profil.nik}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Tempat Lahir</p>
                  <p className="text-sm font-medium">{profil.tempat_lahir || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Tanggal Lahir</p>
                  <p className="text-sm font-medium">
                    {profil.tanggal_lahir
                      ? new Date(profil.tanggal_lahir).toLocaleDateString('id-ID', {
                          day: '2-digit', month: 'long', year: 'numeric',
                        })
                      : '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
