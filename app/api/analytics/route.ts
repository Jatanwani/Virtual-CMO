import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [postsRes, analyticsRes, contentRes, profileRes] = await Promise.all([
      supabase.from('scheduled_posts').select('*').eq('user_id', user.id),
      supabase.from('post_analytics').select('*').eq('user_id', user.id),
      supabase.from('content_items').select('*').eq('user_id', user.id),
      supabase.from('profiles').select('*').eq('id', user.id).single(),
    ])

    const posts = (postsRes.data || []) as any[]
    const analytics = (analyticsRes.data || []) as any[]
    const content = (contentRes.data || []) as any[]
    const profile = profileRes.data

    const totalPosts = posts.length
    const publishedPosts = posts.filter(p => p.status === 'posted').length
    const pendingPosts = posts.filter(p => p.status === 'pending').length
    const failedPosts = posts.filter(p => p.status === 'failed').length
    const totalContent = content.length
    const draftContent = content.filter(c => c.status === 'draft').length
    const totalImpressions = analytics.reduce((sum: number, a: any) => sum + (a.impressions || 0), 0)
    const totalLikes = analytics.reduce((sum: number, a: any) => sum + (a.likes || 0), 0)
    const totalEngagements = totalLikes + analytics.reduce((sum: number, a: any) => sum + (a.comments || 0) + (a.shares || 0), 0)

    const platformStats = ['linkedin', 'twitter', 'instagram', 'facebook'].map(platform => ({
      platform,
      posts: posts.filter(p => p.platform === platform).length,
      published: posts.filter(p => p.platform === platform && p.status === 'posted').length,
    }))

    return NextResponse.json({
      overview: { totalPosts, publishedPosts, pendingPosts, failedPosts, totalContent, draftContent, totalImpressions, totalEngagements },
      platformStats,
      recentPosts: posts.slice(0, 5),
      profile,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}