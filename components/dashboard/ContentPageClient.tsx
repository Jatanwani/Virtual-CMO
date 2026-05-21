'use client'

import { useState, useEffect } from 'react'
import { Profile } from '@/types/database'
import { RefreshCw, ThumbsUp, Clock, Download, Copy } from 'lucide-react'

interface Post {
  id?: string
  day: string
  day_name: string
  pillar: string
  topic: string
  hook: string
  body: string
  cta: string
  hashtags: string[]
  approved?: boolean
  revising?: boolean
}

interface ContentItem {
  id: string
  hook: string
  full_post: string
  topic: string
  platform: string
  status: string
  hashtags?: string[]
  cta?: string
  day?: string
  approved?: boolean
  created_at: string
}

const PLATFORMS = ['LinkedIn', 'Instagram', 'X', 'Facebook']

const PLATFORM_CHARS: Record<string, number> = {
  LinkedIn: 1500,
  Instagram: 500,
  X: 200,
  Facebook: 800,
}

const PLATFORM_TIPS: Record<string, string> = {
  LinkedIn: 'Long-form storytelling · Professional tone · 5-8 hashtags',
  Instagram: 'Short punchy captions · Emotional · 10-15 hashtags',
  X: 'Max 200 chars · Ultra concise · 2-3 hashtags',
  Facebook: 'Conversational · Ask questions · 3-5 hashtags',
}

interface Props {
  profile: Profile | null
  initialItems: ContentItem[]
}

export function ContentPageClient({ profile, initialItems }: Props) {
  const [selectedPlatform, setSelectedPlatform] = useState('LinkedIn')
  const [contentPlan, setContentPlan] = useState<{ posts: Post[] } | null>(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [items] = useState<ContentItem[]>(initialItems)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    const saved = sessionStorage.getItem('cmo_platform')
    if (saved && PLATFORMS.includes(saved)) setSelectedPlatform(saved)
  }, [])

  const generatePlan = async () => {
    setGenerating(true)
    setError('')
    try {
      const strategyRaw = sessionStorage.getItem('cmo_strategy')
      const strategy = strategyRaw ? JSON.parse(strategyRaw) : null
      const res = await fetch('/api/content-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strategy, platform: selectedPlatform }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setContentPlan(data.plan)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  const revisePost = async (idx: number) => {
    if (!contentPlan) return
    const post = contentPlan.posts[idx]
    setContentPlan(prev => {
      if (!prev) return prev
      const posts = [...prev.posts]
      posts[idx] = { ...posts[idx], revising: true }
      return { ...prev, posts }
    })
    try {
      const res = await fetch('/api/content-plan/revise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content_item_id: post.id, topic: post.topic, pillar: post.pillar, platform: selectedPlatform }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setContentPlan(prev => {
        if (!prev) return prev
        const posts = [...prev.posts]
        posts[idx] = { ...posts[idx], hook: data.revised.hook, body: data.revised.body, cta: data.revised.cta, hashtags: data.revised.hashtags, approved: false, revising: false }
        return { ...prev, posts }
      })
    } catch {
      setContentPlan(prev => {
        if (!prev) return prev
        const posts = [...prev.posts]
        posts[idx] = { ...posts[idx], revising: false }
        return { ...prev, posts }
      })
    }
  }

  const approvePost = async (idx: number) => {
    if (!contentPlan) return
    const post = contentPlan.posts[idx]
    if (post.id) {
      await fetch('/api/content-plan/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content_item_id: post.id }),
      })
    }
    setContentPlan(prev => {
      if (!prev) return prev
      const posts = [...prev.posts]
      posts[idx] = { ...posts[idx], approved: true }
      return { ...prev, posts }
    })
  }

  const copyPost = async (post: Post) => {
    const text = `${post.hook}\n\n${post.body}\n\n${post.cta}\n\n${post.hashtags?.map(h => '#' + h).join(' ')}`
    await navigator.clipboard.writeText(text)
    setCopied(post.id || post.day)
    setTimeout(() => setCopied(null), 2000)
  }

  const downloadAll = () => {
    if (!contentPlan) return
    const text = contentPlan.posts.map(p =>
      `=== ${p.day} — ${p.day_name} ===\nTopic: ${p.topic}\n\nHook:\n${p.hook}\n\nBody:\n${p.body}\n\nCTA: ${p.cta}\n\nHashtags: ${p.hashtags?.map(h => '#' + h).join(' ')}\n`
    ).join('\n\n' + '-'.repeat(50) + '\n\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `7-day-${selectedPlatform.toLowerCase()}-content.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const isX = selectedPlatform === 'X'
  const approvedCount = contentPlan?.posts.filter(p => p.approved).length || 0

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#0D0C0B]">Content Engine</h1>
          <p className="text-[14px] text-[#7A7670] mt-1">Generate 7 days of platform-optimized text content</p>
        </div>
        {contentPlan && (
          <div className="flex items-center gap-3">
            <span className="text-[12px] text-[#7A7670]">{approvedCount}/{contentPlan.posts.length} approved</span>
            <button onClick={downloadAll}
              className="flex items-center gap-1.5 px-3 py-2 border border-[#EDE9E3] bg-white rounded-xl text-[12px] font-semibold hover:border-[#0D0C0B] transition-colors">
              <Download size={13} /> Download All
            </button>
          </div>
        )}
      </div>

      {/* Platform selector */}
      <div className="bg-white border border-[#EDE9E3] rounded-2xl p-5">
        <p className="text-[11.5px] font-bold text-[#A39E96] uppercase tracking-wider mb-3">Select Platform</p>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {PLATFORMS.map(p => (
            <button key={p} onClick={() => setSelectedPlatform(p)}
              className={`py-3 px-2 rounded-xl text-[13px] font-semibold border transition-all ${
                selectedPlatform === p ? 'bg-[#0D0C0B] text-white border-[#0D0C0B]' : 'bg-[#F5F3EF] text-[#524F4A] border-[#EDE9E3] hover:border-[#0D0C0B]'
              }`}>
              <div>{p}</div>
              <div className="text-[10px] opacity-60 mt-0.5">max {PLATFORM_CHARS[p]}</div>
            </button>
          ))}
        </div>

        <p className="text-[12px] text-[#A39E96] mb-4">{PLATFORM_TIPS[selectedPlatform]}</p>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-[13px] px-4 py-3 rounded-xl">{error}</div>
        )}

        <button onClick={generatePlan} disabled={generating}
          className="w-full bg-[#FF8C1A] text-white py-3.5 rounded-xl text-[14px] font-bold hover:bg-[#E67300] disabled:opacity-50 transition-colors">
          {generating ? (
            <span className="flex items-center justify-center gap-2">
              <RefreshCw size={14} className="animate-spin" />
              Generating 7-day {selectedPlatform} content plan...
            </span>
          ) : contentPlan ? `Regenerate for ${selectedPlatform}` : `Generate 7-Day ${selectedPlatform} Content`}
        </button>
      </div>

      {/* Content cards */}
      {contentPlan && contentPlan.posts.map((post, i) => (
        <div key={i} className={`bg-white border rounded-2xl overflow-hidden transition-all ${
          post.approved ? 'border-green-300' : 'border-[#EDE9E3]'
        }`}>
          {/* Card header */}
          <div className="flex items-center justify-between px-5 py-3 bg-[#F5F3EF] border-b border-[#EDE9E3]">
            <div className="flex items-center gap-3">
              <span className="font-bold text-[#0D0C0B] text-[14px]">{post.day} — {post.day_name}</span>
              <span className="bg-[#FF8C1A]/15 text-[#E67300] text-[11px] font-bold px-2 py-0.5 rounded-full">{post.pillar}</span>
            </div>
            <div className="flex items-center gap-2">
              {post.approved && (
                <span className="flex items-center gap-1 text-green-600 text-[12px] font-semibold">
                  <ThumbsUp size={12} /> Approved
                </span>
              )}
              <button onClick={() => copyPost(post)}
                className="flex items-center gap-1 text-[12px] text-[#7A7670] hover:text-[#0D0C0B] transition-colors px-2 py-1 rounded-lg hover:bg-white">
                <Copy size={12} />
                {copied === (post.id || post.day) ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* Topic */}
            <div>
              <p className="text-[11px] font-bold text-[#A39E96] uppercase tracking-wider mb-1">Topic</p>
              <p className="font-semibold text-[#0D0C0B] text-[14px]">{post.topic}</p>
            </div>

            {/* Hook */}
            <div>
              <p className="text-[11px] font-bold text-[#A39E96] uppercase tracking-wider mb-1">
                Hook {isX && <span className="text-[#FF8C1A] normal-case font-normal">(keep short for X)</span>}
              </p>
              <p className="text-[14px] text-[#0D0C0B] font-semibold leading-snug">{post.hook}</p>
            </div>

            {/* Body */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-[11px] font-bold text-[#A39E96] uppercase tracking-wider">Post Body</p>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  (post.body?.length || 0) <= PLATFORM_CHARS[selectedPlatform]
                    ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
                }`}>
                  {post.body?.length || 0}/{PLATFORM_CHARS[selectedPlatform]} chars
                </span>
              </div>
              <div className="bg-[#FAFAF8] border border-[#EDE9E3] rounded-xl p-4">
                <p className="text-[13px] text-[#524F4A] leading-relaxed whitespace-pre-line">{post.body}</p>
              </div>
              {isX && (post.body?.length || 0) > 200 && (
                <p className="text-red-500 text-[11px] mt-1 font-medium">Over 200 chars — click Revise to fix</p>
              )}
            </div>

            {/* CTA */}
            <div>
              <p className="text-[11px] font-bold text-[#A39E96] uppercase tracking-wider mb-1">CTA</p>
              <p className="text-[13px] text-[#0D0C0B] font-medium">{post.cta}</p>
            </div>

            {/* Hashtags */}
            <div className="flex flex-wrap gap-1.5">
              {post.hashtags?.map((tag, j) => (
                <span key={j} className="bg-blue-50 text-blue-600 text-[11px] px-2.5 py-0.5 rounded-full font-medium">#{tag}</span>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-[#F5F3EF]">
              {post.approved ? (
                <div className="flex-1 bg-green-50 border border-green-200 text-green-700 py-2.5 rounded-xl text-[13px] font-semibold text-center flex items-center justify-center gap-2">
                  <ThumbsUp size={13} /> Approved
                </div>
              ) : (
                <>
                  <button onClick={() => approvePost(i)} disabled={post.revising}
                    className="flex-1 bg-[#0D0C0B] text-white py-2.5 rounded-xl text-[13px] font-semibold hover:bg-[#1A1714] disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                    <ThumbsUp size={13} /> Approve
                  </button>
                  <button onClick={() => revisePost(i)} disabled={post.revising}
                    className="flex-1 border border-[#EDE9E3] text-[#524F4A] py-2.5 rounded-xl text-[13px] font-medium hover:border-[#0D0C0B] disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                    {post.revising ? <><RefreshCw size={13} className="animate-spin" /> Revising...</> : <><RefreshCw size={13} /> Revise</>}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* All approved */}
      {contentPlan && approvedCount === contentPlan.posts.length && contentPlan.posts.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
          <p className="text-3xl mb-2">🎉</p>
          <p className="font-bold text-green-800 text-[16px]">All 7 posts approved!</p>
          <p className="text-[13px] text-green-600 mt-1 mb-4">Download your content and post manually to your social media.</p>
          <button onClick={downloadAll}
            className="flex items-center gap-2 bg-[#0D0C0B] text-white px-6 py-3 rounded-xl text-[13px] font-semibold mx-auto hover:bg-[#1A1714] transition-colors">
            <Download size={14} /> Download All 7 Posts
          </button>
        </div>
      )}

      {/* Previous content library */}
      {!contentPlan && items.length > 0 && (
        <div>
          <h2 className="font-bold text-[#0D0C0B] text-[16px] mb-3">Previous Content</h2>
          <div className="space-y-3">
            {items.slice(0, 10).map(item => (
              <div key={item.id} className="bg-white border border-[#EDE9E3] rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[11px] font-bold text-[#A39E96] uppercase bg-[#F5F3EF] px-2 py-0.5 rounded">{item.platform}</span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${item.approved ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                        {item.approved ? 'Approved' : item.status}
                      </span>
                    </div>
                    <p className="font-semibold text-[#0D0C0B] text-[14px]">{item.hook || item.topic}</p>
                    <p className="text-[12px] text-[#7A7670] mt-1 line-clamp-2">{item.full_post}</p>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-[#A39E96] flex-shrink-0">
                    <Clock size={11} />
                    {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
