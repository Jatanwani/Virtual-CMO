'use client'

import { useState } from 'react'
import { Profile, ContentItem } from '@/types/database'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  Calendar, Sparkles, Copy, Check, ExternalLink,
  Linkedin, Twitter, MessageSquare, X, CheckCircle
} from 'lucide-react'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

const PLATFORM_CONFIG: Record<string, { color: string; bg: string; Icon: any }> = {
  LinkedIn: { color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', Icon: Linkedin },
  Twitter: { color: 'text-sky-600', bg: 'bg-sky-50 border-sky-200', Icon: Twitter },
  'Reddit/Slack': { color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200', Icon: MessageSquare },
  default: { color: 'text-[#524F4A]', bg: 'bg-[#F5F3EF] border-[#EDE9E3]', Icon: MessageSquare },
}

const STATUS_CONFIG = {
  draft: { label: 'Draft', class: 'bg-[#F5F3EF] text-[#7A7670] border-[#EDE9E3]' },
  scheduled: { label: 'Scheduled', class: 'bg-amber-50 text-amber-700 border-amber-200' },
  published: { label: 'Published', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
}

interface Props {
  profile: Profile | null
  initialItems: ContentItem[]
  weekStart: string
}

export function ContentClient({ profile, initialItems, weekStart }: Props) {
  const [items, setItems] = useState<ContentItem[]>(initialItems)
  const [generating, setGenerating] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null)
  const [generatingPost, setGeneratingPost] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const generateCalendar = async () => {
    setGenerating(true)
    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate_calendar' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `Server error ${res.status}`)
      if (data.items) {
        setItems(data.items)
        toast.success('Content calendar generated!')
      }
    } catch (err: any) {
      console.error('Content generation error:', err)
      toast.error(err.message || 'Failed to generate calendar — check API key')
    }
    setGenerating(false)
  }

  const generatePost = async (item: ContentItem) => {
    if (item.full_post) {
      setSelectedItem(item)
      return
    }
    setGeneratingPost(item.id)
    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate_post', itemId: item.id }),
      })
      const data = await res.json()
      if (data.item) {
        setItems(prev => prev.map(i => i.id === item.id ? data.item : i))
        setSelectedItem(data.item)
      }
    } catch {
      toast.error('Failed to generate post')
    }
    setGeneratingPost(null)
  }

  const copyPost = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(id)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(null), 2000)
  }

  const updateStatus = async (id: string, status: 'draft' | 'scheduled' | 'published') => {
    await fetch('/api/content', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    setItems(prev => prev.map(i => i.id === id ? { ...i, status } : i))
  }

  const itemsByDay = DAYS.reduce((acc, day) => {
    acc[day] = items.filter(i => i.day === day)
    return acc
  }, {} as Record<string, ContentItem[]>)

  const publishedCount = items.filter(i => i.status === 'published').length
  const totalItems = items.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 style={{fontFamily: 'Cabinet Grotesk, sans-serif'}} className="text-xl font-black text-[#0D0C0B]">
              This Week&apos;s Content
            </h2>
            {totalItems > 0 && (
              <span className="bg-[#F5F3EF] border border-[#EDE9E3] text-[#7A7670] text-[12px] font-medium px-2.5 py-1 rounded-full">
                {publishedCount}/{totalItems} published
              </span>
            )}
          </div>
          <p className="text-[13px] text-[#A39E96] mt-1">Week of {weekStart}</p>
        </div>
        <button
          onClick={generateCalendar}
          disabled={generating}
          className="flex items-center gap-2 bg-[#0D0C0B] text-white text-[13px] font-semibold px-5 py-2.5 rounded-xl hover:bg-[#1A1714] transition-all disabled:opacity-50"
        >
          <Sparkles size={14} className={generating ? 'animate-spin' : ''} />
          {generating ? 'Generating...' : items.length ? 'Regenerate Week' : 'Generate This Week'}
        </button>
      </div>

      {/* Empty state */}
      {!generating && items.length === 0 && (
        <div className="bg-white border border-[#EDE9E3] rounded-2xl px-8 py-16 text-center shadow-card">
          <div className="w-14 h-14 bg-[#F5F3EF] rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Calendar size={24} className="text-[#FF8C1A]" />
          </div>
          <h3 style={{fontFamily: 'Cabinet Grotesk, sans-serif'}} className="text-xl font-bold text-[#0D0C0B] mb-2">No content plan yet</h3>
          <p className="text-[14px] text-[#A39E96] max-w-md mx-auto mb-6">
            Your CMO will generate a full week of platform-specific content ideas tailored to your product, ICP, and growth goals.
          </p>
          <button
            onClick={generateCalendar}
            className="bg-[#0D0C0B] text-white px-8 py-3 rounded-xl text-[14px] font-semibold hover:bg-[#1A1714] transition-all"
          >
            Generate My Content Calendar →
          </button>
        </div>
      )}

      {/* Generating shimmer */}
      {generating && (
        <div className="grid grid-cols-5 gap-3">
          {DAYS.map(day => (
            <div key={day} className="space-y-3">
              <div className="h-5 rounded shimmer w-20" />
              <div className="h-28 rounded-xl shimmer" />
              <div className="h-28 rounded-xl shimmer" />
            </div>
          ))}
        </div>
      )}

      {/* Calendar grid */}
      {!generating && items.length > 0 && (
        <div className="grid grid-cols-5 gap-3">
          {DAYS.map(day => (
            <div key={day}>
              <p className="text-[11px] font-bold text-[#A39E96] uppercase tracking-wider mb-2.5">{day.slice(0, 3)}</p>
              <div className="space-y-2">
                {itemsByDay[day]?.map(item => {
                  const platform = PLATFORM_CONFIG[item.platform || ''] || PLATFORM_CONFIG.default
                  const status = STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.draft
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`bg-white border rounded-xl p-3 cursor-pointer hover:shadow-card-hover transition-all group ${item.status === 'published' ? 'border-emerald-200 bg-emerald-50/30' : 'border-[#EDE9E3]'}`}
                      onClick={() => generatePost(item)}
                    >
                      <div className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md border mb-2 ${platform.bg} ${platform.color}`}>
                        <platform.Icon size={8} />
                        {item.platform}
                      </div>
                      <p className="text-[11.5px] font-semibold text-[#0D0C0B] leading-tight mb-1 line-clamp-2">
                        {item.topic}
                      </p>
                      <p className="text-[10.5px] text-[#A39E96] leading-snug line-clamp-2 mb-2">
                        {item.hook}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border uppercase tracking-wide ${status.class}`}>
                          {status.label}
                        </span>
                        {generatingPost === item.id ? (
                          <Sparkles size={11} className="text-[#FF8C1A] animate-spin" />
                        ) : item.full_post ? (
                          <CheckCircle size={11} className="text-emerald-500" />
                        ) : (
                          <ExternalLink size={10} className="text-[#C9C4BC] group-hover:text-[#7A7670] transition-colors" />
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && setSelectedItem(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-modal w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col"
            >
              <div className="px-6 py-4 border-b border-[#F5F3EF] flex items-center justify-between">
                <div>
                  <p style={{fontFamily: 'Cabinet Grotesk, sans-serif'}} className="font-bold text-[#0D0C0B] text-[15px]">{selectedItem.topic}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] text-[#A39E96]">{selectedItem.day} · {selectedItem.platform}</span>
                    <span className="text-[11px] text-[#A39E96]">·</span>
                    <span className="text-[11px] text-[#A39E96]">{selectedItem.type}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="w-7 h-7 rounded-lg bg-[#F5F3EF] flex items-center justify-center hover:bg-[#EDE9E3] transition-colors"
                >
                  <X size={14} className="text-[#7A7670]" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {selectedItem.full_post ? (
                  <div className="bg-[#FAFAF8] border border-[#EDE9E3] rounded-xl p-5">
                    <pre className="whitespace-pre-wrap text-[13.5px] text-[#0D0C0B] leading-relaxed font-[inherit]">
                      {selectedItem.full_post}
                    </pre>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <p className="text-[11px] font-bold text-[#A39E96] uppercase tracking-wider mb-1">Hook</p>
                      <p className="text-[13.5px] text-[#0D0C0B] font-medium">{selectedItem.hook}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-[#A39E96] uppercase tracking-wider mb-1">CTA</p>
                      <p className="text-[13.5px] text-[#524F4A]">{selectedItem.cta}</p>
                    </div>
                    <button
                      onClick={() => generatePost(selectedItem)}
                      className="w-full bg-[#0D0C0B] text-white py-3 rounded-xl text-[13.5px] font-semibold hover:bg-[#1A1714] transition-all mt-4"
                    >
                      Generate Full Post →
                    </button>
                  </div>
                )}
              </div>

              {selectedItem.full_post && (
                <div className="px-6 py-4 border-t border-[#F5F3EF] flex items-center gap-3">
                  <button
                    onClick={() => copyPost(selectedItem.full_post!, selectedItem.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#0D0C0B] text-white py-2.5 rounded-xl text-[13px] font-semibold hover:bg-[#1A1714] transition-all"
                  >
                    {copied === selectedItem.id ? <Check size={14} /> : <Copy size={14} />}
                    {copied === selectedItem.id ? 'Copied!' : 'Copy post'}
                  </button>
                  <div className="flex gap-2">
                    {(['draft', 'scheduled', 'published'] as const).map(s => (
                      <button
                        key={s}
                        onClick={() => {
                          updateStatus(selectedItem.id, s)
                          setSelectedItem(prev => prev ? { ...prev, status: s } : null)
                        }}
                        className={`px-3 py-2.5 rounded-xl text-[12px] font-semibold border capitalize transition-all ${selectedItem.status === s ? STATUS_CONFIG[s].class : 'bg-white text-[#A39E96] border-[#EDE9E3] hover:border-[#C9C4BC]'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
