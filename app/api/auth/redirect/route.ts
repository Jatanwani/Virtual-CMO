import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/auth/login', request.url))
  const { data: profile } = await supabase.from('profiles').select('onboarded').eq('id', user.id).single()
  if (!(profile as any)?.onboarded) return NextResponse.redirect(new URL('/onboarding', request.url))
  return NextResponse.redirect(new URL('/dashboard', request.url))
}
