'use client'

import { useEffect, useState } from 'react'
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Users, Package, Bike, Printer, TrendingUp } from 'lucide-react'
import { StorageOrder, RunnerOrder, PrintingOrder } from '@/types'
import { formatRM, statusLabel } from '@/lib/utils'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

interface Stats {
  users: number
  storage: number
  runner: number
  printing: number
  revenue: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({ users: 0, storage: 0, runner: 0, printing: 0, revenue: 0 })
  const [recentStorage, setRecentStorage] = useState<StorageOrder[]>([])
  const [recentRunner, setRecentRunner] = useState<RunnerOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [usersSnap, storageSnap, runnerSnap, printingSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(query(collection(db, 'storage_orders'), orderBy('createdAt', 'desc'), limit(5))),
        getDocs(query(collection(db, 'runner_orders'), orderBy('createdAt', 'desc'), limit(5))),
        getDocs(collection(db, 'printing_orders')),
      ])

      const storageOrders = storageSnap.docs.map((d) => ({ id: d.id, ...d.data() } as StorageOrder))
      const runnerOrders = runnerSnap.docs.map((d) => ({ id: d.id, ...d.data() } as RunnerOrder))
      const printingOrders = printingSnap.docs.map((d) => ({ id: d.id, ...d.data() } as PrintingOrder))

      const storageRevenue = storageOrders.reduce((s, o) => s + (o.totalPrice ?? 0), 0)
      const printRevenue = printingOrders.reduce((s, o) => s + (o.totalPrice ?? 0), 0)
      const runnerRevenue = runnerOrders.reduce((s, o) => s + (o.estimatedFee ?? 0), 0)

      setStats({
        users: usersSnap.size,
        storage: storageOrders.length,
        runner: runnerOrders.length,
        printing: printingOrders.length,
        revenue: storageRevenue + printRevenue + runnerRevenue,
      })
      setRecentStorage(storageOrders.slice(0, 4))
      setRecentRunner(runnerOrders.slice(0, 4))
      setLoading(false)
    }
    load()
  }, [])

  const STAT_CARDS = [
    { label: 'Total Students', value: stats.users, icon: Users, color: 'bg-blue-50 text-blue-500' },
    { label: 'Storage Orders', value: stats.storage, icon: Package, color: 'bg-secondary text-primary' },
    { label: 'Runner Orders', value: stats.runner, icon: Bike, color: 'bg-green-50 text-success' },
    { label: 'Print Jobs', value: stats.printing, icon: Printer, color: 'bg-amber-50 text-warning' },
    { label: 'Est. Revenue', value: formatRM(stats.revenue), icon: TrendingUp, color: 'bg-purple-50 text-primary', wide: true },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ label, value, icon: Icon, color, wide }) => (
          <Card key={label} className={wide ? 'md:col-span-2' : ''}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} mb-3`}>
              <Icon size={20} />
            </div>
            <p className="text-xs text-text-secondary">{label}</p>
            <p className="text-2xl font-semibold font-poppins text-text-primary mt-1">{value}</p>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Storage */}
        <div>
          <h2 className="font-semibold font-poppins text-text-primary mb-3">Recent Storage Orders</h2>
          <div className="flex flex-col gap-2">
            {recentStorage.length === 0 ? (
              <Card><p className="text-text-secondary text-sm text-center py-4">No storage orders yet</p></Card>
            ) : (
              recentStorage.map((o) => (
                <Card key={o.id} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-text-primary truncate">{o.userName}</p>
                    <p className="text-xs text-text-secondary">{o.size} × {o.quantity} — {o.category}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <Badge status={o.status} />
                    <p className="text-xs font-semibold text-primary mt-1">{formatRM(o.totalPrice)}</p>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Recent Runner */}
        <div>
          <h2 className="font-semibold font-poppins text-text-primary mb-3">Recent Runner Orders</h2>
          <div className="flex flex-col gap-2">
            {recentRunner.length === 0 ? (
              <Card><p className="text-text-secondary text-sm text-center py-4">No runner orders yet</p></Card>
            ) : (
              recentRunner.map((o) => (
                <Card key={o.id} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-text-primary truncate">{o.userName}</p>
                    <p className="text-xs text-text-secondary capitalize">{o.type} — {o.pickupLocation}</p>
                  </div>
                  <Badge status={o.status} />
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
