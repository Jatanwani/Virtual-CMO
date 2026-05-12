import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { callGatewayJSON } from '@/lib/ai-gateway'
import { format, startOfWeek, addDays } from 'date-fns'

export const maxDuration = 60

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

interface GeneratedPost {
  day: string
  day_number: number
  platform: string
  topic: string
  headline: string
  body: string
  hashtags: string[]
  image_prompt: string
  hook: string
  cta: string
}

interface GeneratedWeek {
  week_theme: string
  posts: GeneratedPost[]
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { weekOffset = 0 } = await request.json().catch(() => ({}))

    const { data: profile } = await supabase
      .from('profiles').select('*').eq('id', user.id).single()
    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    const weekStart = format(
      addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), weekOffset * 7),
      'yyyy-MM-dd'
    )

    // Delete any existing draft posts for this week
    await supabase
      .from('content_items')
      .delete()
      .eq('user_id', user.id)
      .eq('week_start', weekStart)
      .eq('status', 'draft')

    const prompt = `You are creating a 7-day social media content plan for a startup founder.

FOUNDER PROFILE:
- Product: ${profile.product}
- ICP: ${profile.icp}
- Stage: ${profile.stage}
- Goal: ${profile.goal_30}
- Channels: ${profile.channels || 'LinkedIn, Twitter/X, Instagram'}
- Budget: ${profile.budget || '$0'}

Create 7 posts (one per day, Mon–Sun) that form a COHERENT weekly strategy.
Each post must be completely written — not a template or placeholder.

Return ONLY this JSON, no extra text:
{
  "week_theme": "One sentence describing this week's marketing theme",
  "posts": [
    {
      "day": "Monday",
      "day_number": 1,
      "platform": "LinkedIn",
      "topic": "Specific angle or story for this post",
      "headline": "The scroll-stopping first line (max 12 words, no generic phrases)",
      "body": "Full post body (150-250 words). Write the ACTUAL post, not instructions. Include a specific insight, story, or data point relevant to this founder's product and ICP. End with a soft CTA.",
      "hashtags": ["#Relevant", "#Hashtags", "#Max8"],
      "image_prompt": "Detailed DALL-E prompt for a professional image: describe scene, style, colors, mood. No text in image. Example: 'Minimalist flat-lay of a laptop and notebook on a clean white desk, warm morning light, entrepreneurship theme, professional photography style'",
      "hook": "One-line hook summary",
      "cta": "The CTA used in this post"
    }
  ]
}

Rules:
- Day 1 (Mon): Authority/insight post — LinkedIn
- Day 2 (Tue): Problem-aware post — Twitter/X
- Day 3 (Wed): Story/case study — LinkedIn
- Day 4 (Thu): Tactical tip — Instagram or LinkedIn
- Day 5 (Fri): Engagement/question post — Twitter/X
- Day 6 (Sat): Behind-the-scenes or founder story — Instagram
- Day 7 (Sun): Weekly reflection or teaser for next week — LinkedIn
- Every post MUST mention or relate to the founder's specific product/ICP
- Body must be fully written, not a template`

    const result = await callGatewayJSON<GeneratedWeek>(prompt, profile, user.id)

    if (!result.posts || result.posts.length === 0) {
      throw new Error('AI returned empty content plan')
    }

    // Save all posts to DB
    const postsToInsert = result.posts.map((post, idx) => ({
      user_id: user.id,
      week_start: weekStart,
      day: post.day || DAYS[idx],
      day_number: idx + 1,
      week_number: weekOffset,
      platform: post.platform || 'LinkedIn',
      topic: post.topic,
      headline: post.headline,
      body: post.body,
      hook: post.hook || post.headline,
      full_post: `${post.headline}\n\n${post.body}\n\n${post.hashtags?.join(' ') || ''}`,
      hashtags: post.hashtags || [],
      image_prompt: post.image_prompt,
      cta: post.cta,
      type: 'social_post',
      status: 'draft',
    }))

    const { data: saved, error: saveError } = await supabase
      .from('content_items')
      .insert(postsToInsert)
      .select()

    if (saveError) throw new Error(`Failed to save: ${saveError.message}`)

    return NextResponse.json({
      week_theme: result.week_theme,
      posts: saved,
      weekStart,
    })

  } catch (err: any) {
    console.error('[content/generate-week]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
