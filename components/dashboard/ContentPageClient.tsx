'use client'

import { useState, useEffect } from 'react'
import { Profile } from '@/types/database'
import { RefreshCw, ThumbsUp, Image as ImageIcon, Download, Clock } from 'lucide-react'

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
  image_prompt: string
  image_url?: string
  approved?: boolean
  revising?: boolean
  generating_image?: boolean
}

interface ContentPlan {
  platform: string
  posts: Post[]
}

interface ContentItem {
  id: string
  hook: string
  full_post: string
  topic: string
  platform: string
  status: string
  image_url?: string
  hashtags?: string[]
  cta?: string
  image_prompt?: string
  day?: string
  approved?: boolean
  created_at: string
}

const PLATFORMS = ['LinkedIn', 'Instagram', 'Twitter', 'Facebook']

const PLATFORM_CHARS: Record<string, number> = {
  LinkedIn: 1500,
  Instagram: 500,
  Twitter: 200,
  Facebook: 800,
}

interface Props {
  profile: Profile | null
  initialItems: ContentItem[]
}

export function ContentPageClient({ profile, initialItems }: Props) {
  const [view, setView] = useState<'generate' | 'library'>('generate')
  const [selectedPlatform, setSelectedPlatform] = useState('LinkedIn')
  const [contentPlan, setContentPlan] = useState<ContentPlan | null>(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [items, setItems] = useState<ContentItem[]>(initialItems)

  // On mount, check if strategy was passed from CMO Brain
  useEffect(() => {
    const saved = sessionStorage.getItem('cmo_platform')
    if (saved && PLATFORMS.includes(saved)) {
      setSelectedPlatform(saved)
    }
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
      setView('generate')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  const generateImage = async (postIndex: number) => {
    if (!contentPlan) return
    const post = contentPlan.posts[postIndex]
    setContentPlan(prev => {
      if (!prev) return prev
      const posts = [...prev.posts]
      posts[postIndex] = { ...posts[postIndex], generating_image: true }
      return { ...prev, posts }
    })
    try {
      const res = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: post.image_prompt,
          platform: selectedPlatform.toLowerCase(),
          content_item_id: post.id,
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setContentPlan(prev => {
        if (!prev) return prev
        const posts = [...prev.posts]
        posts[postIndex] = { ...posts[postIndex], image_url: data.image_url, generating_image: false }
        return { ...prev, posts }
      })
    } catch {
      setContentPlan(prev => {
        if (!prev) return prev
        const posts = [...prev.posts]
        posts[postIndex] = { ...posts[postIndex], generating_image: false }
        return { ...prev, posts }
      })
    }
  }

  const revisePost = async (postIndex: number) => {
    if (!contentPlan) return
    const post = contentPlan.posts[postIndex]
    setContentPlan(prev => {
      if (!prev) return prev
      const posts = [...prev.posts]
      posts[postIndex] = { ...posts[postIndex], revising: true }
      return { ...prev, posts }
    })
    try {
      const res = await fetch('/api/content-plan/revise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_item_id: post.id,
          topic: post.topic,
          pillar: post.pillar,
          platform: selectedPlatform,
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setContentPlan(prev => {
        if (!prev) return prev
        const posts = [...prev.posts]
        posts[postIndex] = {
          ...posts[postIndex],
          hook: data.revised.hook,
          body: data.revised.body,
          cta: data.revised.cta,
          hashtags: data.revised.hashtags,
          image_prompt: data.revised.image_prompt,
          image_url: undefined,
          approved: false,
          revising: false,
        }
        return { ...prev, posts }
      })
    } catch {
      setContentPlan(prev => {
        if (!prev) return prev
        const posts = [...prev.posts]
        posts[postIndex] = { ...posts[postIndex], revising: false }
        return { ...prev, posts }
      })
    }
  }

  const approvePost = async (postIndex: number) => {
    if (!contentPlan) return
    const post = contentPlan.posts[postIndex]
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
      posts[postIndex] = { ...posts[postIndex], approved: true }
      return { ...prev, posts }
    })
  }

  const isTwitter = selectedPlatform === 'Twitter'
  const approvedCount = contentPlan?.posts.filter(p => p.approved).length || 0

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#0D0C0B]">Content Engine</h1>
          <p className="text-[#7A7670] text-[14px] mt-1">Generate 7 days of platform-optimized content</p>
        </div>
        {contentPlan && (
          <span className="text-[13px] text-[#7A7670] bg-white border border-[#EDE9E3] px-3 py-1.5 rounded-lg">
            {approvedCount}/{contentPlan.posts.length} approved
          </span>
        )}
      </div>

      {/* Platform selector + Generate button */}
      <div className="bg-white border border-[#EDE9E3] rounded-2xl p-5">
        <p className="text-[12px] font-bold text-[#A39E96] uppercase tracking-wider mb-3">Select Platform</p>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {PLATFORMS.map(p => (
            <button
              key={p}
              onClick={() => setSelectedPlatform(p)}
              className={`py-2.5 px-3 rounded-xl text-[13px] font-semibold border transition-all ${
                selectedPlatform === p
                  ? 'bg-[#0D0C0B] text-white border-[#0D0C0B]'
                  : 'bg-[#F5F3EF] text-[#524F4A] border-[#EDE9E3] hover:border-[#0D0C0B]'
              }`}
            >
              <div>{p}</div>
              <div className="text-[10px] opacity-60 mt-0.5">max {PLATFORM_CHARS[p]} chars</div>
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-[13px] px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <button
          onClick={generatePlan}
          disabled={generating}
          className="w-full bg-[#FF8C1A] text-white py-3 rounded-xl text-[14px] font-bold hover:bg-[#E67300] disabled:opacity-50 transition-colors"
        >
          {generating
            ? 'Generating your 7-day content plan...'
            : contentPlan
              ? `Regenerate for ${selectedPlatform}`
              : `Generate 7-Day ${selectedPlatform} Content`}
        </button>

        {generating && (
          <p className="text-center text-[12px] text-[#A39E96] mt-2">
            Writing platform-optimized posts, hooks, CTAs and image prompts...
          </p>
        )}
      </div>

      {/* Content cards */}
      {contentPlan && contentPlan.posts.map((post, i) => (
        <div
          key={i}
          className={`bg-white border rounded-2xl overflow-hidden transition-all ${
            post.approved ? 'border-green-300 shadow-sm shadow-green-50' : 'border-[#EDE9E3]'
          }`}
        >
          {/* Day header */}
          <div className="flex items-center justify-between px-5 py-3 bg-[#F5F3EF] border-b border-[#EDE9E3]">
            <div className="flex items-center gap-3">
              <span className="font-bold text-[#0D0C0B] text-[14px]">{post.day} — {post.day_name}</span>
              <span className="bg-[#FF8C1A]/15 text-[#E67300] text-[11px] font-bold px-2 py-0.5 rounded-full">
                {post.pillar}
              </span>
              <span className="text-[11px] text-[#A39E96]">{selectedPlatform}</span>
            </div>
            {post.approved && (
              <span className="flex items-center gap-1 text-green-600 text-[12px] font-semibold">
                <ThumbsUp size={12} /> Approved
              </span>
            )}
          </div>

          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Left: Content */}
              <div className="space-y-4">
                <div>
                  <p className="text-[11px] font-bold text-[#A39E96] uppercase tracking-wider mb-1">Topic</p>
                  <p className="font-semibold text-[#0D0C0B] text-[14px]">{post.topic}</p>
                </div>

                <div>
                  <p className="text-[11px] font-bold text-[#A39E96] uppercase tracking-wider mb-1">
                    Hook {isTwitter && <span className="text-[#FF8C1A]">(Twitter — keep short)</span>}
                  </p>
                  <p className="text-[14px] text-[#0D0C0B] font-semibold leading-snug">{post.hook}</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[11px] font-bold text-[#A39E96] uppercase tracking-wider">
                      Post Body
                    </p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      (post.body?.length || 0) <= PLATFORM_CHARS[selectedPlatform]
                        ? 'bg-green-50 text-green-600'
                        : 'bg-red-50 text-red-500'
                    }`}>
                      {post.body?.length || 0}/{PLATFORM_CHARS[selectedPlatform]} chars
                    </span>
                  </div>
                  <div className={`bg-[#FAFAF8] rounded-xl p-4 ${isTwitter ? 'border-2 border-sky-100' : ''}`}>
                    <p className="text-[13px] text-[#524F4A] leading-relaxed whitespace-pre-line">{post.body}</p>
                  </div>
                  {isTwitter && (post.body?.length || 0) > 200 && (
                    <p className="text-red-500 text-[11px] mt-1 font-medium">
                      Warning: exceeds 200 character limit. Click Revise to regenerate.
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-[11px] font-bold text-[#A39E96] uppercase tracking-wider mb-1">CTA</p>
                  <p className="text-[13px] text-[#0D0C0B] font-medium">{post.cta}</p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {post.hashtags?.map((tag, j) => (
                    <span key={j} className="bg-blue-50 text-blue-600 text-[11px] px-2 py-0.5 rounded-full font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right: Image */}
              <div className="space-y-3">
                <p className="text-[11px] font-bold text-[#A39E96] uppercase tracking-wider">AI Image</p>

                {post.image_url ? (
                  <div className="relative group">
                    <img
                      src={post.image_url}
                      alt="Post visual"
                      className="w-full rounded-xl border border-[#EDE9E3]"
                    />
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => generateImage(i)}
                        className="bg-white/90 backdrop-blur text-[#524F4A] p-2 rounded-lg hover:bg-white shadow-sm"
                        title="Regenerate image"
                      >
                        <RefreshCw size={14} />
                      </button>
                      <a
                        href={post.image_url}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white/90 backdrop-blur text-[#524F4A] p-2 rounded-lg hover:bg-white shadow-sm"
                        title="Download image"
                      >
                        <Download size={14} />
                      </a>
                    </div>
                  </div>
                ) : post.generating_image ? (
                  <div className="bg-[#F5F3EF] rounded-xl h-48 flex flex-col items-center justify-center gap-3">
                    <div className="w-8 h-8 border-2 border-[#FF8C1A] border-t-transparent rounded-full animate-spin" />
                    <p className="text-[12px] text-[#A39E96]">Generating image... (10-20 sec)</p>
                  </div>
                ) : (
                  <button
                    onClick={() => generateImage(i)}
                    className="w-full bg-[#F5F3EF] border-2 border-dashed border-[#EDE9E3] rounded-xl h-48 flex flex-col items-center justify-center gap-2 hover:border-[#FF8C1A] hover:bg-[#FFF8F0] transition-all group"
                  >
                    <ImageIcon size={24} className="text-[#C9C4BC] group-hover:text-[#FF8C1A]" />
                    <p className="text-[12px] text-[#A39E96] group-hover:text-[#FF8C1A] font-medium">
                      Generate AI image (free)
                    </p>
                    <p className="text-[11px] text-[#C9C4BC]">Powered by Pollinations AI</p>
                  </button>
                )}

                <p className="text-[10px] text-[#C9C4BC] leading-relaxed line-clamp-2">
                  Prompt: {post.image_prompt}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 mt-5 pt-4 border-t border-[#F5F3EF]">
              {post.approved ? (
                <div className="flex-1 bg-green-50 border border-green-200 text-green-700 py-2.5 rounded-xl text-[13px] font-semibold text-center flex items-center justify-center gap-2">
                  <ThumbsUp size={14} /> Approved and Scheduled
                </div>
              ) : (
                <>
                  <button
                    onClick={() => approvePost(i)}
                    disabled={post.revising}
                    className="flex-1 bg-[#0D0C0B] text-white py-2.5 rounded-xl text-[13px] font-semibold hover:bg-[#1A1714] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <ThumbsUp size={14} /> Approve & Schedule
                  </button>
                  <button
                    onClick={() => revisePost(i)}
                    disabled={post.revising}
                    className="flex-1 border border-[#EDE9E3] text-[#524F4A] py-2.5 rounded-xl text-[13px] font-medium hover:border-[#0D0C0B] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  >
                    {post.revising ? (
                      <><RefreshCw size={14} className="animate-spin" /> Revising...</>
                    ) : (
                      <><RefreshCw size={14} /> Revise Post</>
                    )}
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
          <div className="text-3xl mb-2">🎉</div>
          <p className="font-bold text-green-800 text-[16px]">All 7 posts approved!</p>
          <p className="text-[13px] text-green-600 mt-1">
            Your content is saved. Go to the Scheduler to manage publishing dates.
          </p>
        </div>
      )}

      {/* Library of past content */}
      {!contentPlan && initialItems.length > 0 && (
        <div>
          <h2 className="font-bold text-[#0D0C0B] text-[16px] mb-3">Previous Content</h2>
          <div className="space-y-3">
            {initialItems.slice(0, 10).map(item => (
              <div key={item.id} className="bg-white border border-[#EDE9E3] rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[11px] font-bold text-[#A39E96] uppercase bg-[#F5F3EF] px-2 py-0.5 rounded">
                        {item.platform}
                      </span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        item.approved ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
                      }`}>
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
