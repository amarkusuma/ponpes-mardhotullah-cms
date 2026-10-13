'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useAuthStore } from '@/lib/auth/auth-store'
import { ROLE_HOME } from '@/lib/auth/roles'
import type { Role } from '@/lib/auth/roles'

export function useAuth() {
  const router = useRouter()
  const { user, isLoading, setUser, clearUser, setLoading, primaryRole, hasRole, hasPermission } =
    useAuthStore()

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true)
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.message ?? 'Login gagal')
        }

        const { user: userData } = data.data ?? {}
        if (userData) setUser({ ...userData, permissions: userData.permissions ?? [] })

        const role = primaryRole() as Role
        const home = ROLE_HOME[role] ?? '/login'
        router.push(home)
        return data
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Login gagal'
        toast.error(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [router, setUser, setLoading, primaryRole]
  )

  const logout = useCallback(async () => {
    setLoading(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      clearUser()
      setLoading(false)
      router.push('/login')
    }
  }, [router, clearUser, setLoading])

  const fetchMe = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/me')
      if (!res.ok) {
        clearUser()
        return null
      }
      const data = await res.json()
      const userData = data.data
      if (userData) setUser(userData)
      return userData
    } catch {
      clearUser()
      return null
    } finally {
      setLoading(false)
    }
  }, [setUser, clearUser, setLoading])

  return { user, isLoading, login, logout, fetchMe, primaryRole, hasRole, hasPermission }
}
