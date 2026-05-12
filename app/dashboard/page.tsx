'use client'
import { createClient } from '@/lib/supabase/server'
import { DashboardClient } from '@/components/dashboard/DashboardClient'
export const dynamic = 'force-dynamic';
export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [
    { data: profile },
    { data: tasks },
    { data: experiments },
    { data: results },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user!.id).single(),
    supabase.from('tasks').select('*').eq('user_id', user!.id).order('priority').limit(30),
    supabase.from('experiments').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }).limit(10),
    supabase.from('results').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }).limit(10),
  ])

  return (
    <DashboardClient
      profile={profile}
      initialTasks={tasks || []}
      experiments={experiments || []}
      results={results || []}
    />
  )
}