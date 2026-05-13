import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    if (!data.session) {
      return NextResponse.json({ error: 'No session created' }, { status: 401 })
    }

    // Check onboarding status
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarded')
      .eq('id', data.user.id)
      .single()

    const redirectTo = (profile as any)?.onboarded ? '/dashboard' : '/onboarding'

    return NextResponse.json({ redirectTo })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
