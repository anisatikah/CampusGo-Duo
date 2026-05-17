import BottomNav from './BottomNav'

interface MainLayoutProps {
  children: React.ReactNode
  noPadding?: boolean
}

export default function MainLayout({ children, noPadding }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-white max-w-md mx-auto relative">
      <main className={noPadding ? '' : 'pb-24'}>{children}</main>
      <BottomNav />
    </div>
  )
}
