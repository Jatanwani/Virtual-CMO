import { createClient } from '@/lib/supabase/server'
import { ContentPageClient } from '@/components/dashboard/ContentPageClient'

export default async function ContentPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  const { data: items } = await supabase
    .from('content_items')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return <ContentPageClient profile={profile} initialItems={items || []} />
}
