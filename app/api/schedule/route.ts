import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: posts } = await supabase
      .from('scheduled_posts')
      .select('*, content_items(*)')
      .eq('user_id', user.id)
      .order('scheduled_at', { ascending: true })

    return NextResponse.json({ posts: posts || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { content_item_id, platform, content, image_url, scheduled_at } = await request.json()

    const { data: post, error } = await supabase
      .from('scheduled_posts')
      .insert({
        user_id: user.id,
        content_item_id,
        platform,
        content,
        image_url,
        scheduled_at,
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw error

    // Update content item status
    if (content_item_id) {
      await supabase
        .from('content_items')
        .update({ status: 'scheduled', scheduled_at })
        .eq('id', content_item_id)
        .eq('user_id', user.id)
    }

    return NextResponse.json({ post })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await request.json()
    await supabase.from('scheduled_posts').delete().eq('id', id).eq('user_id', user.id)

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
