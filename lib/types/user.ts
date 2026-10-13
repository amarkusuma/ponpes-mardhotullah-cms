export interface UserRole {
  id: string
  name: string
}

export interface UserItem {
  id: string
  name: string
  email: string
  avatar?: string
  is_active: boolean
  roles: UserRole[]
}

export interface CreateUserForm {
  name: string
  email: string
  password: string
  role_ids: string[]
}

export interface UpdateUserForm {
  name?: string
  is_active?: boolean
}

export interface DashboardStats {
  total_santri: number
  total_guru: number
  total_wali: number
  total_tagihan_bulan_ini: number
  tagihan_lunas: number
  tagihan_belum_bayar: number
}
