'use client'

import { useState, useCallback } from 'react'
import { Plus, Download, RefreshCw, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DataTable } from '@/components/common/data-table'
import { SPPFilterBar } from '@/components/spp/spp-filter'
import { buildSPPColumns } from '@/components/spp/spp-columns'
import { PayDialog } from '@/components/spp/pay-dialog'
import { DetailDialog } from '@/components/spp/detail-dialog'
import { GenerateDialog } from '@/components/spp/generate-dialog'
import { useSPPList } from '@/hooks/use-spp'
import type { TagihanSPP, SPPFilter } from '@/lib/types/spp'
import apiClient from '@/lib/api/client'

const DEFAULT_FILTER: SPPFilter = {
  search: '',
  status: '',
  bulan: '',
  tahun: '',
}

type DialogMode = null | 'pay' | 'detail' | 'generate'

function exportCSV(filter: SPPFilter) {
  const params = new URLSearchParams()
  if (filter.search) params.set('search', filter.search)
  if (filter.status) params.set('status', filter.status)
  if (filter.bulan) params.set('bulan', String(filter.bulan))
  if (filter.tahun) params.set('tahun', String(filter.tahun))
  params.set('export', 'csv')
  params.set('limit', '10000')
  window.open(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/spp/export?${params}`, '_blank')
}

async function exportExcel(filter: SPPFilter) {
  const params: Record<string, string | number> = { limit: 10000, page: 1 }
  if (filter.search) params.search = filter.search
  if (filter.status) params.status = filter.status
  if (filter.bulan) params.bulan = filter.bulan as number
  if (filter.tahun) params.tahun = filter.tahun as number

  const res = await apiClient.get<{ data: TagihanSPP[] }>('/admin/spp', { params })
  const rows = res.data.data ?? []

  const { utils, writeFile } = await import('xlsx')
  const ws = utils.json_to_sheet(
    rows.map((r) => ({
      'Nama Santri': r.nama_santri,
      NIK: r.nik,
      Kelas: r.kelas_nama,
      Jenis: r.jenis,
      Bulan: r.bulan,
      Tahun: r.tahun,
      Nominal: r.nominal,
      'Total Dibayar': r.total_dibayar,
      Sisa: r.sisa,
      Status: r.status,
    }))
  )
  const wb = utils.book_new()
  utils.book_append_sheet(wb, ws, 'SPP')
  writeFile(wb, `spp-export-${Date.now()}.xlsx`)
}

export default function SPPPage() {
  const [filter, setFilter] = useState<SPPFilter>(DEFAULT_FILTER)
  const [page, setPage] = useState(1)
  const [sortKey, setSortKey] = useState<string>('created_at')
  const [sortDesc, setSortDesc] = useState(true)
  const [dialogMode, setDialogMode] = useState<DialogMode>(null)
  const [selectedTagihan, setSelectedTagihan] = useState<TagihanSPP | null>(null)

  const { data, isLoading, refetch } = useSPPList(
    { ...filter, jenis: 'SPP' },
    page,
    10
  )

  const handlePay = useCallback((tagihan: TagihanSPP) => {
    setSelectedTagihan(tagihan)
    setDialogMode('pay')
  }, [])

  const handleDetail = useCallback((tagihan: TagihanSPP) => {
    setSelectedTagihan(tagihan)
    setDialogMode('detail')
  }, [])

  const handleSort = useCallback((key: string) => {
    setSortDesc((prev) => sortKey === key ? !prev : false)
    setSortKey(key)
  }, [sortKey])

  const handleFilterChange = (f: SPPFilter) => {
    setFilter(f)
    setPage(1)
  }

  const columns = buildSPPColumns(handlePay, handleDetail, handleSort)
  const rows = data?.data ?? []
  const total = data?.pagination?.total ?? 0

  const closeDialog = () => {
    setDialogMode(null)
    setSelectedTagihan(null)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Manajemen SPP</h2>
          <p className="text-muted-foreground">Kelola tagihan dan pembayaran SPP santri.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/spp/rekap">
            <Button variant="outline" size="sm" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Rekap
            </Button>
          </Link>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => exportCSV(filter)}>
            <Download className="h-4 w-4" />
            CSV
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => exportExcel(filter)}>
            <Download className="h-4 w-4" />
            Excel
          </Button>
          <Button size="sm" className="gap-2" onClick={() => setDialogMode('generate')}>
            <Plus className="h-4 w-4" />
            Generate SPP
          </Button>
        </div>
      </div>

      <SPPFilterBar
        filter={filter}
        onChange={handleFilterChange}
        onReset={() => { setFilter(DEFAULT_FILTER); setPage(1) }}
      />

      <DataTable
        columns={columns}
        data={rows}
        loading={isLoading}
        pagination={{ page, limit: 10, total, onPageChange: setPage }}
      />

      {/* Generate SPP */}
      <Dialog open={dialogMode === 'generate'} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Tagihan SPP</DialogTitle>
          </DialogHeader>
          <GenerateDialog onSuccess={closeDialog} onClose={closeDialog} />
        </DialogContent>
      </Dialog>

      {/* Pay */}
      <Dialog open={dialogMode === 'pay' && !!selectedTagihan} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Catat Pembayaran SPP</DialogTitle>
          </DialogHeader>
          {selectedTagihan && (
            <PayDialog tagihan={selectedTagihan} onSuccess={closeDialog} onClose={closeDialog} />
          )}
        </DialogContent>
      </Dialog>

      {/* Detail */}
      <Dialog open={dialogMode === 'detail' && !!selectedTagihan} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detail Tagihan SPP</DialogTitle>
          </DialogHeader>
          {selectedTagihan && <DetailDialog tagihan={selectedTagihan} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
