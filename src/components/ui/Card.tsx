import { cn } from '@/lib/utils'
import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  padding?: 'sm' | 'md' | 'lg' | 'none'
}

export default function Card({ className, hover, padding = 'md', children, ...props }: CardProps) {
  const paddings = { none: '', sm: 'p-3', md: 'p-4', lg: 'p-6' }
  return (
    <div
      className={cn(
        'bg-card-bg rounded-2xl shadow-card border border-purple-50',
        hover && 'hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer transition-all duration-200',
        paddings[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
