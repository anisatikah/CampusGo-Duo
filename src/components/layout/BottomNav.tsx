'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingBag, Grid3X3, MessageCircle, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/orders', icon: ShoppingBag, label: 'Orders' },
  { href: '/services', icon: Grid3X3, label: 'Services' },
  { href: '/chat', icon: MessageCircle, label: 'Chat' },
  { href: '/profile', icon: User, label: 'Profile' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-purple-50 shadow-bottom safe-bottom">
      <div className="max-w-md mx-auto flex items-center justify-around px-2 py-2">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all min-w-[56px]',
                active ? 'text-primary' : 'text-text-secondary',
              )}
            >
              <div className={cn('p-1.5 rounded-xl transition-all', active && 'bg-secondary')}>
                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              </div>
              <span className={cn('text-[10px] font-semibold', active ? 'text-primary' : 'text-text-secondary')}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
