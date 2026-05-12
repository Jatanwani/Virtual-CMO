import { createClient } from '@/lib/supabase/server'
import { ExperimentsClient } from '@/components/dashboard/ExperimentsClient'

export default async function ExperimentsPage() {
  const supabase = await createClient() // Added 'await'
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: experiments }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user!.id).single(),
    supabase.from('experiments').select('*').eq('user_id', user!.id)
      .order('created_at', { ascending: false }),
  ])

  return <ExperimentsClient profile={profile} initialExperiments={experiments || []} />
}
