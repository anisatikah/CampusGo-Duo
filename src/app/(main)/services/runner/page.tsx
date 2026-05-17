'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Bike, MapPin, Navigation, Info } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useRunnerOrders } from '@/hooks/useOrders'
import { RunnerType } from '@/types'
import { formatRM } from '@/lib/utils'
import { RUNNER_BASE_FEE } from '@/types'
import TopBar from '@/components/layout/TopBar'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import Textarea from '@/components/ui/Textarea'
import { cn } from '@/lib/utils'

interface RunnerForm {
  pickupLocation: string
  deliveryLocation: string
  notes: string
}

const RUNNER_TYPES: { type: RunnerType; label: string; emoji: string; desc: string }[] = [
  { type: 'food', label: 'Food', emoji: '🍱', desc: 'Order food delivered to you' },
  { type: 'parcel', label: 'Parcel', emoji: '📦', desc: 'Pick up your parcel' },
  { type: 'grocery', label: 'Grocery', emoji: '🛒', desc: 'Get groceries for you' },
  { type: 'custom', label: 'Custom', emoji: '✨', desc: 'Any custom errand' },
]

export default function RunnerPage() {
  const { profile } = useAuth()
  const { createOrder } = useRunnerOrders()
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<RunnerType>('food')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<RunnerForm>()

  const onSubmit = async (data: RunnerForm) => {
    if (!profile) return
    setLoading(true)
    try {
      await createOrder({
        userId: profile.uid,
        userName: profile.name,
        userPhone: profile.phone,
        type: selectedType,
        pickupLocation: data.pickupLocation,
        deliveryLocation: data.deliveryLocation,
        notes: data.notes,
        estimatedFee: RUNNER_BASE_FEE,
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
        <TopBar title="Runner Booked!" showBack />
        <div className="flex-1 flex flex-col items-center justify-center px-4 gap-6">
          <div className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center">
            <Bike size={40} className="text-success" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold font-poppins text-text-primary">Request Sent!</h2>
            <p className="text-text-secondary mt-2 text-sm">A runner will be assigned shortly. Track your order in Orders.</p>
          </div>
          <div className="flex flex-col gap-3 w-full">
            <Button fullWidth onClick={() => router.push('/orders')}>Track Order</Button>
            <Button fullWidth variant="secondary" onClick={() => router.push('/dashboard')}>Back to Home</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <TopBar title="Runner Service" showBack />

      <div className="px-4 py-4 flex flex-col gap-5 pb-8">
        <Card className="flex items-start gap-3 bg-green-50 border-green-100">
          <Info size={18} className="text-success mt-0.5 flex-shrink-0" />
          <p className="text-xs text-text-secondary leading-relaxed">
            Base fee starts at {formatRM(RUNNER_BASE_FEE)}. Final price may vary based on distance and order size.
          </p>
        </Card>

        {/* Runner Type */}
        <div>
          <p className="text-sm font-semibold text-text-primary font-poppins mb-3">Service Type</p>
          <div className="grid grid-cols-2 gap-3">
            {RUNNER_TYPES.map(({ type, label, emoji, desc }) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={cn(
                  'flex flex-col items-start p-3 rounded-2xl border-2 transition-all text-left',
                  selectedType === type
                    ? 'border-primary bg-secondary'
                    : 'border-transparent bg-card-bg shadow-card',
                )}
              >
                <span className="text-2xl mb-1">{emoji}</span>
                <span className="font-semibold text-sm text-text-primary">{label}</span>
                <span className="text-[11px] text-text-secondary">{desc}</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Pickup Location"
            placeholder="e.g. McDonald's Kota Samarahan"
            icon={<MapPin size={16} />}
            error={errors.pickupLocation?.message}
            {...register('pickupLocation', { required: 'Pickup location is required' })}
          />
          <Input
            label="Delivery Location"
            placeholder="e.g. Kolej Seroja Blok A Room 201"
            icon={<Navigation size={16} />}
            error={errors.deliveryLocation?.message}
            {...register('deliveryLocation', { required: 'Delivery location is required' })}
          />
          <Textarea
            label="Order Notes"
            placeholder="What do you need? Include item names, quantities, special requests..."
            id="notes"
            {...register('notes')}
          />

          {/* Fee summary */}
          <Card className="bg-secondary border-purple-100">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-text-primary font-poppins">Estimated Fee</p>
                <p className="text-xs text-text-secondary mt-0.5">Final price confirmed by runner</p>
              </div>
              <span className="text-xl font-semibold text-primary">{formatRM(RUNNER_BASE_FEE)}+</span>
            </div>
          </Card>

          <Button type="submit" fullWidth size="lg" loading={loading} className="mt-2">
            Request Runner
          </Button>
        </form>
      </div>
    </div>
  )
}
