'use client'

import { User, MapPin, Calendar, IdCard } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useWaliProfil } from '@/hooks/use-akademik'

export default function WaliSantriPage() {
  const { data: anakList = [], isLoading } = useWaliProfil()

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Data Santri</h2>
        <p className="text-muted-foreground">Profil putra-putri Anda.</p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      ) : anakList.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground text-sm">
            Belum ada data santri yang terhubung.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {anakList.map((s) => (
            <Card key={s.id}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-base">{s.nama}</p>
                    <Badge variant={s.status === 'aktif' ? 'success' : 'secondary'} className="mt-1">
                      {s.status}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-3">
                  {s.nik && (
                    <div className="flex items-center gap-3 text-sm">
                      <IdCard className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div>
                        <span className="text-muted-foreground">NIK: </span>
                        <span className="font-mono font-medium">{s.nik}</span>
                      </div>
                    </div>
                  )}
                  {s.tempat_lahir && (
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span>{s.tempat_lahir}</span>
                    </div>
                  )}
                  {s.tanggal_lahir && (
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span>
                        {new Date(s.tanggal_lahir).toLocaleDateString('id-ID', {
                          day: '2-digit', month: 'long', year: 'numeric',
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
