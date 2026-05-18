import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Provider 1: Gemini Flash - 1500 req/min free, very fast
async function generateWithGeminiFlash(prompt: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new Error('NO_GEMINI_KEY')

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 8192, temperature: 0.7 },
      }),
      signal: AbortSignal.timeout(45000),
    }
  )

  if (res.status === 429 || res.status === 503) throw new Error('QUOTA_EXCEEDED')
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as any
    const msg = err?.error?.message || ''
    if (msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('limit')) {
      throw new Error('QUOTA_EXCEEDED')
    }
    throw new Error('GEMINI_FLASH_ERROR: ' + msg)
  }

  const data = await res.json() as any
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
  if (!text) throw new Error('EMPTY_RESPONSE')
  return text
}

// Provider 2: Groq - completely free, no daily limits, fast
async function generateWithGroq(prompt: string): Promise<string> {
  const key = process.env.GROQ_API_KEY
  if (!key) throw new Error('NO_GROQ_KEY')

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 8000,
      messages: [
        {
          role: 'system',
          content: 'You are an expert landing page designer. Generate complete beautiful HTML landing pages. Return ONLY valid HTML starting with <!DOCTYPE html>.',
        },
        { role: 'user', content: prompt },
      ],
    }),
    signal: AbortSignal.timeout(45000),
  })

  if (res.status === 429) throw new Error('QUOTA_EXCEEDED')
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as any
    throw new Error('GROQ_ERROR: ' + (err?.error?.message || res.status))
  }

  const data = await res.json() as any
  const text = data.choices?.[0]?.message?.content || ''
  if (!text) throw new Error('EMPTY_RESPONSE')
  return text
}

// Provider 3: Gemini Pro as last resort
async function generateWithGeminiPro(prompt: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new Error('NO_GEMINI_KEY')

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

  if (res.status === 429 || res.status === 503) throw new Error('QUOTA_EXCEEDED')
  if (!res.ok) throw new Error('GEMINI_PRO_ERROR')

  const data = await res.json() as any
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
  if (!text) throw new Error('EMPTY_RESPONSE')
  return text
}

function cleanHtml(raw: string): string {
  return raw
    .replace(/^```html\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim()
}

function buildFallback(name: string, problem: string, icp: string): string {
  const yr = new Date().getFullYear()
  return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>' + name + '</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"><script src="https://cdn.tailwindcss.com"></script><style>*{font-family:Inter,sans-serif}a{text-decoration:none}</style></head><body style="margin:0;background:#FAFAF8"><nav style="position:sticky;top:0;z-index:50;background:rgba(250,250,248,0.95);backdrop-filter:blur(12px);border-bottom:1px solid #EDE9E3;padding:0 32px;display:flex;align-items:center;justify-content:space-between;height:64px"><span style="font-weight:900;font-size:18px;color:#0D0C0B">' + name + '</span><a href="#cta" style="background:#FF8C1A;color:white;padding:10px 24px;border-radius:10px;font-weight:700;font-size:14px">Get Started Free</a></nav><section style="background:linear-gradient(135deg,#0D0C0B,#1a1714,#2d1a00);padding:100px 32px;text-align:center"><p style="color:#FF8C1A;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 20px">Built for ' + (icp.split(',')[0] || 'Modern Teams') + '</p><h1 style="font-size:clamp(32px,5vw,60px);font-weight:900;color:white;margin:0 0 20px;line-height:1.05">' + name + '<br><span style="color:#FF8C1A">Simplified</span></h1><p style="color:rgba(255,255,255,0.65);font-size:18px;max-width:560px;margin:0 auto 40px;line-height:1.7">' + problem + '</p><a href="#cta" style="background:#FF8C1A;color:white;padding:16px 36px;border-radius:12px;font-weight:700;font-size:16px;display:inline-block">Start Free Today</a><p style="color:rgba(255,255,255,0.3);font-size:13px;margin-top:16px">No credit card required</p></section><section style="padding:80px 32px;background:white"><div style="max-width:1000px;margin:0 auto;text-align:center"><h2 style="font-size:36px;font-weight:800;color:#0D0C0B;margin:0 0 48px">Why ' + name + '?</h2><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px"><div style="border:1px solid #EDE9E3;border-radius:20px;padding:32px;text-align:left"><div style="font-size:32px;margin-bottom:16px">&#9889;</div><h3 style="font-weight:700;color:#0D0C0B;margin:0 0 10px">Lightning Fast</h3><p style="color:#7A7670;font-size:14px;line-height:1.6;margin:0">Set up in minutes, see results immediately.</p></div><div style="border:1px solid #EDE9E3;border-radius:20px;padding:32px;text-align:left"><div style="font-size:32px;margin-bottom:16px">&#129504;</div><h3 style="font-weight:700;color:#0D0C0B;margin:0 0 10px">AI-Powered</h3><p style="color:#7A7670;font-size:14px;line-height:1.6;margin:0">Smart automation built for your workflow.</p></div><div style="border:1px solid #EDE9E3;border-radius:20px;padding:32px;text-align:left"><div style="font-size:32px;margin-bottom:16px">&#128200;</div><h3 style="font-weight:700;color:#0D0C0B;margin:0 0 10px">Real Results</h3><p style="color:#7A7670;font-size:14px;line-height:1.6;margin:0">Data-driven growth for your business.</p></div></div></div></section><section id="cta" style="padding:100px 32px;text-align:center"><h2 style="font-size:40px;font-weight:900;color:#0D0C0B;margin:0 0 16px">Ready to grow faster?</h2><p style="color:#7A7670;font-size:17px;margin:0 0 40px">Join hundreds of founders using ' + name + '</p><a href="#" style="background:#FF8C1A;color:white;padding:18px 40px;border-radius:12px;font-weight:700;font-size:16px;display:inline-block">Get Started Free</a></section><footer style="background:#0D0C0B;padding:32px;text-align:center"><p style="color:rgba(255,255,255,0.3);font-size:13px;margin:0">Copyright ' + yr + ' ' + name + '. All rights reserved.</p></footer></body></html>'
}

function buildPrompt(name: string, problem: string, icp: string): string {
  return `Create a stunning, complete, professional landing page HTML for this product.

Product Name: ${name}
Problem solved: ${problem}
Target customer: ${icp}

CRITICAL: Use ONLY "${name}" throughout. Do NOT use any other product names.

Design requirements:
- Include in head: Tailwind CSS CDN <script src="https://cdn.tailwindcss.com"></script> and Google Fonts Inter
- Colors: primary #0D0C0B, accent #FF8C1A, background #FAFAF8
- Sections: sticky nav, hero with dark gradient, problem, 3 features, how-it-works (3 steps), testimonials, CTA, footer
- Mobile responsive, hover effects, premium SaaS design
- All links use href="#section-id" for smooth scroll, never external URLs
- CSS animations for hero entrance
- High conversion copywriting specific to "${name}"

Return ONLY complete HTML from <!DOCTYPE html> to </html>. No markdown, no explanation.`
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { title, description } = await request.json()
    const productName = (title || '').trim() || 'My Product'
    const problemDesc = (description || '').trim() || 'A solution to a real problem'

    const { data: profile } = await supabase.from('profiles').select('icp').eq('id', user.id).single()
    const icp = (profile as any)?.icp || 'Modern teams'

    const prompt = buildPrompt(productName, problemDesc, icp)

    // Try providers in order: Gemini Flash → Groq → Gemini Pro → Fallback
    const providers = [
      { name: 'Gemini Flash', fn: () => generateWithGeminiFlash(prompt) },
      { name: 'Groq', fn: () => generateWithGroq(prompt) },
      { name: 'Gemini Pro', fn: () => generateWithGeminiPro(prompt) },
    ]

    let html = ''
    let usedProvider = 'fallback'

    for (const provider of providers) {
      try {
        console.log(`[Landing] Trying ${provider.name}...`)
        const raw = await provider.fn()
        const cleaned = cleanHtml(raw)
        if (cleaned.includes('<html') || cleaned.includes('<!DOCTYPE')) {
          html = cleaned
          usedProvider = provider.name
          console.log(`[Landing] Success with ${provider.name}`)
          break
        }
      } catch (err: any) {
        console.warn(`[Landing] ${provider.name} failed:`, err.message)
      }
    }

    // All providers failed - use fallback template
    if (!html) {
      html = buildFallback(productName, problemDesc, icp)
      usedProvider = 'template'
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
      provider: usedProvider,
      quota_exceeded: usedProvider === 'template',
      message: usedProvider === 'template'
        ? 'All generation services are temporarily busy. Showing a template. Please try again in a few minutes.'
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
