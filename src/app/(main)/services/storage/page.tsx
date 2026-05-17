'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Package, AlertTriangle, Info } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useStorageOrders } from '@/hooks/useOrders'
import { StorageSize, STORAGE_EXAMPLES, STORAGE_MAX_QTY } from '@/types'
import { calcStorageTotal, formatRM, generateOrderId } from '@/lib/utils'
import TopBar from '@/components/layout/TopBar'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'

interface StorageForm {
  size: StorageSize
  quantity: number
  category: string
  startDate: string
  endDate: string
  notes: string
  isFragile: boolean
}

const SIZE_OPTIONS = [
  { value: 'S', label: 'Small (S) — Backpack, pillow, mat' },
  { value: 'M', label: 'Medium (M) — Luggage, fan, printer' },
  { value: 'L', label: 'Large (L) — Large luggage, bulky items' },
]

export default function StoragePage() {
  const { profile } = useAuth()
  const { createOrder } = useStorageOrders()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  const { register, handleSubmit, watch, formState: { errors } } = useForm<StorageForm>({
    defaultValues: { size: 'S', quantity: 1, isFragile: false },
  })

  const size = watch('size') as StorageSize
  const quantity = Number(watch('quantity')) || 1
  const startDate = watch('startDate')
  const endDate = watch('endDate')

  const maxQty = STORAGE_MAX_QTY[size]
  const showPricing = startDate && endDate && endDate > startDate

  const pricing = showPricing
    ? calcStorageTotal(size, Math.min(quantity, maxQty), startDate, endDate)
    : null

  const onSubmit = async (data: StorageForm) => {
    if (!profile) return
    setLoading(true)
    try {
      const { days, dailyRate, total } = calcStorageTotal(
        data.size,
        Math.min(data.quantity, STORAGE_MAX_QTY[data.size]),
        data.startDate,
        data.endDate,
      )
      await createOrder({
        userId: profile.uid,
        userName: profile.name,
        userPhone: profile.phone,
        size: data.size,
        quantity: Math.min(data.quantity, STORAGE_MAX_QTY[data.size]),
        category: data.category || STORAGE_EXAMPLES[data.size][0],
        startDate: data.startDate,
        endDate: data.endDate,
        totalDays: days,
        dailyRate,
        totalPrice: total,
        notes: data.notes,
        isFragile: data.isFragile,
        imageUrls: [],
        status: 'pending',
      })
      setSuccess(true)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col min-h-screen">
        <TopBar title="Storage Booked!" showBack />
        <div className="flex-1 flex flex-col items-center justify-center px-4 gap-6">
          <div className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center">
            <Package size={40} className="text-success" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold font-poppins text-text-primary">Booking Confirmed!</h2>
            <p className="text-text-secondary mt-2 text-sm">Your storage booking is pending pickup scheduling. We'll contact you soon.</p>
          </div>
          <div className="flex flex-col gap-3 w-full">
            <Button fullWidth onClick={() => router.push('/orders')}>View My Orders</Button>
            <Button fullWidth variant="secondary" onClick={() => router.push('/dashboard')}>Back to Home</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <TopBar title="Storage Service" showBack />

      <div className="px-4 py-4 flex flex-col gap-5 pb-8">
        {/* Info card */}
        <Card className="flex items-start gap-3 bg-secondary border-purple-100">
          <Info size={18} className="text-primary mt-0.5 flex-shrink-0" />
          <p className="text-xs text-text-secondary leading-relaxed">
            Book storage for your belongings during semester break. Daily rates based on item size and quantity.
          </p>
        </Card>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* Size */}
          <Select
            label="Item Size"
            id="size"
            options={SIZE_OPTIONS}
            {...register('size', { required: true })}
          />

          <div className="bg-secondary rounded-2xl px-4 py-3">
            <p className="text-xs font-semibold text-primary mb-1">Examples for {size}:</p>
            <p className="text-xs text-text-secondary">{STORAGE_EXAMPLES[size].join(', ')}</p>
          </div>

          {/* Quantity */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-text-primary font-poppins">
              Quantity (max {maxQty})
            </label>
            <input
              type="number"
              min={1}
              max={maxQty}
              className="w-full rounded-2xl border border-purple-100 bg-white px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              {...register('quantity', { required: true, min: 1, max: maxQty })}
            />
          </div>

          {/* Category */}
          <Input
            label="Item Description"
            placeholder="e.g. 1 luggage + pillow"
            id="category"
            {...register('category')}
          />

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Date"
              type="date"
              id="startDate"
              min={today}
              error={errors.startDate?.message}
              {...register('startDate', { required: 'Required' })}
            />
            <Input
              label="End Date"
              type="date"
              id="endDate"
              min={startDate || today}
              error={errors.endDate?.message}
              {...register('endDate', {
                required: 'Required',
                validate: (v) => !startDate || v > startDate || 'Must be after start',
              })}
            />
          </div>

          {/* Notes */}
          <Textarea
            label="Special Notes (optional)"
            placeholder="Any special handling instructions..."
            id="notes"
            {...register('notes')}
          />

          {/* Fragile */}
          <label className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 accent-primary" {...register('isFragile')} />
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-warning" />
              <span className="text-sm font-medium text-text-primary">Mark as Fragile</span>
            </div>
          </label>

          {/* Pricing Summary */}
          {pricing && (
            <Card className="bg-secondary border-purple-100">
              <h3 className="font-semibold text-primary font-poppins mb-3">Pricing Summary</h3>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Size</span>
                  <span className="font-medium text-text-primary">
                    {size === 'S' ? 'Small' : size === 'M' ? 'Medium' : 'Large'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Daily Rate</span>
                  <span className="font-medium text-text-primary">{formatRM(pricing.dailyRate)}/day</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Duration</span>
                  <span className="font-medium text-text-primary">{pricing.days} days</span>
                </div>
                <div className="h-px bg-purple-100 my-1" />
                <div className="flex justify-between">
                  <span className="font-semibold text-text-primary">Total</span>
                  <span className="font-semibold text-primary text-lg">{formatRM(pricing.total)}</span>
                </div>
              </div>
            </Card>
          )}

          <Button type="submit" fullWidth size="lg" loading={loading} className="mt-2">
            Confirm Booking
          </Button>
        </form>
      </div>
    </div>
  )
}
