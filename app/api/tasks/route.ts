import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { callGatewayJSON } from '@/lib/ai-gateway'

export const maxDuration = 60

export async function POST() {
  try {
    const supabase = await createClient() // Added 'await'
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    const prompt = `Generate a strategic diagnosis + 5 high-priority action tasks for this founder.

Founder:
- Product: ${profile.product}
- Problem: ${profile.problem}
- ICP: ${profile.icp}
- Stage: ${profile.stage}
- Traction: ${profile.traction}
- Channels: ${profile.channels}
- 30-day goal: ${profile.goal_30}
- Daily time: ${profile.time_available}
- Budget: ${profile.budget}

Return this exact JSON structure with no extra text:
{
  "archetype": "Creator|Builder|Seller|Hybrid",
  "bottleneck": "One specific sentence identifying their number 1 growth bottleneck",
  "topChannels": ["channel1", "channel2", "channel3"],
  "tasks": [
    {
      "title": "Specific task title",
      "why": "One line: why this matters for their specific goal",
      "steps": ["Exact step 1", "Exact step 2", "Exact step 3", "Exact step 4"],
      "outcome": "Measurable outcome e.g. 10 demo calls booked",
      "time_required": "e.g. 2 hours",
      "difficulty": "Easy|Medium|Hard",
      "priority": 1
    }
  ]
}

Make every task hyper-specific to this founders product, ICP, and goal. No generic advice. Return 5 tasks total.`

    const result = await callGatewayJSON<{
      archetype: string
      bottleneck: string
      topChannels: string[]
      tasks: Array<{
        title: string; why: string; steps: string[]; outcome: string
        time_required: string; difficulty: string; priority: number
      }>
    }>(prompt, profile, user.id)

    await supabase.from('profiles').update({
      archetype: result.archetype,
      bottleneck: result.bottleneck,
      top_channels: result.topChannels,
    }).eq('id', user.id)

    await supabase.from('tasks').delete().eq('user_id', user.id)

    const taskRows = result.tasks.map(t => ({
      user_id: user.id,
      title: t.title,
      why: t.why,
      steps: t.steps,
      outcome: t.outcome,
      time_required: t.time_required,
      difficulty: t.difficulty,
      priority: t.priority,
      status: 'todo',
    }))

    const { data: insertedTasks } = await supabase.from('tasks').insert(taskRows).select()

    return NextResponse.json({ tasks: insertedTasks, archetype: result.archetype, bottleneck: result.bottleneck })
  } catch (err: any) {
    console.error('Tasks API error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient() // Added 'await'
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { id, status } = body

    const { data } = await supabase
      .from('tasks')
      .update({ status, completed_at: status === 'done' ? new Date().toISOString() : null })
      .eq('id', id).eq('user_id', user.id)
      .select().single()

    const { data: allTasks } = await supabase.from('tasks').select('status').eq('user_id', user.id)
    if (allTasks) {
      const done = allTasks.filter(t => t.status === 'done').length
      const score = Math.round((done / allTasks.length) * 100)
      await supabase.from('profiles').update({ traction_score: score }).eq('id', user.id)
    }

    return NextResponse.json({ task: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
