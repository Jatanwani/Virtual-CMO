import { createClient } from '@/lib/supabase/server'
import { ResultsClient } from '@/components/dashboard/ResultsClient'

export default async function ResultsPage() {
  const supabase = await createClient() // Added 'await'
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: results }, { data: tasks }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user!.id).single(),
    supabase.from('results').select('*').eq('user_id', user!.id)
      .order('created_at', { ascending: false }).limit(20),
    supabase.from('tasks').select('id, title').eq('user_id', user!.id).eq('status', 'todo'),
  ])

  return <ResultsClient profile={profile} initialResults={results || []} tasks={tasks || []} />
}
