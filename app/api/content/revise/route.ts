import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { callGatewayJSON } from '@/lib/ai-gateway'

export const maxDuration = 60

interface RevisedPost {
  headline: string
  body: string
  hashtags: string[]
  image_prompt: string
  cta: string
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { postId, feedback } = await request.json()
    if (!postId) return NextResponse.json({ error: 'postId required' }, { status: 400 })

    const [{ data: profile }, { data: post }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('content_items').select('*').eq('id', postId).eq('user_id', user.id).single(),
    ])

    if (!profile || !post) {
      return NextResponse.json({ error: 'Post or profile not found' }, { status: 404 })
    }

    const prompt = `Revise this social media post for a startup founder.

FOUNDER: ${profile.product} | ICP: ${profile.icp} | Stage: ${profile.stage}
PLATFORM: ${post.platform}
CURRENT HEADLINE: ${post.headline}
CURRENT BODY: ${post.body}
CURRENT HASHTAGS: ${post.hashtags?.join(', ')}
${feedback ? `\nREVISION FEEDBACK: "${feedback}"\n` : '\nInstruction: Make it more compelling, specific, and actionable.'}

Return ONLY this JSON:
{
  "headline": "New scroll-stopping headline (max 12 words)",
  "body": "Full revised post body (150-250 words, fully written, not a template)",
  "hashtags": ["#Tag1", "#Tag2", "#Tag3", "#Tag4", "#Tag5"],
  "image_prompt": "Detailed DALL-E image prompt for professional social media image, no text in image",
  "cta": "The call to action used"
}`

    const revised = await callGatewayJSON<RevisedPost>(prompt, profile, user.id)

    const { data: updated, error } = await supabase
      .from('content_items')
      .update({
        headline: revised.headline,
        body: revised.body,
        hashtags: revised.hashtags,
        image_prompt: revised.image_prompt,
        cta: revised.cta,
        full_post: `${revised.headline}\n\n${revised.body}\n\n${revised.hashtags?.join(' ')}`,
        image_url: null, // clear old image so it gets regenerated
        status: 'draft',
      })
      .eq('id', postId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw new Error(error.message)

    return NextResponse.json({ post: updated })

  } catch (err: any) {
    console.error('[content/revise]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
