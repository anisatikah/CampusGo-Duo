'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Printer, FileText, Info } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { usePrintingOrders } from '@/hooks/useOrders'
import { PrintColor, PrintDelivery } from '@/types'
import { calcPrintPrice, formatRM } from '@/lib/utils'
import TopBar from '@/components/layout/TopBar'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import { cn } from '@/lib/utils'

interface PrintForm {
  fileName: string
  pages: number
  copies: number
  deliveryAddress: string
}

export default function PrintingPage() {
  const { profile } = useAuth()
  const { createOrder } = usePrintingOrders()
  const router = useRouter()
  const [color, setColor] = useState<PrintColor>('bw')
  const [delivery, setDelivery] = useState<PrintDelivery>('pickup')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<PrintForm>({
    defaultValues: { pages: 1, copies: 1 },
  })

  const pages = Number(watch('pages')) || 1
  const copies = Number(watch('copies')) || 1
  const total = calcPrintPrice(pages, copies, color)

  const onSubmit = async (data: PrintForm) => {
    if (!profile) return
    setLoading(true)
    try {
      await createOrder({
        userId: profile.uid,
        userName: profile.name,
        fileUrl: '',
        fileName: data.fileName,
        color,
        copies: data.copies,
        pages: data.pages,
        delivery,
        deliveryAddress: data.deliveryAddress,
        totalPrice: calcPrintPrice(data.pages, data.copies, color),
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
        <TopBar title="Print Job Submitted!" showBack />
        <div className="flex-1 flex flex-col items-center justify-center px-4 gap-6">
          <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center">
            <Printer size={40} className="text-blue-500" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold font-poppins text-text-primary">Print Job Received!</h2>
            <p className="text-text-secondary mt-2 text-sm">Your print job is being processed. You'll be notified when it's ready.</p>
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
      <TopBar title="Printing Service" showBack />

      <div className="px-4 py-4 flex flex-col gap-5 pb-8">
        <Card className="flex items-start gap-3 bg-blue-50 border-blue-100">
          <Info size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-text-secondary leading-relaxed">
            B&W: RM0.10/page · Color: RM0.50/page. WhatsApp us your file after booking.
          </p>
        </Card>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {/* File name */}
          <Input
            label="Document Name"
            placeholder="e.g. Assignment_CSC123.pdf"
            icon={<FileText size={16} />}
            error={errors.fileName?.message}
            {...register('fileName', { required: 'Document name is required' })}
          />

          {/* Color selection */}
          <div>
            <p className="text-sm font-semibold text-text-primary font-poppins mb-3">Print Type</p>
            <div className="grid grid-cols-2 gap-3">
              {(['bw', 'color'] as PrintColor[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    'flex flex-col items-center py-4 rounded-2xl border-2 transition-all',
                    color === c ? 'border-primary bg-secondary' : 'border-transparent bg-card-bg shadow-card',
                  )}
                >
                  <span className="text-2xl mb-1">{c === 'bw' ? '⬛' : '🎨'}</span>
                  <span className="font-semibold text-sm text-text-primary">{c === 'bw' ? 'Black & White' : 'Color'}</span>
                  <span className="text-xs text-text-secondary">{c === 'bw' ? 'RM0.10/page' : 'RM0.50/page'}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Pages & Copies */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-text-primary font-poppins">Pages</label>
              <input
                type="number"
                min={1}
                className="w-full rounded-2xl border border-purple-100 bg-white px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                {...register('pages', { required: true, min: 1, valueAsNumber: true })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-text-primary font-poppins">Copies</label>
              <input
                type="number"
                min={1}
                className="w-full rounded-2xl border border-purple-100 bg-white px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                {...register('copies', { required: true, min: 1, valueAsNumber: true })}
              />
            </div>
          </div>

          {/* Delivery option */}
          <div>
            <p className="text-sm font-semibold text-text-primary font-poppins mb-3">Collection Method</p>
            <div className="grid grid-cols-2 gap-3">
              {(['pickup', 'delivery'] as PrintDelivery[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDelivery(d)}
                  className={cn(
                    'flex flex-col items-center py-4 rounded-2xl border-2 transition-all',
                    delivery === d ? 'border-primary bg-secondary' : 'border-transparent bg-card-bg shadow-card',
                  )}
                >
                  <span className="text-2xl mb-1">{d === 'pickup' ? '🏃' : '🚚'}</span>
                  <span className="font-semibold text-sm text-text-primary capitalize">{d}</span>
                  <span className="text-xs text-text-secondary">{d === 'pickup' ? 'Collect yourself' : 'We deliver'}</span>
                </button>
              ))}
            </div>
          </div>

          {delivery === 'delivery' && (
            <Input
              label="Delivery Address"
              placeholder="Room / Block / College"
              error={errors.deliveryAddress?.message}
              {...register('deliveryAddress', { required: delivery === 'delivery' ? 'Address required for delivery' : false })}
            />
          )}

          {/* Price summary */}
          <Card className="bg-secondary border-purple-100">
            <h3 className="font-semibold text-primary font-poppins mb-3">Price Summary</h3>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Rate</span>
                <span className="font-medium">{color === 'bw' ? 'RM0.10' : 'RM0.50'}/page</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Pages × Copies</span>
                <span className="font-medium">{pages} × {copies}</span>
              </div>
              <div className="h-px bg-purple-100 my-1" />
              <div className="flex justify-between">
                <span className="font-semibold text-text-primary">Total</span>
                <span className="font-semibold text-primary text-lg">{formatRM(total)}</span>
              </div>
            </div>
          </Card>

          <Button type="submit" fullWidth size="lg" loading={loading}>
            Submit Print Job
          </Button>
        </form>
      </div>
    </div>
  )
}
