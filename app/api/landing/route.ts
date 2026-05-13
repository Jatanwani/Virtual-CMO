import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { callGatewayJSON, buildFounderContext } from '@/lib/ai-gateway'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { title, description } = await request.json()

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

    const prompt = `Generate a complete, professional landing page HTML for this startup:

Product: ${title || profile?.product}
Description: ${description || profile?.problem}
Target Customer: ${profile?.icp}
Stage: ${profile?.stage}

Generate a COMPLETE, BEAUTIFUL, MODERN landing page with:
- Hero section with compelling headline and CTA button
- Problem/Solution section  
- Features section (3 features)
- Social proof section
- CTA section
- Footer

Use this exact color scheme: primary #0D0C0B, accent #FF8C1A, background #FAFAF8
Use Tailwind CSS CDN classes.
Make it mobile responsive.
Include smooth hover effects.

Return JSON with this structure:
{
  "title": "page title",
  "html": "complete HTML string with inline tailwind classes",
  "sections": ["hero", "problem", "features", "cta"]
}`

    const result = await callGatewayJSON<{ title: string; html: string; sections: string[] }>(
      prompt, profile || {}, user.id
    )

    // Save to DB
    const slug = (result.title || title || 'landing').toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now()
    const { data: page } = await supabase
      .from('landing_pages')
      .insert({
        user_id: user.id,
        title: result.title || title,
        slug,
        html_content: result.html,
        published: false,
      })
      .select()
      .single()

    return NextResponse.json({ page, html: result.html })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: pages } = await supabase
      .from('landing_pages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    return NextResponse.json({ pages: pages || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
