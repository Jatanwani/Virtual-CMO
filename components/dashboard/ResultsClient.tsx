'use client'

import { useState } from 'react'
import { Profile, Result } from '@/types/database'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { BarChart3, Brain, ChevronDown, ChevronUp, Flame } from 'lucide-react'
import { format } from 'date-fns'

interface Props {
  profile: Profile | null
  initialResults: Result[]
  tasks: { id: string; title: string }[]
}

export function ResultsClient({ initialResults, tasks }: Props) {
  const [results, setResults] = useState<Result[]>(initialResults)
  const [taskTitle, setTaskTitle] = useState('')
  const [execution, setExecution] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [latest, setLatest] = useState<{ feedback: string; nextActions: string[]; score: number } | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const avgScore = results.length
    ? Math.round(results.reduce((a, r) => a + (r.score || 0), 0) / results.length)
    : 0

  const submit = async () => {
    if (!execution.trim()) return
    setSubmitting(true)
    setLatest(null)
    try {
      const res = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_title: taskTitle || 'General execution', execution }),
      })
      const data = await res.json()
      if (data.result) {
        setResults(prev => [data.result, ...prev])
        setLatest(data.analysis)
        setExecution('')
        setTaskTitle('')
        toast.success(`Score: ${data.analysis.score}/100`)
      }
    } catch {
      toast.error('Failed to submit')
    }
    setSubmitting(false)
  }

  const scoreColor = (s: number) =>
    s >= 80 ? 'text-emerald-600' : s >= 60 ? 'text-amber-600' : 'text-red-500'

  const scoreBg = (s: number) =>
    s >= 80 ? 'bg-emerald-50 border-emerald-200' : s >= 60 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Submissions', value: results.length, icon: BarChart3 },
          { label: 'Avg Score', value: avgScore, icon: Flame },
          { label: 'This Week', value: results.filter(r => new Date(r.created_at) > new Date(Date.now() - 7 * 86400000)).length, icon: Brain },
        ].map(s => (
          <div key={s.label} className="bg-white border border-[#EDE9E3] rounded-2xl p-5 shadow-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-[#A39E96] uppercase tracking-wider">{s.label}</span>
              <s.icon size={14} className="text-[#FF8C1A]" />
            </div>
            <p style={{fontFamily: 'Cabinet Grotesk, sans-serif'}} className="text-3xl font-black text-[#0D0C0B]">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Submit form */}
      <div className="bg-white border border-[#EDE9E3] rounded-2xl p-6 shadow-card">
        <h3 style={{fontFamily: 'Cabinet Grotesk, sans-serif'}} className="font-bold text-[#0D0C0B] text-[16px] mb-1">Submit Today&apos;s Work</h3>
        <p className="text-[13px] text-[#A39E96] mb-5">Be specific with numbers. Your CMO will analyze and tell you what&apos;s working.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-[11.5px] font-bold text-[#A39E96] uppercase tracking-wider mb-1.5">
              What task did you execute?
            </label>
            <select
              className="w-full px-3.5 py-2.5 border border-[#EDE9E3] rounded-xl text-[13.5px] text-[#0D0C0B] focus:outline-none focus:border-[#0D0C0B] transition-colors bg-[#FAFAF8] appearance-none"
              value={taskTitle}
              onChange={e => setTaskTitle(e.target.value)}
            >
              <option value="">Select a task or type custom below...</option>
              {tasks.map(t => (
                <option key={t.id} value={t.title}>{t.title}</option>
              ))}
              <option value="custom">Other / Custom task</option>
            </select>
          </div>

          {(taskTitle === 'custom' || !tasks.find(t => t.title === taskTitle)) && taskTitle && taskTitle !== 'custom' && (
            <div>
              <label className="block text-[11.5px] font-bold text-[#A39E96] uppercase tracking-wider mb-1.5">
                Task name
              </label>
              <input
                className="w-full px-3.5 py-2.5 border border-[#EDE9E3] rounded-xl text-[13.5px] text-[#0D0C0B] placeholder:text-[#C9C4BC] focus:outline-none focus:border-[#0D0C0B] transition-colors bg-[#FAFAF8]"
                placeholder="What did you work on?"
                value={taskTitle === 'custom' ? '' : taskTitle}
                onChange={e => setTaskTitle(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="block text-[11.5px] font-bold text-[#A39E96] uppercase tracking-wider mb-1.5">
              What happened? (be specific with numbers) *
            </label>
            <textarea
              className="w-full px-3.5 py-3 border border-[#EDE9E3] rounded-xl text-[13.5px] text-[#0D0C0B] placeholder:text-[#C9C4BC] focus:outline-none focus:border-[#0D0C0B] transition-colors bg-[#FAFAF8] resize-none leading-relaxed"
              rows={4}
              placeholder="e.g. Sent 45 cold DMs on LinkedIn. Got 6 replies (13% rate), 2 booked demo calls. One said the timing wasn't right. Average response time was 4 hours..."
              value={execution}
              onChange={e => setExecution(e.target.value)}
            />
          </div>

          <button
            onClick={submit}
            disabled={!execution.trim() || submitting}
            className="w-full bg-[#0D0C0B] text-white py-3 rounded-xl text-[14px] font-semibold hover:bg-[#1A1714] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Brain size={15} className={submitting ? 'animate-pulse' : ''} />
            {submitting ? 'Your CMO is analyzing...' : 'Get CMO Feedback →'}
          </button>
        </div>
      </div>

      {/* Latest feedback */}
      <AnimatePresence>
        {latest && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0D0C0B] rounded-2xl p-6 border border-[#1A1714]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-[#FF8C1A]/20 rounded-lg flex items-center justify-center">
                  <Brain size={14} className="text-[#FF8C1A]" />
                </div>
                <p style={{fontFamily: 'Cabinet Grotesk, sans-serif'}} className="font-bold text-white text-[15px]">CMO Feedback</p>
              </div>
              <div className={`px-3 py-1 rounded-lg border text-sm font-bold ${scoreBg(latest.score)}`}>
                <span className={scoreColor(latest.score)}>{latest.score}/100</span>
              </div>
            </div>

            <p className="text-[13.5px] text-white/80 leading-relaxed mb-5">{latest.feedback}</p>

            <div>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3">Next Actions</p>
              <div className="space-y-2">
                {latest.nextActions.map((action, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="text-[#FF8C1A] font-bold text-[12px] flex-shrink-0 mt-0.5">{i + 1}.</span>
                    <p className="text-[13px] text-white/75">{action}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History */}
      {results.length > 0 && (
        <div>
          <h3 style={{fontFamily: 'Cabinet Grotesk, sans-serif'}} className="font-bold text-[#0D0C0B] mb-4">Submission History</h3>
          <div className="space-y-3">
            {results.map(result => (
              <div key={result.id} className="bg-white border border-[#EDE9E3] rounded-2xl shadow-card overflow-hidden">
                <div
                  className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-[#FAFAF8] transition-colors"
                  onClick={() => setExpandedId(expandedId === result.id ? null : result.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="text-[13.5px] font-semibold text-[#0D0C0B]">{result.task_title || 'General execution'}</p>
                      {result.score && (
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border ${scoreBg(result.score)} ${scoreColor(result.score)}`}>
                          {result.score}/100
                        </span>
                      )}
                    </div>
                    <p className="text-[12.5px] text-[#A39E96] line-clamp-1">{result.execution}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                    <span className="text-[11px] text-[#C9C4BC]">{format(new Date(result.created_at), 'MMM d')}</span>
                    {expandedId === result.id ? <ChevronUp size={14} className="text-[#A39E96]" /> : <ChevronDown size={14} className="text-[#A39E96]" />}
                  </div>
                </div>

                <AnimatePresence>
                  {expandedId === result.id && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 border-t border-[#F5F3EF] pt-4 space-y-4">
                        <div>
                          <p className="text-[11px] font-bold text-[#A39E96] uppercase tracking-wider mb-1">What you submitted</p>
                          <p className="text-[13px] text-[#524F4A]">{result.execution}</p>
                        </div>
                        {result.cmo_feedback && (
                          <div>
                            <p className="text-[11px] font-bold text-[#A39E96] uppercase tracking-wider mb-1">CMO Feedback</p>
                            <p className="text-[13px] text-[#524F4A] leading-relaxed">{result.cmo_feedback}</p>
                          </div>
                        )}
                        {result.next_actions && result.next_actions.length > 0 && (
                          <div>
                            <p className="text-[11px] font-bold text-[#A39E96] uppercase tracking-wider mb-2">Next Actions</p>
                            <ol className="space-y-1.5">
                              {result.next_actions.map((a, i) => (
                                <li key={i} className="flex items-start gap-2 text-[13px] text-[#524F4A]">
                                  <span className="text-[#FF8C1A] font-bold flex-shrink-0">{i + 1}.</span>
                                  {a}
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
