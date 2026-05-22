'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, Zap, Calendar, FlaskConical, BarChart3, Settings, LogOut, Globe, PieChart, Users } from 'lucide-react'

const CAPITAL_NAV = [
  { href: '/dashboard/capital', label: 'Investor Intelligence', icon: Users, badge: 'LIVE' },
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

interface Profile { full_name?: string; email?: string; company_name?: string; avatar_url?: string; traction_score?: number; product?: string }

export function Sidebar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname()
  const handleSignOut = async () => { const s = createClient(); await s.auth.signOut(); window.location.href = '/auth/login' }
  const isActive = (href: string, exact?: boolean) => exact ? pathname === href : pathname.startsWith(href)
  const displayName = profile?.full_name || profile?.email?.split('@')[0] || 'Founder'
  const companyName = profile?.company_name || profile?.product?.slice(0, 20) || 'My Startup'
  const score = profile?.traction_score || 0

  return (
    <aside style={{ width: '220px', flexShrink: 0, background: '#0a0a0f', borderRight: '1px solid #1e2a4a', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>

      {/* Logo */}
      <div style={{ padding: '18px 16px', borderBottom: '1px solid #1e2a4a', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#FF8C1A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 12px rgba(255,140,26,0.4)' }}>
          <span style={{ color: '#0a0a0f', fontWeight: 900, fontSize: '12px', letterSpacing: '-0.5px' }}>VC</span>
        </div>
        <div>
          <p style={{ color: '#e8eaf6', fontWeight: 700, fontSize: '13px', lineHeight: 1.2 }}>Virtual CMO</p>
          <p style={{ color: 'rgba(0,212,255,0.5)', fontSize: '10px', lineHeight: 1.3 }}>Growth + Capital OS</p>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {[{ label: 'Capital', items: CAPITAL_NAV }, { label: 'Growth', items: GROWTH_NAV }].map(section => (
          <div key={section.label}>
            <p style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#2a3a6a', padding: '0 10px', marginBottom: '4px' }}>{section.label}</p>
            {section.items.map((item: any) => {
              const active = isActive(item.href, item.exact)
              return (
                <Link key={item.href} href={item.href} style={{
                  display: 'flex', alignItems: 'center', gap: '9px',
                  padding: '8px 10px', borderRadius: '8px', marginBottom: '1px',
                  fontSize: '13px', fontWeight: active ? 600 : 400,
                  textDecoration: 'none', transition: 'all 0.15s',
                  background: active ? 'rgba(0,212,255,0.08)' : 'transparent',
                  color: active ? '#00d4ff' : 'rgba(232,234,246,0.45)',
                  borderLeft: active ? '2px solid #00d4ff' : '2px solid transparent',
                }}>
                  <item.icon size={15} style={{ flexShrink: 0 }} />
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.badge && (
                    <span style={{
                      fontSize: '8px', fontWeight: 700, padding: '1px 5px', borderRadius: '20px',
                      background: item.badge === 'AI' ? 'rgba(255,140,26,0.15)' : item.badge === 'LIVE' ? 'rgba(0,255,136,0.12)' : 'rgba(0,212,255,0.12)',
                      color: item.badge === 'AI' ? '#FF8C1A' : item.badge === 'LIVE' ? '#00ff88' : '#00d4ff',
                      border: `1px solid ${item.badge === 'AI' ? 'rgba(255,140,26,0.2)' : item.badge === 'LIVE' ? 'rgba(0,255,136,0.2)' : 'rgba(0,212,255,0.2)'}`,
                    }}>{item.badge}</span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Traction */}
      {score > 0 && (
        <div style={{ padding: '0 10px 8px', flexShrink: 0 }}>
          <div style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.1)', borderRadius: '10px', padding: '10px 12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#2a3a6a' }}>Traction Score</span>
              <span style={{ fontSize: '13px', fontWeight: 900, color: '#FF8C1A' }}>{score}</span>
            </div>
            <div style={{ height: '2px', background: '#1e2a4a', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${score}%`, background: 'linear-gradient(90deg, #FF8C1A, #00d4ff)', borderRadius: '2px' }} />
            </div>
          </div>
        </div>
      )}

      {/* Bottom */}
      <div style={{ borderTop: '1px solid #1e2a4a', padding: '8px', flexShrink: 0 }}>
        <Link href="/dashboard/settings" style={{
          display: 'flex', alignItems: 'center', gap: '9px', padding: '8px 10px', borderRadius: '8px',
          textDecoration: 'none', fontSize: '13px', transition: 'all 0.15s', marginBottom: '2px',
          background: pathname === '/dashboard/settings' ? 'rgba(0,212,255,0.08)' : 'transparent',
          color: pathname === '/dashboard/settings' ? '#00d4ff' : 'rgba(232,234,246,0.4)',
        }}>
          <Settings size={15} />
          Settings
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '8px 10px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg,#FF8C1A,#e67300)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '11px', fontWeight: 700, color: 'white', overflow: 'hidden' }}>
            {profile?.avatar_url ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : displayName[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: '#e8eaf6', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</p>
            <p style={{ color: 'rgba(232,234,246,0.3)', fontSize: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{companyName}</p>
          </div>
          <button onClick={handleSignOut} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(232,234,246,0.2)', padding: '4px', display: 'flex', transition: 'color 0.15s' }} title="Sign out"
            onMouseEnter={e => (e.currentTarget.style.color = '#ff4757')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(232,234,246,0.2)')}>
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </aside>
  )
}
