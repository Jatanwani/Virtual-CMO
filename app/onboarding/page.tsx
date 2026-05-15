'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'

const STEPS = [
  {
    id: 'product',
    title: "What are you building?",
    subtitle: "Tell your CMO about your startup",
    fields: [
      { key: 'product', label: 'Describe your product', type: 'textarea', placeholder: 'e.g. A B2B SaaS tool that helps HR teams automate employee onboarding...' },
      { key: 'problem', label: 'What core problem does it solve?', type: 'textarea', placeholder: 'e.g. HR teams spend 40+ hours per new hire on repetitive onboarding tasks...' },
    ],
  },
  {
    id: 'audience',
    title: "Who are you selling to?",
    subtitle: "Precision here = better strategy",
    fields: [
      { key: 'icp', label: 'Exact target customer (ICP)', type: 'textarea', placeholder: 'e.g. HR Managers at B2B tech startups, 20-200 employees, Series A-B...' },
      { key: 'stage', label: 'Current stage', type: 'select', options: ['Idea/Pre-MVP', 'MVP Built', 'Early Traction (1-10 customers)', 'Growing (10-100 customers)', 'Scaling (100+ customers)'] },
    ],
  },
  {
    id: 'traction',
    title: "Where are you right now?",
    subtitle: "Honest numbers. No judgment.",
    fields: [
      { key: 'traction', label: 'Current traction (be specific)', type: 'textarea', placeholder: 'e.g. 0 paying customers, 180 waitlist signups, $0 MRR...' },
      { key: 'channels', label: 'Existing audience/channels', type: 'textarea', placeholder: 'e.g. 800 LinkedIn followers, 200 email subscribers...' },
    ],
  },
  {
    id: 'goals',
    title: "What does winning look like?",
    subtitle: "Set your 30-day target",
    fields: [
      { key: 'goal_30', label: 'Primary goal for next 30 days', type: 'textarea', placeholder: 'e.g. Reach $5,000 MRR with 50 paying customers at $99/month.' },
      { key: 'time_available', label: 'Hours available for marketing daily', type: 'select', options: ['1-2 hours/day (side project)', '2-4 hours/day (part-time)', '4-6 hours/day (near full-time)', '6+ hours/day (full-time founder)'] },
      { key: 'budget', label: 'Monthly marketing budget', type: 'select', options: ['$0 — bootstrapped, sweat equity only', '$100–500/month', '$500–2,000/month', '$2,000–10,000/month', '$10,000+/month'] },
    ],
  },
]

type FormData = Record<string, string>

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<FormData>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const currentStep = STEPS[step]
  const isLastStep = step === STEPS.length - 1
  const progress = ((step + 1) / STEPS.length) * 100

  const canProceed = currentStep.fields.every(f => {
    if (f.type === 'select') return true
    return (data[f.key]?.trim().length ?? 0) > 10
  })

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Not logged in. Please sign in again.')
        setLoading(false)
        window.location.href = '/auth/login'
        return
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          ...data,
          onboarded: true,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' })

      if (updateError) throw updateError

      window.location.href = '/dashboard'
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-80 bg-[#0D0C0B] flex-col p-10">
        <div className="flex items-center gap-2 mb-16">
          <div className="w-7 h-7 bg-[#FF8C1A] rounded-lg flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L12 4.5V10L7 13L2 10V4.5L7 1Z" fill="white"/>
            </svg>
          </div>
          <span className="font-bold text-white text-[15px]">Virtual CMO OS</span>
        </div>

        <div className="flex-1 space-y-6">
          {STEPS.map((s, i) => (
            <div key={s.id} className={`flex items-start gap-3 transition-all ${i === step ? 'opacity-100' : i < step ? 'opacity-50' : 'opacity-25'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[11px] font-bold ${i < step ? 'bg-[#FF8C1A]' : i === step ? 'bg-white' : 'bg-white/10'}`}>
                {i < step ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#0D0C0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                ) : (
                  <span className={i === step ? 'text-[#0D0C0B]' : 'text-white/60'}>{i + 1}</span>
                )}
              </div>
              <div>
                <p className={`text-[13px] font-semibold ${i === step ? 'text-white' : 'text-white/60'}`}>{s.title}</p>
                <p className="text-[12px] text-white/40 mt-0.5">{s.subtitle}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-[12px] text-white/30">Takes about 3 minutes.<br/>Your CMO needs this to build your plan.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col">
        <div className="h-1 bg-[#EDE9E3]">
          <div className="h-full bg-[#FF8C1A] transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-lg">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <div className="mb-8">
                  <div className="text-[12px] font-semibold text-[#A39E96] uppercase tracking-widest mb-3">
                    Step {step + 1} of {STEPS.length}
                  </div>
                  <h2 className="text-4xl font-black text-[#0D0C0B] leading-tight mb-2">{currentStep.title}</h2>
                  <p className="text-[#7A7670] text-[15px]">{currentStep.subtitle}</p>
                </div>

                <div className="space-y-5">
                  {currentStep.fields.map(field => (
                    <div key={field.key}>
                      <label className="block text-[12.5px] font-semibold text-[#524F4A] mb-2 uppercase tracking-wide">
                        {field.label}
                      </label>
                      {field.type === 'textarea' ? (
                        <textarea
                          className="w-full px-4 py-3 border border-[#EDE9E3] rounded-xl text-[14px] text-[#0D0C0B] placeholder:text-[#C9C4BC] focus:outline-none focus:border-[#0D0C0B] transition-colors bg-white resize-none leading-relaxed"
                          rows={3}
                          placeholder={field.placeholder}
                          value={data[field.key] || ''}
                          onChange={e => setData(p => ({ ...p, [field.key]: e.target.value }))}
                        />
                      ) : (
                        <select
                          className="w-full px-4 py-3 border border-[#EDE9E3] rounded-xl text-[14px] text-[#0D0C0B] focus:outline-none focus:border-[#0D0C0B] transition-colors bg-white"
                          value={data[field.key] || (field.options && field.options[0]) || ''}
                          onChange={e => setData(p => ({ ...p, [field.key]: e.target.value }))}
                        >
                          {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      )}
                    </div>
                  ))}
                </div>

                {error && (
                  <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-[13px] px-4 py-3 rounded-lg">
                    ⚠ {error}
                  </div>
                )}

                <div className="flex items-center justify-between mt-8">
                  <button
                    onClick={() => setStep(s => s - 1)}
                    className={`text-[13.5px] font-medium text-[#7A7670] hover:text-[#0D0C0B] transition-colors ${step === 0 ? 'invisible' : ''}`}
                  >
                    ← Back
                  </button>

                  {isLastStep ? (
                    <button
                      onClick={handleSubmit}
                      disabled={!canProceed || loading}
                      className="bg-[#0D0C0B] text-white px-8 py-3 rounded-xl text-[14px] font-semibold hover:bg-[#1A1714] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                    >
                      {loading ? 'Building your plan...' : 'Launch my CMO OS →'}
                    </button>
                  ) : (
                    <button
                      onClick={() => setStep(s => s + 1)}
                      disabled={!canProceed}
                      className="bg-[#0D0C0B] text-white px-8 py-3 rounded-xl text-[14px] font-semibold hover:bg-[#1A1714] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Continue →
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
