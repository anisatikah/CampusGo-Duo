'use client'

import { useRouter } from 'next/navigation'
import { User, Phone, Building2, LogOut, ChevronRight, Shield, Archive, Bike, Printer } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useAllOrders } from '@/hooks/useOrders'
import TopBar from '@/components/layout/TopBar'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function ProfilePage() {
  const { profile, logOut } = useAuth()
  const { storageOrders, runnerOrders, printingOrders } = useAllOrders()
  const router = useRouter()

  const handleLogout = async () => {
    await logOut()
    router.replace('/login')
  }

  const STATS = [
    { label: 'Storage', value: storageOrders.length, icon: Archive, color: 'text-primary' },
    { label: 'Runner', value: runnerOrders.length, icon: Bike, color: 'text-success' },
    { label: 'Printing', value: printingOrders.length, icon: Printer, color: 'text-blue-500' },
  ]

  return (
    <div>
      <TopBar title="Profile" />

      <div className="px-4 py-4 flex flex-col gap-5 pb-8">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="w-20 h-20 gradient-primary rounded-3xl flex items-center justify-center">
            <span className="text-white text-3xl font-semibold font-poppins">
              {profile?.name?.[0] ?? 'U'}
            </span>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold font-poppins text-text-primary">{profile?.name}</h2>
            <p className="text-sm text-text-secondary">{profile?.email}</p>
            {profile?.role === 'admin' && (
              <span className="inline-flex items-center gap-1 bg-primary text-white text-xs font-semibold px-2.5 py-0.5 rounded-full mt-2">
                <Shield size={10} /> Admin
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {STATS.map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="flex flex-col items-center py-4 gap-1">
              <Icon size={20} className={color} />
              <span className="text-xl font-semibold font-poppins text-text-primary">{value}</span>
              <span className="text-xs text-text-secondary">{label}</span>
            </Card>
          ))}
        </div>

        {/* Info */}
        <Card className="flex flex-col gap-4">
          <h3 className="font-semibold text-text-primary font-poppins">Account Info</h3>
          {[
            { icon: User, label: 'Full Name', value: profile?.name },
            { icon: Phone, label: 'Phone', value: profile?.phone || '—' },
            { icon: Building2, label: 'College / Block', value: profile?.college || '—' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-9 h-9 bg-secondary rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-text-secondary">{label}</p>
                <p className="text-sm font-medium text-text-primary">{value}</p>
              </div>
            </div>
          ))}
        </Card>

        {/* Menu */}
        <Card className="flex flex-col divide-y divide-purple-50">
          {[
            { label: 'My Orders', href: '/orders' },
            { label: 'Order History', href: '/orders' },
            ...(profile?.role === 'admin' ? [{ label: 'Admin Dashboard', href: '/admin' }] : []),
          ].map(({ label, href }) => (
            <button
              key={label}
              onClick={() => router.push(href)}
              className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0"
            >
              <span className="text-sm font-medium text-text-primary">{label}</span>
              <ChevronRight size={16} className="text-text-secondary" />
            </button>
          ))}
        </Card>

        <Button variant="danger" fullWidth onClick={handleLogout} className="mt-2">
          <LogOut size={16} />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
