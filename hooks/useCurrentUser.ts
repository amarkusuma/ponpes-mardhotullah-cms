'use client'

import { useQuery } from '@tanstack/react-query'
import api from '../lib/axios'

interface CurrentUser {
  id: number
  name: string
  email: string
  role: string
}

export function useCurrentUser() {
  return useQuery<CurrentUser>(['currentUser'], async () => {
    const response = await api.get('/profile')
    return response.data
  })
}
