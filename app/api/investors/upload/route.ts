import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { investors, adminKey } = await request.json()

    // Simple admin protection
    if (adminKey !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (!Array.isArray(investors) || investors.length === 0) {
      return NextResponse.json({ error: 'No investors provided' }, { status: 400 })
    }

    const BATCH = 200
    let inserted = 0
    for (let i = 0; i < investors.length; i += BATCH) {
      const batch = investors.slice(i, i + BATCH)
      const { error } = await supabase
        .from('investors')
        .upsert(batch, { onConflict: 'name,firm', ignoreDuplicates: true })
      if (!error) inserted += batch.length
    }

    return NextResponse.json({ ok: true, inserted })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
