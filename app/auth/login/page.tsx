'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setStatus('Signing in...')

    try {
      // Step 1: Sign in via browser client (sets cookie in browser)
      const supabase = createClient()
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })

      if (signInError) {
        setError(signInError.message)
        setStatus('')
        setLoading(false)
        return
      }

      if (!data.session) {
        setError('No session created. Please try again.')
        setStatus('')
        setLoading(false)
        return
      }

      setStatus('Authenticated! Redirecting...')

      // Step 2: Call server to check onboarding and get redirect target
      // The server can now read the cookie since browser client set it
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const result = await res.json()

      if (result.error) {
        // Still redirect to dashboard — browser session exists
        window.location.href = '/dashboard'
        return
      }

      window.location.href = result.redirectTo || '/dashboard'

    } catch (err: any) {
      setError(err.message || 'Something went wrong')
      setStatus('')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 bg-[#0D0C0B] rounded-xl flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L12 4.5V10L7 13L2 10V4.5L7 1Z" fill="#FF8C1A"/>
            </svg>
          </div>
          <span className="font-bold text-[16px] text-[#0D0C0B]">Virtual CMO OS</span>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-black text-[#0D0C0B]">Welcome back</h1>
          <p className="text-[14px] text-[#7A7670] mt-1">Sign in to your CMO dashboard</p>
        </div>

        <div className="bg-white border border-[#EDE9E3] rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[12.5px] font-semibold text-[#524F4A] mb-1.5 uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-[#EDE9E3] rounded-lg text-[14px] text-[#0D0C0B] placeholder:text-[#A39E96] focus:outline-none focus:border-[#0D0C0B] transition-colors bg-[#FAFAF8]"
                placeholder="you@startup.com"
                required
              />
            </div>

            <div>
              <label className="block text-[12.5px] font-semibold text-[#524F4A] mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-[#EDE9E3] rounded-lg text-[14px] text-[#0D0C0B] placeholder:text-[#A39E96] focus:outline-none focus:border-[#0D0C0B] transition-colors bg-[#FAFAF8]"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] px-4 py-3 rounded-lg">
                ⚠ {error}
              </div>
            )}

            {status && !error && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-[13px] px-4 py-3 rounded-lg">
                ✓ {status}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0D0C0B] text-white py-3 rounded-lg text-[14px] font-semibold hover:bg-[#1A1714] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in →'}
            </button>
          </form>
        </div>

        <p className="text-center text-[13px] text-[#7A7670] mt-5">
          No account?{' '}
          <Link href="/auth/signup" className="text-[#0D0C0B] font-semibold hover:underline">
            Get started free →
          </Link>
        </p>
      </div>
    </div>
  )
}
