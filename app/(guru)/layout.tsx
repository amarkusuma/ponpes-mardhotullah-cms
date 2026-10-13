import { DashboardLayout } from '@/components/layout/dashboard-layout'

export default function GuruLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout role="guru">{children}</DashboardLayout>
}
