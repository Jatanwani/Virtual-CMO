import { createClient } from '@/lib/supabase/server'
import { CMOBrainClient } from '@/components/dashboard/CMOBrainClient'

export default async function ChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: messages }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user!.id).single(),
    supabase.from('chat_messages').select('*').eq('user_id', user!.id).order('created_at').limit(50),
  ])

  return <CMOBrainClient profile={profile} initialMessages={messages || []} />
}
