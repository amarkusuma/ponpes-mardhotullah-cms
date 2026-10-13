'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-react'
import type { SPPFilter } from '@/lib/types/spp'

const BULAN_OPTIONS = [
  { value: 1, label: 'Januari' }, { value: 2, label: 'Februari' },
  { value: 3, label: 'Maret' }, { value: 4, label: 'April' },
  { value: 5, label: 'Mei' }, { value: 6, label: 'Juni' },
  { value: 7, label: 'Juli' }, { value: 8, label: 'Agustus' },
  { value: 9, label: 'September' }, { value: 10, label: 'Oktober' },
  { value: 11, label: 'November' }, { value: 12, label: 'Desember' },
]

const TAHUN_OPTIONS = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i)

interface SPPFilterProps {
  filter: SPPFilter
  onChange: (f: SPPFilter) => void
  onReset: () => void
}

export function SPPFilterBar({ filter, onChange, onReset }: SPPFilterProps) {
  const hasActiveFilter =
    !!filter.search || !!filter.status || !!filter.bulan || !!filter.tahun || !!filter.kelas_id

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-48 max-w-64">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari nama santri..."
          className="pl-8"
          value={filter.search ?? ''}
          onChange={(e) => onChange({ ...filter, search: e.target.value })}
        />
      </div>

      {/* Status */}
      <select
        className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
        value={filter.status ?? ''}
        onChange={(e) => onChange({ ...filter, status: e.target.value as SPPFilter['status'] })}
      >
        <option value="">Semua Status</option>
        <option value="belum_bayar">Belum Bayar</option>
        <option value="sebagian">Cicilan</option>
        <option value="lunas">Lunas</option>
      </select>

      {/* Bulan */}
      <select
        className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
        value={filter.bulan ?? ''}
        onChange={(e) => onChange({ ...filter, bulan: e.target.value ? Number(e.target.value) : '' })}
      >
        <option value="">Semua Bulan</option>
        {BULAN_OPTIONS.map((b) => (
          <option key={b.value} value={b.value}>{b.label}</option>
        ))}
      </select>

      {/* Tahun */}
      <select
        className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
        value={filter.tahun ?? ''}
        onChange={(e) => onChange({ ...filter, tahun: e.target.value ? Number(e.target.value) : '' })}
      >
        <option value="">Semua Tahun</option>
        {TAHUN_OPTIONS.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>

      {/* Reset */}
      {hasActiveFilter && (
        <Button variant="ghost" size="sm" onClick={onReset} className="gap-1.5">
          <X className="h-3.5 w-3.5" />
          Reset
        </Button>
      )}
    </div>
  )
}
