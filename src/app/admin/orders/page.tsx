'use client'

import { useEffect, useState } from 'react'
import { collection, getDocs, query, orderBy, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Archive, Bike, Printer, Filter } from 'lucide-react'
import { StorageOrder, RunnerOrder, PrintingOrder, StorageStatus, RunnerStatus, PrintStatus } from '@/types'
import { formatRM, statusLabel } from '@/lib/utils'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import { cn } from '@/lib/utils'

type TabType = 'storage' | 'runner' | 'printing'

const STORAGE_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'pickup_scheduled', label: 'Pickup Scheduled' },
  { value: 'picked_up', label: 'Picked Up' },
  { value: 'in_storage', label: 'In Storage' },
  { value: 'returning', label: 'Returning' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const RUNNER_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'on_the_way', label: 'On The Way' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

const PRINT_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'ready', label: 'Ready' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

export default function AdminOrdersPage() {
  const [tab, setTab] = useState<TabType>('storage')
  const [storageOrders, setStorageOrders] = useState<StorageOrder[]>([])
  const [runnerOrders, setRunnerOrders] = useState<RunnerOrder[]>([])
  const [printingOrders, setPrintingOrders] = useState<PrintingOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => {
    async function load() {
      const [s, r, p] = await Promise.all([
        getDocs(query(collection(db, 'storage_orders'), orderBy('createdAt', 'desc'))),
        getDocs(query(collection(db, 'runner_orders'), orderBy('createdAt', 'desc'))),
        getDocs(query(collection(db, 'printing_orders'), orderBy('createdAt', 'desc'))),
      ])
      setStorageOrders(s.docs.map((d) => ({ id: d.id, ...d.data() } as StorageOrder)))
      setRunnerOrders(r.docs.map((d) => ({ id: d.id, ...d.data() } as RunnerOrder)))
      setPrintingOrders(p.docs.map((d) => ({ id: d.id, ...d.data() } as PrintingOrder)))
      setLoading(false)
    }
    load()
  }, [])

  const updateStatus = async (collectionName: string, id: string, status: string) => {
    setUpdating(id)
    await updateDoc(doc(db, collectionName, id), { status, updatedAt: serverTimestamp() })
    if (collectionName === 'storage_orders') {
      setStorageOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: status as StorageStatus } : o)))
    } else if (collectionName === 'runner_orders') {
      setRunnerOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: status as RunnerStatus } : o)))
    } else {
      setPrintingOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: status as PrintStatus } : o)))
    }
    setUpdating(null)
  }

  const TABS = [
    { key: 'storage' as TabType, label: 'Storage', icon: Archive, count: storageOrders.length },
    { key: 'runner' as TabType, label: 'Runner', icon: Bike, count: runnerOrders.length },
    { key: 'printing' as TabType, label: 'Printing', icon: Printer, count: printingOrders.length },
  ]

  const currentCollection = tab === 'storage' ? 'storage_orders' : tab === 'runner' ? 'runner_orders' : 'printing_orders'
  const statusOptions = tab === 'storage' ? STORAGE_STATUS_OPTIONS : tab === 'runner' ? RUNNER_STATUS_OPTIONS : PRINT_STATUS_OPTIONS

  const currentOrders = (
    tab === 'storage' ? storageOrders :
    tab === 'runner' ? runnerOrders :
    printingOrders
  ).filter((o) => !filterStatus || o.status === filterStatus)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(({ key, label, icon: Icon, count }) => (
          <button
            key={key}
            onClick={() => { setTab(key); setFilterStatus('') }}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold transition-all',
              tab === key ? 'bg-primary text-white' : 'bg-white text-text-secondary hover:bg-secondary border border-purple-50',
            )}
          >
            <Icon size={16} />
            {label}
            <span className={cn('text-xs px-1.5 py-0.5 rounded-full', tab === key ? 'bg-white/20 text-white' : 'bg-secondary text-primary')}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Filter size={16} className="text-text-secondary" />
        <Select
          options={[{ value: '', label: 'All statuses' }, ...statusOptions]}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {/* Orders */}
      <div className="flex flex-col gap-3">
        {currentOrders.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-text-secondary">No orders found</p>
          </Card>
        ) : (
          currentOrders.map((order) => (
            <Card key={order.id} className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-sm text-text-primary">{order.userName}</p>
                  <p className="text-xs text-text-secondary font-mono">{order.id.slice(0, 12).toUpperCase()}</p>
                </div>
                <Badge status={order.status} />
              </div>

              {/* Order details */}
              <div className="text-xs text-text-secondary space-y-1">
                {tab === 'storage' && (() => {
                  const s = order as StorageOrder
                  return (
                    <>
                      <p>Size: {s.size} · Qty: {s.quantity} · {s.totalDays} days</p>
                      <p>Date: {s.startDate} → {s.endDate}</p>
                      <p className="font-semibold text-primary">Total: {formatRM(s.totalPrice)}</p>
                    </>
                  )
                })()}
                {tab === 'runner' && (() => {
                  const r = order as RunnerOrder
                  return (
                    <>
                      <p>Type: {r.type} · From: {r.pickupLocation}</p>
                      <p>To: {r.deliveryLocation}</p>
                    </>
                  )
                })()}
                {tab === 'printing' && (() => {
                  const p = order as PrintingOrder
                  return (
                    <>
                      <p>{p.fileName} · {p.pages}p × {p.copies} copies · {p.color === 'bw' ? 'B&W' : 'Color'}</p>
                      <p className="font-semibold text-primary">Total: {formatRM(p.totalPrice)}</p>
                    </>
                  )
                })()}
              </div>

              {/* Status update */}
              <div className="flex items-center gap-2">
                <Select
                  options={statusOptions}
                  value={order.status}
                  onChange={(e) => updateStatus(currentCollection, order.id, e.target.value)}
                  className="flex-1 text-xs py-2"
                />
                <span className={cn('text-xs text-text-secondary', updating === order.id && 'opacity-50')}>
                  {updating === order.id ? 'Saving...' : 'Saved'}
                </span>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
