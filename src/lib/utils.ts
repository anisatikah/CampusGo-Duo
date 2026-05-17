import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { differenceInDays, parseISO } from 'date-fns'
import { STORAGE_RATES, STORAGE_MAX_QTY, StorageSize } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRM(amount: number): string {
  return `RM ${amount.toFixed(2)}`
}

export function calcStorageDays(start: string, end: string): number {
  return Math.max(1, differenceInDays(parseISO(end), parseISO(start)))
}

export function getStorageDailyRate(size: StorageSize, qty: number): number {
  const maxQty = STORAGE_MAX_QTY[size]
  const clampedQty = Math.min(qty, maxQty)
  return STORAGE_RATES[size][clampedQty] ?? 0
}

export function calcStorageTotal(size: StorageSize, qty: number, start: string, end: string) {
  const days = calcStorageDays(start, end)
  const dailyRate = getStorageDailyRate(size, qty)
  return { days, dailyRate, total: parseFloat((days * dailyRate).toFixed(2)) }
}

export function calcPrintPrice(pages: number, copies: number, color: 'bw' | 'color'): number {
  const rate = color === 'color' ? 0.50 : 0.10
  return parseFloat((pages * copies * rate).toFixed(2))
}

export function generateOrderId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let id = 'CGO-'
  for (let i = 0; i < 8; i++) id += chars[Math.floor(Math.random() * chars.length)]
  return id
}

export function statusLabel(status: string): string {
  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    pending: 'warning',
    pickup_scheduled: 'primary',
    picked_up: 'primary',
    in_storage: 'primary',
    returning: 'warning',
    completed: 'success',
    cancelled: 'danger',
    accepted: 'primary',
    on_the_way: 'primary',
    delivered: 'success',
    processing: 'primary',
    ready: 'success',
  }
  return map[status] ?? 'secondary'
}
