'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Role } from './roles'

export interface AuthUser {
  id: string
  name: string
  email: string
  avatar?: string
  roles: string[]
  permissions: string[]
}

interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  setUser: (user: AuthUser | null) => void
  clearUser: () => void
  setLoading: (loading: boolean) => void
  primaryRole: () => Role | null
  hasRole: (role: string) => boolean
  hasPermission: (permission: string) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,

      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
      setLoading: (isLoading) => set({ isLoading }),

      primaryRole: () => {
        const { user } = get()
        if (!user?.roles?.length) return null
        const priority: Role[] = ['admin', 'guru', 'santri', 'wali']
        return priority.find((r) => user.roles.includes(r)) ?? (user.roles[0] as Role)
      },

      hasRole: (role) => {
        return get().user?.roles.includes(role) ?? false
      },

      hasPermission: (permission) => {
        return get().user?.permissions.includes(permission) ?? false
      },
    }),
    {
      name: 'simpeg-auth',
      partialize: (state) => ({ user: state.user }),
    }
  )
)
