import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { callGatewayChat } from '@/lib/ai-gateway'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [
      { data: posts },
      { data: analytics },
      { data: content },
      { data: profile },
    ] = await Promise.all([
      supabase.from('scheduled_posts').select('*').eq('user_id', user.id),
      supabase.from('post_analytics').select('*').eq('user_id', user.id),
      supabase.from('content_items').select('*').eq('user_id', user.id),
      supabase.from('profiles').select('*').eq('id', user.id).single(),
    ])

    const totalPosts = posts?.length || 0
    const publishedPosts = posts?.filter(p => p.status === 'posted').length || 0
    const pendingPosts = posts?.filter(p => p.status === 'pending').length || 0
    const failedPosts = posts?.filter(p => p.status === 'failed').length || 0
    const totalContent = content?.length || 0
    const draftContent = content?.filter(c => c.status === 'draft').length || 0
    const totalImpressions = analytics?.reduce((sum, a) => sum + (a.impressions || 0), 0) || 0
    const totalLikes = analytics?.reduce((sum, a) => sum + (a.likes || 0), 0) || 0
    const totalEngagements = totalLikes + (analytics?.reduce((sum, a) => sum + (a.comments || 0) + (a.shares || 0), 0) || 0)

    // Platform breakdown
    const platformStats = ['linkedin', 'twitter', 'instagram', 'facebook'].map(platform => ({
      platform,
      posts: posts?.filter(p => p.platform === platform).length || 0,
      published: posts?.filter(p => p.platform === platform && p.status === 'posted').length || 0,
    }))

    return NextResponse.json({
      overview: { totalPosts, publishedPosts, pendingPosts, failedPosts, totalContent, draftContent, totalImpressions, totalEngagements },
      platformStats,
      recentPosts: posts?.slice(0, 5) || [],
      profile,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
