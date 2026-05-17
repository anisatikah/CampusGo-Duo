'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft, Bell } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TopBarProps {
  title: string
  showBack?: boolean
  showNotification?: boolean
  action?: React.ReactNode
  transparent?: boolean
}

export default function TopBar({ title, showBack, showNotification, action, transparent }: TopBarProps) {
  const router = useRouter()

  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex items-center justify-between px-4 py-4',
        transparent ? 'bg-transparent' : 'bg-white border-b border-purple-50',
      )}
    >
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-secondary text-primary hover:bg-purple-100 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
        )}
        <h1 className="text-lg font-semibold text-text-primary font-poppins">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        {action}
        {showNotification && (
          <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-secondary text-primary hover:bg-purple-100 transition-colors relative">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
          </button>
        )}
      </div>
    </header>
  )
}
