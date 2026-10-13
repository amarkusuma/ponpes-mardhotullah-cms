'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api/client'
import type { ApiResponse } from '@/lib/types/spp'

export interface TagihanAdminItem {
  id: string
  santri_id: string
  nama_santri: string
  nik: string
  jenis: string
  nominal: number
  bulan: number
  tahun: number
  status: 'belum_bayar' | 'sebagian' | 'lunas'
  total_dibayar: number
  sisa: number
  created_at: string
}

export interface CreateTagihanForm {
  santri_id: string
  jenis: string
  nominal: number
  bulan: number
  tahun: number
}

export interface CreatePembayaranForm {
  tagihan_id: string
  jumlah_bayar: number
  tanggal_bayar: string
  metode: 'tunai' | 'transfer' | 'qris'
  keterangan?: string
}

interface PaginatedTagihan {
  data: TagihanAdminItem[]
  meta: { page: number; limit: number; total: number; total_pages: number }
}

export const keuanganKeys = {
  all: ['keuangan'] as const,
  lists: () => [...keuanganKeys.all, 'list'] as const,
  list: (params: object) => [...keuanganKeys.lists(), params] as const,
}

export function useAdminTagihan(params: {
  page?: number
  limit?: number
  status?: string
  santri_id?: string
  bulan?: number
  tahun?: number
} = {}) {
  return useQuery({
    queryKey: keuanganKeys.list(params),
    queryFn: async () => {
      const res = await apiClient.get<{ success: boolean; data: TagihanAdminItem[]; meta: PaginatedTagihan['meta'] }>(
        '/admin/tagihan',
        { params: { page: 1, limit: 20, ...params } },
      )
      return { data: res.data.data ?? [], meta: res.data.meta }
    },
    placeholderData: (prev) => prev,
  })
}

export function useCreateTagihan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateTagihanForm) => {
      const res = await apiClient.post<ApiResponse<TagihanAdminItem>>('/admin/tagihan', data)
      return res.data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: keuanganKeys.lists() }),
  })
}

export function useCreatePembayaran() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreatePembayaranForm) => {
      const res = await apiClient.post('/admin/pembayaran', data)
      return res.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: keuanganKeys.lists() }),
  })
}
