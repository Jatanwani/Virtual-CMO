import { createClient } from '@/lib/supabase/server'
import { streamGatewayChat } from '@/lib/ai-gateway'

export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const supabase = await createClient(); // MUST HAVE 'await'
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response('Unauthorized', { status: 401 })

    const body = await request.json()
    const { messages } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response('No messages provided', { status: 400 })
    }

    const { data: profile } = await supabase
      .from('profiles').select('*').eq('id', user.id).single()

    if (!profile) return new Response('Profile not found', { status: 404 })

    // Save last user message fire and forget
    const lastMsg = messages[messages.length - 1]
    if (lastMsg?.role === 'user') {
      supabase.from('chat_messages').insert({
        user_id: user.id,
        role: 'user',
        content: lastMsg.content,
      }).then(() => {})
    }

    const stream = await streamGatewayChat(
      messages.map((m: any) => ({ role: m.role, content: String(m.content) })),
      profile,
      user.id
    )

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (err: any) {
    console.error('CMO chat error:', err)
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

export async function GET() {
  try {
    const supabase = await createClient(); // MUST HAVE 'await'
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response('Unauthorized', { status: 401 })

    const { data: messages } = await supabase
      .from('chat_messages').select('*').eq('user_id', user.id)
      .order('created_at', { ascending: true }).limit(100)

    return Response.json({ messages: messages || [] })
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
