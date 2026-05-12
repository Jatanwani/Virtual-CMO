import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { callGatewayJSON } from '@/lib/ai-gateway'
import { format, startOfWeek } from 'date-fns'

export const maxDuration = 60

export async function GET() {
  try {
    const supabase = await createClient() // Added 'await' here
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
    const { data } = await supabase
      .from('content_items').select('*')
      .eq('user_id', user.id).eq('week_start', weekStart).order('created_at')

    return NextResponse.json({ items: data || [], weekStart })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient() // Added 'await' here
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { action, itemId } = body

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    if (action === 'generate_calendar') {
      const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')

      const result = await callGatewayJSON<{
        days: Array<{
          day: string
          items: Array<{ type: string; hook: string; topic: string; cta: string; platform: string }>
        }>
      }>(
        `Generate a 5-day content calendar for this founder.
Product: "${profile.product}"
ICP: "${profile.icp}"
Stage: "${profile.stage}"
Channels: "${profile.channels}"
Goal: "${profile.goal_30}"

Return this exact JSON with no extra text:
{
  "days": [
    {
      "day": "Monday",
      "items": [
        { "type": "LinkedIn Post", "hook": "First line that stops the scroll", "topic": "Specific topic", "cta": "Clear call to action", "platform": "LinkedIn" },
        { "type": "Community Post", "hook": "Conversation starter", "topic": "Topic for community", "cta": "Drive engagement", "platform": "Reddit/Slack" }
      ]
    }
  ]
}
Generate 5 days Monday to Friday. 2 items each day. Make everything specific to this founders product and ICP.`,
        profile,
        user.id
      )

      await supabase.from('content_items').delete().eq('user_id', user.id).eq('week_start', weekStart)

      const rows = result.days.flatMap(day =>
        day.items.map(item => ({
          user_id: user.id, week_start: weekStart, day: day.day,
          type: item.type, hook: item.hook, topic: item.topic,
          cta: item.cta, platform: item.platform || 'LinkedIn', status: 'draft' as const,
        }))
      )

      const { data: inserted } = await supabase.from('content_items').insert(rows).select()
      return NextResponse.json({ items: inserted })
    }

    if (action === 'generate_post' && itemId) {
      const { data: item } = await supabase.from('content_items').select('*').eq('id', itemId).single()
      if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 })

      const result = await callGatewayJSON<{ post: string }>(
        `Write a complete ready-to-publish ${item.platform} post.
Topic: "${item.topic}"
Hook: "${item.hook}"
CTA: "${item.cta}"
Founder builds: "${profile.product}" for "${profile.icp}"
Stage: ${profile.stage}
Goal: ${profile.goal_30}

Write using: Hook line, then story or insight 3-4 lines, then key takeaway 1-2 lines, then CTA.
Max 220 words. Authentic founder voice. Not salesy.
Return JSON: { "post": "full post text here" }`,
        profile,
        user.id
      )

      const { data: updated } = await supabase.from('content_items')
        .update({ full_post: result.post }).eq('id', itemId).eq('user_id', user.id)
        .select().single()

      return NextResponse.json({ item: updated, post: result.post })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err: any) {
    console.error('Content API error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient() // Added 'await' here
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id, status } = await request.json()
    const { data } = await supabase.from('content_items')
      .update({ status }).eq('id', id).eq('user_id', user.id).select().single()

    return NextResponse.json({ item: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
