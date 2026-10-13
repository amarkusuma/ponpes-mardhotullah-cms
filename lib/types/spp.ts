// Status and method enums
export type StatusTagihan = 'belum_bayar' | 'sebagian' | 'lunas'
export type MetodePembayaran = 'tunai' | 'transfer' | 'qris'

export interface TagihanSPP {
  id: string
  santri_id: string
  nama_santri: string
  nik: string
  kelas_nama: string
  jenis: string
  nominal: number
  bulan: number
  tahun: number
  status: StatusTagihan
  total_dibayar: number
  sisa: number
  created_at: string
}

export interface Pembayaran {
  id: string
  tagihan_id: string
  jumlah_bayar: number
  metode: MetodePembayaran
  tanggal_bayar: string
  keterangan?: string
  created_at: string
}

export interface TagihanDetail extends TagihanSPP {
  pembayaran: Pembayaran[]
}

export interface GenerateResult {
  generated: number
  skipped: number
  total: number
}

export interface RekapBulanan {
  bulan: number
  tahun: number
  total_tagihan: number
  total_masuk: number
  jumlah_tagihan: number
  jumlah_lunas: number
  jumlah_belum: number
  jumlah_cicilan: number
}

export interface UnpaidItem {
  tagihan_id: string
  santri_id: string
  nama_santri: string
  nik: string
  kelas_nama: string
  bulan: number
  tahun: number
  nominal: number
  sisa: number
  status: string
}

export interface SPPFilter {
  search?: string
  status?: StatusTagihan | ''
  bulan?: number | ''
  tahun?: number | ''
  kelas_id?: string
  jenis?: string
}

export interface GenerateSPPForm {
  bulan: number
  tahun: number
  nominal: number
  jenis: string
}

export interface BayarTagihanForm {
  jumlah_bayar: number
  metode: MetodePembayaran
  tanggal_bayar: string
  keterangan?: string
}

// API envelope types
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  pagination?: {
    page: number
    limit: number
    total: number
    total_pages: number
  }
}
