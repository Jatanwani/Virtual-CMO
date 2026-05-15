import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildFounderContext, callGatewayChat } from '@/lib/ai-gateway'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { title, description } = await request.json()
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    const p = (profile || {}) as any

    const productName = title || p.product?.slice(0, 60) || 'My Startup'
    const problem = description || p.problem || 'Solving a real problem'
    const icp = p.icp || 'Modern teams'
    const year = new Date().getFullYear()

    const prompt = `Create a complete beautiful modern landing page HTML for this startup:
Product: ${productName}
Problem solved: ${problem}  
Target customer: ${icp}

Requirements:
- Include Tailwind CSS CDN and Google Fonts Inter in head
- Use colors: primary #0D0C0B, accent #FF8C1A, bg #FAFAF8
- Sections: sticky nav, hero with dark gradient, problem, 3 features, testimonials, CTA, footer
- Mobile responsive, hover effects, premium SaaS design
- Compelling copy specific to their product

Return ONLY the complete HTML document. Start with <!DOCTYPE html> and end with </html>. No markdown, no explanation.`

    const result = await callGatewayChat(
      [{ role: 'user', content: prompt }],
      p,
      user.id
    )

    let html = result.content.trim()
    html = html.replace(/^```html\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()

    if (!html.includes('<html')) {
      html = buildFallbackPage(productName, problem, icp, year)
    }

    const slug = productName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now()
    const { data: page } = await supabase
      .from('landing_pages')
      .insert({ user_id: user.id, title: productName, slug, html_content: html, published: false })
      .select()
      .single()

    return NextResponse.json({ page, html })
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

function buildFallbackPage(name: string, problem: string, icp: string, year: number): string {
  const features = [
    { icon: 'rocket', title: 'Instant Setup', desc: 'Get running in under 2 minutes. No complex configuration needed.' },
    { icon: 'brain', title: 'AI-Powered', desc: 'Smart automation that learns your workflow and improves every day.' },
    { icon: 'chart', title: 'Real Analytics', desc: 'See exactly what is working with beautiful actionable dashboards.' },
  ]

  const testimonials = [
    { q: name + ' saved us 20 hours a week. Absolute game changer.', author: 'Sarah K.', role: 'Founder' },
    { q: 'Our growth tripled in 60 days. I wish I found this sooner.', author: 'Raj M.', role: 'CEO' },
    { q: 'Simple, powerful, and the support is incredible. 10 out of 10.', author: 'Emma L.', role: 'CMO' },
  ]

  const featureCards = features.map(f =>
    '<div style="background:white;border:1px solid #EDE9E3;border-radius:20px;padding:32px;transition:all 0.2s;">' +
    '<div style="font-size:32px;margin-bottom:16px;">&#9733;</div>' +
    '<h3 style="font-size:18px;font-weight:700;color:#0D0C0B;margin:0 0 10px 0;">' + f.title + '</h3>' +
    '<p style="font-size:14px;color:#7A7670;line-height:1.6;margin:0;">' + f.desc + '</p>' +
    '</div>'
  ).join('')

  const testimonialCards = testimonials.map(t =>
    '<div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:28px;text-align:left;">' +
    '<p style="color:rgba(255,255,255,0.8);font-size:15px;line-height:1.6;margin:0 0 20px 0;">"' + t.q + '"</p>' +
    '<p style="color:white;font-weight:700;font-size:14px;margin:0;">' + t.author + '</p>' +
    '<p style="color:rgba(255,255,255,0.4);font-size:12px;margin:4px 0 0 0;">' + t.role + '</p>' +
    '</div>'
  ).join('')

  return '<!DOCTYPE html>' +
    '<html lang="en">' +
    '<head>' +
    '<meta charset="UTF-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
    '<title>' + name + '</title>' +
    '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">' +
    '<script src="https://cdn.tailwindcss.com"></script>' +
    '<style>*{font-family:Inter,sans-serif;box-sizing:border-box;}a{text-decoration:none;}.btn{display:inline-block;padding:14px 32px;border-radius:12px;font-weight:700;font-size:15px;transition:all 0.2s;cursor:pointer;}.btn-primary{background:#FF8C1A;color:white;}.btn-primary:hover{background:#e67300;transform:translateY(-2px);box-shadow:0 8px 25px rgba(255,140,26,0.35);}.btn-secondary{background:transparent;color:#0D0C0B;border:2px solid #EDE9E3;}.btn-secondary:hover{border-color:#0D0C0B;transform:translateY(-2px);}.card:hover{box-shadow:0 12px 40px rgba(0,0,0,0.08);transform:translateY(-4px);}</style>' +
    '</head>' +
    '<body style="background:#FAFAF8;margin:0;">' +

    '<nav style="position:sticky;top:0;z-index:50;background:rgba(250,250,248,0.95);backdrop-filter:blur(12px);border-bottom:1px solid #EDE9E3;padding:0 32px;">' +
    '<div style="max-width:1100px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;height:64px;">' +
    '<span style="font-weight:900;font-size:18px;color:#0D0C0B;">' + name + '</span>' +
    '<div style="display:flex;gap:24px;align-items:center;">' +
    '<a href="#features" style="color:#524F4A;font-weight:500;font-size:14px;">Features</a>' +
    '<a href="#cta" class="btn btn-primary" style="padding:10px 24px;font-size:14px;">Get Started Free</a>' +
    '</div></div></nav>' +

    '<section style="background:linear-gradient(135deg,#0D0C0B 0%,#1a1714 50%,#2d1a00 100%);padding:100px 32px 120px;text-align:center;">' +
    '<div style="max-width:800px;margin:0 auto;">' +
    '<div style="display:inline-block;background:#FFF8F0;color:#FF8C1A;border:1px solid #FFD4A3;padding:6px 16px;border-radius:100px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:24px;">Built for ' + icp.split(',')[0] + '</div>' +
    '<h1 style="font-size:clamp(36px,5vw,64px);font-weight:900;color:white;line-height:1.05;margin:0 0 24px 0;">The smarter way to<br/><span style="color:#FF8C1A;">grow your business</span></h1>' +
    '<p style="font-size:18px;color:rgba(255,255,255,0.65);line-height:1.7;max-width:560px;margin:0 auto 40px auto;">' + problem + '</p>' +
    '<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">' +
    '<a href="#cta" class="btn btn-primary">Start Free Today</a>' +
    '<a href="#features" class="btn btn-secondary" style="color:white;border-color:rgba(255,255,255,0.2);">See Features</a>' +
    '</div>' +
    '<p style="color:rgba(255,255,255,0.3);font-size:13px;margin-top:20px;">No credit card required</p>' +
    '</div></section>' +

    '<section id="features" style="padding:80px 32px;background:#FAFAF8;">' +
    '<div style="max-width:1000px;margin:0 auto;">' +
    '<div style="text-align:center;margin-bottom:56px;">' +
    '<h2 style="font-size:36px;font-weight:800;color:#0D0C0B;margin:0 0 16px 0;">Everything you need to grow</h2>' +
    '<p style="font-size:17px;color:#7A7670;max-width:500px;margin:0 auto;">Powerful tools built specifically for ' + icp.split(',')[0] + '</p>' +
    '</div>' +
    '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;">' +
    featureCards +
    '</div></div></section>' +

    '<section style="padding:80px 32px;background:#0D0C0B;">' +
    '<div style="max-width:900px;margin:0 auto;text-align:center;">' +
    '<p style="color:rgba(255,255,255,0.4);font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:40px;">Trusted by founders worldwide</p>' +
    '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px;">' +
    testimonialCards +
    '</div></div></section>' +

    '<section id="cta" style="padding:100px 32px;text-align:center;">' +
    '<div style="max-width:600px;margin:0 auto;">' +
    '<h2 style="font-size:42px;font-weight:900;color:#0D0C0B;margin:0 0 16px 0;">Ready to grow faster?</h2>' +
    '<p style="font-size:17px;color:#7A7670;margin:0 0 40px 0;line-height:1.7;">Join hundreds of founders already using ' + name + '</p>' +
    '<a href="#" class="btn btn-primary" style="font-size:16px;padding:18px 40px;">Start Free - No Credit Card</a>' +
    '<p style="color:#A39E96;font-size:13px;margin-top:20px;">Free plan available - Cancel anytime</p>' +
    '</div></section>' +

    '<footer style="background:#0D0C0B;padding:32px;text-align:center;">' +
    '<p style="color:rgba(255,255,255,0.3);font-size:13px;margin:0;">Copyright ' + year + ' ' + name + '. All rights reserved.</p>' +
    '</footer>' +
    '</body></html>'
}
