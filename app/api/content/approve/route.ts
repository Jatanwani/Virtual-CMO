import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { postId, scheduledAt } = await request.json()
    if (!postId) return NextResponse.json({ error: 'postId required' }, { status: 400 })

    const { data, error } = await supabase
      .from('content_items')
      .update({
        status: scheduledAt ? 'scheduled' : 'published',
        scheduled_at: scheduledAt || null,
      })
      .eq('id', postId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw new Error(error.message)

    return NextResponse.json({ post: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
