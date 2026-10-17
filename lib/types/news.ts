import type { StatusArtikel } from './konten'

export type StatusNews = StatusArtikel

export const KATEGORI_NEWS = ['kegiatan', 'prestasi', 'pengumuman', 'agenda', 'lainnya'] as const
export type KategoriNews = (typeof KATEGORI_NEWS)[number]

export const KATEGORI_NEWS_LABELS: Record<KategoriNews, string> = {
  kegiatan: 'Kegiatan',
  prestasi: 'Prestasi',
  pengumuman: 'Pengumuman',
  agenda: 'Agenda',
  lainnya: 'Lainnya',
}

export const STATUS_NEWS = ['draft', 'archived', 'published'] as const

export const STATUS_NEWS_LABELS: Record<StatusNews, string> = {
  draft: 'Draf',
  archived: 'Arsipkan',
  published: 'Publikasikan',
}

export interface NewsItem {
  id: string
  judul: string
  slug: string
  kategori: KategoriNews
  thumbnail?: string
  konten?: string
  status: StatusNews
  penulis: string
  created_at: string
  updated_at: string
}

export interface CreateNewsForm {
  judul: string
  slug: string
  kategori: KategoriNews
  thumbnail?: string
  konten: string
  status: StatusNews
}
