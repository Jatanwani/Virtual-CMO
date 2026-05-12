'use client'

import { useState } from 'react'
import { Profile, Experiment } from '@/types/database'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { FlaskConical, Plus, Trash2, Brain, X, ChevronDown, ChevronUp } from 'lucide-react'
import { format } from 'date-fns'

const STATUS_CONFIG = {
  Running: { class: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-400' },
  Won: { class: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  Lost: { class: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-400' },
  Paused: { class: 'bg-[#F5F3EF] text-[#7A7670] border-[#EDE9E3]', dot: 'bg-[#C9C4BC]' },
}

interface Props {
  profile: Profile | null
  initialExperiments: Experiment[]
}

const emptyForm = { hypothesis: '', channel: '', metric: '' }

export function ExperimentsClient({ initialExperiments }: Props) {
  const [experiments, setExperiments] = useState<Experiment[]>(initialExperiments)
  const [form, setForm] = useState(emptyForm)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState<string | null>(null)
  const [editingResult, setEditingResult] = useState<Record<string, string>>({})

  const won = experiments.filter(e => e.status === 'Won').length
  const running = experiments.filter(e => e.status === 'Running').length
  const lost = experiments.filter(e => e.status === 'Lost').length

  const addExperiment = async () => {
    if (!form.hypothesis.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/experiments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.experiment) {
        setExperiments(prev => [data.experiment, ...prev])
        setForm(emptyForm)
        setShowForm(false)
        toast.success('Experiment added!')
      }
    } catch {
      toast.error('Failed to add experiment')
    }
    setSubmitting(false)
  }

  const updateStatus = async (id: string, status: Experiment['status']) => {
    const result = editingResult[id] || ''
    const res = await fetch('/api/experiments', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, result }),
    })
    const data = await res.json()
    if (data.experiment) {
      setExperiments(prev => prev.map(e => e.id === id ? data.experiment : e))
    }
  }

  const analyzeExperiment = async (id: string) => {
    const exp = experiments.find(e => e.id === id)
    if (!exp || !exp.result) {
      toast.error('Add a result first')
      return
    }
    setAnalyzing(id)
    try {
      const res = await fetch('/api/experiments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: exp.status, result: exp.result, analyze: true }),
      })
      const data = await res.json()
      if (data.experiment) {
        setExperiments(prev => prev.map(e => e.id === id ? data.experiment : e))
        toast.success('Analysis complete!')
      }
    } catch {
      toast.error('Analysis failed')
    }
    setAnalyzing(null)
  }

  const deleteExperiment = async (id: string) => {
    await fetch(`/api/experiments?id=${id}`, { method: 'DELETE' })
    setExperiments(prev => prev.filter(e => e.id !== id))
    toast.success('Removed')
  }

  const updateResult = (id: string, val: string) => {
    setEditingResult(prev => ({ ...prev, [id]: val }))
    setExperiments(prev => prev.map(e => e.id === id ? { ...e, result: val } : e))
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total', value: experiments.length, color: 'text-[#0D0C0B]' },
          { label: 'Running', value: running, color: 'text-amber-600' },
          { label: 'Won', value: won, color: 'text-emerald-600' },
          { label: 'Lost', value: lost, color: 'text-red-500' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-[#EDE9E3] rounded-2xl p-4 shadow-card text-center">
            <p style={{fontFamily: 'Cabinet Grotesk, sans-serif'}} className={`text-3xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[11.5px] text-[#A39E96] uppercase tracking-wide mt-1 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-[#7A7670]">
          {experiments.length === 0
            ? 'Track your growth hypotheses. Learn fast. Double down on what works.'
            : `${experiments.length} experiment${experiments.length !== 1 ? 's' : ''} tracked`}
        </p>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-[#0D0C0B] text-white text-[13px] font-semibold px-4 py-2.5 rounded-xl hover:bg-[#1A1714] transition-all"
        >
          <Plus size={14} />
          New Experiment
        </button>
      </div>

      {/* New experiment form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white border border-[#EDE9E3] rounded-2xl p-6 shadow-card"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 style={{fontFamily: 'Cabinet Grotesk, sans-serif'}} className="font-bold text-[#0D0C0B]">Add New Experiment</h3>
              <button onClick={() => setShowForm(false)}>
                <X size={16} className="text-[#A39E96] hover:text-[#524F4A]" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="col-span-2">
                <label className="block text-[11.5px] font-bold text-[#A39E96] uppercase tracking-wider mb-1.5">
                  Hypothesis *
                </label>
                <input
                  className="w-full px-3.5 py-2.5 border border-[#EDE9E3] rounded-xl text-[13.5px] text-[#0D0C0B] placeholder:text-[#C9C4BC] focus:outline-none focus:border-[#0D0C0B] transition-colors bg-[#FAFAF8]"
                  placeholder="If I post 3x/week on LinkedIn with founder stories, I'll get 20+ DM requests/week"
                  value={form.hypothesis}
                  onChange={e => setForm(p => ({ ...p, hypothesis: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-[11.5px] font-bold text-[#A39E96] uppercase tracking-wider mb-1.5">
                  Channel
                </label>
                <input
                  className="w-full px-3.5 py-2.5 border border-[#EDE9E3] rounded-xl text-[13.5px] text-[#0D0C0B] placeholder:text-[#C9C4BC] focus:outline-none focus:border-[#0D0C0B] transition-colors bg-[#FAFAF8]"
                  placeholder="LinkedIn, Cold Email, Reddit..."
                  value={form.channel}
                  onChange={e => setForm(p => ({ ...p, channel: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-[11.5px] font-bold text-[#A39E96] uppercase tracking-wider mb-1.5">
                  Success Metric
                </label>
                <input
                  className="w-full px-3.5 py-2.5 border border-[#EDE9E3] rounded-xl text-[13.5px] text-[#0D0C0B] placeholder:text-[#C9C4BC] focus:outline-none focus:border-[#0D0C0B] transition-colors bg-[#FAFAF8]"
                  placeholder="e.g. 20 DM replies in 7 days"
                  value={form.metric}
                  onChange={e => setForm(p => ({ ...p, metric: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2.5 text-[13px] text-[#7A7670] hover:text-[#0D0C0B] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addExperiment}
                disabled={!form.hypothesis.trim() || submitting}
                className="bg-[#0D0C0B] text-white px-6 py-2.5 rounded-xl text-[13px] font-semibold hover:bg-[#1A1714] transition-all disabled:opacity-50"
              >
                {submitting ? 'Adding...' : 'Add Experiment'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {experiments.length === 0 && !showForm && (
        <div className="bg-white border border-[#EDE9E3] rounded-2xl px-8 py-16 text-center shadow-card">
          <div className="w-14 h-14 bg-[#F5F3EF] rounded-2xl flex items-center justify-center mx-auto mb-5">
            <FlaskConical size={24} className="text-blue-500" />
          </div>
          <h3 style={{fontFamily: 'Cabinet Grotesk, sans-serif'}} className="text-xl font-bold text-[#0D0C0B] mb-2">No experiments yet</h3>
          <p className="text-[14px] text-[#A39E96] max-w-md mx-auto mb-6">
            Great founders are great experimenters. Track hypotheses, measure results, and double down on what works.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#0D0C0B] text-white px-6 py-3 rounded-xl text-[13.5px] font-semibold hover:bg-[#1A1714] transition-all"
          >
            Add Your First Experiment →
          </button>
        </div>
      )}

      {/* Experiments list */}
      <div className="space-y-3">
        <AnimatePresence>
          {experiments.map((exp) => {
            const statusCfg = STATUS_CONFIG[exp.status] || STATUS_CONFIG.Running
            const expanded = expandedId === exp.id

            return (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white border border-[#EDE9E3] rounded-2xl shadow-card overflow-hidden"
              >
                {/* Header */}
                <div
                  className="px-5 py-4 flex items-start gap-3 cursor-pointer hover:bg-[#FAFAF8] transition-colors"
                  onClick={() => setExpandedId(expanded ? null : exp.id)}
                >
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${statusCfg.dot}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-[#0D0C0B] leading-snug">{exp.hypothesis}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {exp.channel && (
                        <span className="text-[11px] bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-lg font-medium">
                          {exp.channel}
                        </span>
                      )}
                      {exp.metric && (
                        <span className="text-[11px] text-[#A39E96]">Target: {exp.metric}</span>
                      )}
                      <span className="text-[11px] text-[#C9C4BC]">
                        {format(new Date(exp.created_at), 'MMM d')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${statusCfg.class}`}>
                      {exp.status}
                    </span>
                    {expanded ? <ChevronUp size={14} className="text-[#A39E96]" /> : <ChevronDown size={14} className="text-[#A39E96]" />}
                  </div>
                </div>

                {/* Expanded content */}
                <AnimatePresence>
                  {expanded && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 border-t border-[#F5F3EF] pt-4 space-y-4">
                        {/* Status buttons */}
                        <div>
                          <p className="text-[11px] font-bold text-[#A39E96] uppercase tracking-wider mb-2">Status</p>
                          <div className="flex gap-2 flex-wrap">
                            {(['Running', 'Won', 'Lost', 'Paused'] as const).map(s => (
                              <button
                                key={s}
                                onClick={() => updateStatus(exp.id, s)}
                                className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all ${exp.status === s ? STATUS_CONFIG[s].class : 'bg-white text-[#A39E96] border-[#EDE9E3] hover:border-[#C9C4BC]'}`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Result */}
                        <div>
                          <label className="block text-[11px] font-bold text-[#A39E96] uppercase tracking-wider mb-1.5">
                            Result
                          </label>
                          <textarea
                            className="w-full px-3.5 py-2.5 border border-[#EDE9E3] rounded-xl text-[13px] text-[#0D0C0B] placeholder:text-[#C9C4BC] focus:outline-none focus:border-[#0D0C0B] transition-colors bg-[#FAFAF8] resize-none"
                            rows={2}
                            placeholder="What actually happened? Be specific with numbers..."
                            value={exp.result || editingResult[exp.id] || ''}
                            onChange={e => updateResult(exp.id, e.target.value)}
                          />
                        </div>

                        {/* Learning */}
                        {exp.learning && (
                          <div>
                            <p className="text-[11px] font-bold text-[#A39E96] uppercase tracking-wider mb-1.5">Learning</p>
                            <p className="text-[13px] text-[#524F4A]">{exp.learning}</p>
                          </div>
                        )}

                        {/* CMO Analysis */}
                        {exp.cmo_analysis && (
                          <div className="bg-[#0D0C0B] rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Brain size={12} className="text-[#FF8C1A]" />
                              <p className="text-[10px] font-bold text-white/50 uppercase tracking-wider">CMO Analysis</p>
                            </div>
                            <p className="text-[13px] text-white/85 leading-relaxed">{exp.cmo_analysis}</p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => analyzeExperiment(exp.id)}
                            disabled={analyzing === exp.id || !exp.result}
                            className="flex items-center gap-1.5 bg-[#F5F3EF] text-[#524F4A] border border-[#EDE9E3] px-4 py-2 rounded-lg text-[12.5px] font-semibold hover:bg-[#EDE9E3] transition-all disabled:opacity-40"
                          >
                            <Brain size={13} className={analyzing === exp.id ? 'animate-pulse text-[#FF8C1A]' : ''} />
                            {analyzing === exp.id ? 'Analyzing...' : 'Get CMO Analysis'}
                          </button>
                          <button
                            onClick={() => deleteExperiment(exp.id)}
                            className="flex items-center gap-1.5 text-red-400 hover:text-red-600 px-3 py-2 rounded-lg text-[12.5px] transition-colors ml-auto"
                          >
                            <Trash2 size={13} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
