'use client'
import { useState, useEffect } from 'react'

interface ScheduledPost {
  id: string
  platform: string
  content: string
  image_url?: string
  scheduled_at: string
  status: string
}

interface ContentItem {
  id: string
  hook: string
  full_post: string
  platform: string
  status: string
  image_url?: string
  scheduled_at?: string
}

const PLATFORM_COLORS: Record<string, string> = {
  linkedin: 'bg-blue-100 text-blue-700',
  twitter: 'bg-sky-100 text-sky-700',
  instagram: 'bg-pink-100 text-pink-700',
  facebook: 'bg-indigo-100 text-indigo-700',
}

const PLATFORM_ICONS: Record<string, string> = {
  linkedin: '💼',
  twitter: '𝕏',
  instagram: '📸',
  facebook: '👥',
}

export function ContentScheduler() {
  const [posts, setPosts] = useState<ScheduledPost[]>([])
  const [contentItems, setContentItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [scheduling, setScheduling] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null)
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('09:00')
  const [selectedPlatform, setSelectedPlatform] = useState('linkedin')
  const [view, setView] = useState<'queue' | 'content'>('content')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const [schedRes, contentRes] = await Promise.all([
      fetch('/api/schedule'),
      fetch('/api/content'),
    ])
    const [schedData, contentData] = await Promise.all([schedRes.json(), contentRes.json()])
    setPosts(schedData.posts || [])
    setContentItems(contentData.items?.filter((c: ContentItem) => c.status === 'draft') || [])
    setLoading(false)
  }

  const schedulePost = async (item: ContentItem) => {
    if (!scheduleDate) return alert('Please select a date')
    setScheduling(item.id)
    try {
      const scheduledAt = new Date(`${scheduleDate}T${scheduleTime}:00`).toISOString()
      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_item_id: item.id,
          platform: selectedPlatform,
          content: item.full_post || item.hook,
          image_url: item.image_url,
          scheduled_at: scheduledAt,
        }),
      })
      if (res.ok) {
        setSelectedItem(null)
        fetchData()
      }
    } finally {
      setScheduling(null)
    }
  }

  const deletePost = async (id: string) => {
    await fetch('/api/schedule', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    fetchData()
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-[#A39E96] text-[14px]">Loading scheduler...</div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 bg-[#F0EDE8] p-1 rounded-xl w-fit">
        {(['content', 'queue'] as const).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-all capitalize ${
              view === v ? 'bg-white text-[#0D0C0B] shadow-sm' : 'text-[#7A7670]'
            }`}
          >
            {v === 'content' ? `📝 Draft Content (${contentItems.length})` : `📅 Queue (${posts.length})`}
          </button>
        ))}
      </div>

      {view === 'content' && (
        <div className="space-y-3">
          {contentItems.length === 0 ? (
            <div className="bg-white border border-[#EDE9E3] rounded-2xl p-8 text-center">
              <div className="text-4xl mb-3">📝</div>
              <p className="text-[#7A7670] text-[14px]">No draft content yet.</p>
              <p className="text-[#A39E96] text-[12px] mt-1">Generate content from the Content Engine tab first.</p>
            </div>
          ) : contentItems.map(item => (
            <div key={item.id} className="bg-white border border-[#EDE9E3] rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-[#0D0C0B] truncate">{item.hook}</p>
                  <p className="text-[12px] text-[#7A7670] mt-1 line-clamp-2">{item.full_post}</p>
                </div>
                <button
                  onClick={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
                  className="flex-shrink-0 bg-[#FF8C1A] text-white px-4 py-2 rounded-lg text-[12px] font-semibold hover:bg-[#E67300] transition-colors"
                >
                  Schedule →
                </button>
              </div>

              {selectedItem?.id === item.id && (
                <div className="mt-4 pt-4 border-t border-[#EDE9E3] space-y-3">
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(PLATFORM_ICONS).map(([p, icon]) => (
                      <button
                        key={p}
                        onClick={() => setSelectedPlatform(p)}
                        className={`py-2 rounded-lg text-[12px] font-medium transition-all capitalize ${
                          selectedPlatform === p
                            ? 'bg-[#0D0C0B] text-white'
                            : 'bg-[#F5F3EF] text-[#524F4A] hover:bg-[#EDE9E3]'
                        }`}
                      >
                        {icon} {p}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <input
                      type="date"
                      value={scheduleDate}
                      onChange={e => setScheduleDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="flex-1 px-3 py-2 border border-[#EDE9E3] rounded-lg text-[13px] focus:outline-none focus:border-[#0D0C0B]"
                    />
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={e => setScheduleTime(e.target.value)}
                      className="flex-1 px-3 py-2 border border-[#EDE9E3] rounded-lg text-[13px] focus:outline-none focus:border-[#0D0C0B]"
                    />
                  </div>
                  <button
                    onClick={() => schedulePost(item)}
                    disabled={scheduling === item.id || !scheduleDate}
                    className="w-full bg-[#0D0C0B] text-white py-2.5 rounded-lg text-[13px] font-semibold disabled:opacity-50"
                  >
                    {scheduling === item.id ? 'Scheduling...' : `Schedule for ${selectedPlatform} →`}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {view === 'queue' && (
        <div className="space-y-3">
          {posts.length === 0 ? (
            <div className="bg-white border border-[#EDE9E3] rounded-2xl p-8 text-center">
              <div className="text-4xl mb-3">📅</div>
              <p className="text-[#7A7670] text-[14px]">No posts scheduled yet.</p>
            </div>
          ) : posts.map(post => (
            <div key={post.id} className="bg-white border border-[#EDE9E3] rounded-2xl p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${PLATFORM_COLORS[post.platform] || 'bg-gray-100 text-gray-700'}`}>
                      {PLATFORM_ICONS[post.platform]} {post.platform}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      post.status === 'posted' ? 'bg-green-100 text-green-700' :
                      post.status === 'failed' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {post.status}
                    </span>
                    <span className="text-[12px] text-[#A39E96]">🕐 {formatDate(post.scheduled_at)}</span>
                  </div>
                  <p className="text-[13px] text-[#524F4A] line-clamp-2">{post.content}</p>
                </div>
                {post.status === 'pending' && (
                  <button
                    onClick={() => deletePost(post.id)}
                    className="ml-4 text-[#A39E96] hover:text-red-500 text-[12px]"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
