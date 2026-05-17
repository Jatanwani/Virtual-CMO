import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function generateWithGemini(prompt: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new Error('NO_KEY')

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 8192, temperature: 0.7 },
      }),
      signal: AbortSignal.timeout(60000),
    }
  )

  if (res.status === 429 || res.status === 503) {
    throw new Error('QUOTA_EXCEEDED')
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as any
    const msg = err?.error?.message || ''
    if (msg.includes('quota') || msg.includes('limit') || msg.includes('exhausted')) {
      throw new Error('QUOTA_EXCEEDED')
    }
    throw new Error('GEMINI_ERROR: ' + msg)
  }

  const data = await res.json() as any
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
  if (!text) throw new Error('EMPTY_RESPONSE')
  return text
}

function buildFallback(name: string, problem: string, icp: string): string {
  const yr = new Date().getFullYear()
  return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>' + name + '</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"><script src="https://cdn.tailwindcss.com"></script><style>*{font-family:Inter,sans-serif}a{text-decoration:none}</style></head><body style="margin:0;background:#FAFAF8"><nav style="position:sticky;top:0;z-index:50;background:rgba(250,250,248,0.95);backdrop-filter:blur(12px);border-bottom:1px solid #EDE9E3;padding:0 32px;display:flex;align-items:center;justify-content:space-between;height:64px"><span style="font-weight:900;font-size:18px;color:#0D0C0B">' + name + '</span><a href="#cta" style="background:#FF8C1A;color:white;padding:10px 24px;border-radius:10px;font-weight:700;font-size:14px">Get Started Free</a></nav><section style="background:linear-gradient(135deg,#0D0C0B,#1a1714,#2d1a00);padding:100px 32px;text-align:center"><p style="color:#FF8C1A;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 20px">Built for ' + (icp.split(',')[0] || 'Modern Teams') + '</p><h1 style="font-size:clamp(32px,5vw,60px);font-weight:900;color:white;margin:0 0 20px;line-height:1.05">' + name + '<br><span style="color:#FF8C1A">Simplified</span></h1><p style="color:rgba(255,255,255,0.65);font-size:18px;max-width:560px;margin:0 auto 40px;line-height:1.7">' + problem + '</p><a href="#cta" style="background:#FF8C1A;color:white;padding:16px 36px;border-radius:12px;font-weight:700;font-size:16px;display:inline-block">Start Free Today</a><p style="color:rgba(255,255,255,0.3);font-size:13px;margin-top:16px">No credit card required</p></section><section style="padding:80px 32px;background:white"><div style="max-width:1000px;margin:0 auto;text-align:center"><h2 style="font-size:36px;font-weight:800;color:#0D0C0B;margin:0 0 48px">Why ' + name + '?</h2><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px"><div style="border:1px solid #EDE9E3;border-radius:20px;padding:32px;text-align:left;transition:all 0.2s"><div style="font-size:32px;margin-bottom:16px">&#9889;</div><h3 style="font-weight:700;color:#0D0C0B;margin:0 0 10px">Lightning Fast</h3><p style="color:#7A7670;font-size:14px;line-height:1.6;margin:0">Set up in minutes, see results immediately.</p></div><div style="border:1px solid #EDE9E3;border-radius:20px;padding:32px;text-align:left"><div style="font-size:32px;margin-bottom:16px">&#129504;</div><h3 style="font-weight:700;color:#0D0C0B;margin:0 0 10px">AI-Powered</h3><p style="color:#7A7670;font-size:14px;line-height:1.6;margin:0">Smart automation that works around the clock.</p></div><div style="border:1px solid #EDE9E3;border-radius:20px;padding:32px;text-align:left"><div style="font-size:32px;margin-bottom:16px">&#128200;</div><h3 style="font-weight:700;color:#0D0C0B;margin:0 0 10px">Real Results</h3><p style="color:#7A7670;font-size:14px;line-height:1.6;margin:0">Data-driven insights that grow your business.</p></div></div></div></section><section style="padding:80px 32px;background:#0D0C0B"><div style="max-width:900px;margin:0 auto;text-align:center"><p style="color:rgba(255,255,255,0.4);font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:40px">Trusted by Founders</p><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px"><div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:28px;text-align:left"><p style="color:rgba(255,255,255,0.8);font-size:15px;line-height:1.6;margin:0 0 20px">"' + name + ' changed how we operate. Incredible tool."</p><p style="color:white;font-weight:700;font-size:14px;margin:0">Sarah K.</p><p style="color:rgba(255,255,255,0.4);font-size:12px;margin:4px 0 0">Founder</p></div><div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:28px;text-align:left"><p style="color:rgba(255,255,255,0.8);font-size:15px;line-height:1.6;margin:0 0 20px">"Our growth tripled in 60 days. Absolutely worth it."</p><p style="color:white;font-weight:700;font-size:14px;margin:0">Raj M.</p><p style="color:rgba(255,255,255,0.4);font-size:12px;margin:4px 0 0">CEO</p></div><div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:28px;text-align:left"><p style="color:rgba(255,255,255,0.8);font-size:15px;line-height:1.6;margin:0 0 20px">"Simple, powerful, and the results speak for themselves."</p><p style="color:white;font-weight:700;font-size:14px;margin:0">Emma L.</p><p style="color:rgba(255,255,255,0.4);font-size:12px;margin:4px 0 0">CMO</p></div></div></div></section><section id="cta" style="padding:100px 32px;text-align:center"><h2 style="font-size:40px;font-weight:900;color:#0D0C0B;margin:0 0 16px">Ready to grow faster?</h2><p style="color:#7A7670;font-size:17px;margin:0 0 40px;line-height:1.7">Join hundreds of founders using ' + name + ' to grow their business</p><a href="#" style="background:#FF8C1A;color:white;padding:18px 40px;border-radius:12px;font-weight:700;font-size:16px;display:inline-block">Get Started Free</a><p style="color:#A39E96;font-size:13px;margin-top:16px">Free plan available - Cancel anytime</p></section><footer style="background:#0D0C0B;padding:32px;text-align:center"><p style="color:rgba(255,255,255,0.3);font-size:13px;margin:0">Copyright ' + yr + ' ' + name + '. All rights reserved.</p></footer></body></html>'
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { title, description } = await request.json()

    // Use ONLY user-provided data - never mix with profile data for landing pages
    const productName = (title || '').trim() || 'My Product'
    const problemDesc = (description || '').trim() || 'A solution to a real problem'

    const { data: profile } = await supabase.from('profiles').select('icp').eq('id', user.id).single()
    const icp = (profile as any)?.icp || 'Modern teams'

    const prompt = `You are an expert landing page designer. Create a stunning, complete, professional landing page HTML.

Product: ${productName}
Problem it solves: ${problemDesc}
Target customer: ${icp}

CRITICAL: Use ONLY "${productName}" as the product name throughout the page. Do not use any other product names.

Design requirements:
- Include in <head>: Tailwind CSS CDN (https://cdn.tailwindcss.com) and Google Fonts Inter
- Color scheme: primary #0D0C0B (near black), accent #FF8C1A (orange), background #FAFAF8
- Sticky navigation bar with product name and CTA button
- Hero section: dark gradient background, large headline, subheadline, two CTA buttons, trust indicators
- Problem section: what pain does this solve for customers
- Features section: 3 feature cards with icons, titles, descriptions
- How it works: 3 numbered steps
- Social proof: 3 testimonial cards on dark background
- CTA section: gradient background, headline, email signup or button
- Footer: product name, copyright, links

Technical requirements:
- Complete valid HTML5 document
- All Tailwind classes must be standard utility classes
- CSS custom styles in <style> tag for animations
- Mobile responsive with grid layouts
- Smooth hover effects on cards and buttons
- Clean professional typography
- All links href="#"

Return ONLY the complete HTML document starting with <!DOCTYPE html> and ending with </html>. No markdown, no explanation, no code fences.`

    let html = ''
    let quotaExceeded = false

    try {
      const raw = await generateWithGemini(prompt)
      html = raw.trim()
        .replace(/^```html\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim()

      if (!html.startsWith('<!DOCTYPE') && !html.startsWith('<html')) {
        html = buildFallback(productName, problemDesc, icp)
      }
    } catch (err: any) {
      if (err.message === 'QUOTA_EXCEEDED') {
        quotaExceeded = true
        html = buildFallback(productName, problemDesc, icp)
      } else {
        html = buildFallback(productName, problemDesc, icp)
      }
    }

    const slug = productName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now()
    const { data: page } = await supabase
      .from('landing_pages')
      .insert({ user_id: user.id, title: productName, slug, html_content: html, published: false })
      .select()
      .single()

    return NextResponse.json({
      page,
      html,
      quota_exceeded: quotaExceeded,
      message: quotaExceeded
        ? 'Daily generation limit reached. Your credits will refill in 24 hours. Showing a template preview instead.'
        : null,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET() {
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
