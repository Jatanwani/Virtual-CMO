'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, Zap, Calendar, FlaskConical,
  BarChart3, Settings, LogOut, Globe,
  PieChart, ChevronRight, Users, TrendingUp
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

  const NavItem = ({ item }: { item: typeof CAPITAL_NAV[0] }) => {
    const active = isActive(item.href, (item as any).exact)
    return (
      <Link href={item.href}
        style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '9px 12px', borderRadius: '10px',
          fontSize: '13px', fontWeight: active ? '600' : '500',
          transition: 'all 0.15s',
          background: active ? 'rgba(255,140,26,0.15)' : 'transparent',
          color: active ? '#FF8C1A' : 'rgba(232,240,247,0.55)',
          textDecoration: 'none',
        }}
        onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.color = 'rgba(232,240,247,0.9)' }}
        onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(232,240,247,0.55)' } }}
      >
        <item.icon size={16} style={{ flexShrink: 0, opacity: active ? 1 : 0.7 }} />
        <span style={{ flex: 1 }}>{item.label}</span>
        {(item as any).badge && (
          <span style={{
            fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '20px',
            background: (item as any).badge === 'AI' ? 'rgba(255,140,26,0.2)' : 'rgba(77,190,107,0.2)',
            color: (item as any).badge === 'AI' ? '#FF8C1A' : '#4dbe6b',
          }}>{(item as any).badge}</span>
        )}
        {active && <ChevronRight size={12} style={{ opacity: 0.4 }} />}
      </Link>
    )
  }

  return (
    <aside style={{
      width: '240px', flexShrink: 0,
      background: '#17212b',
      borderRight: '1px solid #2b3a4a',
      display: 'flex', flexDirection: 'column',
      height: '100%', overflowY: 'auto',
    }}>
      {/* Logo */}
      <div style={{ padding: '16px', borderBottom: '1px solid #2b3a4a', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: '#FF8C1A', display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexShrink: 0,
          }}>
            <span style={{ color: '#0D0C0B', fontWeight: 900, fontSize: '13px', letterSpacing: '-0.5px' }}>VC</span>
          </div>
          <div>
            <p style={{ color: '#e8f0f7', fontWeight: 700, fontSize: '14px', lineHeight: 1.2 }}>Virtual CMO</p>
            <p style={{ color: 'rgba(232,240,247,0.35)', fontSize: '10px', lineHeight: 1.2 }}>Growth + Capital OS</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Capital */}
        <div>
          <p className="tg-section-header" style={{ color: 'rgba(232,240,247,0.3)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 12px', marginBottom: '4px' }}>Capital</p>
          {CAPITAL_NAV.map(item => <NavItem key={item.href} item={item} />)}
        </div>

        {/* Growth */}
        <div>
          <p className="tg-section-header" style={{ color: 'rgba(232,240,247,0.3)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 12px', marginBottom: '4px' }}>Growth</p>
          {GROWTH_NAV.map(item => <NavItem key={item.href} item={item} />)}
        </div>
      </nav>

      {/* Traction score */}
      {score > 0 && (
        <div style={{ padding: '8px 12px', flexShrink: 0 }}>
          <div style={{ background: 'rgba(255,140,26,0.08)', border: '1px solid rgba(255,140,26,0.15)', borderRadius: '10px', padding: '10px 12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(232,240,247,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Traction</span>
              <span style={{ fontSize: '14px', fontWeight: 900, color: '#FF8C1A' }}>{score}</span>
            </div>
            <div style={{ height: '3px', background: 'rgba(255,140,26,0.15)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${score}%`, background: '#FF8C1A', borderRadius: '3px' }} />
            </div>
          </div>
        </div>
      )}

      {/* Settings + Profile */}
      <div style={{ borderTop: '1px solid #2b3a4a', padding: '8px', flexShrink: 0 }}>
        <Link href="/dashboard/settings" style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '9px 12px', borderRadius: '10px', textDecoration: 'none',
          color: pathname === '/dashboard/settings' ? '#FF8C1A' : 'rgba(232,240,247,0.5)',
          background: pathname === '/dashboard/settings' ? 'rgba(255,140,26,0.12)' : 'transparent',
          fontSize: '13px', fontWeight: 500, transition: 'all 0.15s',
        }}>
          <Settings size={16} style={{ opacity: 0.7 }} />
          Settings
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', marginTop: '2px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #FF8C1A, #e67300)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, fontSize: '13px', fontWeight: 700, color: 'white',
            overflow: 'hidden',
          }}>
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : displayName[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: '#e8f0f7', fontSize: '13px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</p>
            <p style={{ color: 'rgba(232,240,247,0.35)', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{companyName}</p>
          </div>
          <button onClick={handleSignOut} title="Sign out"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(232,240,247,0.25)', padding: '4px', borderRadius: '6px', display: 'flex', transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#e05c5c')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(232,240,247,0.25)')}>
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}
