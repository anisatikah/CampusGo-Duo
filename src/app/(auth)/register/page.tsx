'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { User, Mail, Lock, Phone, Building2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface RegisterForm {
  name: string
  email: string
  phone: string
  college: string
  password: string
  confirmPassword: string
}

export default function RegisterPage() {
  const { signUp } = useAuth()
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>()
  const password = watch('password')

  const onSubmit = async (data: RegisterForm) => {
    setError('')
    setLoading(true)
    try {
      await signUp(data.email, data.password, data.name, data.phone, data.college)
      router.replace('/dashboard')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : ''
      setError(msg.includes('email-already-in-use') ? 'Email already registered.' : 'Registration failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-semibold font-poppins text-text-primary">Create account</h2>
        <p className="text-text-secondary mt-1 text-sm">Join CampusGo and simplify campus life</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Full Name"
          placeholder="Ahmad Rizwan"
          icon={<User size={16} />}
          error={errors.name?.message}
          {...register('name', { required: 'Name is required' })}
        />
        <Input
          label="Email"
          type="email"
          placeholder="student@university.edu.my"
          icon={<Mail size={16} />}
          error={errors.email?.message}
          {...register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } })}
        />
        <Input
          label="Phone Number"
          type="tel"
          placeholder="01X-XXXXXXXX"
          icon={<Phone size={16} />}
          error={errors.phone?.message}
          {...register('phone', { required: 'Phone is required' })}
        />
        <Input
          label="College / Block"
          placeholder="e.g. Kolej Seroja, Blok A"
          icon={<Building2 size={16} />}
          {...register('college')}
        />
        <Input
          label="Password"
          type="password"
          placeholder="Min 6 characters"
          icon={<Lock size={16} />}
          error={errors.password?.message}
          {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
        />
        <Input
          label="Confirm Password"
          type="password"
          placeholder="Repeat password"
          icon={<Lock size={16} />}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: (v) => v === password || 'Passwords do not match',
          })}
        />

        {error && (
          <div className="bg-red-50 text-danger text-sm px-4 py-3 rounded-2xl border border-red-100">
            {error}
          </div>
        )}

        <Button type="submit" fullWidth size="lg" loading={loading} className="mt-2">
          Create Account
        </Button>
      </form>

      <p className="text-center text-sm text-text-secondary">
        Already have an account?{' '}
        <Link href="/login" className="text-primary font-semibold hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  )
}
