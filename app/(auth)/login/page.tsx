'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const { login, isLoading } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.email, data.password)
    } catch {
      // error handled inside useAuth
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel: Logo ── */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-white relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-green-50" />
        <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-green-50" />

        {/* Logo emblem */}
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="relative w-64 h-64">
            {/* Outer ring */}
            <img src="/images/logo-marhotullah.png" alt="" />
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-green-800">Marhotullah</h1>
            <p className="text-sm text-green-600 mt-1">Pondok Pesantren Mardhotullah Al Islamy</p>
            <p className="text-xs text-gray-400 mt-1">Wonosari, Gunungkidul, Yogyakarta</p>
          </div>
        </div>
      </div>

      {/* ── Right Panel: Form ── */}
      <div className="flex-1 flex items-center justify-center bg-white relative overflow-hidden px-8 py-12">
        {/* Decorative circle top-right */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-green-100/60 pointer-events-none" />
        {/* Decorative circle bottom-left */}
        <div className="absolute -bottom-16 -left-16 w-52 h-52 rounded-full bg-green-100/40 pointer-events-none" />

        <div className="relative z-10 w-full max-w-md">
          {/* Title */}
          <div className="mb-8">
            <h2 className="text-3xl text-gray-700">
              Marhotullah <span className="font-extrabold text-gray-900">AKADEMIK</span>
            </h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-800">
                Email / No Telepone
              </label>
              <input
                type="email"
                placeholder="Masukkan Email"
                autoComplete="email"
                className="w-full h-11 rounded-lg border border-gray-300 bg-white px-4 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100 placeholder:text-gray-400"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-800">Password</label>
              <input
                type="password"
                placeholder="Masukkan Password"
                autoComplete="current-password"
                className="w-full h-11 rounded-lg border border-gray-300 bg-white px-4 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100 placeholder:text-gray-400"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password.message}</p>
              )}
              <button
                type="button"
                className="text-xs text-green-700 hover:underline mt-0.5"
              >
                Lupa Password
              </button>
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-lg bg-green-700 text-white font-semibold text-sm hover:bg-green-800 transition disabled:opacity-60 flex items-center justify-center gap-2 shadow-md"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Login
            </button>

            {/* Sign up link */}
            <p className="text-center text-sm text-gray-500">
              Belum Punya Akun ?{' '}
              <span className="font-bold text-gray-800 cursor-pointer hover:underline">
                Sign up
              </span>
            </p>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-300" />
              <span className="text-sm text-gray-400">Or</span>
              <div className="flex-1 h-px bg-gray-300" />
            </div>

            {/* Google button */}
            <button
              type="button"
              className="w-full h-11 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-3 shadow-sm"
            >
              {/* Google G icon */}
              <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107"/>
                <path d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00"/>
                <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50"/>
                <path d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2"/>
              </svg>
              Login With Google
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
