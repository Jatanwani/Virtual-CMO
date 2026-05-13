import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { callGatewayJSON, buildFounderContext } from '@/lib/ai-gateway'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { content_item_id, topic, pillar, platform = 'LinkedIn' } = await request.json()
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    const p = (profile || {}) as any

    const prompt = `Regenerate a completely fresh, better version of this social media post.

FOUNDER CONTEXT:
${buildFounderContext(p)}

Topic: ${topic}
Pillar: ${pillar}
Platform: ${platform}

Return ONLY this JSON:
{
  "hook": "New scroll-stopping opening line",
  "body": "Full post body with line breaks",
  "cta": "Specific call to action",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5"],
  "image_prompt": "Detailed AI image prompt - professional marketing visual, no text in image"
}`

    const revised = await callGatewayJSON<any>(prompt, p, user.id)

    if (content_item_id) {
      const updateData = {
        hook: revised.hook,
        full_post: revised.body,
        cta: revised.cta,
        hashtags: revised.hashtags,
        image_prompt: revised.image_prompt,
        image_url: null as null,
      }
      await supabase.from('content_items').update(updateData as never).eq('id', content_item_id).eq('user_id', user.id)
    }

    return NextResponse.json({ revised })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}