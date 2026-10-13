'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api/client'
import type {
  TagihanSPP,
  TagihanDetail,
  Pembayaran,
  GenerateResult,
  RekapBulanan,
  UnpaidItem,
  SPPFilter,
  BayarTagihanForm,
  GenerateSPPForm,
  ApiResponse,
} from '@/lib/types/spp'

// Query keys factory
export const sppKeys = {
  all: ['spp'] as const,
  lists: () => [...sppKeys.all, 'list'] as const,
  list: (filter: SPPFilter, page: number, limit: number) =>
    [...sppKeys.lists(), { filter, page, limit }] as const,
  details: () => [...sppKeys.all, 'detail'] as const,
  detail: (id: string) => [...sppKeys.details(), id] as const,
  payments: (id: string) => [...sppKeys.all, 'payments', id] as const,
  rekap: (tahun: number, jenis: string) =>
    [...sppKeys.all, 'rekap', tahun, jenis] as const,
  unpaid: (bulan: number, tahun: number, jenis: string) =>
    [...sppKeys.all, 'unpaid', bulan, tahun, jenis] as const,
}

// Build query params from filter
function buildParams(filter: SPPFilter, page: number, limit: number) {
  const params: Record<string, string | number> = { page, limit }
  if (filter.search) params.search = filter.search
  if (filter.status) params.status = filter.status
  if (filter.bulan) params.bulan = filter.bulan
  if (filter.tahun) params.tahun = filter.tahun
  if (filter.kelas_id) params.kelas_id = filter.kelas_id
  if (filter.jenis) params.jenis = filter.jenis
  return params
}

// List tagihan SPP
export function useSPPList(filter: SPPFilter, page: number, limit = 10) {
  return useQuery({
    queryKey: sppKeys.list(filter, page, limit),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<TagihanSPP[]>>('/admin/spp', {
        params: buildParams(filter, page, limit),
      })
      return res.data
    },
    placeholderData: (prev) => prev,
  })
}

// Detail tagihan
export function useSPPDetail(id: string) {
  return useQuery({
    queryKey: sppKeys.detail(id),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<TagihanDetail>>(`/admin/spp/${id}`)
      return res.data.data
    },
    enabled: !!id,
  })
}

// Payments for a tagihan
export function useSPPPayments(tagihanId: string) {
  return useQuery({
    queryKey: sppKeys.payments(tagihanId),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Pembayaran[]>>(
        `/admin/spp/${tagihanId}/payments`
      )
      return res.data.data
    },
    enabled: !!tagihanId,
  })
}

// Rekap bulanan
export function useSPPRekap(tahun: number, jenis = 'SPP') {
  return useQuery({
    queryKey: sppKeys.rekap(tahun, jenis),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<RekapBulanan[]>>('/admin/spp/rekap', {
        params: { tahun, jenis },
      })
      return res.data.data ?? []
    },
  })
}

// Unpaid list
export function useSPPUnpaid(bulan: number, tahun: number, jenis = 'SPP') {
  return useQuery({
    queryKey: sppKeys.unpaid(bulan, tahun, jenis),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<UnpaidItem[]>>('/admin/spp/unpaid', {
        params: { bulan, tahun, jenis },
      })
      return res.data.data ?? []
    },
    enabled: bulan > 0 && tahun > 0,
  })
}

// Generate SPP mutation
export function useGenerateSPP() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: GenerateSPPForm) => {
      const res = await apiClient.post<ApiResponse<GenerateResult>>(
        '/admin/spp/generate',
        data
      )
      return res.data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sppKeys.lists() })
    },
  })
}

// Pay tagihan mutation
export function usePaySPP(tagihanId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: BayarTagihanForm) => {
      const res = await apiClient.post<ApiResponse<Pembayaran>>(
        `/admin/spp/${tagihanId}/pay`,
        data
      )
      return res.data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sppKeys.lists() })
      qc.invalidateQueries({ queryKey: sppKeys.detail(tagihanId) })
      qc.invalidateQueries({ queryKey: sppKeys.payments(tagihanId) })
    },
  })
}
