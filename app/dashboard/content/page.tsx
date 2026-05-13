import { createClient } from '@/lib/supabase/server'
import { ContentClient } from '@/components/dashboard/ContentClient'
import { format, startOfWeek } from 'date-fns'

export default async function ContentPage() {
  const supabase = await createClient() // Added 'await'
  const { data: { user } } = await supabase.auth.getUser()

  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')

  const [{ data: profile }, { data: items }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user!.id).single(),
    supabase.from('content_items').select('*')
      .eq('user_id', user!.id)
      .eq('week_start', weekStart)
      .order('created_at'),
  ])

  return <ContentClient profile={profile} initialItems={items || []} weekStart={weekStart} />
}
