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
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setStatus('Signing in...')

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      setError(signInError.message)
      setStatus('')
      setLoading(false)
      return
    }

    if (!data.session) {
      setError('No session returned. Please try again.')
      setStatus('')
      setLoading(false)
      return
    }

    setStatus('Signed in! Checking profile...')

    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarded')
      .eq('id', data.session.user.id)
      .single()

    const onboarded = (profile as any)?.onboarded

    if (onboarded) {
      setStatus('Redirecting to dashboard...')
      window.location.replace('/dashboard')
    } else {
      setStatus('Redirecting to onboarding...')
      window.location.replace('/onboarding')
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 bg-[#0D0C0B] rounded-xl flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L12 4.5V10L7 13L2 10V4.5L7 1Z" fill="#FF8C1A"/>
            </svg>
          </div>
          <span style={{fontFamily: 'Cabinet Grotesk, sans-serif'}} className="font-bold text-[16px] text-[#0D0C0B]">
            Virtual CMO OS
          </span>
        </div>

        <div className="text-center mb-6">
          <h1 style={{fontFamily: 'Cabinet Grotesk, sans-serif'}} className="text-2xl font-black text-[#0D0C0B]">
            Welcome back
          </h1>
          <p className="text-[14px] text-[#7A7670] mt-1">Sign in to your CMO dashboard</p>
        </div>

        <div className="bg-white border border-[#EDE9E3] rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleLogin} className="space-y-4">

            <div>
              <label htmlFor="email" className="block text-[12.5px] font-semibold text-[#524F4A] mb-1.5 uppercase tracking-wide">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-[#EDE9E3] rounded-lg text-[14px] text-[#0D0C0B] placeholder:text-[#A39E96] focus:outline-none focus:border-[#0D0C0B] transition-colors bg-[#FAFAF8]"
                placeholder="you@startup.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-[12.5px] font-semibold text-[#524F4A] mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-[#EDE9E3] rounded-lg text-[14px] text-[#0D0C0B] placeholder:text-[#A39E96] focus:outline-none focus:border-[#0D0C0B] transition-colors bg-[#FAFAF8]"
                placeholder="••••••••"
                required
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Status message */}
            {status && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 text-[13px] px-4 py-3 rounded-lg">
                {status}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0D0C0B] text-white py-3 rounded-lg text-[14px] font-semibold hover:bg-[#1A1714] transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
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