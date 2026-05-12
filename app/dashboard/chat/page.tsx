import { createClient } from '@/lib/supabase/server'
import { ChatClient } from '@/components/dashboard/ChatClient'

export default async function ChatPage() {
  const supabase = await createClient() // Added 'await'
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: messages }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user!.id).single(),
    supabase.from('chat_messages').select('*').eq('user_id', user!.id)
      .order('created_at', { ascending: true }).limit(100),
  ])

  return <ChatClient profile={profile} initialMessages={messages || []} />
}
