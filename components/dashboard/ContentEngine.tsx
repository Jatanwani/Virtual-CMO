'use client'

import { useState, useCallback } from 'react'
import { Profile } from '@/types/database'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, RefreshCw, Check, X, Calendar, Copy,
  Download, Image as ImageIcon, ChevronLeft, ChevronRight,
  Loader2, Clock, CheckCircle2, Send, Edit3, Zap
} from 'lucide-react'
import toast from 'react-hot-toast'

// ─── Types ─────────────────────────────────────────────────────────────────
interface ContentPost {
  id: string
  day: string
  day_number: number
  platform: string
  topic: string
  headline: string
  body: string
  hashtags: string[]
  image_url?: string
  image_prompt?: string
  cta?: string
  status: 'draft' | 'scheduled' | 'published'
  scheduled_at?: string
}

interface Props {
  profile: Profile | null
  initialItems: ContentPost[]
  weekStart: string
}

const PLATFORM_COLORS: Record<string, string> = {
  'LinkedIn':   'bg-[#0A66C2] text-white',
  'Twitter/X':  'bg-[#000000] text-white',
  'Instagram':  'bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCB045] text-white',
  'Facebook':   'bg-[#1877F2] text-white',
}

const STATUS_CONFIG = {
  draft:     { label: 'Draft',     icon: Edit3,        color: 'text-[#A39E96] bg-[#F5F3EF]' },
  scheduled: { label: 'Scheduled', icon: Clock,        color: 'text-amber-600 bg-amber-50' },
  published: { label: 'Published', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
}

// ─── Post Card ─────────────────────────────────────────────────────────────
function PostCard({
  post,
  onApprove,
  onRevise,
  onGenerateImage,
}: {
  post: ContentPost
  onApprove: (post: ContentPost, scheduledAt?: string) => Promise<void>
  onRevise: (post: ContentPost, feedback: string) => Promise<void>
  onGenerateImage: (post: ContentPost) => Promise<void>
}) {
  const [expanded, setExpanded] = useState(false)
  const [reviseFeedback, setReviseFeedback] = useState('')
  const [showRevise, setShowRevise] = useState(false)
  const [showSchedule, setShowSchedule] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('09:00')
  const [loading, setLoading] = useState<'image' | 'revise' | 'approve' | null>(null)
  const [copied, setCopied] = useState(false)

  const statusCfg = STATUS_CONFIG[post.status] || STATUS_CONFIG.draft
  const StatusIcon = statusCfg.icon
  const platformColor = PLATFORM_COLORS[post.platform] || 'bg-[#524F4A] text-white'

  const handleCopy = () => {
    const text = `${post.headline}\n\n${post.body}\n\n${post.hashtags?.join(' ')}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Copied to clipboard')
  }

  const handleGenerateImage = async () => {
    setLoading('image')
    try { await onGenerateImage(post) }
    finally { setLoading(null) }
  }

  const handleRevise = async () => {
    if (!reviseFeedback.trim() && !confirm('Revise without specific feedback?')) return
    setLoading('revise')
    try {
      await onRevise(post, reviseFeedback)
      setShowRevise(false)
      setReviseFeedback('')
    } finally { setLoading(null) }
  }

  const handleApprove = async () => {
    if (showSchedule) {
      if (!scheduleDate) { toast.error('Pick a date first'); return }
      setLoading('approve')
      try {
        const dt = new Date(`${scheduleDate}T${scheduleTime}:00`)
        await onApprove(post, dt.toISOString())
        setShowSchedule(false)
      } finally { setLoading(null) }
    } else {
      setShowSchedule(true)
    }
  }

  const handlePublishNow = async () => {
    setLoading('approve')
    try { await onApprove(post) }
    finally { setLoading(null) }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-[#EDE9E3] rounded-2xl overflow-hidden shadow-card hover:shadow-md transition-shadow"
    >
      {/* Card header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#EDE9E3] bg-[#FDFCFA]">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-bold text-[#0D0C0B]">{post.day}</span>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${platformColor}`}>
            {post.platform}
          </span>
        </div>
        <span className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${statusCfg.color}`}>
          <StatusIcon size={10} />
          {statusCfg.label}
        </span>
      </div>

      {/* AI Image */}
      <div className="relative w-full aspect-square bg-[#F5F3EF] overflow-hidden">
        {post.image_url ? (
          <img
            src={post.image_url}
            alt={post.headline}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <ImageIcon size={28} className="text-[#C9C4BC]" />
            <p className="text-[11px] text-[#A39E96] text-center px-4">{post.image_prompt?.slice(0, 60)}...</p>
            <button
              onClick={handleGenerateImage}
              disabled={!!loading}
              className="flex items-center gap-1.5 text-[12px] font-medium text-[#FF8C1A] hover:text-[#E67300] transition-colors disabled:opacity-50"
            >
              {loading === 'image'
                ? <><Loader2 size={12} className="animate-spin" /> Generating...</>
                : <><Sparkles size={12} /> Generate Image</>}
            </button>
          </div>
        )}
        {post.image_url && (
          <button
            onClick={handleGenerateImage}
            disabled={!!loading}
            className="absolute bottom-2 right-2 bg-black/60 hover:bg-black/80 text-white text-[10px] px-2 py-1 rounded-lg flex items-center gap-1 transition-colors"
          >
            {loading === 'image' ? <Loader2 size={10} className="animate-spin" /> : <RefreshCw size={10} />}
            Regenerate
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Headline */}
        <p className="text-[14px] font-bold text-[#0D0C0B] leading-snug">{post.headline}</p>

        {/* Body — truncated unless expanded */}
        <div className="relative">
          <p className={`text-[13px] text-[#524F4A] leading-relaxed whitespace-pre-wrap ${!expanded ? 'line-clamp-3' : ''}`}>
            {post.body}
          </p>
          {post.body && post.body.length > 160 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-[12px] text-[#FF8C1A] font-medium mt-0.5"
            >
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>

        {/* Hashtags */}
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {post.hashtags.map(tag => (
              <span key={tag} className="text-[11px] text-[#0A66C2] bg-blue-50 px-1.5 py-0.5 rounded-md">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Revise feedback input */}
        <AnimatePresence>
          {showRevise && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <textarea
                value={reviseFeedback}
                onChange={e => setReviseFeedback(e.target.value)}
                placeholder="What to change? (optional — leave blank to fully regenerate)"
                className="w-full text-[13px] border border-[#EDE9E3] rounded-xl px-3 py-2 resize-none focus:outline-none focus:border-[#C9C4BC] text-[#0D0C0B] placeholder:text-[#C9C4BC]"
                rows={2}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleRevise}
                  disabled={loading === 'revise'}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-[#0D0C0B] text-white text-[12px] font-medium py-2 rounded-xl hover:bg-[#1A1714] transition-colors disabled:opacity-50"
                >
                  {loading === 'revise'
                    ? <><Loader2 size={12} className="animate-spin" /> Revising...</>
                    : <><RefreshCw size={12} /> Revise</>}
                </button>
                <button
                  onClick={() => setShowRevise(false)}
                  className="px-3 border border-[#EDE9E3] rounded-xl text-[#524F4A] hover:bg-[#F5F3EF] transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Schedule picker */}
        <AnimatePresence>
          {showSchedule && post.status === 'draft' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 pt-1"
            >
              <p className="text-[12px] font-semibold text-[#0D0C0B]">Schedule for:</p>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={e => setScheduleDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="flex-1 text-[12px] border border-[#EDE9E3] rounded-xl px-3 py-2 focus:outline-none focus:border-[#C9C4BC]"
                />
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={e => setScheduleTime(e.target.value)}
                  className="w-24 text-[12px] border border-[#EDE9E3] rounded-xl px-3 py-2 focus:outline-none focus:border-[#C9C4BC]"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleApprove}
                  disabled={loading === 'approve'}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500 text-white text-[12px] font-semibold py-2 rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50"
                >
                  {loading === 'approve'
                    ? <><Loader2 size={12} className="animate-spin" /> Scheduling...</>
                    : <><Calendar size={12} /> Schedule</>}
                </button>
                <button
                  onClick={handlePublishNow}
                  disabled={loading === 'approve'}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-[#0A66C2] text-white text-[12px] font-semibold py-2 rounded-xl hover:bg-[#0958A8] transition-colors disabled:opacity-50"
                >
                  <Send size={12} /> Mark Published
                </button>
              </div>
              <button
                onClick={() => setShowSchedule(false)}
                className="w-full text-[11px] text-[#A39E96] hover:text-[#524F4A] transition-colors"
              >Cancel</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        {post.status === 'draft' && !showRevise && !showSchedule && (
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setShowRevise(true)}
              className="flex-1 flex items-center justify-center gap-1.5 border border-[#EDE9E3] text-[#524F4A] text-[12px] font-medium py-2.5 rounded-xl hover:border-[#C9C4BC] hover:bg-[#F5F3EF] transition-all"
            >
              <RefreshCw size={12} /> Revise
            </button>
            <button
              onClick={() => setShowSchedule(true)}
              className="flex-1 flex items-center justify-center gap-1.5 bg-[#FF8C1A] text-white text-[12px] font-semibold py-2.5 rounded-xl hover:bg-[#E67300] transition-all"
            >
              <Check size={12} /> Approve
            </button>
          </div>
        )}

        {/* Approved post actions */}
        {post.status !== 'draft' && (
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-1.5 border border-[#EDE9E3] text-[#524F4A] text-[12px] font-medium py-2 rounded-xl hover:bg-[#F5F3EF] transition-all"
            >
              {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy Post</>}
            </button>
            <button
              onClick={() => setShowRevise(true)}
              className="flex-1 flex items-center justify-center gap-1.5 border border-[#EDE9E3] text-[#524F4A] text-[12px] font-medium py-2 rounded-xl hover:bg-[#F5F3EF] transition-all"
            >
              <Edit3 size={12} /> Edit
            </button>
          </div>
        )}

        {/* Copy for draft posts */}
        {post.status === 'draft' && !showRevise && !showSchedule && (
          <button
            onClick={handleCopy}
            className="w-full text-[11px] text-[#A39E96] hover:text-[#524F4A] flex items-center justify-center gap-1 transition-colors"
          >
            {copied ? <Check size={10} /> : <Copy size={10} />}
            {copied ? 'Copied!' : 'Copy post text'}
          </button>
        )}
      </div>
    </motion.div>
  )
}

// ─── Main ContentEngine ─────────────────────────────────────────────────────
export function ContentEngine({ profile, initialItems, weekStart }: Props) {
  const [posts, setPosts] = useState<ContentPost[]>(initialItems as ContentPost[])
  const [weekTheme, setWeekTheme] = useState('')
  const [generating, setGenerating] = useState(false)
  const [weekOffset, setWeekOffset] = useState(0)
  const [currentWeekStart, setCurrentWeekStart] = useState(weekStart)

  const stats = {
    total: posts.length,
    draft: posts.filter(p => p.status === 'draft').length,
    scheduled: posts.filter(p => p.status === 'scheduled').length,
    published: posts.filter(p => p.status === 'published').length,
  }

  // ── Generate full 7-day plan ────────────────────────────────────────────
  const generateWeek = async () => {
    setGenerating(true)
    const toastId = toast.loading('CMO Brain is crafting your 7-day content plan...')
    try {
      const res = await fetch('/api/content/generate-week', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekOffset }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPosts(data.posts)
      setWeekTheme(data.week_theme)
      setCurrentWeekStart(data.weekStart)
      toast.success('7-day content plan ready!', { id: toastId })
    } catch (err: any) {
      toast.error(err.message || 'Generation failed', { id: toastId })
    } finally {
      setGenerating(false)
    }
  }

  // ── Generate image for a post ───────────────────────────────────────────
  const handleGenerateImage = useCallback(async (post: ContentPost) => {
    const toastId = toast.loading(`Generating image for ${post.day}...`)
    try {
      const res = await fetch('/api/content/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id, imagePrompt: post.image_prompt }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, image_url: data.imageUrl } : p))
      toast.success('Image generated!', { id: toastId })
    } catch (err: any) {
      toast.error(err.message, { id: toastId })
    }
  }, [])

  // ── Revise a post ───────────────────────────────────────────────────────
  const handleRevise = useCallback(async (post: ContentPost, feedback: string) => {
    const toastId = toast.loading('Revising post...')
    try {
      const res = await fetch('/api/content/revise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id, feedback }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPosts(prev => prev.map(p => p.id === post.id ? data.post : p))
      toast.success('Post revised!', { id: toastId })
    } catch (err: any) {
      toast.error(err.message, { id: toastId })
    }
  }, [])

  // ── Approve a post ──────────────────────────────────────────────────────
  const handleApprove = useCallback(async (post: ContentPost, scheduledAt?: string) => {
    const toastId = toast.loading(scheduledAt ? 'Scheduling...' : 'Approving...')
    try {
      const res = await fetch('/api/content/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id, scheduledAt }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPosts(prev => prev.map(p => p.id === post.id ? data.post : p))
      toast.success(scheduledAt ? `Scheduled for ${new Date(scheduledAt).toLocaleDateString()}` : 'Marked as published!', { id: toastId })
    } catch (err: any) {
      toast.error(err.message, { id: toastId })
    }
  }, [])

  // ── Generate all images at once ─────────────────────────────────────────
  const generateAllImages = async () => {
    const noImage = posts.filter(p => !p.image_url && p.image_prompt)
    if (noImage.length === 0) { toast('All posts already have images'); return }
    toast.loading(`Generating ${noImage.length} images...`, { id: 'bulk-images' })
    for (const post of noImage) {
      await handleGenerateImage(post)
      await new Promise(r => setTimeout(r, 500))
    }
    toast.success('All images generated!', { id: 'bulk-images' })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[22px] font-bold text-[#0D0C0B]">Content Engine</h1>
          <p className="text-[13px] text-[#A39E96] mt-0.5">
            AI-generated 7-day content plan tailored to your ICP
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {posts.length > 0 && (
            <button
              onClick={generateAllImages}
              className="flex items-center gap-1.5 border border-[#EDE9E3] text-[#524F4A] text-[13px] font-medium px-3 py-2 rounded-xl hover:bg-[#F5F3EF] transition-all"
            >
              <ImageIcon size={14} /> Generate All Images
            </button>
          )}
          <button
            onClick={generateWeek}
            disabled={generating}
            className="flex items-center gap-2 bg-[#FF8C1A] hover:bg-[#E67300] text-white text-[13px] font-semibold px-4 py-2.5 rounded-xl transition-all disabled:opacity-60 shadow-sm"
          >
            {generating
              ? <><Loader2 size={14} className="animate-spin" /> Generating...</>
              : <><Zap size={14} /> {posts.length > 0 ? 'Regenerate Week' : 'Generate 7-Day Plan'}</>}
          </button>
        </div>
      </div>

      {/* Week navigator */}
      <div className="flex items-center justify-between bg-white border border-[#EDE9E3] rounded-xl px-4 py-3 shadow-card">
        <button
          onClick={() => setWeekOffset(w => w - 1)}
          className="p-1.5 rounded-lg hover:bg-[#F5F3EF] transition-colors"
        >
          <ChevronLeft size={16} className="text-[#524F4A]" />
        </button>
        <div className="text-center">
          <p className="text-[13px] font-semibold text-[#0D0C0B]">
            {weekOffset === 0 ? 'This Week' : weekOffset === 1 ? 'Next Week' : weekOffset === -1 ? 'Last Week' : `Week ${weekOffset > 0 ? '+' : ''}${weekOffset}`}
          </p>
          <p className="text-[11px] text-[#A39E96]">{currentWeekStart}</p>
        </div>
        <button
          onClick={() => setWeekOffset(w => w + 1)}
          className="p-1.5 rounded-lg hover:bg-[#F5F3EF] transition-colors"
        >
          <ChevronRight size={16} className="text-[#524F4A]" />
        </button>
      </div>

      {/* Stats */}
      {posts.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total', value: stats.total, color: 'text-[#0D0C0B]' },
            { label: 'Draft', value: stats.draft, color: 'text-[#A39E96]' },
            { label: 'Scheduled', value: stats.scheduled, color: 'text-amber-600' },
            { label: 'Published', value: stats.published, color: 'text-emerald-600' },
          ].map(s => (
            <div key={s.label} className="bg-white border border-[#EDE9E3] rounded-xl p-3 text-center shadow-card">
              <p className={`text-[20px] font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[11px] text-[#A39E96]">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Week theme */}
      {weekTheme && (
        <div className="bg-gradient-to-r from-[#FF8C1A]/10 to-[#E67300]/5 border border-[#FF8C1A]/20 rounded-xl px-4 py-3">
          <p className="text-[11px] font-semibold text-[#FF8C1A] uppercase tracking-wide mb-0.5">This Week's Theme</p>
          <p className="text-[14px] font-semibold text-[#0D0C0B]">{weekTheme}</p>
        </div>
      )}

      {/* Empty state */}
      {posts.length === 0 && !generating && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-16 h-16 bg-[#F5F3EF] rounded-2xl flex items-center justify-center">
            <Sparkles size={28} className="text-[#FF8C1A]" />
          </div>
          <div className="text-center">
            <p className="text-[16px] font-bold text-[#0D0C0B]">No content plan yet</p>
            <p className="text-[13px] text-[#A39E96] mt-1 max-w-xs">
              Click "Generate 7-Day Plan" and your CMO Brain will create a full week of tailored posts with images, headlines, body copy, and hashtags.
            </p>
          </div>
          <button
            onClick={generateWeek}
            className="flex items-center gap-2 bg-[#FF8C1A] text-white text-[14px] font-semibold px-6 py-3 rounded-xl hover:bg-[#E67300] transition-all"
          >
            <Zap size={16} /> Generate 7-Day Plan
          </button>
        </div>
      )}

      {/* Generating skeleton */}
      {generating && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="bg-white border border-[#EDE9E3] rounded-2xl overflow-hidden animate-pulse">
              <div className="h-10 bg-[#F5F3EF]" />
              <div className="aspect-square bg-[#EDE9E3]" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-[#F5F3EF] rounded w-3/4" />
                <div className="h-3 bg-[#F5F3EF] rounded w-full" />
                <div className="h-3 bg-[#F5F3EF] rounded w-5/6" />
                <div className="h-8 bg-[#F5F3EF] rounded-xl mt-4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post grid */}
      {posts.length > 0 && !generating && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {posts
            .sort((a, b) => (a.day_number || 0) - (b.day_number || 0))
            .map(post => (
              <PostCard
                key={post.id}
                post={post}
                onApprove={handleApprove}
                onRevise={handleRevise}
                onGenerateImage={handleGenerateImage}
              />
            ))}
        </div>
      )}
    </div>
  )
}
