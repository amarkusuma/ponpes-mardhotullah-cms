'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { TagihanSPP, StatusTagihan } from '@/lib/types/spp'

const BULAN_NAMES = [
  '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

function StatusBadge({ status }: { status: StatusTagihan }) {
  if (status === 'lunas')
    return <Badge variant="success">Lunas</Badge>
  if (status === 'sebagian')
    return <Badge variant="warning">Cicilan</Badge>
  return <Badge variant="destructive">Belum Bayar</Badge>
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)
}

interface ActionCellProps {
  tagihan: TagihanSPP
  onPay: (tagihan: TagihanSPP) => void
  onDetail: (tagihan: TagihanSPP) => void
}

function ActionCell({ tagihan, onPay, onDetail }: ActionCellProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onDetail(tagihan)}>Detail</DropdownMenuItem>
        {tagihan.status !== 'lunas' && (
          <DropdownMenuItem onClick={() => onPay(tagihan)}>Bayar</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function buildSPPColumns(
  onPay: (tagihan: TagihanSPP) => void,
  onDetail: (tagihan: TagihanSPP) => void,
  onSort: (key: string) => void
): ColumnDef<TagihanSPP>[] {
  return [
    {
      accessorKey: 'nama_santri',
      header: ({ column: _col }) => (
        <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => onSort('nama_santri')}>
          Nama Santri
          <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
        </Button>
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.nama_santri}</p>
          {row.original.nik && <p className="text-xs text-muted-foreground font-mono">{row.original.nik}</p>}
        </div>
      ),
    },
    {
      accessorKey: 'kelas_nama',
      header: 'Kelas',
      cell: ({ row }) => <span className="text-sm">{row.original.kelas_nama || '-'}</span>,
    },
    {
      accessorKey: 'bulan',
      header: ({ column: _col }) => (
        <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => onSort('bulan')}>
          Bulan
          <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
        </Button>
      ),
      cell: ({ row }) => (
        <span>{BULAN_NAMES[row.original.bulan]} {row.original.tahun}</span>
      ),
    },
    {
      accessorKey: 'nominal',
      header: () => <span className="text-right block">Tagihan</span>,
      cell: ({ row }) => (
        <span className="text-right block font-mono text-sm">
          {formatRupiah(row.original.nominal)}
        </span>
      ),
    },
    {
      accessorKey: 'total_dibayar',
      header: () => <span className="text-right block">Dibayar</span>,
      cell: ({ row }) => (
        <span className="text-right block font-mono text-sm text-green-600 dark:text-green-400">
          {formatRupiah(row.original.total_dibayar)}
        </span>
      ),
    },
    {
      accessorKey: 'sisa',
      header: () => <span className="text-right block">Sisa</span>,
      cell: ({ row }) => (
        <span className={`text-right block font-mono text-sm ${row.original.sisa > 0 ? 'text-destructive' : ''}`}>
          {formatRupiah(row.original.sisa)}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <ActionCell tagihan={row.original} onPay={onPay} onDetail={onDetail} />
      ),
    },
  ]
}
