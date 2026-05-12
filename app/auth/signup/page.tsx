'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Account created! Setting up your profile...')
      window.location.href = '/onboarding'
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-10 h-10 bg-[#0D0C0B] rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg width="18" height="18" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L12 4.5V10L7 13L2 10V4.5L7 1Z" fill="#FF8C1A"/>
            </svg>
          </div>
          <h1 style={{fontFamily: 'Cabinet Grotesk, sans-serif'}} className="text-2xl font-black text-[#0D0C0B]">
            Get your CMO
          </h1>
          <p className="text-[#7A7670] text-sm mt-1">Free to start. No credit card needed.</p>
        </div>

        <div className="bg-white border border-[#EDE9E3] rounded-2xl p-6 shadow-card">
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-[12.5px] font-semibold text-[#524F4A] mb-1.5 uppercase tracking-wide">
                Your name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-[#EDE9E3] rounded-lg text-[14px] text-[#0D0C0B] placeholder:text-[#A39E96] focus:outline-none focus:border-[#0D0C0B] transition-colors bg-[#FAFAF8]"
                placeholder="Priya Sharma"
                required
              />
            </div>

            <div>
              <label className="block text-[12.5px] font-semibold text-[#524F4A] mb-1.5 uppercase tracking-wide">
                Work email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-[#EDE9E3] rounded-lg text-[14px] text-[#0D0C0B] placeholder:text-[#A39E96] focus:outline-none focus:border-[#0D0C0B] transition-colors bg-[#FAFAF8]"
                placeholder="priya@startup.com"
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
                placeholder="Min. 8 characters"
                minLength={8}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0D0C0B] text-white py-3 rounded-lg text-[14px] font-semibold hover:bg-[#1A1714] transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Creating account...' : 'Create free account →'}
            </button>
          </form>
        </div>

        <p className="text-center text-[13px] text-[#7A7670] mt-5">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-[#0D0C0B] font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
