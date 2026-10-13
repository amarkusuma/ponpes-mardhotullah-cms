import { DashboardLayout } from '@/components/layout/dashboard-layout'

export default function SantriLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout role="santri">{children}</DashboardLayout>
}
