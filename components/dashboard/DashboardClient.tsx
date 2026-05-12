'use client'

import { useState } from 'react'
import { Profile, Task, Experiment, Result } from '@/types/database'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  CheckCircle2, Circle, Zap, TrendingUp, Target,
  Clock, ChevronRight, AlertCircle, FlaskConical, BarChart3,
  RefreshCw, Flame
} from 'lucide-react'

interface Props {
  profile: Profile | null
  initialTasks: Task[]
  experiments: Experiment[]
  results: Result[]
}

const DIFFICULTY_CONFIG = {
  Easy: { class: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  Medium: { class: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  Hard: { class: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' },
}

export function DashboardClient({ profile, initialTasks, experiments, results }: Props) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [generating, setGenerating] = useState(false)
  const [expandedTask, setExpandedTask] = useState<string | null>(null)

  const doneTasks = tasks.filter(t => t.status === 'done')
  const todoTasks = tasks.filter(t => t.status === 'todo')
  const execScore = tasks.length ? Math.round((doneTasks.length / tasks.length) * 100) : 0
  const wonExps = experiments.filter(e => e.status === 'Won').length
  const avgScore = results.length
    ? Math.round(results.reduce((a, r) => a + (r.score || 70), 0) / results.length)
    : 0

  const generatePlan = async () => {
    setGenerating(true)
    try {
      const res = await fetch('/api/tasks', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `Server error ${res.status}`)
      if (data.tasks) {
        setTasks(data.tasks)
        toast.success('30-day plan generated!')
        // Refresh page to get updated profile diagnosis
        window.location.reload()
      }
    } catch (err: any) {
      console.error('Generate plan error:', err)
      toast.error(err.message || 'Failed to generate plan — check API key')
    }
    setGenerating(false)
  }

  const toggleTask = async (taskId: string, current: string) => {
    const newStatus = current === 'done' ? 'todo' : 'done'
    setTasks(ts => ts.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
    await fetch('/api/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: taskId, status: newStatus }),
    })
  }

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Execution', value: `${execScore}%`, sub: `${doneTasks.length} of ${tasks.length} tasks`, icon: CheckCircle2, color: 'text-emerald-600' },
          { label: 'Experiments', value: `${experiments.length}`, sub: `${wonExps} won`, icon: FlaskConical, color: 'text-blue-600' },
          { label: 'Avg Score', value: `${avgScore}`, sub: `${results.length} submissions`, icon: BarChart3, color: 'text-purple-600' },
          { label: 'Days Active', value: Math.ceil((Date.now() - new Date(profile?.created_at || Date.now()).getTime()) / 86400000).toString(), sub: 'Keep shipping', icon: Flame, color: 'text-[#FF8C1A]' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white border border-[#EDE9E3] rounded-2xl p-5 shadow-card"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold text-[#A39E96] uppercase tracking-wider">{stat.label}</span>
              <stat.icon size={15} className={stat.color} />
            </div>
            <p style={{fontFamily: 'Cabinet Grotesk, sans-serif'}} className="text-3xl font-black text-[#0D0C0B] leading-none">{stat.value}</p>
            <p className="text-[12px] text-[#A39E96] mt-1.5">{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Tasks - takes 2 cols */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-[#EDE9E3] rounded-2xl shadow-card overflow-hidden">
            <div className="px-6 py-4 border-b border-[#F5F3EF] flex items-center justify-between">
              <div>
                <h2 style={{fontFamily: 'Cabinet Grotesk, sans-serif'}} className="text-[16px] font-bold text-[#0D0C0B]">Action Tasks</h2>
                <p className="text-[12px] text-[#A39E96] mt-0.5">Your 30-day CMO execution plan</p>
              </div>
              <button
                onClick={generatePlan}
                disabled={generating}
                className="flex items-center gap-2 bg-[#0D0C0B] text-white text-[12.5px] px-4 py-2 rounded-lg hover:bg-[#1A1714] transition-all disabled:opacity-50"
              >
                <RefreshCw size={12} className={generating ? 'animate-spin' : ''} />
                {generating ? 'Generating...' : tasks.length ? 'Regenerate' : 'Generate Plan'}
              </button>
            </div>

            {generating && (
              <div className="p-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="mb-3 h-16 rounded-xl shimmer" />
                ))}
              </div>
            )}

            {!generating && tasks.length === 0 && (
              <div className="px-6 py-14 text-center">
                <div className="w-12 h-12 bg-[#F5F3EF] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Zap size={20} className="text-[#FF8C1A]" />
                </div>
                <h3 style={{fontFamily: 'Cabinet Grotesk, sans-serif'}} className="text-[16px] font-bold text-[#0D0C0B] mb-2">No plan yet</h3>
                <p className="text-[13.5px] text-[#A39E96] mb-5 max-w-sm mx-auto">
                  Your CMO will analyze your profile and generate a custom 30-day growth plan with specific action tasks.
                </p>
                <button
                  onClick={generatePlan}
                  className="bg-[#0D0C0B] text-white px-6 py-2.5 rounded-xl text-[13.5px] font-semibold hover:bg-[#1A1714] transition-all"
                >
                  Generate My 30-Day Plan →
                </button>
              </div>
            )}

            {!generating && tasks.length > 0 && (
              <div className="divide-y divide-[#F5F3EF]">
                {tasks.map((task, i) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="px-6 py-4"
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleTask(task.id, task.status)}
                        className="mt-0.5 flex-shrink-0"
                      >
                        {task.status === 'done'
                          ? <CheckCircle2 size={18} className="text-emerald-500" />
                          : <Circle size={18} className="text-[#C9C4BC] hover:text-[#7A7670] transition-colors" />
                        }
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-[14px] font-semibold cursor-pointer transition-colors ${task.status === 'done' ? 'text-[#C9C4BC] line-through' : 'text-[#0D0C0B] hover:text-[#FF8C1A]'}`}
                            onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                          >
                            {task.title}
                          </span>
                          {task.difficulty && (
                            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${DIFFICULTY_CONFIG[task.difficulty as keyof typeof DIFFICULTY_CONFIG]?.class || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${DIFFICULTY_CONFIG[task.difficulty as keyof typeof DIFFICULTY_CONFIG]?.dot || 'bg-gray-400'}`} />
                              {task.difficulty}
                            </span>
                          )}
                          {task.time_required && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-[#A39E96]">
                              <Clock size={10} />
                              {task.time_required}
                            </span>
                          )}
                        </div>

                        <p className="text-[12.5px] text-[#7A7670] mt-1">{task.why}</p>

                        {expandedTask === task.id && task.steps && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-3 bg-[#FAFAF8] border border-[#EDE9E3] rounded-xl p-4"
                          >
                            <p className="text-[11px] font-bold text-[#A39E96] uppercase tracking-wider mb-2">Steps to execute</p>
                            <ol className="space-y-1.5">
                              {task.steps.map((step, si) => (
                                <li key={si} className="flex items-start gap-2 text-[13px] text-[#524F4A]">
                                  <span className="text-[11px] font-bold text-[#FF8C1A] mt-0.5 flex-shrink-0">{si + 1}.</span>
                                  {step}
                                </li>
                              ))}
                            </ol>
                            {task.outcome && (
                              <div className="mt-3 pt-3 border-t border-[#EDE9E3]">
                                <p className="text-[11px] font-bold text-[#A39E96] uppercase tracking-wider mb-1">Expected outcome</p>
                                <p className="text-[13px] text-[#2D6A4F] font-medium">{task.outcome}</p>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </div>

                      <button
                        onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                        className="text-[#C9C4BC] hover:text-[#7A7670] transition-colors"
                      >
                        <ChevronRight size={16} className={`transition-transform ${expandedTask === task.id ? 'rotate-90' : ''}`} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right col */}
        <div className="space-y-4">
          {/* CMO Diagnosis */}
          {profile?.bottleneck && (
            <div className="bg-[#0D0C0B] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle size={13} className="text-[#FF8C1A]" />
                <span className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">Bottleneck</span>
              </div>
              <p className="text-[13.5px] text-white/85 leading-relaxed">{profile.bottleneck}</p>

              {profile.top_channels && (
                <div className="mt-4">
                  <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-2">Top channels</p>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.top_channels.map(ch => (
                      <span key={ch} className="bg-[#FF8C1A]/15 text-[#FF8C1A] text-[11.5px] font-medium px-2.5 py-1 rounded-lg">
                        {ch}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {profile.archetype && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <Target size={12} className="text-[#FF8C1A]" />
                    <p className="text-[11px] text-white/40">You are a <span className="text-white/80 font-semibold">{profile.archetype}</span></p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 30-day goal */}
          <div className="bg-white border border-[#EDE9E3] rounded-2xl p-5 shadow-card">
            <div className="flex items-center gap-2 mb-2">
              <Target size={13} className="text-[#FF8C1A]" />
              <span className="text-[11px] font-semibold text-[#A39E96] uppercase tracking-wider">30-Day Goal</span>
            </div>
            <p className="text-[13.5px] text-[#0D0C0B] font-medium leading-relaxed">
              {profile?.goal_30 || 'Set in onboarding'}
            </p>
          </div>

          {/* Recent experiments */}
          {experiments.length > 0 && (
            <div className="bg-white border border-[#EDE9E3] rounded-2xl p-5 shadow-card">
              <div className="flex items-center gap-2 mb-3">
                <FlaskConical size={13} className="text-blue-500" />
                <span className="text-[11px] font-semibold text-[#A39E96] uppercase tracking-wider">Recent Experiments</span>
              </div>
              <div className="space-y-2">
                {experiments.slice(0, 3).map(exp => (
                  <div key={exp.id} className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${exp.status === 'Won' ? 'bg-emerald-500' : exp.status === 'Lost' ? 'bg-red-400' : exp.status === 'Running' ? 'bg-amber-400' : 'bg-[#C9C4BC]'}`} />
                    <p className="text-[12.5px] text-[#524F4A] truncate flex-1">{exp.hypothesis}</p>
                    <span className="text-[11px] text-[#A39E96] flex-shrink-0">{exp.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick win */}
          <div className="bg-gradient-to-br from-[#FFF8F0] to-[#FFF3E0] border border-[#FFD4A3] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={13} className="text-[#FF8C1A]" />
              <span className="text-[11px] font-semibold text-[#E67300] uppercase tracking-wider">Quick Win</span>
            </div>
            <p className="text-[13px] text-[#7A3D00] font-medium leading-relaxed">
              Spend 30 min engaging on LinkedIn. Comment on 10 posts in your niche with genuine insights. This alone can drive 5-10 profile views daily.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
