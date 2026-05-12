import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { callGatewayJSON } from '@/lib/ai-gateway'

export const maxDuration = 60

export async function GET() {
  try {
    const supabase = await createClient() // Added 'await'
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data } = await supabase.from('experiments').select('*')
      .eq('user_id', user.id).order('created_at', { ascending: false })

    return NextResponse.json({ experiments: data || [] })
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
    const { hypothesis, channel, metric } = body

    const { data } = await supabase.from('experiments')
      .insert({ user_id: user.id, hypothesis, channel, metric, status: 'Running' })
      .select().single()

    return NextResponse.json({ experiment: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient() // Added 'await'
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { id, status, result, learning, analyze } = body

    if (analyze && result) {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      const { data: exp } = await supabase.from('experiments').select('*').eq('id', id).single()

      if (exp && profile) {
        const analysis = await callGatewayJSON<{ analysis: string; nextAction: string }>(
          `Analyze this growth experiment.
Hypothesis: "${exp.hypothesis}"
Channel: ${exp.channel}
Metric: ${exp.metric}
Result: "${result}"
Status: ${status}
Founder product: ${profile.product} for ${profile.icp}
Goal: ${profile.goal_30}
Return JSON: { "analysis": "2-3 sentence analysis of what happened and why", "nextAction": "specific next action based on this result" }`,
          profile,
          user.id
        )

        const { data: updated } = await supabase.from('experiments')
          .update({ status, result, learning: learning || analysis.nextAction, cmo_analysis: analysis.analysis })
          .eq('id', id).eq('user_id', user.id).select().single()

        return NextResponse.json({ experiment: updated })
      }
    }

    const { data } = await supabase.from('experiments')
      .update({ status, result, learning }).eq('id', id).eq('user_id', user.id)
      .select().single()

    return NextResponse.json({ experiment: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient() // Added 'await'
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    await supabase.from('experiments').delete().eq('id', id!).eq('user_id', user.id)

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
