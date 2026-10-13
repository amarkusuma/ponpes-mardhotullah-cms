'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import type { MenuItem, Role } from '@/lib/auth/roles'
import { ROLE_MENUS } from '@/lib/auth/roles'

interface SidebarProps {
  role: Role
  className?: string
}

function NavItem({ item, active }: { item: MenuItem; active: boolean }) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
        active
          ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-sm'
          : 'text-white/80 hover:bg-white/10 hover:text-white'
      )}
    >
      <span className={cn(
        'flex h-8 w-8 items-center justify-center rounded-lg shrink-0',
        active ? 'bg-white/20' : 'bg-white/10'
      )}>
        <Icon className="h-4 w-4" />
      </span>
      <span>{item.label}</span>
    </Link>
  )
}

function SidebarContent({ role }: { role: Role }) {
  const pathname = usePathname()
  const menus = ROLE_MENUS[role] ?? []

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-4 border-b border-white/10">
        {/* School emblem icon */}
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-500 shadow-md shrink-0">
          <img src="/images/logo-marhotullah.png" alt="" />
        </div>
        <div>
          <p className="text-base font-bold leading-none tracking-wide">Akademik</p>
          <p className="text-[10px] text-white/50 mt-0.5 leading-none">Marhotullah</p>
        </div>
      </div>

      {/* Nav */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {menus.map((item) => (
            <NavItem key={item.href} item={item} active={pathname.startsWith(item.href)} />
          ))}
        </nav>
      </ScrollArea>

      <div className="px-4 pb-4 pt-2 border-t border-white/10">
        <p className="text-[10px] text-white/30 text-center">Marhotullah v1.0</p>
      </div>
    </div>
  )
}

export function Sidebar({ role, className }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={cn('hidden lg:flex w-60 flex-col shrink-0', className)}>
        <SidebarContent role={role} />
      </aside>

      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-3.5 z-50 lg:hidden"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-60 transform transition-transform duration-200 lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="absolute right-3 top-3.5 z-10">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
            <X className="h-5 w-5 text-white" />
          </Button>
        </div>
        <SidebarContent role={role} />
      </aside>
    </>
  )
}
