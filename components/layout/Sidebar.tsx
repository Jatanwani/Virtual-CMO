'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Profile } from '@/types/database'
import {
  LayoutDashboard, Zap, Calendar, FlaskConical, 
  BarChart3, Settings, LogOut, TrendingUp
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Overview & tasks' },
  { href: '/dashboard/chat', label: 'CMO Brain', icon: Zap, description: 'AI strategy chat', badge: 'AI' },
  { href: '/dashboard/content', label: 'Content Engine', icon: Calendar, description: 'Auto-generated calendar' },
  { href: '/dashboard/experiments', label: 'Experiments', icon: FlaskConical, description: 'Growth hypothesis tracker' },
  { href: '/dashboard/results', label: 'Results', icon: BarChart3, description: 'Submit & get feedback' },
]

interface SidebarProps {
  profile: Profile
}

export function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const score = profile.traction_score || 0
  const initials = (profile.full_name || profile.email || 'U')
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="w-[240px] h-full bg-[#0D0C0B] flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/8">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#FF8C1A] rounded-lg flex items-center justify-center flex-shrink-0">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L12 4.5V10L7 13L2 10V4.5L7 1Z" fill="white"/>
            </svg>
          </div>
          <div>
            <p style={{fontFamily: 'Cabinet Grotesk, sans-serif'}} className="text-white font-bold text-[13.5px] leading-none">Virtual CMO OS</p>
            <p className="text-white/30 text-[10px] mt-0.5">Growth Brain</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <div className="text-[10px] font-semibold text-white/25 uppercase tracking-widest px-2 mb-3">
          Navigation
        </div>

        {NAV_ITEMS.map(item => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                active
                  ? 'bg-white/10 text-white'
                  : 'text-white/45 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#FF8C1A] rounded-r-full" />
              )}
              <item.icon size={15} className={active ? 'text-[#FF8C1A]' : ''} />
              <span className="text-[13px] font-medium flex-1">{item.label}</span>
              {item.badge && (
                <span className="text-[9px] font-bold bg-[#FF8C1A]/20 text-[#FF8C1A] px-1.5 py-0.5 rounded uppercase tracking-wide">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}

        <div className="text-[10px] font-semibold text-white/25 uppercase tracking-widest px-2 mt-5 mb-3">
          Account
        </div>
        <Link
          href="/dashboard/settings"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
            pathname === '/dashboard/settings'
              ? 'bg-white/10 text-white'
              : 'text-white/45 hover:text-white/80 hover:bg-white/5'
          }`}
        >
          <Settings size={15} />
          <span className="text-[13px] font-medium">Settings</span>
        </Link>
      </nav>

      {/* Traction Score */}
      <div className="px-4 pb-3">
        <div className="bg-white/5 border border-white/8 rounded-xl p-3.5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <TrendingUp size={12} className="text-[#FF8C1A]" />
              <span className="text-[11px] font-semibold text-white/50 uppercase tracking-wide">Traction Score</span>
            </div>
            <span style={{fontFamily: 'Cabinet Grotesk, sans-serif'}} className="text-white font-black text-[18px]">
              {score}<span className="text-white/30 text-[12px] font-normal">/100</span>
            </span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#FF8C1A] to-[#E67300] rounded-full transition-all duration-1000"
              style={{ width: `${score}%` }}
            />
          </div>
          <p className="text-[10.5px] text-white/25 mt-2">
            {score < 30 ? 'Just getting started' : score < 60 ? 'Building momentum' : score < 80 ? 'Strong execution' : 'Elite performer'}
          </p>
        </div>
      </div>

      {/* Profile */}
      <div className="px-4 pb-5 border-t border-white/8 pt-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF8C1A] to-[#E67300] flex items-center justify-center text-white font-bold text-[11px] flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12.5px] font-semibold text-white truncate">{profile.full_name || 'Founder'}</p>
            <p className="text-[11px] text-white/30 truncate">{profile.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-white/30 hover:text-white/70 transition-colors p-1"
            title="Sign out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
