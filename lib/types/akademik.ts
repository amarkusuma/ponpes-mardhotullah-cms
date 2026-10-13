export interface TahunAjaran {
  id: string
  tahun_mulai: number
  tahun_selesai: number
  is_active: boolean
}

export interface Kelas {
  id: string
  nama_kelas: string
  tingkat: number
  tahun_ajaran_id: string
  tahun_ajaran?: TahunAjaran
  wali_kelas_id?: string
}

export interface MataPelajaran {
  id: string
  nama: string
  kode: string
  deskripsi?: string
}

export interface JadwalItem {
  id: string
  hari: string
  jam_mulai: string
  jam_selesai: string
  nama_mapel: string
  nama_guru: string
  nama_kelas: string
  kelas_id: string
}

export interface SantriItem {
  id: string
  nik?: string
  nama: string
  email?: string
  tempat_lahir: string
  tanggal_lahir: string
  alamat?: string
  status: 'aktif' | 'alumni' | 'dropout' | 'keluar'
  foto?: string
}

export interface PenilaianItem {
  id: string
  nama_santri: string
  nik: string
  nama_mapel: string
  jenis_penilaian: string
  nilai: number
  semester: number
  tahun_ajaran: string
}

export interface RekapNilaiItem {
  nama_santri: string
  nik: string
  nilai: Array<{ jenis: string; nilai: number }>
  rata_rata: number
}

export interface CreateKelasForm {
  nama_kelas: string
  tingkat: number
  tahun_ajaran_id: string
  wali_kelas_id?: string
}

export interface CreateMapelForm {
  nama: string
  kode: string
  deskripsi?: string
}

export interface CreateJadwalForm {
  kelas_id: string
  mapel_id: string
  guru_id: string
  hari: string
  jam_mulai: string
  jam_selesai: string
}

export interface CreatePenilaianForm {
  santri_id: string
  mapel_id: string
  kelas_id: string
  jenis_penilaian_id: string
  tahun_ajaran_id: string
  nilai: number
  semester: number
}
