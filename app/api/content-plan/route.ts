import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { callGatewayJSON, buildFounderContext } from '@/lib/ai-gateway'

const PLATFORM_RULES: Record<string, string> = {
  LinkedIn: `LinkedIn RULES (MANDATORY):
- Body: minimum 800 characters, target 1200-1500 characters
- Format: bold hook line, then double line breaks between paragraphs
- Include: personal story or data point, specific numbers
- Tone: professional but human
- End with a question or CTA
- 5-8 hashtags`,

  Instagram: `Instagram RULES (MANDATORY):
- Body: 300-500 characters
- Start with emoji + bold statement  
- Short punchy sentences, emotional language
- 10-15 hashtags
- Clear CTA`,

  X: `X (Twitter) RULES (MANDATORY):
- Body: EXACTLY 150-200 characters - count every character
- One powerful punchy insight or hot take
- Zero fluff - every word must earn its place
- Maximum 3 hashtags (included in character count)
- If your draft exceeds 200 chars, cut it down ruthlessly`,

  Facebook: `Facebook RULES (MANDATORY):
- Body: 400-800 characters
- Conversational warm tone
- Ask a question to drive comments
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

    const rules = PLATFORM_RULES[platform] || PLATFORM_RULES.LinkedIn
    const isX = platform === 'X'

    const prompt = `You are a world-class ${platform} content strategist. Generate a 7-day content plan.

FOUNDER CONTEXT:
${buildFounderContext(p)}

STRATEGY:
Archetype: ${strategy?.archetype || 'Content-Led'}
Positioning: ${strategy?.one_liner || p.product || 'Not specified'}
Pillars: ${strategy?.content_pillars?.map((x: any) => x.name).join(', ') || 'Education, Authority, Community'}

${rules}

Generate exactly 7 posts. Return ONLY valid JSON:
{
  "posts": [
    {
      "day": "Day 1",
      "day_name": "Monday",
      "pillar": "pillar name",
      "topic": "specific topic",
      "hook": "opening line (for X keep under 60 chars)",
      "body": "${isX ? 'MUST be 150-200 characters total. Count carefully. No more, no less.' : 'Full post body, properly formatted with line breaks'}",
      "cta": "call to action",
      "hashtags": ${isX ? '["tag1", "tag2"]' : '["tag1", "tag2", "tag3", "tag4", "tag5"]'},
      "image_prompt": "detailed visual description for marketing image, no text in image, ${platform} dimensions"
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
