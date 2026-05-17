'use client'

import Link from 'next/link'
import { Package, Bike, Printer, PackageCheck, Archive, Clock, CheckCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useAllOrders } from '@/hooks/useOrders'
import TopBar from '@/components/layout/TopBar'
import StatCard from '@/components/dashboard/StatCard'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { formatRM } from '@/lib/utils'

const QUICK_ACTIONS = [
  { href: '/services/storage', icon: Package, label: 'Storage', color: 'bg-purple-100 text-primary' },
  { href: '/services/runner', icon: Bike, label: 'Runner', color: 'bg-green-100 text-success' },
  { href: '/services/printing', icon: Printer, label: 'Printing', color: 'bg-blue-100 text-blue-600' },
  { href: '/services', icon: PackageCheck, label: 'Parcel', color: 'bg-amber-100 text-warning' },
]

export default function DashboardPage() {
  const { profile } = useAuth()
  const { storageOrders, runnerOrders, printingOrders, loading } = useAllOrders()

  const firstName = profile?.name?.split(' ')[0] ?? 'Student'

  const activeStorage = storageOrders.filter((o) => !['completed', 'cancelled'].includes(o.status))
  const activeRunner = runnerOrders.filter((o) => !['delivered', 'cancelled'].includes(o.status))
  const activePrinting = printingOrders.filter((o) => !['completed', 'cancelled'].includes(o.status))
  const totalActive = activeStorage.length + activeRunner.length + activePrinting.length

  const recentOrders = [
    ...storageOrders.slice(0, 2).map((o) => ({ ...o, type: 'Storage' })),
    ...runnerOrders.slice(0, 2).map((o) => ({ ...o, type: 'Runner' })),
    ...printingOrders.slice(0, 2).map((o) => ({ ...o, type: 'Printing' })),
  ]
    .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1))
    .slice(0, 4)

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="gradient-primary px-4 pt-12 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-white/70 text-sm font-inter">Good day,</p>
            <h1 className="text-white text-2xl font-semibold font-poppins">{firstName} 👋</h1>
          </div>
          <Link href="/profile">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white font-semibold text-lg">
              {firstName[0]}
            </div>
          </Link>
        </div>

        {/* Active orders pill */}
        <div className="bg-white/15 backdrop-blur rounded-2xl px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
            <Clock size={16} className="text-white" />
          </div>
          <div>
            <p className="text-white font-semibold font-poppins">{totalActive} Active Orders</p>
            <p className="text-white/70 text-xs">Tap Orders to track them</p>
          </div>
          <Link href="/orders" className="ml-auto bg-white text-primary text-xs font-semibold px-3 py-1.5 rounded-xl">
            View
          </Link>
        </div>
      </div>

      <div className="px-4 -mt-2 flex flex-col gap-6 pb-4">
        {/* Quick Actions */}
        <div>
          <h2 className="text-sm font-semibold text-text-secondary mb-3 font-poppins uppercase tracking-wide">Quick Actions</h2>
          <div className="grid grid-cols-4 gap-3">
            {QUICK_ACTIONS.map(({ href, icon: Icon, label, color }) => (
              <Link key={href} href={href}>
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color} shadow-sm`}>
                    <Icon size={24} />
                  </div>
                  <span className="text-xs font-medium text-text-primary text-center">{label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div>
          <h2 className="text-sm font-semibold text-text-secondary mb-3 font-poppins uppercase tracking-wide">Summary</h2>
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              title="Storage Orders"
              value={storageOrders.length}
              subtitle={`${activeStorage.length} active`}
              icon={<Archive size={20} />}
              color="purple"
            />
            <StatCard
              title="Runner Orders"
              value={runnerOrders.length}
              subtitle={`${activeRunner.length} active`}
              icon={<Bike size={20} />}
              color="green"
            />
            <StatCard
              title="Print Jobs"
              value={printingOrders.length}
              subtitle={`${activePrinting.length} active`}
              icon={<Printer size={20} />}
              color="blue"
            />
            <StatCard
              title="Completed"
              value={
                storageOrders.filter((o) => o.status === 'completed').length +
                runnerOrders.filter((o) => o.status === 'delivered').length +
                printingOrders.filter((o) => o.status === 'completed').length
              }
              subtitle="All time"
              icon={<CheckCircle size={20} />}
              color="green"
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-text-secondary font-poppins uppercase tracking-wide">Recent Activity</h2>
            <Link href="/orders" className="text-xs text-primary font-semibold">See all</Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : recentOrders.length === 0 ? (
            <Card className="text-center py-8">
              <p className="text-text-secondary text-sm">No orders yet. Book a service!</p>
              <Link href="/services" className="text-primary text-sm font-semibold mt-2 inline-block">Browse Services →</Link>
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {recentOrders.map((order) => (
                <Card key={order.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center flex-shrink-0">
                    {order.type === 'Storage' && <Archive size={18} className="text-primary" />}
                    {order.type === 'Runner' && <Bike size={18} className="text-success" />}
                    {order.type === 'Printing' && <Printer size={18} className="text-blue-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-text-primary truncate">{order.type} Service</p>
                    <p className="text-xs text-text-secondary">{order.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <Badge status={order.status} />
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* WhatsApp CTA */}
        <a
          href={`https://wa.me/${process.env.NEXT_PUBLIC_ADMIN_WHATSAPP ?? '601XXXXXXXXX'}?text=Hi%20CampusGo%2C%20I%20need%20help!`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-2xl px-4 py-3"
        >
          <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-green-600">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.558 4.121 1.527 5.845L.057 23.882l6.187-1.623A11.934 11.934 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.643-.52-5.15-1.42l-.37-.217-3.672.963.981-3.584-.24-.381A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-sm text-green-800">Need help?</p>
            <p className="text-xs text-green-600">Chat with us on WhatsApp</p>
          </div>
        </a>
      </div>
    </div>
  )
}
