'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api/client'
import type { UserItem, CreateUserForm, UpdateUserForm, DashboardStats } from '@/lib/types/user'
import type { ApiResponse } from '@/lib/types/spp'

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (search: string, role: string) => [...userKeys.lists(), { search, role }] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const,
  roles: () => [...userKeys.all, 'roles'] as const,
  dashboard: () => ['dashboard'] as const,
}

export function useDashboardStats() {
  return useQuery({
    queryKey: userKeys.dashboard(),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<DashboardStats>>('/admin/dashboard')
      return res.data.data
    },
  })
}

export function useUsers(search = '', role = '', page = 1, limit = 10) {
  return useQuery({
    queryKey: [...userKeys.list(search, role), page, limit],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<UserItem[]>>('/admin/users', {
        params: { search, role, page, limit },
      })
      return res.data
    },
    placeholderData: (prev) => prev,
  })
}

export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<UserItem>>(`/admin/users/${id}`)
      return res.data.data
    },
    enabled: !!id,
  })
}

export function useRoles() {
  return useQuery({
    queryKey: userKeys.roles(),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<{ id: string; name: string }[]>>('/admin/roles')
      return res.data.data ?? []
    },
  })
}

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateUserForm) => {
      const res = await apiClient.post<ApiResponse<UserItem>>('/admin/users', data)
      return res.data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.lists() }),
  })
}

export function useUpdateUser(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: UpdateUserForm) => {
      const res = await apiClient.put<ApiResponse<UserItem>>(`/admin/users/${id}`, data)
      return res.data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.lists() })
      qc.invalidateQueries({ queryKey: userKeys.detail(id) })
    },
  })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/admin/users/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.lists() }),
  })
}

export function useAssignRoles(userId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (roleIds: string[]) => {
      await apiClient.put(`/admin/users/${userId}/roles`, { role_ids: roleIds })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.lists() })
      qc.invalidateQueries({ queryKey: userKeys.detail(userId) })
    },
  })
}
