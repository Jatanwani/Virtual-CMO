'use client'

import { useState, useRef, useEffect } from 'react'
import { Profile, ChatMessage } from '@/types/database'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Zap, RotateCcw, Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'

const QUICK_PROMPTS = [
  { label: 'Top 3 growth channels for me', icon: '🎯' },
  { label: 'Write a cold DM script for my ICP', icon: '✍️' },
  { label: 'Content ideas for this week', icon: '📅' },
  { label: 'Diagnose my biggest bottleneck', icon: '🔍' },
  { label: 'Lead magnet ideas for my product', icon: '🧲' },
  { label: 'How to get my first 100 customers', icon: '🚀' },
  { label: 'Competitor analysis for my niche', icon: '🔬' },
  { label: 'Viral content angle for my product', icon: '🔥' },
]

interface DisplayMessage {
  role: 'user' | 'assistant'
  content: string
  id?: string
}

interface Props {
  profile: Profile | null
  initialMessages: ChatMessage[]
}

export function ChatClient({ profile, initialMessages }: Props) {
  const [messages, setMessages] = useState<DisplayMessage[]>(() => {
    if (initialMessages.length === 0) {
      return [{
        role: 'assistant',
        content: `Hey${profile?.full_name ? ` ${profile.full_name.split(' ')[0]}` : ''}! I'm your Virtual CMO. 🎯\n\nI've reviewed your profile. You're building **${profile?.product?.slice(0, 80) || 'your startup'}** targeting **${profile?.icp?.slice(0, 60) || 'your audience'}**.\n\nYour 30-day goal: *${profile?.goal_30?.slice(0, 100) || 'set in settings'}*\n\nI'm here to help you get traction — not give generic advice. Ask me anything: strategy, content, sales scripts, growth hacks, or just "what should I do today?"\n\nWhat's on your mind?`,
      }]
    }
    return initialMessages.map(m => ({ role: m.role, content: m.content, id: m.id }))
  })
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = async (text?: string) => {
    const msg = text || input.trim()
    if (!msg || loading) return

    const userMessage: DisplayMessage = { role: 'user', content: msg }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    const historyForAPI = newMessages
      .filter((m, idx) => {
        if (idx === 0 && m.role === 'assistant' && initialMessages.length === 0) return false
        return true
      })
      .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))

    try {
      const res = await fetch('/api/cmo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: historyForAPI }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
        throw new Error(errData.error || `Request failed with status ${res.status}`)
      }

      if (!res.body) throw new Error('No response body from server')

      setMessages(prev => [...prev, { role: 'assistant', content: '' }])

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })

        // Skip gateway metadata marker at end of stream
        if (chunk.includes('"__meta":true')) {
          // Extract any text before the meta marker
          const metaIndex = chunk.indexOf('\n\n{"__meta"')
          if (metaIndex > 0) {
            fullContent += chunk.slice(0, metaIndex)
          }
          // Don't append the metadata JSON to the display content
          continue
        }

        fullContent += chunk

        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: fullContent
          }
          return updated
        })
      }

      // Final save to DB
      if (fullContent) {
        fetch('/api/cmo/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: fullContent }),
        }).catch(() => {})
      }

    } catch (err: any) {
      console.error('Chat error:', err)
      toast.error(err.message || 'Failed to get response')
      setMessages(prev => {
        if (prev[prev.length - 1]?.role === 'assistant' && !prev[prev.length - 1]?.content) {
          return prev.slice(0, -1)
        }
        return prev
      })
    }
    setLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const copyMessage = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const clearChat = async () => {
    if (!confirm('Clear chat history?')) return
    setMessages([{
      role: 'assistant',
      content: `Fresh start! What growth challenge are we tackling?`,
    }])
  }

  return (
    <div className="flex flex-col h-[calc(100vh-124px)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#0D0C0B] rounded-xl flex items-center justify-center">
            <Zap size={14} className="text-[#FF8C1A]" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[#0D0C0B]">CMO Brain</p>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[11px] text-[#A39E96]">Always on • Context-aware</p>
            </div>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="flex items-center gap-1.5 text-[12px] text-[#A39E96] hover:text-[#524F4A] transition-colors"
        >
          <RotateCcw size={12} />
          Clear chat
        </button>
      </div>

      {/* Quick prompts */}
      {messages.length <= 1 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {QUICK_PROMPTS.map(p => (
            <button
              key={p.label}
              onClick={() => handleSend(p.label)}
              className="flex items-center gap-2 bg-white border border-[#EDE9E3] rounded-xl px-3 py-2.5 text-left hover:border-[#C9C4BC] hover:shadow-card transition-all group"
            >
              <span className="text-base">{p.icon}</span>
              <span className="text-[12px] text-[#524F4A] group-hover:text-[#0D0C0B] font-medium leading-tight">{p.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1 text-[10px] font-bold ${
                msg.role === 'assistant'
                  ? 'bg-[#0D0C0B] text-[#FF8C1A]'
                  : 'bg-gradient-to-br from-[#FF8C1A] to-[#E67300] text-white'
              }`}>
                {msg.role === 'assistant' ? 'C' : (profile?.full_name || 'F')[0].toUpperCase()}
              </div>

              <div className={`group relative max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                <div className={`px-4 py-3 rounded-2xl text-[14px] leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#0D0C0B] text-white rounded-tr-sm shadow-sm'
                    : 'bg-white border border-[#EDE9E3] text-[#0D0C0B] rounded-tl-sm shadow-card'
                }`}>
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-sm prose-brand max-w-none prose-p:leading-relaxed prose-headings:mb-2 prose-headings:mt-4 first:prose-headings:mt-0">
                      <ReactMarkdown>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>

                {msg.role === 'assistant' && msg.content && (
                  <button
                    onClick={() => copyMessage(msg.content, String(i))}
                    className="mt-1.5 flex items-center gap-1 text-[11px] text-[#C9C4BC] hover:text-[#7A7670] transition-colors opacity-0 group-hover:opacity-100"
                  >
                    {copiedId === String(i) ? <Check size={10} /> : <Copy size={10} />}
                    {copiedId === String(i) ? 'Copied' : 'Copy'}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="w-7 h-7 rounded-full bg-[#0D0C0B] flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-[#FF8C1A]">
              C
            </div>
            <div className="bg-white border border-[#EDE9E3] rounded-2xl rounded-tl-sm px-4 py-3 shadow-card">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#C9C4BC] animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#C9C4BC] animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#C9C4BC] animate-bounce" />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border border-[#EDE9E3] rounded-2xl shadow-card p-3 flex items-end gap-3 focus-within:border-[#C9C4BC] transition-colors">
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={e => {
            setInput(e.target.value)
            e.target.style.height = 'auto'
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
          }}
          onKeyDown={handleKeyDown}
          placeholder="Ask your CMO anything..."
          className="flex-1 resize-none bg-transparent text-[14px] text-[#0D0C0B] placeholder:text-[#C9C4BC] focus:outline-none leading-relaxed max-h-[120px] overflow-y-auto py-1"
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || loading}
          className="w-9 h-9 bg-[#0D0C0B] rounded-xl flex items-center justify-center flex-shrink-0 hover:bg-[#1A1714] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Send size={14} className="text-white" />
        </button>
      </div>

      <p className="text-center text-[11px] text-[#C9C4BC] mt-2">
        Shift+Enter for new line · Specialized in manufacturing growth
      </p>
    </div>
  )
}