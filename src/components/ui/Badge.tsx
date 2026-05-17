import { cn, statusLabel } from '@/lib/utils'

interface BadgeProps {
  status: string
  className?: string
}

const colorMap: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  pickup_scheduled: 'bg-blue-100 text-blue-700',
  picked_up: 'bg-indigo-100 text-indigo-700',
  in_storage: 'bg-purple-100 text-purple-700',
  returning: 'bg-orange-100 text-orange-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  accepted: 'bg-blue-100 text-blue-700',
  on_the_way: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  processing: 'bg-purple-100 text-purple-700',
  ready: 'bg-green-100 text-green-700',
}

export default function Badge({ status, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
        colorMap[status] ?? 'bg-gray-100 text-gray-600',
        className,
      )}
    >
      {statusLabel(status)}
    </span>
  )
}
