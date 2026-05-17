'use client'

import { useState } from 'react'
import { Archive, Bike, Printer } from 'lucide-react'
import { useAllOrders } from '@/hooks/useOrders'
import TopBar from '@/components/layout/TopBar'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { formatRM } from '@/lib/utils'
import { cn } from '@/lib/utils'

type TabType = 'all' | 'storage' | 'runner' | 'printing'

const TABS: { key: TabType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'storage', label: 'Storage' },
  { key: 'runner', label: 'Runner' },
  { key: 'printing', label: 'Print' },
]

export default function OrdersPage() {
  const { storageOrders, runnerOrders, printingOrders, loading } = useAllOrders()
  const [activeTab, setActiveTab] = useState<TabType>('all')

  const allOrders = [
    ...storageOrders.map((o) => ({ ...o, orderType: 'storage' as const })),
    ...runnerOrders.map((o) => ({ ...o, orderType: 'runner' as const })),
    ...printingOrders.map((o) => ({ ...o, orderType: 'printing' as const })),
  ].sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1))

  const filtered = activeTab === 'all' ? allOrders : allOrders.filter((o) => o.orderType === activeTab)

  const getIcon = (type: string) => {
    if (type === 'storage') return <Archive size={18} className="text-primary" />
    if (type === 'runner') return <Bike size={18} className="text-success" />
    return <Printer size={18} className="text-blue-500" />
  }

  const getIconBg = (type: string) => {
    if (type === 'storage') return 'bg-secondary'
    if (type === 'runner') return 'bg-green-50'
    return 'bg-blue-50'
  }

  const getLabel = (order: typeof allOrders[0]) => {
    if (order.orderType === 'storage') return `${(order as typeof storageOrders[0]).size} — ${(order as typeof storageOrders[0]).category}`
    if (order.orderType === 'runner') return `${(order as typeof runnerOrders[0]).type} runner`
    return `${(order as typeof printingOrders[0]).pages}p × ${(order as typeof printingOrders[0]).copies} copies`
  }

  const getPrice = (order: typeof allOrders[0]) => {
    if ('totalPrice' in order) return formatRM(order.totalPrice as number)
    if ('estimatedFee' in order) return `${formatRM(order.estimatedFee as number)}+`
    return ''
  }

  return (
    <div>
      <TopBar title="My Orders" showNotification />

      {/* Tabs */}
      <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              'flex-shrink-0 px-4 py-2 rounded-2xl text-sm font-semibold transition-all',
              activeTab === key ? 'bg-primary text-white' : 'bg-secondary text-text-secondary hover:bg-purple-100',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="px-4 py-2 flex flex-col gap-3 pb-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">📭</div>
            <p className="text-text-secondary font-medium">No orders yet</p>
            <p className="text-text-secondary text-sm mt-1">Book a service to get started</p>
          </div>
        ) : (
          filtered.map((order) => (
            <Card key={order.id} className="flex items-center gap-3">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', getIconBg(order.orderType))}>
                {getIcon(order.orderType)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-sm text-text-primary capitalize">
                    {order.orderType} Service
                  </p>
                  <Badge status={order.status} />
                </div>
                <p className="text-xs text-text-secondary mt-0.5 truncate">{getLabel(order)}</p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[10px] text-text-secondary font-mono">{order.id.slice(0, 8).toUpperCase()}</span>
                  <span className="text-xs font-semibold text-primary">{getPrice(order)}</span>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
