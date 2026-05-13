'use client'
import { useState, useEffect } from 'react'

interface Overview {
  totalPosts: number
  publishedPosts: number
  pendingPosts: number
  failedPosts: number
  totalContent: number
  draftContent: number
  totalImpressions: number
  totalEngagements: number
}

interface PlatformStat {
  platform: string
  posts: number
  published: number
}

const PLATFORM_ICONS: Record<string, string> = {
  linkedin: '💼', twitter: '𝕏', instagram: '📸', facebook: '👥',
}

export function AnalyticsDashboard() {
  const [overview, setOverview] = useState<Overview | null>(null)
  const [platformStats, setPlatformStats] = useState<PlatformStat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics').then(r => r.json()).then(data => {
      setOverview(data.overview)
      setPlatformStats(data.platformStats || [])
      setLoading(false)
    })
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-[#A39E96]">Loading analytics...</div>
    </div>
  )

  const stats = [
    { label: 'Total Content', value: overview?.totalContent || 0, icon: '📝', color: 'bg-blue-50 text-blue-600' },
    { label: 'Scheduled', value: overview?.pendingPosts || 0, icon: '📅', color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Published', value: overview?.publishedPosts || 0, icon: '✅', color: 'bg-green-50 text-green-600' },
    { label: 'Impressions', value: overview?.totalImpressions || 0, icon: '👁', color: 'bg-purple-50 text-purple-600' },
    { label: 'Engagements', value: overview?.totalEngagements || 0, icon: '❤️', color: 'bg-pink-50 text-pink-600' },
    { label: 'Drafts', value: overview?.draftContent || 0, icon: '📄', color: 'bg-gray-50 text-gray-600' },
  ]

  return (
    <div className="space-y-6">
      {/* Overview stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white border border-[#EDE9E3] rounded-2xl p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3 ${stat.color}`}>
              {stat.icon}
            </div>
            <div className="text-2xl font-black text-[#0D0C0B]">{stat.value.toLocaleString()}</div>
            <div className="text-[12px] text-[#7A7670] mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Platform breakdown */}
      <div className="bg-white border border-[#EDE9E3] rounded-2xl p-6">
        <h3 className="font-bold text-[#0D0C0B] mb-4">Platform Breakdown</h3>
        <div className="space-y-3">
          {platformStats.map(stat => (
            <div key={stat.platform} className="flex items-center gap-4">
              <div className="w-24 text-[13px] text-[#524F4A] capitalize">
                {PLATFORM_ICONS[stat.platform]} {stat.platform}
              </div>
              <div className="flex-1 bg-[#F5F3EF] rounded-full h-2">
                <div
                  className="bg-[#FF8C1A] h-2 rounded-full transition-all"
                  style={{ width: `${overview?.totalPosts ? (stat.posts / overview.totalPosts) * 100 : 0}%` }}
                />
              </div>
              <div className="text-[13px] text-[#524F4A] w-16 text-right">
                {stat.published}/{stat.posts} posts
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-[#FFF8F0] border border-[#FFD4A3] rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <span className="text-xl">💡</span>
          <div>
            <p className="font-semibold text-[#0D0C0B] text-[14px]">Growth tip</p>
            <p className="text-[13px] text-[#7A7670] mt-1">
              {(overview?.publishedPosts || 0) === 0
                ? 'Start publishing content to see your analytics grow. Schedule your first post today!'
                : `You've published ${overview?.publishedPosts} posts. Consistency is key — aim for 5 posts/week to maximize reach.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
