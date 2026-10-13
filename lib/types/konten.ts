export type StatusArtikel = 'draft' | 'published' | 'archived'

export interface ArtikelItem {
  id: string
  judul: string
  slug: string
  konten?: string
  kategori: string
  thumbnail?: string
  status: StatusArtikel
  penulis: string
  created_at: string
}

export interface BannerItem {
  id: string
  judul: string
  gambar_url: string
  link?: string
  urutan: number
  is_active: boolean
  tanggal_mulai: string
  tanggal_selesai: string
}

export interface CreateArtikelForm {
  judul: string
  slug: string
  konten: string
  kategori?: string
  thumbnail?: string
  status: StatusArtikel
}

export interface CreateBannerForm {
  judul: string
  gambar_url: string
  link?: string
  urutan: number
  is_active: boolean
  tanggal_mulai: string
  tanggal_selesai: string
}

export interface GaleriItem {
  id: string
  judul: string
  deskripsi?: string
  gambar_url: string
  kategori?: string
  urutan: number
  is_published: boolean
  created_at: string
}

export interface CreateGaleriForm {
  judul: string
  deskripsi?: string
  gambar_url: string
  kategori?: string
  urutan?: number
  is_published?: boolean
}
