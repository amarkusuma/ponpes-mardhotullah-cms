'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api/client'
import type { ArtikelItem, BannerItem, CreateArtikelForm, CreateBannerForm, GaleriItem, CreateGaleriForm } from '@/lib/types/konten'
import type { ApiResponse } from '@/lib/types/spp'

export const kontenKeys = {
  artikel: {
    all: ['artikel'] as const,
    lists: () => [...kontenKeys.artikel.all, 'list'] as const,
    detail: (id: string) => [...kontenKeys.artikel.all, 'detail', id] as const,
  },
  banner: {
    all: ['banner'] as const,
    list: () => [...kontenKeys.banner.all, 'list'] as const,
  },
  galeri: {
    all: ['galeri'] as const,
    lists: () => [...kontenKeys.galeri.all, 'list'] as const,
  },
}

// ── Artikel ───────────────────────────────────────────────────────────────────

export function useArtikelList(page = 1, limit = 10, status = '') {
  return useQuery({
    queryKey: [...kontenKeys.artikel.lists(), page, limit, status],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<ArtikelItem[]>>('/admin/artikel', {
        params: { page, limit, status: status || undefined },
      })
      return res.data
    },
    placeholderData: (prev) => prev,
  })
}

export function useArtikelDetail(id: string) {
  return useQuery({
    queryKey: kontenKeys.artikel.detail(id),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<ArtikelItem>>(`/admin/artikel/${id}`)
      return res.data.data
    },
    enabled: !!id,
  })
}

export function useCreateArtikel() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateArtikelForm) => {
      const res = await apiClient.post<ApiResponse<ArtikelItem>>('/admin/artikel', data)
      return res.data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: kontenKeys.artikel.lists() }),
  })
}

export function useUpdateArtikel(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<CreateArtikelForm>) => {
      const res = await apiClient.put<ApiResponse<ArtikelItem>>(`/admin/artikel/${id}`, data)
      return res.data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: kontenKeys.artikel.lists() })
      qc.invalidateQueries({ queryKey: kontenKeys.artikel.detail(id) })
    },
  })
}

export function useUploadThumbnailArtikel() {
  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData()
      form.append('gambar', file)
      const res = await apiClient.post<ApiResponse<{ url: string }>>('/admin/artikel/upload-thumbnail', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return res.data.data?.url ?? ''
    },
  })
}

export function useDeleteArtikel() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/admin/artikel/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: kontenKeys.artikel.lists() }),
  })
}

// ── Banner ────────────────────────────────────────────────────────────────────

export function useBannerList() {
  return useQuery({
    queryKey: kontenKeys.banner.list(),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<BannerItem[]>>('/admin/banner')
      return res.data.data ?? []
    },
  })
}

export function useCreateBanner() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateBannerForm) => {
      const res = await apiClient.post<ApiResponse<BannerItem>>('/admin/banner', data)
      return res.data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: kontenKeys.banner.list() }),
  })
}

export function useUpdateBanner(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<CreateBannerForm>) => {
      const res = await apiClient.put<ApiResponse<BannerItem>>(`/admin/banner/${id}`, data)
      return res.data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: kontenKeys.banner.list() }),
  })
}

export function useUploadGambarBanner() {
  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData()
      form.append('gambar', file)
      const res = await apiClient.post<ApiResponse<{ url: string }>>('/admin/banner/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return res.data.data?.url ?? ''
    },
  })
}

export function useDeleteBanner() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/admin/banner/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: kontenKeys.banner.list() }),
  })
}

// ── Galeri ────────────────────────────────────────────────────────────────────

export function useGaleriList(page = 1, limit = 12, kategori = '') {
  return useQuery({
    queryKey: [...kontenKeys.galeri.lists(), page, limit, kategori],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<GaleriItem[]>>('/admin/galeri', {
        params: { page, limit, kategori: kategori || undefined },
      })
      return res.data
    },
    placeholderData: (prev) => prev,
  })
}

export function useUploadGambarGaleri() {
  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData()
      form.append('gambar', file)
      const res = await apiClient.post<ApiResponse<{ url: string }>>('/admin/galeri/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return res.data.data?.url ?? ''
    },
  })
}

export function useCreateGaleri() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateGaleriForm) => {
      const res = await apiClient.post<ApiResponse<GaleriItem>>('/admin/galeri', data)
      return res.data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: kontenKeys.galeri.lists() }),
  })
}

export function useUpdateGaleri(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<CreateGaleriForm>) => {
      const res = await apiClient.put<ApiResponse<GaleriItem>>(`/admin/galeri/${id}`, data)
      return res.data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: kontenKeys.galeri.lists() }),
  })
}

export function useDeleteGaleri() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/admin/galeri/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: kontenKeys.galeri.lists() }),
  })
}
