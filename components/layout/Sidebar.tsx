'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, Zap, Calendar, FlaskConical,
  BarChart3, Settings, LogOut, Globe,
  PieChart, ChevronRight, Users
} from 'lucide-react'

const CAPITAL_NAV = [
  { href: '/dashboard/capital', label: 'Investor Intelligence', icon: Users, badge: 'NEW' },
]

const GROWTH_NAV = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/chat', label: 'CMO Brain', icon: Zap, badge: 'AI' },
  { href: '/dashboard/content', label: 'Content Engine', icon: Calendar },
  { href: '/dashboard/analytics', label: 'Analytics', icon: PieChart },
  { href: '/dashboard/landing', label: 'Landing Builder', icon: Globe },
  { href: '/dashboard/experiments', label: 'Experiments', icon: FlaskConical },
  { href: '/dashboard/results', label: 'Results', icon: BarChart3 },
]

interface Profile {
  full_name?: string
  email?: string
  company_name?: string
  company_logo_url?: string
  avatar_url?: string
  traction_score?: number
  product?: string
}

export function Sidebar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/auth/login'
  }

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  const displayName = profile?.full_name || profile?.email?.split('@')[0] || 'Founder'
  const companyName = profile?.company_name || profile?.product?.slice(0, 22) || 'My Startup'
  const score = profile?.traction_score || 0

  const NavItem = ({ item }: { item: any }) => {
    const active = isActive(item.href, item.exact)
    return (
      <Link href={item.href}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all group ${
          active ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/80 hover:bg-white/5'
        }`}>
        <item.icon size={15} className={active ? 'text-[#FF8C1A]' : 'text-white/40 group-hover:text-white/60'} />
        <span className="flex-1">{item.label}</span>
        {item.badge && (
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
            item.badge === 'AI' ? 'bg-[#FF8C1A]/20 text-[#FF8C1A]' :
            item.badge === 'NEW' ? 'bg-green-500/20 text-green-400' :
            'bg-white/10 text-white/40'
          }`}>{item.badge}</span>
        )}
        {active && <ChevronRight size={11} className="text-white/30" />}
      </Link>
    )
  }

  return (
    <aside className="w-60 flex-shrink-0 bg-[#0D0C0B] flex flex-col h-full overflow-y-auto">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-[#FF8C1A] flex items-center justify-center flex-shrink-0">
            <span className="text-[#0D0C0B] font-black text-[14px] tracking-tight leading-none">VC</span>
          </div>
          <div>
            <p className="text-white font-bold text-[14px] leading-tight">Virtual CMO</p>
            <p className="text-white/30 text-[10px] leading-tight">Growth + Capital OS</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-5">
        {/* Capital section - FIRST */}
        <div>
          <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest px-3 mb-2">Capital</p>
          <div className="space-y-0.5">
            {CAPITAL_NAV.map(item => <NavItem key={item.href} item={item} />)}
          </div>
        </div>

        {/* Growth section */}
        <div>
          <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest px-3 mb-2">Growth</p>
          <div className="space-y-0.5">
            {GROWTH_NAV.map(item => <NavItem key={item.href} item={item} />)}
          </div>
        </div>
      </nav>

      {/* Traction score */}
      {score > 0 && (
        <div className="px-4 pb-3 flex-shrink-0">
          <div className="bg-white/5 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-wider">Traction Score</span>
              <span className="text-[13px] font-black text-[#FF8C1A]">{score}</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-[#FF8C1A] rounded-full" style={{ width: `${score}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* Settings + Profile */}
      <div className="border-t border-white/5 px-3 py-3 space-y-0.5 flex-shrink-0">
        <Link href="/dashboard/settings"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
            pathname === '/dashboard/settings' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/80 hover:bg-white/5'
          }`}>
          <Settings size={15} className="text-white/40" />
          Settings
        </Link>

        <div className="flex items-center gap-3 px-3 py-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#FF8C1A]/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {profile?.avatar_url || profile?.company_logo_url ? (
              <img src={profile.avatar_url || profile.company_logo_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[#FF8C1A] font-bold text-[11px]">{displayName[0]?.toUpperCase()}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-[12px] font-semibold truncate">{displayName}</p>
            <p className="text-white/30 text-[10px] truncate">{companyName}</p>
          </div>
          <button onClick={handleSignOut} className="text-white/20 hover:text-white/60 transition-colors" title="Sign out">
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </aside>
  )
}
