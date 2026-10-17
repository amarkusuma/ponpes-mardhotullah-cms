'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api/client'
import type { CreateNewsForm, NewsItem } from '@/lib/types/news'
import type { ApiResponse } from '@/lib/types/spp'

export const newsKeys = {
  all: ['news'] as const,
  lists: () => [...newsKeys.all, 'list'] as const,
  detail: (id: string) => [...newsKeys.all, 'detail', id] as const,
}

export function useNewsList(page = 1, limit = 10, status = '', kategori = '') {
  return useQuery({
    queryKey: [...newsKeys.lists(), page, limit, status, kategori],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<NewsItem[]>>('/admin/news', {
        params: { page, limit, status: status || undefined, kategori: kategori || undefined },
      })
      return res.data
    },
    placeholderData: (prev) => prev,
  })
}

// The list omits `konten`, so the edit form loads the full item separately
export function useNewsDetail(id: string) {
  return useQuery({
    queryKey: newsKeys.detail(id),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<NewsItem>>(`/admin/news/${id}`)
      return res.data.data
    },
    enabled: !!id,
  })
}

export function useCreateNews() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateNewsForm) => {
      const res = await apiClient.post<ApiResponse<NewsItem>>('/admin/news', data)
      return res.data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: newsKeys.lists() }),
  })
}

export function useUpdateNews(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<CreateNewsForm>) => {
      const res = await apiClient.put<ApiResponse<NewsItem>>(`/admin/news/${id}`, data)
      return res.data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: newsKeys.lists() })
      qc.invalidateQueries({ queryKey: newsKeys.detail(id) })
    },
  })
}

export function useDeleteNews() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/admin/news/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: newsKeys.lists() }),
  })
}

export function useUploadThumbnailNews() {
  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData()
      form.append('gambar', file)
      const res = await apiClient.post<ApiResponse<{ url: string }>>('/admin/news/upload-thumbnail', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return res.data.data?.url ?? ''
    },
  })
}
