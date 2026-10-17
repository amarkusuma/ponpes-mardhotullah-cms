import type { StatusArtikel } from './konten'

export type StatusPustaka = StatusArtikel

export const STATUS_PUSTAKA = ['draft', 'archived', 'published'] as const

// Labels in the form select describe the action
export const STATUS_PUSTAKA_LABELS: Record<StatusPustaka, string> = {
  draft: 'Draf',
  archived: 'Arsipkan',
  published: 'Publikasikan',
}

// Pusat Informasi: a PDF document in the digital library
export interface PustakaItem {
  id: string
  judul: string
  slug: string
  kategori: string
  thumbnail?: string
  status: StatusPustaka
  file_url: string
  file_size: number
  created_at: string
  updated_at: string
}

export interface CreatePustakaForm {
  judul: string
  slug: string
  kategori: string
  thumbnail: string
  file_url: string
  file_size: number
  status: StatusPustaka
}
