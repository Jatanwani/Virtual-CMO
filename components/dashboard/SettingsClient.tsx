'use client'

import { useState } from 'react'
import { Profile } from '@/types/database'
import toast from 'react-hot-toast'
import { Save, User, Target, Zap, Link2, Building2, Check, ExternalLink } from 'lucide-react'

interface Props { profile: Profile | null }

const SECTIONS = [
  { id: 'company', label: 'Company', icon: Building2 },
  { id: 'founder', label: 'Founder', icon: User },
  { id: 'startup', label: 'CMO Context', icon: Zap },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'social', label: 'Social Connections', icon: Link2 },
]

const SOCIAL_PLATFORMS = [
  {
    id: 'linkedin',
    label: 'LinkedIn',
    color: 'bg-blue-600',
    icon: '💼',
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    description: 'Connect to auto-post to your LinkedIn profile or company page',
  },
  {
    id: 'twitter',
    label: 'X (Twitter)',
    color: 'bg-black',
    icon: '𝕏',
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    description: 'Connect to auto-post tweets and threads',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    color: 'bg-gradient-to-r from-pink-500 to-purple-500',
    icon: '📸',
    authUrl: 'https://api.instagram.com/oauth/authorize',
    description: 'Connect via Meta Business Suite to auto-post',
  },
  {
    id: 'facebook',
    label: 'Facebook',
    color: 'bg-blue-700',
    icon: '👥',
    authUrl: 'https://www.facebook.com/dialog/oauth',
    description: 'Connect to auto-post to your Facebook page',
  },
]

export function SettingsClient({ profile }: Props) {
  const [vals, setVals] = useState<Record<string, string>>(profile as any || {})
  const [saving, setSaving] = useState(false)
  const [activeSection, setActiveSection] = useState('company')

  const set = (key: string, value: string) => setVals(p => ({ ...p, [key]: value }))

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vals),
      })
      if (!res.ok) throw new Error('Failed')
      toast.success('Settings saved! Your CMO brain has been updated.')
    } catch {
      toast.error('Failed to save changes')
    }
    setSaving(false)
  }

  const isConnected = (platform: string) => vals[`${platform}_connected`] === 'true' || (profile as any)?.[`${platform}_connected`]

  const connectSocial = (platform: string) => {
    // In production this would start OAuth flow
    // For now save the handle and mark as connected
    const handle = vals[`${platform}_handle`]
    if (!handle) {
      toast.error(`Enter your ${platform} handle first`)
      return
    }
    setVals(p => ({ ...p, [`${platform}_connected`]: 'true' }))
    toast.success(`${platform} connected! Auto-posting enabled.`)
  }

  const disconnectSocial = (platform: string) => {
    setVals(p => ({ ...p, [`${platform}_connected`]: 'false' }))
    toast.success(`${platform} disconnected`)
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Section tabs */}
      <div className="flex flex-wrap gap-2">
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all border ${
              activeSection === s.id
                ? 'bg-[#0D0C0B] text-white border-[#0D0C0B]'
                : 'bg-white text-[#7A7670] border-[#EDE9E3] hover:border-[#C9C4BC]'
            }`}>
            <s.icon size={13} />
            {s.label}
          </button>
        ))}
      </div>

      {/* ── COMPANY ──────────────────────────────────────────────── */}
      {activeSection === 'company' && (
        <div className="bg-white border border-[#EDE9E3] rounded-2xl p-6 space-y-5">
          <h2 className="font-bold text-[17px] text-[#0D0C0B]">Company Details</h2>

          <Field label="Company Name" value={vals.company_name} onChange={v => set('company_name', v)} placeholder="e.g. TalentFlow Inc." />
          <Field label="Website URL" value={vals.website} onChange={v => set('website', v)} placeholder="https://yoursite.com" />
          <Field label="Company Logo URL" value={vals.company_logo_url} onChange={v => set('company_logo_url', v)} placeholder="https://..." />
          {vals.company_logo_url && (
            <img src={vals.company_logo_url} alt="Logo preview" className="h-12 w-auto rounded-lg border border-[#EDE9E3] object-contain" />
          )}

          <div>
            <label className="block text-[11.5px] font-bold text-[#A39E96] uppercase tracking-wider mb-1.5">Team Size</label>
            <select className={selectClass} value={vals.team_size || '1 (Solo)'} onChange={e => set('team_size', e.target.value)}>
              {['1 (Solo founder)', '2-5 (Small team)', '6-10', '11-25', '25+'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>

          <SaveButton saving={saving} onClick={save} />
        </div>
      )}

      {/* ── FOUNDER ──────────────────────────────────────────────── */}
      {activeSection === 'founder' && (
        <div className="bg-white border border-[#EDE9E3] rounded-2xl p-6 space-y-5">
          <h2 className="font-bold text-[17px] text-[#0D0C0B]">Founder Details</h2>

          <Field label="Full Name" value={vals.full_name} onChange={v => set('full_name', v)} placeholder="Your name" />
          <Field label="Email" value={vals.founder_email} onChange={v => set('founder_email', v)} placeholder="you@startup.com" type="email" />
          <Field label="Phone / WhatsApp" value={vals.founder_phone} onChange={v => set('founder_phone', v)} placeholder="+91 98765 43210" />

          <div className="pt-2 border-t border-[#EDE9E3]">
            <p className="text-[12px] font-bold text-[#A39E96] uppercase tracking-wider mb-3">Social Profiles</p>
            <div className="space-y-3">
              <Field label="LinkedIn URL" value={vals.linkedin_url} onChange={v => set('linkedin_url', v)} placeholder="https://linkedin.com/in/yourname" />
              <Field label="Twitter / X URL" value={vals.twitter_url} onChange={v => set('twitter_url', v)} placeholder="https://twitter.com/yourhandle" />
              <Field label="Instagram URL" value={vals.instagram_url} onChange={v => set('instagram_url', v)} placeholder="https://instagram.com/yourhandle" />
            </div>
          </div>

          <SaveButton saving={saving} onClick={save} />
        </div>
      )}

      {/* ── CMO CONTEXT ──────────────────────────────────────────── */}
      {activeSection === 'startup' && (
        <div className="bg-white border border-[#EDE9E3] rounded-2xl p-6 space-y-5">
          <h2 className="font-bold text-[17px] text-[#0D0C0B]">CMO Brain Context</h2>
          <p className="text-[13px] text-[#7A7670]">This data feeds your CMO Brain. The more specific, the better the strategy.</p>

          <TextArea label="Product Description" value={vals.product} onChange={v => set('product', v)} placeholder="What are you building? Be specific." />
          <TextArea label="Problem You Solve" value={vals.problem} onChange={v => set('problem', v)} placeholder="What exact pain point does it fix? Who feels this pain most?" />
          <TextArea label="Ideal Customer Profile (ICP)" value={vals.icp} onChange={v => set('icp', v)} placeholder="Job title, company size, industry, pain, where they hang out online..." />
          <TextArea label="Current Traction" value={vals.traction} onChange={v => set('traction', v)} placeholder="Be specific: MRR, users, signups, conversations had..." />
          <TextArea label="Existing Channels & Audience" value={vals.channels} onChange={v => set('channels', v)} placeholder="LinkedIn followers, email list, communities, partnerships..." />

          <div>
            <label className="block text-[11.5px] font-bold text-[#A39E96] uppercase tracking-wider mb-1.5">Current Stage</label>
            <select className={selectClass} value={vals.stage || 'Idea/Pre-MVP'} onChange={e => set('stage', e.target.value)}>
              {['Idea/Pre-MVP', 'MVP Built', 'Early Traction (1-10 customers)', 'Growing (10-100 customers)', 'Scaling (100+ customers)'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>

          <div className="bg-[#FFF8F0] border border-[#FFD4A3] rounded-xl p-3">
            <p className="text-[12px] text-[#92400E]">💡 After saving, go to CMO Brain and regenerate your strategy to get updated recommendations.</p>
          </div>

          <SaveButton saving={saving} onClick={save} />
        </div>
      )}

      {/* ── GOALS ────────────────────────────────────────────────── */}
      {activeSection === 'goals' && (
        <div className="bg-white border border-[#EDE9E3] rounded-2xl p-6 space-y-5">
          <h2 className="font-bold text-[17px] text-[#0D0C0B]">Goals & Constraints</h2>

          <TextArea label="30-Day Primary Goal" value={vals.goal_30} onChange={v => set('goal_30', v)} placeholder="Specific, measurable: e.g. Get 50 paying customers at $99/month = $4,950 MRR" />

          <div>
            <label className="block text-[11.5px] font-bold text-[#A39E96] uppercase tracking-wider mb-1.5">Daily Time Available for Marketing</label>
            <select className={selectClass} value={vals.time_available || '2-4 hours/day (part-time)'} onChange={e => set('time_available', e.target.value)}>
              {['1-2 hours/day (side project)', '2-4 hours/day (part-time)', '4-6 hours/day (near full-time)', '6+ hours/day (full-time founder)'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[11.5px] font-bold text-[#A39E96] uppercase tracking-wider mb-1.5">Monthly Marketing Budget</label>
            <select className={selectClass} value={vals.budget || '$0 — bootstrapped'} onChange={e => set('budget', e.target.value)}>
              {['$0 — bootstrapped, sweat equity only', '$100–500/month', '$500–2,000/month', '$2,000–10,000/month', '$10,000+/month'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>

          <SaveButton saving={saving} onClick={save} />
        </div>
      )}

      {/* ── SOCIAL CONNECTIONS ───────────────────────────────────── */}
      {activeSection === 'social' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#EDE9E3] rounded-2xl p-6">
            <h2 className="font-bold text-[17px] text-[#0D0C0B] mb-1">Social Media Connections</h2>
            <p className="text-[13px] text-[#7A7670] mb-5">Connect your accounts to enable auto-posting from the Scheduler.</p>

            <div className="space-y-4">
              {SOCIAL_PLATFORMS.map(platform => {
                const connected = isConnected(platform.id)
                return (
                  <div key={platform.id} className={`border rounded-2xl p-5 transition-all ${connected ? 'border-green-200 bg-green-50' : 'border-[#EDE9E3] bg-white'}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${platform.color} rounded-xl flex items-center justify-center text-white text-lg`}>
                          {platform.icon}
                        </div>
                        <div>
                          <p className="font-semibold text-[#0D0C0B] text-[14px]">{platform.label}</p>
                          <p className="text-[12px] text-[#7A7670]">{platform.description}</p>
                        </div>
                      </div>
                      {connected ? (
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 text-green-600 text-[12px] font-semibold">
                            <Check size={12} /> Connected
                          </span>
                          <button onClick={() => disconnectSocial(platform.id)}
                            className="text-[11px] text-red-400 hover:text-red-600 ml-2">
                            Disconnect
                          </button>
                        </div>
                      ) : (
                        <span className="text-[12px] text-[#A39E96] font-medium">Not connected</span>
                      )}
                    </div>

                    {!connected && (
                      <div className="mt-4 flex gap-2">
                        <input
                          type="text"
                          placeholder={`Your @${platform.id} handle`}
                          value={vals[`${platform.id}_handle`] || ''}
                          onChange={e => set(`${platform.id}_handle`, e.target.value)}
                          className="flex-1 px-3 py-2 border border-[#EDE9E3] rounded-lg text-[13px] focus:outline-none focus:border-[#0D0C0B]"
                        />
                        <button onClick={() => connectSocial(platform.id)}
                          className="bg-[#0D0C0B] text-white px-4 py-2 rounded-lg text-[12px] font-semibold hover:bg-[#1A1714] transition-colors whitespace-nowrap">
                          Connect →
                        </button>
                      </div>
                    )}

                    {connected && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-[12px] text-[#7A7670]">Handle: @{vals[`${platform.id}_handle`] || 'connected'}</span>
                        <a href={`https://${platform.id}.com/${vals[`${platform.id}_handle`] || ''}`} target="_blank" rel="noopener noreferrer"
                          className="text-[12px] text-blue-500 flex items-center gap-1">
                          <ExternalLink size={10} /> View profile
                        </a>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-[#FFF8F0] border border-[#FFD4A3] rounded-2xl p-4">
            <p className="text-[12.5px] text-[#92400E]">
              <strong>Note:</strong> Full OAuth auto-posting requires LinkedIn Developer, Twitter Developer, and Meta Developer app approval.
              For now, connecting saves your handle so the Scheduler knows where to post. Direct API posting will be enabled once OAuth apps are approved.
            </p>
          </div>

          <SaveButton saving={saving} onClick={save} />
        </div>
      )}
    </div>
  )
}

// ─── Reusable field components ────────────────────────────────────────────────
const inputClass = "w-full px-4 py-3 border border-[#EDE9E3] rounded-xl text-[13.5px] text-[#0D0C0B] placeholder:text-[#C9C4BC] focus:outline-none focus:border-[#0D0C0B] transition-colors bg-[#FAFAF8]"
const selectClass = "w-full px-4 py-3 border border-[#EDE9E3] rounded-xl text-[13.5px] text-[#0D0C0B] focus:outline-none focus:border-[#0D0C0B] transition-colors bg-[#FAFAF8] appearance-none"

function Field({ label, value, onChange, placeholder, type = 'text' }: { label: string; value?: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="block text-[11.5px] font-bold text-[#A39E96] uppercase tracking-wider mb-1.5">{label}</label>
      <input type={type} className={inputClass} placeholder={placeholder} value={value || ''} onChange={e => onChange(e.target.value)} />
    </div>
  )
}

function TextArea({ label, value, onChange, placeholder }: { label: string; value?: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="block text-[11.5px] font-bold text-[#A39E96] uppercase tracking-wider mb-1.5">{label}</label>
      <textarea className={`${inputClass} resize-none leading-relaxed`} rows={3} placeholder={placeholder} value={value || ''} onChange={e => onChange(e.target.value)} />
    </div>
  )
}

function SaveButton({ saving, onClick }: { saving: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} disabled={saving}
      className="flex items-center gap-2 bg-[#0D0C0B] text-white px-6 py-3 rounded-xl text-[13.5px] font-semibold hover:bg-[#1A1714] transition-all disabled:opacity-50">
      <Save size={14} />
      {saving ? 'Saving...' : 'Save Changes'}
    </button>
  )
}
