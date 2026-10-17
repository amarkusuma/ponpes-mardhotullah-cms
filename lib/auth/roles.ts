import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  ClipboardList,
  CreditCard,
  Newspaper,
  Megaphone,
  Library,
  Image,
  Images,
  UserCircle,
  FileText,
  Banknote,
  type LucideIcon,
} from 'lucide-react'

export type Role = 'admin' | 'guru' | 'santri' | 'wali'

export const ROLES = {
  ADMIN: 'admin',
  GURU: 'guru',
  SANTRI: 'santri',
  WALI: 'wali',
} as const

export const ROLE_HOME: Record<Role, string> = {
  admin: '/admin/dashboard',
  guru: '/guru/dashboard',
  santri: '/santri/dashboard',
  wali: '/wali/dashboard',
}

export interface MenuItem {
  label: string
  href: string
  icon: LucideIcon
  children?: MenuItem[]
}

export const ROLE_MENUS: Record<Role, MenuItem[]> = {
  admin: [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Pengguna', href: '/admin/pengguna', icon: Users },
    { label: 'Guru', href: '/admin/guru', icon: GraduationCap },
    { label: 'Santri', href: '/admin/santri', icon: UserCircle },
    { label: 'Wali', href: '/admin/wali', icon: Users },
    { label: 'Kelas', href: '/admin/kelas', icon: BookOpen },
    { label: 'Mata Pelajaran', href: '/admin/mata-pelajaran', icon: BookOpen },
    { label: 'Jadwal', href: '/admin/jadwal', icon: Calendar },
    { label: 'Penilaian', href: '/admin/penilaian', icon: ClipboardList },
    { label: 'Keuangan', href: '/admin/keuangan', icon: CreditCard },
    { label: 'SPP', href: '/admin/spp', icon: Banknote },
    { label: 'Artikel', href: '/admin/artikel', icon: Newspaper },
    { label: 'Kabar & Berita', href: '/admin/news', icon: Megaphone },
    { label: 'Pusat Informasi', href: '/admin/pusat-informasi', icon: Library },
    { label: 'Banner', href: '/admin/banner', icon: Image },
    { label: 'Galeri', href: '/admin/galeri', icon: Images },
  ],
  guru: [
    { label: 'Dashboard', href: '/guru/dashboard', icon: LayoutDashboard },
    { label: 'Jadwal Mengajar', href: '/guru/jadwal', icon: Calendar },
    { label: 'Penilaian', href: '/guru/penilaian', icon: ClipboardList },
    { label: 'Rekap Nilai', href: '/guru/rekap-nilai', icon: FileText },
    { label: 'Profil Saya', href: '/guru/profil', icon: UserCircle },
  ],
  santri: [
    { label: 'Dashboard', href: '/santri/dashboard', icon: LayoutDashboard },
    { label: 'Jadwal Pelajaran', href: '/santri/jadwal', icon: Calendar },
    { label: 'Nilai Saya', href: '/santri/nilai', icon: ClipboardList },
    { label: 'Tagihan', href: '/santri/tagihan', icon: CreditCard },
    { label: 'Profil Saya', href: '/santri/profil', icon: UserCircle },
  ],
  wali: [
    { label: 'Dashboard', href: '/wali/dashboard', icon: LayoutDashboard },
    { label: 'Data Santri', href: '/wali/santri', icon: UserCircle },
    { label: 'Nilai Santri', href: '/wali/nilai', icon: ClipboardList },
    { label: 'Tagihan', href: '/wali/tagihan', icon: CreditCard },
    { label: 'Profil Saya', href: '/wali/profil', icon: UserCircle },
  ],
}
