'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) router.replace('/dashboard')
  }, [user, loading, router])

  if (loading) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-white to-purple-50 flex flex-col">
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-6 py-12">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
            <span className="text-white font-bold font-poppins text-lg">C</span>
          </div>
          <div>
            <h1 className="text-xl font-semibold font-poppins text-text-primary">CampusGo</h1>
            <p className="text-xs text-text-secondary">Campus Services Super App</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}
