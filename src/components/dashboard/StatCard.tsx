import Card from '@/components/ui/Card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  color?: 'purple' | 'green' | 'amber' | 'blue'
  className?: string
}

const colorMap = {
  purple: { bg: 'bg-secondary', icon: 'text-primary', title: 'text-text-secondary', value: 'text-text-primary' },
  green: { bg: 'bg-green-50', icon: 'text-success', title: 'text-text-secondary', value: 'text-text-primary' },
  amber: { bg: 'bg-amber-50', icon: 'text-warning', title: 'text-text-secondary', value: 'text-text-primary' },
  blue: { bg: 'bg-blue-50', icon: 'text-blue-500', title: 'text-text-secondary', value: 'text-text-primary' },
}

export default function StatCard({ title, value, subtitle, icon, color = 'purple', className }: StatCardProps) {
  const colors = colorMap[color]
  return (
    <Card className={cn('flex flex-col gap-3', className)}>
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', colors.bg)}>
        <span className={colors.icon}>{icon}</span>
      </div>
      <div>
        <p className={cn('text-xs font-medium', colors.title)}>{title}</p>
        <p className={cn('text-2xl font-semibold font-poppins mt-0.5', colors.value)}>{value}</p>
        {subtitle && <p className="text-xs text-text-secondary mt-0.5">{subtitle}</p>}
      </div>
    </Card>
  )
}
