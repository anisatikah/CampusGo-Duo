export type UserRole = 'student' | 'admin'

export interface UserProfile {
  uid: string
  email: string
  name: string
  phone?: string
  college?: string
  block?: string
  role: UserRole
  avatarUrl?: string
  createdAt: string
}

export type StorageSize = 'S' | 'M' | 'L'

export type StorageStatus =
  | 'pending'
  | 'pickup_scheduled'
  | 'picked_up'
  | 'in_storage'
  | 'returning'
  | 'completed'
  | 'cancelled'

export interface StorageOrder {
  id: string
  userId: string
  userName: string
  userPhone?: string
  size: StorageSize
  quantity: number
  category: string
  startDate: string
  endDate: string
  totalDays: number
  dailyRate: number
  totalPrice: number
  notes?: string
  isFragile: boolean
  imageUrls: string[]
  status: StorageStatus
  createdAt: string
  updatedAt: string
}

export type RunnerType = 'food' | 'parcel' | 'grocery' | 'custom'

export type RunnerStatus = 'pending' | 'accepted' | 'on_the_way' | 'delivered' | 'cancelled'

export interface RunnerOrder {
  id: string
  userId: string
  userName: string
  userPhone?: string
  type: RunnerType
  pickupLocation: string
  deliveryLocation: string
  notes?: string
  receiptUrl?: string
  proofUrl?: string
  estimatedFee: number
  status: RunnerStatus
  runnerId?: string
  runnerName?: string
  createdAt: string
  updatedAt: string
}

export type PrintColor = 'bw' | 'color'
export type PrintDelivery = 'pickup' | 'delivery'
export type PrintStatus = 'pending' | 'processing' | 'ready' | 'completed' | 'cancelled'

export interface PrintingOrder {
  id: string
  userId: string
  userName: string
  fileUrl: string
  fileName: string
  color: PrintColor
  copies: number
  pages: number
  delivery: PrintDelivery
  deliveryAddress?: string
  totalPrice: number
  status: PrintStatus
  createdAt: string
  updatedAt: string
}

export type OrderType = 'storage' | 'runner' | 'printing'

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: string
}

export const STORAGE_RATES: Record<StorageSize, Record<number, number>> = {
  S: {
    1: 0.45, 2: 0.78, 3: 1.04, 4: 1.30, 5: 1.49,
    6: 1.62, 7: 1.75, 8: 1.88, 9: 2.01, 10: 2.14,
  },
  M: {
    1: 0.71, 2: 1.17, 3: 1.56, 4: 1.88, 5: 2.14, 6: 2.40,
  },
  L: {
    1: 0.97, 2: 1.69, 3: 2.34, 4: 2.86,
  },
}

export const STORAGE_MAX_QTY: Record<StorageSize, number> = { S: 10, M: 6, L: 4 }

export const STORAGE_EXAMPLES: Record<StorageSize, string[]> = {
  S: ['Backpack', 'Laundry basket', 'Mini box', 'Pillow', 'Mat'],
  M: ['Luggage', 'Fan', 'Printer', 'Medium box'],
  L: ['Large luggage', 'Large box', 'Bulky items'],
}

export const PRINT_PRICE = { bw: 0.10, color: 0.50 }
export const RUNNER_BASE_FEE = 5.00
