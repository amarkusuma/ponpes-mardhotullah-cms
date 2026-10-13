'use client'

import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useSPPRekap } from '@/hooks/use-spp'
import {
  IncomeBarChart,
  PaymentStatusPieChart,
  StatusStackedChart,
} from '@/components/spp/spp-rekap-chart'

function formatRupiah(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)
}

export default function SPPRekapPage() {
  const currentYear = new Date().getFullYear()
  const [tahun, setTahun] = useState(currentYear)
  const TAHUN_OPTIONS = Array.from({ length: 5 }, (_, i) => currentYear - i)

  const { data = [], isLoading } = useSPPRekap(tahun)

  const totalTagihan = data.reduce((s, d) => s + d.total_tagihan, 0)
  const totalMasuk = data.reduce((s, d) => s + d.total_masuk, 0)
  const totalLunas = data.reduce((s, d) => s + Number(d.jumlah_lunas), 0)
  const totalBelum = data.reduce((s, d) => s + Number(d.jumlah_belum), 0)
  const totalCicilan = data.reduce((s, d) => s + Number(d.jumlah_cicilan), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link href="/admin/spp">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Rekap Keuangan SPP</h2>
            <p className="text-muted-foreground">Laporan pendapatan dan status pembayaran.</p>
          </div>
        </div>

        <select
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
          value={tahun}
          onChange={(e) => setTahun(Number(e.target.value))}
        >
          {TAHUN_OPTIONS.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: 'Total Tagihan', value: formatRupiah(totalTagihan), cls: '' },
          { label: 'Terkumpul', value: formatRupiah(totalMasuk), cls: 'text-green-600 dark:text-green-400' },
          { label: 'Lunas', value: `${totalLunas} santri`, cls: 'text-green-600 dark:text-green-400' },
          { label: 'Cicilan', value: `${totalCicilan} santri`, cls: 'text-orange-500' },
          { label: 'Belum Bayar', value: `${totalBelum} santri`, cls: 'text-destructive' },
        ].map(({ label, value, cls }) => (
          <Card key={label}>
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-7 w-24" />
              ) : (
                <p className={`text-lg font-bold ${cls}`}>{value}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Income bar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Pendapatan Per Bulan ({tahun})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : data.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-muted-foreground text-sm">
                Belum ada data untuk tahun {tahun}
              </div>
            ) : (
              <IncomeBarChart data={data} />
            )}
          </CardContent>
        </Card>

        {/* Pie */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Status Pembayaran</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-56 w-full" />
            ) : (
              <PaymentStatusPieChart data={data} />
            )}
          </CardContent>
        </Card>

        {/* Stacked bar */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Jumlah Santri Per Status Per Bulan ({tahun})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : data.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-muted-foreground text-sm">
                Belum ada data
              </div>
            ) : (
              <StatusStackedChart data={data} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
