'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api/client'
import type { CreatePustakaForm, PustakaItem } from '@/lib/types/pustaka'
import type { ApiResponse } from '@/lib/types/spp'

const BASE = '/admin/pusat-informasi'

export const pustakaKeys = {
  all: ['pusat-informasi'] as const,
  lists: () => [...pustakaKeys.all, 'list'] as const,
}

export function usePustakaList(page = 1, limit = 10, status = '', search = '') {
  return useQuery({
    queryKey: [...pustakaKeys.lists(), page, limit, status, search],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<PustakaItem[]>>(BASE, {
        params: { page, limit, status: status || undefined, search: search || undefined },
      })
      return res.data
    },
    placeholderData: (prev) => prev,
  })
}

export function useCreatePustaka() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreatePustakaForm) => {
      const res = await apiClient.post<ApiResponse<PustakaItem>>(BASE, data)
      return res.data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: pustakaKeys.lists() }),
  })
}

export function useUpdatePustaka(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<CreatePustakaForm>) => {
      const res = await apiClient.put<ApiResponse<PustakaItem>>(`${BASE}/${id}`, data)
      return res.data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: pustakaKeys.lists() }),
  })
}

export function useDeletePustaka() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`${BASE}/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: pustakaKeys.lists() }),
  })
}

async function upload(path: string, field: string, file: File) {
  const form = new FormData()
  form.append(field, file)
  const res = await apiClient.post<ApiResponse<{ url: string; size: number }>>(`${BASE}/${path}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return { url: res.data.data?.url ?? '', size: res.data.data?.size ?? file.size }
}

export function useUploadThumbnailPustaka() {
  return useMutation({
    mutationFn: async (file: File) => (await upload('upload-thumbnail', 'gambar', file)).url,
  })
}

export function useUploadFilePustaka() {
  return useMutation({
    mutationFn: (file: File) => upload('upload-file', 'file', file),
  })
}
