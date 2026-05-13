import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { callGatewayJSON, buildFounderContext } from '@/lib/ai-gateway'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { strategy, platform = 'LinkedIn' } = await request.json()
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

    const prompt = `You are a world-class CMO content strategist. Generate a 7-day content plan based on this approved strategy.

FOUNDER CONTEXT:
${buildFounderContext(profile || {})}

APPROVED STRATEGY:
- Archetype: ${strategy.archetype}
- Positioning: ${strategy.one_liner}
- Content Pillars: ${strategy.content_pillars?.map((p: any) => p.name).join(', ')}

Generate 7 days of content for ${platform}. Return ONLY this JSON:
{
  "week_start": "${new Date().toISOString().split('T')[0]}",
  "platform": "${platform}",
  "posts": [
    {
      "day": "Day 1",
      "day_name": "Monday",
      "pillar": "Which content pillar this belongs to",
      "topic": "Specific topic title",
      "hook": "Attention-grabbing opening line (make it scroll-stopping)",
      "body": "Full post body (300-500 chars for ${platform}, formatted properly with line breaks)",
      "cta": "Specific call to action",
      "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5"],
      "image_prompt": "Detailed prompt for AI image generation - professional marketing visual, no text in image"
    }
  ]
}
Generate exactly 7 posts, one per day (Day 1 through Day 7).`

    const plan = await callGatewayJSON<any>(prompt, profile || {}, user.id)

    // Save all posts to DB
    if (plan.posts && Array.isArray(plan.posts)) {
      const weekStart = new Date().toISOString().split('T')[0]
      const inserts = plan.posts.map((post: any) => ({
        user_id: user.id,
        week_start: weekStart,
        day: post.day,
        type: post.pillar,
        hook: post.hook,
        topic: post.topic,
        cta: post.cta,
        full_post: post.body,
        platform: platform,
        status: 'draft',
        hashtags: post.hashtags,
        image_prompt: post.image_prompt,
      }))

      const { data: savedPosts } = await supabase
        .from('content_items')
        .insert(inserts)
        .select()

      // Merge DB ids into plan
      if (savedPosts) {
        plan.posts = plan.posts.map((post: any, i: number) => ({
          ...post,
          id: savedPosts[i]?.id,
        }))
      }
    }

    return NextResponse.json({ plan })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
