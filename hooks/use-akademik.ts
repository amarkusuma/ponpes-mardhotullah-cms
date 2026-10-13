'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api/client'
import type {
  TahunAjaran,
  Kelas,
  MataPelajaran,
  JadwalItem,
  SantriItem,
  PenilaianItem,
  RekapNilaiItem,
  CreateKelasForm,
  CreateMapelForm,
  CreateJadwalForm,
  CreatePenilaianForm,
} from '@/lib/types/akademik'
import type { ApiResponse } from '@/lib/types/spp'

export const akademikKeys = {
  tahunAjaran: () => ['tahun-ajaran'] as const,
  kelas: {
    all: ['kelas'] as const,
    lists: () => [...akademikKeys.kelas.all, 'list'] as const,
    list: (taID?: string) => [...akademikKeys.kelas.lists(), { taID }] as const,
    detail: (id: string) => [...akademikKeys.kelas.all, 'detail', id] as const,
    jadwal: (id: string) => [...akademikKeys.kelas.all, 'jadwal', id] as const,
  },
  mapel: {
    all: ['mapel'] as const,
    lists: () => [...akademikKeys.mapel.all, 'list'] as const,
  },
  guru: {
    jadwal: () => ['guru', 'jadwal'] as const,
    santri: (kelasId: string) => ['guru', 'santri', kelasId] as const,
    rekap: (kelasId: string, mapelId: string) => ['guru', 'rekap', kelasId, mapelId] as const,
  },
  santri: {
    profil: () => ['santri', 'profil'] as const,
    jadwal: (kelasId: string) => ['santri', 'jadwal', kelasId] as const,
    nilai: () => ['santri', 'nilai'] as const,
  },
  wali: {
    profil: () => ['wali', 'profil'] as const,
    nilai: (santriId: string) => ['wali', 'nilai', santriId] as const,
  },
}

// ── TahunAjaran ───────────────────────────────────────────────────────────────

export function useTahunAjaran() {
  return useQuery({
    queryKey: akademikKeys.tahunAjaran(),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<TahunAjaran[]>>('/admin/tahun-ajaran')
      return res.data.data ?? []
    },
  })
}

// ── Kelas ──────────────────────────────────────────────────────────────────────

export function useKelasList(taID?: string, page = 1, limit = 10) {
  return useQuery({
    queryKey: [...akademikKeys.kelas.list(taID), page, limit],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, limit }
      if (taID) params.tahun_ajaran_id = taID
      const res = await apiClient.get<ApiResponse<Kelas[]>>('/admin/kelas', { params })
      return res.data
    },
    placeholderData: (prev) => prev,
  })
}

export function useKelasDetail(id: string) {
  return useQuery({
    queryKey: akademikKeys.kelas.detail(id),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Kelas>>(`/admin/kelas/${id}`)
      return res.data.data
    },
    enabled: !!id,
  })
}

export function useKelasJadwal(kelasId: string) {
  return useQuery({
    queryKey: akademikKeys.kelas.jadwal(kelasId),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<JadwalItem[]>>(`/admin/kelas/${kelasId}/jadwal`)
      return res.data.data ?? []
    },
    enabled: !!kelasId,
  })
}

export function useCreateKelas() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateKelasForm) => {
      const res = await apiClient.post<ApiResponse<Kelas>>('/admin/kelas', data)
      return res.data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: akademikKeys.kelas.lists() }),
  })
}

export function useUpdateKelas(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<CreateKelasForm>) => {
      const res = await apiClient.put<ApiResponse<Kelas>>(`/admin/kelas/${id}`, data)
      return res.data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: akademikKeys.kelas.lists() }),
  })
}

export function useDeleteKelas() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/admin/kelas/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: akademikKeys.kelas.lists() }),
  })
}

// ── MataPelajaran ──────────────────────────────────────────────────────────────

export function useMapelList(page = 1, limit = 10) {
  return useQuery({
    queryKey: [...akademikKeys.mapel.lists(), page, limit],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<MataPelajaran[]>>('/admin/mata-pelajaran', {
        params: { page, limit },
      })
      return res.data
    },
    placeholderData: (prev) => prev,
  })
}

export function useMapelAll() {
  return useQuery({
    queryKey: [...akademikKeys.mapel.lists(), 'all'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<MataPelajaran[]>>('/admin/mata-pelajaran', {
        params: { limit: 200 },
      })
      return res.data.data ?? []
    },
  })
}

export function useCreateMapel() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateMapelForm) => {
      const res = await apiClient.post<ApiResponse<MataPelajaran>>('/admin/mata-pelajaran', data)
      return res.data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: akademikKeys.mapel.lists() }),
  })
}

export function useDeleteMapel() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/admin/mata-pelajaran/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: akademikKeys.mapel.lists() }),
  })
}

// ── Jadwal ─────────────────────────────────────────────────────────────────────

export function useCreateJadwal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateJadwalForm) => {
      const res = await apiClient.post<ApiResponse<JadwalItem>>('/admin/jadwal', data)
      return res.data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: akademikKeys.kelas.all }),
  })
}

export function useDeleteJadwal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/admin/jadwal/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: akademikKeys.kelas.all }),
  })
}

// ── Guru ───────────────────────────────────────────────────────────────────────

export function useGuruJadwal() {
  return useQuery({
    queryKey: akademikKeys.guru.jadwal(),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<JadwalItem[]>>('/guru/jadwal-mengajar')
      return res.data.data ?? []
    },
  })
}

export function useGuruSantri(kelasId: string) {
  return useQuery({
    queryKey: akademikKeys.guru.santri(kelasId),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<SantriItem[]>>(`/guru/daftar-santri/${kelasId}`)
      return res.data.data ?? []
    },
    enabled: !!kelasId,
  })
}

export function useGuruRekapNilai(kelasId: string, mapelId: string) {
  return useQuery({
    queryKey: akademikKeys.guru.rekap(kelasId, mapelId),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<RekapNilaiItem[]>>(
        `/guru/rekap-nilai/${kelasId}/${mapelId}`
      )
      return res.data.data ?? []
    },
    enabled: !!kelasId && !!mapelId,
  })
}

export function useCreatePenilaian() {
  return useMutation({
    mutationFn: async (data: CreatePenilaianForm) => {
      const res = await apiClient.post<ApiResponse<PenilaianItem>>('/guru/penilaian', data)
      return res.data.data
    },
  })
}

export function useUpdatePenilaian(id: string) {
  return useMutation({
    mutationFn: async (data: { nilai: number; semester?: number }) => {
      const res = await apiClient.put<ApiResponse<PenilaianItem>>(`/guru/penilaian/${id}`, data)
      return res.data.data
    },
  })
}

// ── Santri ─────────────────────────────────────────────────────────────────────

export function useSantriProfil() {
  return useQuery({
    queryKey: akademikKeys.santri.profil(),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<SantriItem>>('/santri/profil')
      return res.data.data
    },
  })
}

export function useSantriJadwal(kelasId: string) {
  return useQuery({
    queryKey: akademikKeys.santri.jadwal(kelasId),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<JadwalItem[]>>('/santri/jadwal-pelajaran', {
        params: { kelas_id: kelasId },
      })
      return res.data.data ?? []
    },
    enabled: !!kelasId,
  })
}

export function useSantriNilai() {
  return useQuery({
    queryKey: akademikKeys.santri.nilai(),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<PenilaianItem[]>>('/santri/nilai')
      return res.data.data ?? []
    },
  })
}

// ── Wali ───────────────────────────────────────────────────────────────────────

export function useWaliProfil() {
  return useQuery({
    queryKey: akademikKeys.wali.profil(),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<SantriItem[]>>('/wali/profil-anak')
      return res.data.data ?? []
    },
  })
}

export function useWaliNilai(santriId: string) {
  return useQuery({
    queryKey: akademikKeys.wali.nilai(santriId),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<PenilaianItem[]>>(`/wali/nilai-anak/${santriId}`)
      return res.data.data ?? []
    },
    enabled: !!santriId,
  })
}

// ── Admin Profil: Guru / Santri / Wali ────────────────────────────────────────

export interface GuruProfilItem {
  id: string
  user_id: string
  nik: string
  nama: string
  email: string
  spesialisasi: string
  foto?: string
}

export interface SantriProfilItem {
  id: string
  user_id: string
  nik: string
  nama: string
  email: string
  tempat_lahir: string
  tanggal_lahir: string
  alamat: string
  status: string
  foto?: string
}

export interface WaliProfilItem {
  id: string
  user_id: string
  nik: string
  nama: string
  email: string
  hubungan: string
  telepon: string
  pekerjaan: string
  alamat: string
  santri: SantriProfilItem[]
}

export function useAdminGuruProfil() {
  return useQuery({
    queryKey: ['admin', 'profil', 'guru'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<GuruProfilItem[]>>('/admin/guru')
      return res.data.data ?? []
    },
  })
}

export function useAdminSantriProfil() {
  return useQuery({
    queryKey: ['admin', 'profil', 'santri'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<SantriProfilItem[]>>('/admin/santri')
      return res.data.data ?? []
    },
  })
}

export function useAdminWaliProfil() {
  return useQuery({
    queryKey: ['admin', 'profil', 'wali'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<WaliProfilItem[]>>('/admin/wali')
      return res.data.data ?? []
    },
  })
}

export function useUpdateGuruProfil(userID: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: { nik?: string; spesialisasi?: string }) => {
      const res = await apiClient.put<ApiResponse<GuruProfilItem>>(`/admin/guru/${userID}`, data)
      return res.data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'profil', 'guru'] }),
  })
}

export function useUpdateSantriProfil(userID: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: { nik?: string; tempat_lahir?: string; alamat?: string }) => {
      const res = await apiClient.put<ApiResponse<SantriProfilItem>>(`/admin/santri/${userID}`, data)
      return res.data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'profil', 'santri'] }),
  })
}

export function useUpdateWaliProfil(userID: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: { nik?: string; hubungan?: string; telepon?: string; pekerjaan?: string; alamat?: string }) => {
      const res = await apiClient.put<ApiResponse<WaliProfilItem>>(`/admin/wali/${userID}`, data)
      return res.data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'profil', 'wali'] }),
  })
}

export function useLinkWaliSantri(waliUserID: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (nik: string) => {
      await apiClient.post(`/admin/wali/${waliUserID}/link-santri`, { nik })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'profil', 'wali'] }),
  })
}

export function useUnlinkWaliSantri(waliUserID: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (santriID: string) => {
      await apiClient.delete(`/admin/wali/${waliUserID}/santri/${santriID}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'profil', 'wali'] }),
  })
}
