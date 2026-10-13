'use client'

import { Bell, Settings, LogOut, User, ChevronRight, Sun, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/use-auth'
import { useAuthStore } from '@/lib/auth/auth-store'

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export function Header({ title }: { title?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const { user, logout } = useAuth()
  const primaryRole = useAuthStore((s) => s.primaryRole())

  const pageTitle = title ?? 'Dashboard'

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-4 lg:px-6 shrink-0">
      {/* Left: title + breadcrumb */}
      <div className="lg:hidden w-10" />
      <div className="hidden lg:block">
        <h1 className="text-xl font-bold text-gray-900 leading-tight">{pageTitle}</h1>
        <div className="flex items-center gap-1 text-xs text-green-700 mt-0.5">
          <span>Dashboard</span>
          <ChevronRight className="h-3 w-3" />
          <span>View</span>
        </div>
      </div>

      {/* Right: actions + user */}
      <div className="flex items-center gap-1 ml-auto">
        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full text-gray-500 hover:text-gray-700"
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle theme"
        >
          {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* Notification bell */}
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full text-gray-500 hover:text-gray-700">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-green-600 ring-2 ring-white" />
        </Button>

        {/* Settings */}
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-gray-500 hover:text-gray-700">
          <Settings className="h-4 w-4" />
        </Button>

        {/* User info + avatar */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 hover:bg-gray-100 transition ml-1">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900 leading-tight">{user?.name ?? '-'}</p>
                <p className="text-xs text-green-700 leading-tight capitalize">{primaryRole ?? ''}</p>
              </div>
              <Avatar className="h-9 w-9 ring-2 ring-green-200">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="bg-green-100 text-green-800 text-xs font-bold">
                  {user ? getInitials(user.name) : '?'}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profil Saya
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => logout()}>
              <LogOut className="mr-2 h-4 w-4" />
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
