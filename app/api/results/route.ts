import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { callGatewayJSON } from '@/lib/ai-gateway'

export const maxDuration = 60

export async function GET() {
  try {
    const supabase = await createClient() // Added 'await'
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data } = await supabase.from('results').select('*')
      .eq('user_id', user.id).order('created_at', { ascending: false }).limit(20)

    return NextResponse.json({ results: data || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient() // Added 'await'
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { task_title, execution } = body

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    const analysis = await callGatewayJSON<{
      feedback: string; nextActions: string[]; score: number
    }>(
      `Analyze this founders execution and give specific CMO feedback.
Task: "${task_title}"
What happened: "${execution}"
Product: ${profile.product}
ICP: ${profile.icp}
Goal: ${profile.goal_30}
Stage: ${profile.stage}

Return JSON:
{
  "feedback": "2-3 paragraphs of specific analysis. What this means for their growth. Be direct.",
  "nextActions": ["Specific action 1", "Specific action 2", "Specific action 3"],
  "score": 75
}
Score 1-100 based on effort quality results and strategic alignment.`,
      profile,
      user.id
    )

    const { data: result } = await supabase.from('results').insert({
      user_id: user.id, task_title, execution,
      cmo_feedback: analysis.feedback,
      next_actions: analysis.nextActions,
      score: analysis.score,
    }).select().single()

    const { data: allResults } = await supabase.from('results').select('score').eq('user_id', user.id)
    if (allResults && allResults.length > 0) {
      const avg = Math.round(allResults.reduce((a, r) => a + (r.score || 0), 0) / allResults.length)
      await supabase.from('profiles').update({ traction_score: avg }).eq('id', user.id)
    }

    return NextResponse.json({ result, analysis })
  } catch (err: any) {
    console.error('Results API error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
