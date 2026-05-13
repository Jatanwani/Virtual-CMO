import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    return NextResponse.json({ profile })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()

    const allowed = [
      'full_name', 'avatar_url',
      'company_name', 'company_logo_url', 'website', 'team_size',
      'founder_phone', 'founder_email',
      'linkedin_url', 'twitter_url', 'instagram_url', 'facebook_url',
      'linkedin_connected', 'twitter_connected', 'instagram_connected', 'facebook_connected',
      'linkedin_handle', 'twitter_handle', 'instagram_handle', 'facebook_handle',
      'product', 'problem', 'icp', 'stage', 'traction', 'channels',
      'goal_30', 'time_available', 'budget', 'archetype',
    ]

    const updates: Record<string, any> = { updated_at: new Date().toISOString() }
    allowed.forEach(key => {
      if (body[key] !== undefined) {
        updates[key] = key.endsWith('_connected')
          ? (body[key] === 'true' || body[key] === true)
          : body[key]
      }
    })

    // Use rpc to bypass TypeScript type checking on dynamic updates
    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updates as never)
      .eq('id', user.id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ profile })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}