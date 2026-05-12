'use client'

import { usePathname } from 'next/navigation'
import { Profile } from '@/types/database'
import { format } from 'date-fns'

const PAGE_TITLES: Record<string, { title: string; sub: string }> = {
  '/dashboard': { title: 'Dashboard', sub: 'Your growth command center' },
  '/dashboard/chat': { title: 'CMO Brain', sub: 'AI strategy advisor — ask anything' },
  '/dashboard/content': { title: 'Content Engine', sub: 'Auto-generated content calendar' },
  '/dashboard/experiments': { title: 'Experiment Tracker', sub: 'Hypothesis → execution → learning' },
  '/dashboard/results': { title: 'Results & Feedback', sub: 'Submit work, get CMO analysis' },
  '/dashboard/settings': { title: 'Settings', sub: 'Manage your founder profile' },
}

export function TopBar({ profile }: { profile: Profile }) {
  const pathname = usePathname()
  const page = PAGE_TITLES[pathname] || { title: 'CMO OS', sub: '' }
  const today = format(new Date(), 'EEEE, MMMM d')

  return (
    <div className="h-[60px] bg-[#F5F3EF] border-b border-[#EDE9E3] px-8 flex items-center justify-between flex-shrink-0">
      <div>
        <h1 style={{fontFamily: 'Cabinet Grotesk, sans-serif'}} className="text-[17px] font-bold text-[#0D0C0B] leading-none">
          {page.title}
        </h1>
        <p className="text-[12px] text-[#A39E96] mt-0.5">{page.sub}</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-[12px] font-medium text-[#524F4A]">{today}</p>
          <p className="text-[11px] text-[#A39E96]">
            Goal: <span className="text-[#0D0C0B] font-medium">{profile.goal_30?.slice(0, 40) || 'Not set'}...</span>
          </p>
        </div>
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#FF8C1A] to-[#E67300] flex items-center justify-center text-white font-bold text-[10px]">
          {(profile.full_name || profile.email || 'U').slice(0, 1).toUpperCase()}
        </div>
      </div>
    </div>
  )
}
