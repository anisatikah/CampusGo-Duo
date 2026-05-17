import Link from 'next/link'
import { Package, Bike, Printer, PackageCheck } from 'lucide-react'
import TopBar from '@/components/layout/TopBar'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

const SERVICES = [
  {
    href: '/services/storage',
    icon: Package,
    label: 'Storage Service',
    description: 'Store your belongings safely during semester break at affordable daily rates.',
    color: 'bg-purple-100 text-primary',
    badge: 'Popular',
    badgeColor: 'bg-primary text-white',
  },
  {
    href: '/services/runner',
    icon: Bike,
    label: 'Runner Service',
    description: 'Get food, parcels, groceries delivered by our trusted campus runners.',
    color: 'bg-green-100 text-success',
    badge: 'Fast',
    badgeColor: 'bg-success text-white',
  },
  {
    href: '/services/printing',
    icon: Printer,
    label: 'Printing Service',
    description: 'Print documents, assignments, and reports — B&W or color with delivery.',
    color: 'bg-blue-100 text-blue-600',
    badge: null,
    badgeColor: '',
  },
  {
    href: '/services/runner',
    icon: PackageCheck,
    label: 'Parcel Pickup',
    description: "We'll pick up your parcels from the post office or delivery hub for you.",
    color: 'bg-amber-100 text-warning',
    badge: null,
    badgeColor: '',
  },
]

export default function ServicesPage() {
  return (
    <div>
      <TopBar title="Services" showNotification />

      <div className="px-4 py-4 flex flex-col gap-4">
        <p className="text-text-secondary text-sm">Choose a service to get started</p>

        {SERVICES.map(({ href, icon: Icon, label, description, color, badge, badgeColor }) => (
          <Card key={label} hover padding="lg">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon size={24} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-text-primary font-poppins">{label}</h3>
                  {badge && (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badgeColor}`}>
                      {badge}
                    </span>
                  )}
                </div>
                <p className="text-sm text-text-secondary leading-relaxed mb-4">{description}</p>
                <Link href={href}>
                  <Button size="sm" variant="primary">Book Now</Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
