import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { callGatewayJSON, buildFounderContext } from '@/lib/ai-gateway'

const PLATFORM_RULES: Record<string, string> = {
  LinkedIn: `LinkedIn post rules:
- Long-form content, 800-1500 characters
- Start with a bold hook line (standalone)
- Use line breaks between paragraphs
- Include personal story or data point
- Professional but conversational tone
- End with a thought-provoking question or CTA
- 5-8 relevant hashtags`,

  Instagram: `Instagram post rules:
- Medium length, 300-500 characters
- Start with an attention-grabbing emoji or bold statement
- Short punchy sentences
- Emotional and visual storytelling
- 10-15 relevant hashtags
- End with a clear CTA`,

  Twitter: `Twitter/X post rules:
- STRICT LIMIT: maximum 200 characters for the post body
- Ultra concise and punchy
- One powerful insight or hook
- No fluff, every word counts
- 2-3 hashtags maximum
- Optional: add a thread indicator like (1/3) if needed`,

  Facebook: `Facebook post rules:
- Conversational and community-focused
- 400-800 characters
- Ask questions to encourage comments
- Relatable storytelling
- 3-5 hashtags`,
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { strategy, platform = 'LinkedIn' } = await request.json()
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    const p = (profile || {}) as any

    const platformRules = PLATFORM_RULES[platform] || PLATFORM_RULES.LinkedIn
    const isTwitter = platform === 'Twitter'

    const prompt = `You are a world-class social media content creator. Generate a 7-day content plan.

FOUNDER CONTEXT:
${buildFounderContext(p)}

APPROVED STRATEGY:
- Archetype: ${strategy?.archetype || 'Content-Led'}
- Positioning: ${strategy?.one_liner || 'Not specified'}
- Content Pillars: ${strategy?.content_pillars?.map((x: any) => x.name).join(', ') || 'Not specified'}

PLATFORM: ${platform}
${platformRules}

Generate exactly 7 posts. Return ONLY this JSON:
{
  "posts": [
    {
      "day": "Day 1",
      "day_name": "Monday",
      "pillar": "content pillar name",
      "topic": "specific topic title",
      "hook": "${isTwitter ? 'Ultra short hook (max 50 chars)' : 'Attention-grabbing opening line'}",
      "body": "${isTwitter ? 'Post body - MUST be under 200 characters total including hook' : 'Full post body with proper line breaks and formatting'}",
      "cta": "${isTwitter ? 'Short CTA (max 30 chars)' : 'Specific call to action'}",
      "hashtags": ${isTwitter ? '["hashtag1", "hashtag2"]' : '["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5"]'},
      "image_prompt": "Professional marketing visual for ${platform} - no text in image, high quality, relevant to topic"
    }
  ]
}`

    const plan = await callGatewayJSON<any>(prompt, p, user.id)

    if (plan?.posts && Array.isArray(plan.posts)) {
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
        platform,
        status: 'draft',
        hashtags: post.hashtags || [],
        image_prompt: post.image_prompt,
      }))

      const { data: savedPosts } = await supabase
        .from('content_items')
        .insert(inserts as never)
        .select()

      if (savedPosts) {
        plan.posts = plan.posts.map((post: any, i: number) => ({
          ...post,
          id: (savedPosts as any[])[i]?.id,
        }))
      }
    }

    return NextResponse.json({ plan })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
