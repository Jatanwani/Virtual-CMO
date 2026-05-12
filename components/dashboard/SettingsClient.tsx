'use client'

import { useState } from 'react'
import { Profile } from '@/types/database'
import toast from 'react-hot-toast'
import { Save, User, Target, Zap } from 'lucide-react'

interface Props { profile: Profile | null }

const SECTIONS = [
  {
    id: 'personal',
    label: 'Personal',
    icon: User,
    fields: [
      { key: 'full_name', label: 'Full name', type: 'input', placeholder: 'Your name' },
    ],
  },
  {
    id: 'startup',
    label: 'Startup Profile',
    icon: Zap,
    fields: [
      { key: 'product', label: 'Product description', type: 'textarea', placeholder: 'What are you building?' },
      { key: 'problem', label: 'Problem solved', type: 'textarea', placeholder: 'What pain point do you solve?' },
      { key: 'icp', label: 'Ideal Customer Profile (ICP)', type: 'textarea', placeholder: 'Who exactly are you selling to?' },
      { key: 'stage', label: 'Current stage', type: 'select', options: ['Idea/Pre-MVP', 'MVP Built', 'Early Traction (1-10 customers)', 'Growing (10-100 customers)', 'Scaling (100+ customers)'] },
      { key: 'traction', label: 'Current traction', type: 'textarea', placeholder: 'Specific numbers: MRR, users, signups...' },
      { key: 'channels', label: 'Existing channels', type: 'textarea', placeholder: 'LinkedIn followers, email list, communities...' },
    ],
  },
  {
    id: 'goals',
    label: 'Goals & Constraints',
    icon: Target,
    fields: [
      { key: 'goal_30', label: '30-day goal', type: 'textarea', placeholder: 'Specific, measurable goal...' },
      { key: 'time_available', label: 'Daily time available', type: 'select', options: ['1-2 hours/day (side project)', '2-4 hours/day (part-time)', '4-6 hours/day (near full-time)', '6+ hours/day (full-time founder)'] },
      { key: 'budget', label: 'Monthly marketing budget', type: 'select', options: ['$0 — bootstrapped, sweat equity only', '$100–500/month', '$500–2,000/month', '$2,000–10,000/month', '$10,000+/month'] },
    ],
  },
]

export function SettingsClient({ profile }: Props) {
  const [vals, setVals] = useState<Record<string, string>>(profile as any || {})
  const [saving, setSaving] = useState(false)
  const [activeSection, setActiveSection] = useState('startup')

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vals),
      })
      if (!res.ok) throw new Error('Failed to save')
      toast.success('Profile updated!')
    } catch {
      toast.error('Failed to save changes')
    }
    setSaving(false)
  }

  const current = SECTIONS.find(s => s.id === activeSection)!

  return (
    <div className="max-w-2xl">
      {/* Section tabs */}
      <div className="flex gap-2 mb-6 bg-white border border-[#EDE9E3] rounded-xl p-1 shadow-card w-fit">
        {SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all ${activeSection === s.id ? 'bg-[#0D0C0B] text-white' : 'text-[#7A7670] hover:text-[#0D0C0B]'}`}
          >
            <s.icon size={13} />
            {s.label}
          </button>
        ))}
      </div>

      {/* Fields */}
      <div className="bg-white border border-[#EDE9E3] rounded-2xl p-6 shadow-card space-y-5">
        <h2 style={{fontFamily: 'Cabinet Grotesk, sans-serif'}} className="font-bold text-[17px] text-[#0D0C0B] mb-2">
          {current.label}
        </h2>

        {current.fields.map(field => (
          <div key={field.key}>
            <label className="block text-[11.5px] font-bold text-[#A39E96] uppercase tracking-wider mb-1.5">
              {field.label}
            </label>
            {field.type === 'textarea' ? (
              <textarea
                className="w-full px-4 py-3 border border-[#EDE9E3] rounded-xl text-[13.5px] text-[#0D0C0B] placeholder:text-[#C9C4BC] focus:outline-none focus:border-[#0D0C0B] transition-colors bg-[#FAFAF8] resize-none leading-relaxed"
                rows={3}
                placeholder={field.placeholder}
                value={vals[field.key] || ''}
                onChange={e => setVals(p => ({ ...p, [field.key]: e.target.value }))}
              />
            ) : field.type === 'select' ? (
              <select
                className="w-full px-4 py-3 border border-[#EDE9E3] rounded-xl text-[13.5px] text-[#0D0C0B] focus:outline-none focus:border-[#0D0C0B] transition-colors bg-[#FAFAF8] appearance-none"
                value={vals[field.key] || (field.options?.[0] || '')}
                onChange={e => setVals(p => ({ ...p, [field.key]: e.target.value }))}
              >
                {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <input
                className="w-full px-4 py-3 border border-[#EDE9E3] rounded-xl text-[13.5px] text-[#0D0C0B] placeholder:text-[#C9C4BC] focus:outline-none focus:border-[#0D0C0B] transition-colors bg-[#FAFAF8]"
                placeholder={field.placeholder}
                value={vals[field.key] || ''}
                onChange={e => setVals(p => ({ ...p, [field.key]: e.target.value }))}
              />
            )}
          </div>
        ))}

        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 bg-[#0D0C0B] text-white px-6 py-3 rounded-xl text-[13.5px] font-semibold hover:bg-[#1A1714] transition-all disabled:opacity-50 mt-2"
        >
          <Save size={14} />
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </div>

      {/* CMO notes */}
      <div className="mt-4 bg-[#FFF8F0] border border-[#FFD4A3] rounded-2xl p-4">
        <p className="text-[12.5px] text-[#92400E]">
          <strong>Tip:</strong> Updating your profile automatically improves your CMO&apos;s recommendations. 
          After saving, regenerate your dashboard plan to get fresh, updated tasks.
        </p>
      </div>
    </div>
  )
}
