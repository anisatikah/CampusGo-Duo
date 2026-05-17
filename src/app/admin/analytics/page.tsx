'use client'

import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { StorageOrder, RunnerOrder, PrintingOrder } from '@/types'
import { formatRM } from '@/lib/utils'
import Card from '@/components/ui/Card'
import { TrendingUp, Package, Bike, Printer, DollarSign } from 'lucide-react'

interface Analytics {
  totalRevenue: number
  storageRevenue: number
  runnerRevenue: number
  printRevenue: number
  totalOrders: number
  completedOrders: number
  pendingOrders: number
  storageBySize: Record<string, number>
  runnerByType: Record<string, number>
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [sSnap, rSnap, pSnap] = await Promise.all([
        getDocs(collection(db, 'storage_orders')),
        getDocs(collection(db, 'runner_orders')),
        getDocs(collection(db, 'printing_orders')),
      ])

      const storage = sSnap.docs.map((d) => d.data() as StorageOrder)
      const runner = rSnap.docs.map((d) => d.data() as RunnerOrder)
      const printing = pSnap.docs.map((d) => d.data() as PrintingOrder)

      const storageRevenue = storage.reduce((s, o) => s + (o.totalPrice ?? 0), 0)
      const runnerRevenue = runner.reduce((s, o) => s + (o.estimatedFee ?? 0), 0)
      const printRevenue = printing.reduce((s, o) => s + (o.totalPrice ?? 0), 0)

      const allOrders = storage.length + runner.length + printing.length
      const completed =
        storage.filter((o) => o.status === 'completed').length +
        runner.filter((o) => o.status === 'delivered').length +
        printing.filter((o) => o.status === 'completed').length
      const pending =
        storage.filter((o) => o.status === 'pending').length +
        runner.filter((o) => o.status === 'pending').length +
        printing.filter((o) => o.status === 'pending').length

      const storageBySize: Record<string, number> = {}
      storage.forEach((o) => { storageBySize[o.size] = (storageBySize[o.size] ?? 0) + 1 })

      const runnerByType: Record<string, number> = {}
      runner.forEach((o) => { runnerByType[o.type] = (runnerByType[o.type] ?? 0) + 1 })

      setAnalytics({
        totalRevenue: storageRevenue + runnerRevenue + printRevenue,
        storageRevenue,
        runnerRevenue,
        printRevenue,
        totalOrders: allOrders,
        completedOrders: completed,
        pendingOrders: pending,
        storageBySize,
        runnerByType,
      })
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!analytics) return null

  const completionRate = analytics.totalOrders > 0
    ? Math.round((analytics.completedOrders / analytics.totalOrders) * 100)
    : 0

  return (
    <div className="flex flex-col gap-6">
      {/* Revenue cards */}
      <div>
        <h2 className="font-semibold font-poppins text-text-primary mb-3">Revenue Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Revenue', value: formatRM(analytics.totalRevenue), icon: DollarSign, color: 'bg-secondary text-primary', wide: true },
            { label: 'Storage', value: formatRM(analytics.storageRevenue), icon: Package, color: 'bg-purple-50 text-primary' },
            { label: 'Runner', value: formatRM(analytics.runnerRevenue), icon: Bike, color: 'bg-green-50 text-success' },
            { label: 'Printing', value: formatRM(analytics.printRevenue), icon: Printer, color: 'bg-blue-50 text-blue-500' },
          ].map(({ label, value, icon: Icon, color, wide }) => (
            <Card key={label} className={wide ? 'md:col-span-2' : ''}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} mb-3`}>
                <Icon size={20} />
              </div>
              <p className="text-xs text-text-secondary">{label}</p>
              <p className="text-2xl font-semibold font-poppins text-text-primary mt-1">{value}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Order stats */}
      <div>
        <h2 className="font-semibold font-poppins text-text-primary mb-3">Order Statistics</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Orders', value: analytics.totalOrders, color: 'text-text-primary' },
            { label: 'Completed', value: analytics.completedOrders, color: 'text-success' },
            { label: 'Pending', value: analytics.pendingOrders, color: 'text-warning' },
          ].map(({ label, value, color }) => (
            <Card key={label} className="text-center">
              <p className={`text-3xl font-semibold font-poppins ${color}`}>{value}</p>
              <p className="text-xs text-text-secondary mt-1">{label}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Completion rate */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-primary" />
            <h2 className="font-semibold font-poppins text-text-primary">Completion Rate</h2>
          </div>
          <span className="text-2xl font-semibold text-primary font-poppins">{completionRate}%</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-3">
          <div
            className="gradient-primary h-3 rounded-full transition-all"
            style={{ width: `${completionRate}%` }}
          />
        </div>
        <p className="text-xs text-text-secondary mt-2">{analytics.completedOrders} of {analytics.totalOrders} orders completed</p>
      </Card>

      {/* Breakdowns */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold font-poppins text-text-primary mb-4">Storage by Size</h3>
          {Object.entries(analytics.storageBySize).length === 0 ? (
            <p className="text-text-secondary text-sm">No data</p>
          ) : (
            Object.entries(analytics.storageBySize).map(([size, count]) => {
              const total = Object.values(analytics.storageBySize).reduce((a, b) => a + b, 0)
              const pct = Math.round((count / total) * 100)
              return (
                <div key={size} className="flex items-center gap-3 mb-3">
                  <span className="text-sm font-semibold text-text-primary w-12">
                    {size === 'S' ? 'Small' : size === 'M' ? 'Medium' : 'Large'}
                  </span>
                  <div className="flex-1 bg-secondary rounded-full h-2">
                    <div className="gradient-primary h-2 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-text-secondary w-12 text-right">{count} ({pct}%)</span>
                </div>
              )
            })
          )}
        </Card>

        <Card>
          <h3 className="font-semibold font-poppins text-text-primary mb-4">Runner by Type</h3>
          {Object.entries(analytics.runnerByType).length === 0 ? (
            <p className="text-text-secondary text-sm">No data</p>
          ) : (
            Object.entries(analytics.runnerByType).map(([type, count]) => {
              const total = Object.values(analytics.runnerByType).reduce((a, b) => a + b, 0)
              const pct = Math.round((count / total) * 100)
              return (
                <div key={type} className="flex items-center gap-3 mb-3">
                  <span className="text-sm font-semibold text-text-primary w-16 capitalize">{type}</span>
                  <div className="flex-1 bg-green-50 rounded-full h-2">
                    <div className="bg-success h-2 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-text-secondary w-12 text-right">{count} ({pct}%)</span>
                </div>
              )
            })
          )}
        </Card>
      </div>
    </div>
  )
}
