'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [guestLoading, setGuestLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const isGuest = searchParams.get('guest') === 'true'

  useEffect(() => {
    if (isGuest) {
      handleGuestLogin()
    }
  }, [isGuest])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast.error('Invalid credentials')
      } else {
        toast.success('Welcome back!')
        router.push('/dashboard')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleGuestLogin = async () => {
    setGuestLoading(true)
    
    try {
      const res = await fetch('/api/auth/guest', {
        method: 'POST'
      })
      
      const data = await res.json()
      
      if (res.ok) {
        const result = await signIn('credentials', {
          email: data.email,
          password: data.password,
          redirect: false,
        })
        
        if (result?.error) {
          toast.error('Failed to sign in as guest')
        } else {
          toast.success('Welcome, Guest!')
          router.push('/dashboard')
        }
      } else {
        toast.error('Failed to create guest account')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setGuestLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Sign in</h2>
          <p className="mt-2 text-gray-600">
            Continue your practice journey
          </p>
        </div>
        
        {guestLoading ? (
          <div className="text-center py-8">
            <div className="text-lg">Creating guest account...</div>
          </div>
        ) : (
          <>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="input mt-1"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  className="input mt-1"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <div className="text-center">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-50 text-gray-500">Or</span>
                </div>
              </div>
              
              <button
                onClick={handleGuestLogin}
                disabled={guestLoading}
                className="w-full btn btn-secondary mt-4"
              >
                {guestLoading ? 'Creating account...' : 'Continue as Guest'}
              </button>
            </div>

            <div className="text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link href="/signup" className="text-primary-600 hover:text-primary-700">
                  Sign up
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}