import { DashboardLayout } from '@/components/layout/dashboard-layout'

export default function WaliLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout role="wali">{children}</DashboardLayout>
}
