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

    const prompt = `Create a complete stunning modern landing page HTML for: ${productName}. Problem: ${problem}. Customer: ${icp}. Use Tailwind CDN, Google Fonts Inter, colors #0D0C0B and #FF8C1A. Include: sticky nav, hero with gradient, problem section, 3 features, testimonials, CTA, footer. Return ONLY complete HTML starting with <!DOCTYPE html>`

    const result = await callGatewayChat([{ role: 'user', content: prompt }], p, user.id)
    let html = result.content.trim().replace(/^```html\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()

    if (!html.includes('<html')) {
      html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${productName}</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet"><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-[#FAFAF8] font-[Inter]"><nav class="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100 px-6 py-4 flex justify-between items-center"><span class="font-black text-xl">${productName}</span><a href="#cta" class="bg-[#FF8C1A] text-white px-5 py-2 rounded-xl font-bold hover:bg-orange-600 transition">Get Started ?</a></nav><section class="bg-gradient-to-br from-[#0D0C0B] to-[#2d1a00] text-white py-24 px-6 text-center"><p class="text-[#FF8C1A] font-bold uppercase tracking-widest text-sm mb-4">AI-Powered Platform</p><h1 class="text-5xl font-black mb-6 leading-tight">Stop struggling.<br/><span class="text-[#FF8C1A]">Start growing.</span></h1><p class="text-white/60 text-lg max-w-xl mx-auto mb-8">${problem}</p><a href="#cta" class="bg-[#FF8C1A] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition inline-block">Start Free Today ?</a></section><section class="py-20 px-6 bg-white"><div class="max-w-4xl mx-auto"><h2 class="text-3xl font-black text-center mb-12">Everything you need</h2><div class="grid grid-cols-1 md:grid-cols-3 gap-6">${['?? Fast Setup|Get running in minutes','?? AI-Powered|Smart automation built in','?? Analytics|Real-time insights always'].map(f=>{const[t,d]=f.split('|');return`<div class="border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition"><p class="text-3xl mb-3">${t.split(' ')[0]}</p><h3 class="font-bold mb-2">${t.split(' ').slice(1).join(' ')}</h3><p class="text-gray-500 text-sm">${d}</p></div>`}).join('')}</div></div></section><section id="cta" class="py-20 px-6 bg-gradient-to-br from-orange-50 to-[#FAFAF8] text-center"><h2 class="text-4xl font-black mb-4">Ready to grow?</h2><p class="text-gray-500 mb-8">Join founders already using ${productName}</p><a href="#" class="bg-[#0D0C0B] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition inline-block">Get Started Free ?</a></section><footer class="bg-[#0D0C0B] text-white/40 text-sm py-6 px-6 text-center">© ${new Date().getFullYear()} ${productName}. All rights reserved.</footer></body></html>`
    }

    const slug = productName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now()
    const { data: page } = await supabase.from('landing_pages').insert({ user_id: user.id, title: productName, slug, html_content: html, published: false }).select().single()

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
    const { data: pages } = await supabase.from('landing_pages').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    return NextResponse.json({ pages: pages || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
