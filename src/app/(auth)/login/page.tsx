'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Mail, Lock } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface LoginForm {
  email: string
  password: string
}

export default function LoginPage() {
  const { signIn } = useAuth()
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>()

  const onSubmit = async (data: LoginForm) => {
    setError('')
    setLoading(true)
    try {
      await signIn(data.email, data.password)
      router.replace('/dashboard')
    } catch {
      setError('Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-semibold font-poppins text-text-primary">Welcome back</h2>
        <p className="text-text-secondary mt-1 text-sm">Sign in to access your campus services</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          placeholder="student@university.edu.my"
          icon={<Mail size={16} />}
          error={errors.email?.message}
          {...register('email', {
            required: 'Email is required',
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
          })}
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          icon={<Lock size={16} />}
          error={errors.password?.message}
          {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
        />

        {error && (
          <div className="bg-red-50 text-danger text-sm px-4 py-3 rounded-2xl border border-red-100">
            {error}
          </div>
        )}

        <Button type="submit" fullWidth size="lg" loading={loading} className="mt-2">
          Sign In
        </Button>
      </form>

      <p className="text-center text-sm text-text-secondary">
        Don't have an account?{' '}
        <Link href="/register" className="text-primary font-semibold hover:underline">
          Sign Up
        </Link>
      </p>
    </div>
  )
}
