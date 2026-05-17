'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import {
  LayoutDashboard, Users, ShoppingBag, BarChart3,
  Menu, X, LogOut, Package
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/users', icon: Users, label: 'Students' },
  { href: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
  { href: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, logOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!loading) {
      if (!user) { router.replace('/login'); return }
      if (profile && profile.role !== 'admin') router.replace('/dashboard')
    }
  }, [user, profile, loading, router])

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (profile.role !== 'admin') return null

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-64 bg-white border-r border-purple-50 z-40 transition-transform duration-300 flex flex-col',
          'md:translate-x-0 md:static md:flex',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="p-6 border-b border-purple-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center">
              <Package size={18} className="text-white" />
            </div>
            <div>
              <p className="font-semibold font-poppins text-text-primary">CampusGo</p>
              <p className="text-xs text-text-secondary">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-1">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  active
                    ? 'bg-primary text-white'
                    : 'text-text-secondary hover:bg-secondary hover:text-primary',
                )}
              >
                <Icon size={18} />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-purple-50">
          <button
            onClick={async () => { await logOut(); router.replace('/login') }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 w-full transition-all"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="bg-white border-b border-purple-50 px-4 md:px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-secondary text-primary"
          >
            <Menu size={18} />
          </button>
          <h1 className="font-semibold font-poppins text-text-primary">
            {NAV.find((n) => n.href === pathname)?.label ?? 'Admin'}
          </h1>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-8 h-8 gradient-primary rounded-xl flex items-center justify-center text-white text-sm font-semibold">
              {profile.name[0]}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
