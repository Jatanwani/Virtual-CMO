import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { callGatewayJSON, buildFounderContext } from '@/lib/ai-gateway'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

    const prompt = `You are a world-class CMO. Analyze this founder and generate a complete marketing strategy.

FOUNDER CONTEXT:
${buildFounderContext(profile || {})}

Return ONLY this JSON structure:
{
  "archetype": "Growth archetype (e.g. Content-Led, Community-Led, Sales-Led)",
  "one_liner": "One sentence positioning statement for their product",
  "top_channels": ["channel1", "channel2", "channel3"],
  "content_pillars": [
    { "name": "Pillar name", "why": "Why this works for them specifically", "examples": ["example topic 1", "example topic 2"] },
    { "name": "Pillar name", "why": "Why this works for them specifically", "examples": ["example topic 1", "example topic 2"] },
    { "name": "Pillar name", "why": "Why this works for them specifically", "examples": ["example topic 1", "example topic 2"] }
  ],
  "ninety_day_plan": [
    { "phase": "Days 1-30", "focus": "Focus area", "actions": ["Specific action 1", "Specific action 2", "Specific action 3"] },
    { "phase": "Days 31-60", "focus": "Focus area", "actions": ["Specific action 1", "Specific action 2", "Specific action 3"] },
    { "phase": "Days 61-90", "focus": "Focus area", "actions": ["Specific action 1", "Specific action 2", "Specific action 3"] }
  ],
  "quick_wins": ["Specific quick win they can do TODAY", "Quick win 2", "Quick win 3"],
  "needs_landing_page": true,
  "landing_page_reason": "Specific reason why they need a landing page right now"
}`

    const strategy = await callGatewayJSON<any>(prompt, profile || {}, user.id)
    return NextResponse.json({ strategy })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
