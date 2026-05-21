'use client'

import { useState } from 'react'
import { Profile } from '@/types/database'
import toast from 'react-hot-toast'
import { Save, User, Target, Zap, Building2 } from 'lucide-react'

interface Props { profile: Profile | null }

const SECTIONS = [
  { id: 'company', label: 'Company', icon: Building2 },
  { id: 'founder', label: 'Founder', icon: User },
  { id: 'startup', label: 'CMO Context', icon: Zap },
  { id: 'goals', label: 'Goals', icon: Target },
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

      {/* COMPANY */}
      {activeSection === 'company' && (
        <div className="bg-white border border-[#EDE9E3] rounded-2xl p-6 space-y-5">
          <h2 className="font-bold text-[17px] text-[#0D0C0B]">Company Details</h2>
          <Field label="Company Name" value={vals.company_name} onChange={v => set('company_name', v)} placeholder="e.g. TalentFlow Inc." />
          <Field label="Website URL" value={vals.website} onChange={v => set('website', v)} placeholder="https://yoursite.com" />
          <Field label="Company Logo URL" value={vals.company_logo_url} onChange={v => set('company_logo_url', v)} placeholder="https://..." />
          {vals.company_logo_url && (
            <img src={vals.company_logo_url} alt="Logo" className="h-12 w-auto rounded-lg border border-[#EDE9E3] object-contain" />
          )}
          <div>
            <label className="block text-[11.5px] font-bold text-[#A39E96] uppercase tracking-wider mb-1.5">Team Size</label>
            <select className={selectClass} value={vals.team_size || '1 (Solo founder)'} onChange={e => set('team_size', e.target.value)}>
              {['1 (Solo founder)', '2-5 (Small team)', '6-10', '11-25', '25+'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <SaveButton saving={saving} onClick={save} />
        </div>
      )}

      {/* FOUNDER */}
      {activeSection === 'founder' && (
        <div className="bg-white border border-[#EDE9E3] rounded-2xl p-6 space-y-5">
          <h2 className="font-bold text-[17px] text-[#0D0C0B]">Founder Details</h2>
          <Field label="Full Name" value={vals.full_name} onChange={v => set('full_name', v)} placeholder="Your name" />
          <Field label="Email" value={vals.founder_email} onChange={v => set('founder_email', v)} placeholder="you@startup.com" type="email" />
          <div className="pt-2 border-t border-[#EDE9E3]">
            <p className="text-[12px] font-bold text-[#A39E96] uppercase tracking-wider mb-3">Your Social Profiles</p>
            <div className="space-y-3">
              <Field label="LinkedIn URL" value={vals.linkedin_url} onChange={v => set('linkedin_url', v)} placeholder="https://linkedin.com/in/yourname" />
              <Field label="Twitter / X URL" value={vals.twitter_url} onChange={v => set('twitter_url', v)} placeholder="https://x.com/yourhandle" />
            </div>
          </div>
          <SaveButton saving={saving} onClick={save} />
        </div>
      )}

      {/* CMO CONTEXT */}
      {activeSection === 'startup' && (
        <div className="bg-white border border-[#EDE9E3] rounded-2xl p-6 space-y-5">
          <h2 className="font-bold text-[17px] text-[#0D0C0B]">CMO Brain Context</h2>
          <p className="text-[13px] text-[#7A7670]">This data powers your CMO Brain. The more specific, the better the strategy.</p>
          <TextArea label="Product Description" value={vals.product} onChange={v => set('product', v)} placeholder="What are you building? Be specific." />
          <TextArea label="Problem You Solve" value={vals.problem} onChange={v => set('problem', v)} placeholder="What exact pain does it fix? Who feels it most?" />
          <TextArea label="Ideal Customer Profile (ICP)" value={vals.icp} onChange={v => set('icp', v)} placeholder="Job title, company size, industry, pain points..." />
          <TextArea label="Current Traction" value={vals.traction} onChange={v => set('traction', v)} placeholder="MRR, users, signups — be specific" />
          <TextArea label="Existing Channels" value={vals.channels} onChange={v => set('channels', v)} placeholder="LinkedIn followers, email list, communities..." />
          <div>
            <label className="block text-[11.5px] font-bold text-[#A39E96] uppercase tracking-wider mb-1.5">Current Stage</label>
            <select className={selectClass} value={vals.stage || 'Idea/Pre-MVP'} onChange={e => set('stage', e.target.value)}>
              {['Idea/Pre-MVP', 'MVP Built', 'Early Traction (1-10 customers)', 'Growing (10-100 customers)', 'Scaling (100+ customers)'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="bg-[#FFF8F0] border border-[#FFD4A3] rounded-xl p-3">
            <p className="text-[12px] text-[#92400E]">After saving, regenerate your strategy in CMO Brain to get updated recommendations.</p>
          </div>
          <SaveButton saving={saving} onClick={save} />
        </div>
      )}

      {/* GOALS */}
      {activeSection === 'goals' && (
        <div className="bg-white border border-[#EDE9E3] rounded-2xl p-6 space-y-5">
          <h2 className="font-bold text-[17px] text-[#0D0C0B]">Goals & Constraints</h2>
          <TextArea label="30-Day Primary Goal" value={vals.goal_30} onChange={v => set('goal_30', v)} placeholder="Specific, measurable: e.g. Get 50 paying customers at $99/month" />
          <div>
            <label className="block text-[11.5px] font-bold text-[#A39E96] uppercase tracking-wider mb-1.5">Daily Time for Marketing</label>
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
    </div>
  )
}

const inputClass = "w-full px-4 py-3 border border-[#EDE9E3] rounded-xl text-[13.5px] text-[#0D0C0B] placeholder:text-[#C9C4BC] focus:outline-none focus:border-[#0D0C0B] transition-colors bg-[#FAFAF8]"
const selectClass = "w-full px-4 py-3 border border-[#EDE9E3] rounded-xl text-[13.5px] text-[#0D0C0B] focus:outline-none focus:border-[#0D0C0B] transition-colors bg-[#FAFAF8]"

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
