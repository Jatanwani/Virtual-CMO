'use client'

import { useState, useRef, useEffect } from 'react'
import { Profile, ChatMessage } from '@/types/database'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Zap, RotateCcw, Copy, Check, ChevronRight, Sparkles, RefreshCw, ThumbsUp, Globe } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

// ─── Types ────────────────────────────────────────────────────────────────────
interface DisplayMessage {
  role: 'user' | 'assistant'
  content: string
  id?: string
}

interface ContentPillar {
  name: string
  why: string
  examples: string[]
}

interface Strategy {
  archetype: string
  one_liner: string
  top_channels: string[]
  content_pillars: ContentPillar[]
  ninety_day_plan: { phase: string; focus: string; actions: string[] }[]
  quick_wins: string[]
  needs_landing_page: boolean
  landing_page_reason: string
}

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
  status?: string
  revising?: boolean
  generating_image?: boolean
}

interface ContentPlan {
  week_start: string
  platform: string
  posts: Post[]
}

const QUICK_PROMPTS = [
  { label: 'Generate my full marketing strategy', icon: '🧠', action: 'strategy' },
  { label: 'Top 3 growth channels for me', icon: '🎯', action: 'chat' },
  { label: 'Write a cold DM script for my ICP', icon: '✍️', action: 'chat' },
  { label: 'Diagnose my biggest bottleneck', icon: '🔍', action: 'chat' },
  { label: 'Lead magnet ideas for my product', icon: '🧲', action: 'chat' },
  { label: 'How to get my first 100 customers', icon: '🚀', action: 'chat' },
]

const PLATFORMS = ['LinkedIn', 'Instagram', 'Twitter', 'Facebook']

interface Props {
  profile: Profile | null
  initialMessages: ChatMessage[]
}

export function CMOBrainClient({ profile, initialMessages }: Props) {
  const [messages, setMessages] = useState<DisplayMessage[]>(() => {
    if (initialMessages.length === 0) {
      return [{
        role: 'assistant',
        content: `Hey${profile?.full_name ? ` ${profile.full_name.split(' ')[0]}` : ''}! I'm your Virtual CMO. 🎯\n\nI've reviewed your profile. You're building **${profile?.product?.slice(0, 80) || 'your startup'}** targeting **${profile?.icp?.slice(0, 60) || 'your audience'}**.\n\nYour 30-day goal: *${profile?.goal_30?.slice(0, 100) || 'set in settings'}*\n\nClick **"Generate my full marketing strategy"** to get your complete growth plan, or ask me anything!`,
      }]
    }
    return initialMessages.map(m => ({ role: m.role, content: m.content, id: m.id }))
  })

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Strategy flow state
  const [view, setView] = useState<'chat' | 'strategy' | 'content'>('chat')
  const [strategy, setStrategy] = useState<Strategy | null>(null)
  const [generatingStrategy, setGeneratingStrategy] = useState(false)
  const [contentPlan, setContentPlan] = useState<ContentPlan | null>(null)
  const [generatingContent, setGeneratingContent] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState('LinkedIn')
  const [generatingLanding, setGeneratingLanding] = useState(false)
  const [landingHtml, setLandingHtml] = useState('')

  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // ─── Generate Strategy ─────────────────────────────────────────────────────
  const generateStrategy = async () => {
    setGeneratingStrategy(true)
    setView('strategy')
    try {
      const res = await fetch('/api/strategy', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setStrategy(data.strategy)
    } catch (err: any) {
      alert('Failed to generate strategy: ' + err.message)
      setView('chat')
    } finally {
      setGeneratingStrategy(false)
    }
  }

  // ─── Generate 7-Day Content Plan ──────────────────────────────────────────
  const generateContentPlan = async () => {
    if (!strategy) return
    setGeneratingContent(true)
    setView('content')
    try {
      const res = await fetch('/api/content-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strategy, platform: selectedPlatform }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setContentPlan(data.plan)
    } catch (err: any) {
      alert('Failed to generate content: ' + err.message)
    } finally {
      setGeneratingContent(false)
    }
  }

  // ─── Generate Image for a Post ────────────────────────────────────────────
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
    } catch (err: any) {
      setContentPlan(prev => {
        if (!prev) return prev
        const posts = [...prev.posts]
        posts[postIndex] = { ...posts[postIndex], generating_image: false }
        return { ...prev, posts }
      })
    }
  }

  // ─── Revise a Post ────────────────────────────────────────────────────────
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
          revising: false,
          approved: false,
        }
        return { ...prev, posts }
      })
    } catch (err: any) {
      setContentPlan(prev => {
        if (!prev) return prev
        const posts = [...prev.posts]
        posts[postIndex] = { ...posts[postIndex], revising: false }
        return { ...prev, posts }
      })
    }
  }

  // ─── Approve a Post ───────────────────────────────────────────────────────
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
      posts[postIndex] = { ...posts[postIndex], approved: true, status: 'scheduled' }
      return { ...prev, posts }
    })
  }

  // ─── Generate Landing Page ────────────────────────────────────────────────
  const generateLandingPage = async () => {
    setGeneratingLanding(true)
    try {
      const res = await fetch('/api/landing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: profile?.product, description: profile?.problem }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setLandingHtml(data.html)
    } catch (err: any) {
      alert('Failed to generate landing page: ' + err.message)
    } finally {
      setGeneratingLanding(false)
    }
  }

  const downloadLanding = () => {
    const blob = new Blob([landingHtml], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'landing-page.html'
    a.click()
  }

  // ─── Chat ─────────────────────────────────────────────────────────────────
  const handleSend = async (text?: string, action?: string) => {
    if (action === 'strategy') { generateStrategy(); return }
    const msg = text || input.trim()
    if (!msg || loading) return
    const userMessage: DisplayMessage = { role: 'user', content: msg }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    const historyForAPI = newMessages
      .filter((m, idx) => !(idx === 0 && m.role === 'assistant' && initialMessages.length === 0))
      .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))
    try {
      const res = await fetch('/api/cmo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: historyForAPI }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      if (!res.body) throw new Error('No response body')
      setMessages(prev => [...prev, { role: 'assistant', content: '' }])
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        if (chunk.includes('"__meta":true')) continue
        fullContent += chunk
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { ...updated[updated.length - 1], content: fullContent }
          return updated
        })
      }
      if (fullContent) {
        fetch('/api/cmo/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: fullContent }) }).catch(() => {})
      }
    } catch (err: any) {
      setMessages(prev => prev[prev.length - 1]?.role === 'assistant' && !prev[prev.length - 1]?.content ? prev.slice(0, -1) : prev)
    }
    setLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const approvedCount = contentPlan?.posts.filter(p => p.approved).length || 0

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="h-[calc(100vh-100px)] flex flex-col">

      {/* Top nav tabs */}
      <div className="flex items-center gap-2 mb-4 flex-shrink-0">
        <div className="flex gap-1 bg-[#F0EDE8] p-1 rounded-xl">
          {[
            { id: 'chat', label: '💬 Chat' },
            { id: 'strategy', label: '🧠 Strategy' },
            { id: 'content', label: '📅 7-Day Content' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${
                view === tab.id ? 'bg-white text-[#0D0C0B] shadow-sm' : 'text-[#7A7670] hover:text-[#524F4A]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {view === 'strategy' && strategy && (
          <button
            onClick={() => setView('content')}
            className="ml-auto flex items-center gap-2 bg-[#FF8C1A] text-white px-4 py-2 rounded-xl text-[13px] font-semibold hover:bg-[#E67300] transition-colors"
          >
            <Sparkles size={14} />
            Generate 7-Day Content
          </button>
        )}
        {view === 'content' && contentPlan && (
          <div className="ml-auto text-[12px] text-[#7A7670]">
            {approvedCount}/{contentPlan.posts.length} approved
          </div>
        )}
      </div>

      {/* ── CHAT VIEW ─────────────────────────────────────────────────────── */}
      {view === 'chat' && (
        <div className="flex flex-col flex-1 min-h-0">
          {messages.length <= 1 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4 flex-shrink-0">
              {QUICK_PROMPTS.map(p => (
                <button
                  key={p.label}
                  onClick={() => handleSend(p.label, p.action)}
                  className={`flex items-center gap-2 border rounded-xl px-3 py-2.5 text-left hover:shadow-sm transition-all group ${
                    p.action === 'strategy'
                      ? 'bg-[#0D0C0B] border-[#0D0C0B] text-white'
                      : 'bg-white border-[#EDE9E3] hover:border-[#C9C4BC]'
                  }`}
                >
                  <span className="text-base">{p.icon}</span>
                  <span className={`text-[12px] font-medium leading-tight ${p.action === 'strategy' ? 'text-white' : 'text-[#524F4A]'}`}>{p.label}</span>
                </button>
              ))}
            </div>
          )}

          <div className="flex-1 overflow-y-auto space-y-4 pb-4 min-h-0">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1 text-[10px] font-bold ${
                    msg.role === 'assistant' ? 'bg-[#0D0C0B] text-[#FF8C1A]' : 'bg-gradient-to-br from-[#FF8C1A] to-[#E67300] text-white'
                  }`}>
                    {msg.role === 'assistant' ? 'C' : (profile?.full_name || 'F')[0].toUpperCase()}
                  </div>
                  <div className={`max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div className={`px-4 py-3 rounded-2xl text-[14px] leading-relaxed ${
                      msg.role === 'user' ? 'bg-[#0D0C0B] text-white rounded-tr-sm' : 'bg-white border border-[#EDE9E3] text-[#0D0C0B] rounded-tl-sm'
                    }`}>
                      {msg.role === 'assistant' ? (
                        <div className="prose prose-sm max-w-none"><ReactMarkdown>{msg.content}</ReactMarkdown></div>
                      ) : msg.content}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {loading && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-[#0D0C0B] flex items-center justify-center text-[10px] font-bold text-[#FF8C1A]">C</div>
                <div className="bg-white border border-[#EDE9E3] rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C9C4BC] animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C9C4BC] animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C9C4BC] animate-bounce" />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="bg-white border border-[#EDE9E3] rounded-2xl p-3 flex items-end gap-3 flex-shrink-0">
            <textarea ref={textareaRef} rows={1} value={input}
              onChange={e => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px' }}
              onKeyDown={handleKeyDown}
              placeholder="Ask your CMO anything..."
              className="flex-1 resize-none bg-transparent text-[14px] text-[#0D0C0B] placeholder:text-[#C9C4BC] focus:outline-none leading-relaxed max-h-[120px] py-1"
            />
            <button onClick={() => handleSend()} disabled={!input.trim() || loading}
              className="w-9 h-9 bg-[#0D0C0B] rounded-xl flex items-center justify-center hover:bg-[#1A1714] transition-all disabled:opacity-30">
              <Send size={14} className="text-white" />
            </button>
          </div>
        </div>
      )}

      {/* ── STRATEGY VIEW ─────────────────────────────────────────────────── */}
      {view === 'strategy' && (
        <div className="flex-1 overflow-y-auto space-y-5">
          {generatingStrategy && (
            <div className="bg-white border border-[#EDE9E3] rounded-2xl p-8 text-center">
              <div className="text-3xl mb-3 animate-pulse">🧠</div>
              <p className="font-semibold text-[#0D0C0B]">Building your marketing strategy...</p>
              <p className="text-[13px] text-[#7A7670] mt-1">Analyzing your business, ICP, and growth levers</p>
            </div>
          )}

          {!strategy && !generatingStrategy && (
            <div className="bg-white border border-[#EDE9E3] rounded-2xl p-8 text-center">
              <div className="text-3xl mb-3">🧠</div>
              <p className="font-semibold text-[#0D0C0B] mb-4">Generate your personalized marketing strategy</p>
              <button onClick={generateStrategy}
                className="bg-[#0D0C0B] text-white px-6 py-3 rounded-xl text-[14px] font-semibold hover:bg-[#1A1714] transition-colors">
                Generate Strategy →
              </button>
            </div>
          )}

          {strategy && !generatingStrategy && (
            <>
              {/* Archetype + positioning */}
              <div className="bg-[#0D0C0B] rounded-2xl p-6 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-[#FF8C1A] text-white text-[11px] font-bold px-2 py-1 rounded-lg uppercase tracking-wide">{strategy.archetype}</span>
                </div>
                <p className="text-[18px] font-bold leading-snug">"{strategy.one_liner}"</p>
                <div className="flex gap-2 mt-4 flex-wrap">
                  {strategy.top_channels?.map(ch => (
                    <span key={ch} className="bg-white/10 text-white/80 text-[12px] px-3 py-1 rounded-full">{ch}</span>
                  ))}
                </div>
              </div>

              {/* Content Pillars */}
              <div className="bg-white border border-[#EDE9E3] rounded-2xl p-6">
                <h3 className="font-bold text-[#0D0C0B] mb-4">📌 Content Pillars</h3>
                <div className="space-y-4">
                  {strategy.content_pillars?.map((pillar, i) => (
                    <div key={i} className="border border-[#EDE9E3] rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-6 h-6 bg-[#FF8C1A] rounded-lg flex items-center justify-center text-white text-[11px] font-bold">{i+1}</span>
                        <span className="font-semibold text-[#0D0C0B]">{pillar.name}</span>
                      </div>
                      <p className="text-[13px] text-[#7A7670] mb-3">{pillar.why}</p>
                      <div className="flex flex-wrap gap-2">
                        {pillar.examples?.map((ex, j) => (
                          <span key={j} className="bg-[#F5F3EF] text-[#524F4A] text-[12px] px-3 py-1 rounded-full">{ex}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 90-day plan */}
              <div className="bg-white border border-[#EDE9E3] rounded-2xl p-6">
                <h3 className="font-bold text-[#0D0C0B] mb-4">📅 90-Day Growth Plan</h3>
                <div className="space-y-4">
                  {strategy.ninety_day_plan?.map((phase, i) => (
                    <div key={i} className="border border-[#EDE9E3] rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="bg-[#0D0C0B] text-white text-[11px] font-bold px-3 py-1 rounded-lg">{phase.phase}</span>
                        <span className="font-semibold text-[#0D0C0B] text-[14px]">{phase.focus}</span>
                      </div>
                      <ul className="space-y-1.5">
                        {phase.actions?.map((action, j) => (
                          <li key={j} className="flex items-start gap-2 text-[13px] text-[#524F4A]">
                            <ChevronRight size={14} className="text-[#FF8C1A] mt-0.5 flex-shrink-0" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick wins */}
              <div className="bg-[#FFF8F0] border border-[#FFD4A3] rounded-2xl p-5">
                <h3 className="font-bold text-[#0D0C0B] mb-3">⚡ Quick Wins (Do These Today)</h3>
                <ul className="space-y-2">
                  {strategy.quick_wins?.map((win, i) => (
                    <li key={i} className="flex items-start gap-2 text-[13px] text-[#524F4A]">
                      <span className="text-[#FF8C1A] font-bold">{i+1}.</span>
                      {win}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Landing page suggestion */}
              {strategy.needs_landing_page && (
                <div className="bg-white border border-[#EDE9E3] rounded-2xl p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <Globe size={20} className="text-[#FF8C1A] mt-0.5" />
                    <div>
                      <h3 className="font-bold text-[#0D0C0B]">Landing Page Recommended</h3>
                      <p className="text-[13px] text-[#7A7670] mt-1">{strategy.landing_page_reason}</p>
                    </div>
                  </div>

                  {!landingHtml && (
                    <button onClick={generateLandingPage} disabled={generatingLanding}
                      className="w-full bg-[#0D0C0B] text-white py-3 rounded-xl text-[14px] font-semibold hover:bg-[#1A1714] disabled:opacity-50 transition-colors">
                      {generatingLanding ? '✦ Building your landing page...' : '✦ Generate Landing Page + Download Code'}
                    </button>
                  )}

                  {landingHtml && (
                    <div className="space-y-3">
                      <div className="border border-[#EDE9E3] rounded-xl overflow-hidden">
                        <iframe srcDoc={landingHtml} className="w-full h-[400px] border-0" title="Landing page preview" />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={downloadLanding}
                          className="flex-1 bg-[#0D0C0B] text-white py-2.5 rounded-lg text-[13px] font-semibold hover:bg-[#1A1714] transition-colors">
                          ↓ Download HTML
                        </button>
                        <button onClick={() => { navigator.clipboard.writeText(landingHtml) }}
                          className="flex-1 border border-[#EDE9E3] text-[#524F4A] py-2.5 rounded-lg text-[13px] font-medium hover:border-[#0D0C0B] transition-colors">
                          Copy Code
                        </button>
                        <button onClick={generateLandingPage}
                          className="border border-[#EDE9E3] text-[#524F4A] py-2.5 px-4 rounded-lg text-[13px] hover:border-[#0D0C0B] transition-colors">
                          ↺
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Generate content CTA */}
              <div className="bg-gradient-to-r from-[#0D0C0B] to-[#1A1714] rounded-2xl p-6 text-white text-center">
                <p className="font-bold text-[16px] mb-2">Strategy approved? Let's create your content.</p>
                <p className="text-white/60 text-[13px] mb-5">Generate 7 days of posts with AI images, hooks, and hashtags</p>
                <div className="flex gap-2 justify-center mb-4">
                  {PLATFORMS.map(p => (
                    <button key={p} onClick={() => setSelectedPlatform(p)}
                      className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${
                        selectedPlatform === p ? 'bg-[#FF8C1A] text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}>{p}</button>
                  ))}
                </div>
                <button onClick={generateContentPlan}
                  className="bg-[#FF8C1A] text-white px-8 py-3 rounded-xl text-[15px] font-bold hover:bg-[#E67300] transition-colors">
                  <Sparkles size={16} className="inline mr-2" />
                  Generate 7-Day {selectedPlatform} Content →
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── CONTENT VIEW ──────────────────────────────────────────────────── */}
      {view === 'content' && (
        <div className="flex-1 overflow-y-auto space-y-5">
          {generatingContent && (
            <div className="bg-white border border-[#EDE9E3] rounded-2xl p-8 text-center">
              <div className="text-3xl mb-3 animate-pulse">✍️</div>
              <p className="font-semibold text-[#0D0C0B]">Creating your 7-day content plan...</p>
              <p className="text-[13px] text-[#7A7670] mt-1">Writing posts, hooks, CTAs, and image prompts</p>
            </div>
          )}

          {!contentPlan && !generatingContent && (
            <div className="bg-white border border-[#EDE9E3] rounded-2xl p-8 text-center">
              <p className="text-[#7A7670] mb-4">No content plan yet. Generate a strategy first.</p>
              <button onClick={() => setView('strategy')}
                className="bg-[#0D0C0B] text-white px-6 py-3 rounded-xl text-[14px] font-semibold">
                Go to Strategy →
              </button>
            </div>
          )}

          {contentPlan && !generatingContent && contentPlan.posts.map((post, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className={`bg-white border rounded-2xl overflow-hidden transition-all ${
                post.approved ? 'border-green-300 shadow-sm shadow-green-100' : 'border-[#EDE9E3]'
              }`}
            >
              {/* Day header */}
              <div className="flex items-center justify-between px-5 py-3 bg-[#F5F3EF] border-b border-[#EDE9E3]">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-[#0D0C0B] text-[14px]">{post.day} — {post.day_name}</span>
                  <span className="bg-[#FF8C1A]/15 text-[#E67300] text-[11px] font-semibold px-2 py-0.5 rounded-full">{post.pillar}</span>
                </div>
                {post.approved && (
                  <span className="flex items-center gap-1 text-green-600 text-[12px] font-semibold">
                    <ThumbsUp size={12} /> Approved
                  </span>
                )}
              </div>

              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Left: Content */}
                <div className="space-y-3">
                  <div>
                    <p className="text-[11px] font-semibold text-[#A39E96] uppercase tracking-wide mb-1">Topic</p>
                    <p className="font-semibold text-[#0D0C0B] text-[14px]">{post.topic}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-[#A39E96] uppercase tracking-wide mb-1">Hook</p>
                    <p className="text-[14px] text-[#0D0C0B] font-medium leading-snug">{post.hook}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-[#A39E96] uppercase tracking-wide mb-1">Body</p>
                    <p className="text-[13px] text-[#524F4A] leading-relaxed whitespace-pre-line">{post.body}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-[#A39E96] uppercase tracking-wide mb-1">CTA</p>
                    <p className="text-[13px] text-[#0D0C0B] font-medium">{post.cta}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {post.hashtags?.map((tag, j) => (
                      <span key={j} className="bg-blue-50 text-blue-600 text-[11px] px-2 py-0.5 rounded-full font-medium">#{tag}</span>
                    ))}
                  </div>
                </div>

                {/* Right: Image */}
                <div className="space-y-3">
                  <p className="text-[11px] font-semibold text-[#A39E96] uppercase tracking-wide">AI Image</p>

                  {post.image_url ? (
                    <div className="relative">
                      <img src={post.image_url} alt="Post visual" className="w-full rounded-xl border border-[#EDE9E3]" />
                      <button onClick={() => generateImage(i)}
                        className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-[#524F4A] p-2 rounded-lg hover:bg-white transition-colors shadow-sm">
                        <RefreshCw size={14} />
                      </button>
                    </div>
                  ) : post.generating_image ? (
                    <div className="bg-[#F5F3EF] rounded-xl h-40 flex flex-col items-center justify-center gap-2">
                      <div className="animate-spin text-2xl">⟳</div>
                      <p className="text-[12px] text-[#A39E96]">Generating image...</p>
                    </div>
                  ) : (
                    <button onClick={() => generateImage(i)}
                      className="w-full bg-[#F5F3EF] border-2 border-dashed border-[#EDE9E3] rounded-xl h-40 flex flex-col items-center justify-center gap-2 hover:border-[#FF8C1A] hover:bg-[#FFF8F0] transition-all group">
                      <span className="text-2xl">🖼️</span>
                      <p className="text-[12px] text-[#A39E96] group-hover:text-[#FF8C1A] font-medium">Click to generate image (free)</p>
                    </button>
                  )}

                  <p className="text-[11px] text-[#C9C4BC] leading-relaxed">Prompt: {post.image_prompt}</p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="px-5 pb-5 flex gap-2">
                {post.approved ? (
                  <div className="flex-1 bg-green-50 border border-green-200 text-green-700 py-2.5 rounded-xl text-[13px] font-semibold text-center">
                    ✓ Approved & Scheduled
                  </div>
                ) : (
                  <>
                    <button onClick={() => approvePost(i)} disabled={post.revising}
                      className="flex-1 bg-[#0D0C0B] text-white py-2.5 rounded-xl text-[13px] font-semibold hover:bg-[#1A1714] transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                      <ThumbsUp size={14} /> Approve & Schedule
                    </button>
                    <button onClick={() => revisePost(i)} disabled={post.revising}
                      className="flex-1 border border-[#EDE9E3] text-[#524F4A] py-2.5 rounded-xl text-[13px] font-medium hover:border-[#0D0C0B] transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                      {post.revising ? (
                        <><RefreshCw size={14} className="animate-spin" /> Revising...</>
                      ) : (
                        <><RefreshCw size={14} /> Revise Post</>
                      )}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          ))}

          {contentPlan && !generatingContent && approvedCount === contentPlan.posts.length && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
              <div className="text-3xl mb-2">🎉</div>
              <p className="font-bold text-green-800">All 7 posts approved!</p>
              <p className="text-[13px] text-green-600 mt-1">Your content is scheduled. Check the Scheduler tab to manage publishing.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
