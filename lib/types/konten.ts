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

// Website pages whose header (hero) image comes from a banner
export const HALAMAN_BANNER = [
  'home', 'profile', 'gallery', 'faq', 'pendaftaran', 'berita', 'artikel', 'pusat-informasi',
] as const
export type HalamanBanner = (typeof HALAMAN_BANNER)[number]

export const HALAMAN_BANNER_LABELS: Record<HalamanBanner, string> = {
  home: 'Home',
  profile: 'Profile',
  gallery: 'Gallery',
  faq: 'FAQ',
  pendaftaran: 'Pendaftaran',
  berita: 'Kabar & Berita',
  artikel: 'Artikel',
  'pusat-informasi': 'Pusat Informasi',
}

export interface BannerItem {
  id: string
  judul: string
  gambar_url: string
  halaman: HalamanBanner
  urutan: number
  is_active: boolean
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
  halaman: HalamanBanner
  urutan: number
  is_active: boolean
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
