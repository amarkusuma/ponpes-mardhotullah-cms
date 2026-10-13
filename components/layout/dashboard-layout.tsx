import { Sidebar } from './sidebar'
import { Header } from './header'
import type { Role } from '@/lib/auth/roles'

interface DashboardLayoutProps {
  children: React.ReactNode
  role: Role
  title?: string
}

export function DashboardLayout({ children, role, title }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar role={role} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title={title} />
        <main className="flex-1 overflow-y-auto bg-background p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
