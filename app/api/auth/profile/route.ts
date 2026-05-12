import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient() // Add await here!
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()

    const allowed = ['product', 'problem', 'icp', 'stage', 'traction', 'channels', 'goal_30', 'time_available', 'budget', 'full_name']
    const update: Record<string, string> = {}
    for (const key of allowed) {
      if (body[key] !== undefined) update[key] = body[key]
    }

    const { data } = await supabase
      .from('profiles')
      .update(update)
      .eq('id', user.id)
      .select()
      .single()

    return NextResponse.json({ profile: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
