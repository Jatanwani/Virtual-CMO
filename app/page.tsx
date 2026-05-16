import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = await createClient() 
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarded')
      .eq('id', user.id)
      .single()
    
    if (profile?.onboarded) redirect('/dashboard')
    else redirect('/onboarding')
  }

  return (
    <div className="min-h-screen bg-[#0D0C0B] text-white overflow-x-hidden antialiased selection:bg-[#FF8C1A]/20 selection:text-white">
      {/* Background Graphic Structural Grain Overlay */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.035]" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px'
        }}
      />

      {/* ─── NAVBAR SECTION ─── */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 flex items-center justify-center overflow-hidden rounded-full">
            <img 
              src="/virtual-cmo-logo.png" 
              alt="Virtual CMO OS Logo" 
              className="w-full h-full object-cover block"
            />
          </div>
          <span className="font-black text-[15px] tracking-tight">Virtual CMO OS</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-[13px] text-white/50 font-medium">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how" className="hover:text-white transition-colors">How it works</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="text-[13px] text-white/60 hover:text-white transition-colors font-medium px-3 py-2">
            Sign in
          </Link>
          <Link href="/auth/signup" className="bg-[#FF8C1A] hover:bg-[#E67300] text-[#0D0C0B] text-[13px] font-bold px-4 py-2 rounded-lg transition-all hover:shadow-[0_0_20px_#FF8C1A55]">
            Get started free →
          </Link>
        </div>
      </nav>

      {/* ─── HERO ATTACK ZONE SECTION ─── */}
      <section className="relative z-10 px-6 md:px-12 pt-24 pb-20 text-center max-w-5xl mx-auto">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#FF8C1A] opacity-[0.07] blur-[120px] rounded-full pointer-events-none" />
        <div className="inline-flex items-center gap-2 bg-[#FF8C1A]/10 border border-[#FF8C1A]/30 text-[#FF8C1A] text-[11px] font-bold px-3 py-1.5 rounded-full mb-8 tracking-widest uppercase">
          <div className="w-1.5 h-1.5 rounded-full bg-[#FF8C1A] animate-pulse" />
          AI-Powered Growth OS for Startups
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.02] mb-6">
          Your startup deserves<br />
          <span className="text-[#FF8C1A]">a world-class CMO.</span><br />
          <span className="text-white/30">Not a consultant bill.</span>
        </h1>
        <p className="text-[17px] md:text-[19px] text-white/50 max-w-2xl mx-auto leading-relaxed mb-10">
          Virtual CMO OS gives every founder a personal Chief Marketing Officer — custom strategy, daily content, growth experiments, and real coaching. Tailored to your exact product, ICP, and stage.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
          <Link href="/auth/signup" className="bg-[#FF8C1A] hover:bg-[#E67300] text-[#0D0C0B] px-8 py-4 rounded-xl text-[15px] font-black transition-all hover:shadow-[0_0_40px_#FF8C1A40] w-full sm:w-auto text-center">
            Start free — no credit card →
          </Link>
          <Link href="/auth/login" className="border border-white/10 hover:border-white/20 text-white/60 hover:text-white px-8 py-4 rounded-xl text-[15px] font-medium transition-all w-full sm:w-auto text-center">
            I have an account
          </Link>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[12px] text-white/30 font-medium">
          <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-[#FF8C1A]/60" />500+ founders using it</div>
          <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-[#FF8C1A]/60" />7-day content in 60 seconds</div>
          <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-[#FF8C1A]/60" />Works with $0 budget</div>
          <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-[#FF8C1A]/60" />6 AI providers for reliability</div>
        </div>
      </section>

      {/* ─── LIVE DASHBOARD MOCK INTERFACE ─── */}
      <section className="relative z-10 px-6 md:px-12 pb-24 max-w-5xl mx-auto">
        <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
          <div className="bg-[#1A1714] px-4 py-3 flex items-center gap-2 border-b border-white/[0.06]">
            <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
            <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
            <div className="w-3 h-3 rounded-full bg-[#28C840]" />
            <div className="flex-1 mx-4 bg-white/5 rounded-md px-3 py-1 text-[11px] text-white/30 text-left">app.virtualcmo.io/dashboard</div>
          </div>
          <div className="bg-[#FDFCFA] flex flex-col md:flex-row min-h-[340px]">
            {/* Sidebar Element */}
            <div className="w-full md:w-52 bg-[#0D0C0B] p-4 flex flex-col gap-1 flex-shrink-0 text-left">
              <div className="flex items-center gap-2 mb-6 mt-1">
                <div className="w-7 h-7 flex items-center justify-center overflow-hidden rounded-full">
                  <img src="/virtual-cmo-logo.png" alt="Logo" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="text-white text-[11px] font-bold">Virtual CMO</div>
                  <div className="text-white/30 text-[9px]">Growth Brain</div>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-medium text-white/40"><div className="w-1.5 h-1.5 rounded-full bg-white/20" />Dashboard</div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-medium bg-[#FF8C1A] text-[#0D0C0B]"><div className="w-1.5 h-1.5 rounded-full bg-[#0D0C0B]" />CMO Brain</div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-medium text-white/40"><div className="w-1.5 h-1.5 rounded-full bg-white/20" />Content Engine</div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-medium text-white/40"><div className="w-1.5 h-1.5 rounded-full bg-white/20" />Experiments</div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-medium text-white/40"><div className="w-1.5 h-1.5 rounded-full bg-white/20" />Settings</div>
              <div className="mt-8 md:mt-auto bg-[#1A1714] rounded-xl p-3">
                <div className="text-[9px] text-[#FF8C1A] font-bold mb-1">TRACTION SCORE</div>
                <div className="text-white text-[18px] font-black">42<span className="text-white/30 text-[11px]">/100</span></div>
                <div className="w-full bg-white/10 rounded-full h-1.5 mt-1.5">
                  <div className="bg-[#FF8C1A] h-1.5 rounded-full" style={{ width: '42%' }} />
                </div>
              </div>
            </div>
            {/* Main Interactive Chat Area Mock */}
            <div className="flex-1 flex flex-col p-5 gap-3 text-left overflow-hidden">
              <div className="text-[#0D0C0B] font-bold text-[13px]">CMO Brain <span className="text-[10px] text-[#A39E96] font-normal ml-1">AI strategy advisor</span></div>
              <div className="flex gap-2 flex-row-reverse">
                <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[9px] font-bold bg-[#FF8C1A] text-white">F</div>
                <div className="text-[10px] leading-relaxed rounded-xl px-3 py-2 max-w-[80%] bg-[#0D0C0B] text-white">
                  <div>Create a 30-day marketing plan for my SaaS targeting SMBs</div>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[9px] font-bold bg-[#0D0C0B] text-[#FF8C1A]">C</div>
                <div className="text-[10px] leading-relaxed rounded-xl px-3 py-2 max-w-[80%] bg-white border border-[#EDE9E3] text-[#0D0C0B]">
                  <div>Here's your personalized 30-day GTM plan for SMB SaaS:</div>
                  <div className="font-bold mt-1">Week 1 — Nail the Message</div>
                  <div>• Rewrite your homepage headline around the #1 SMB pain</div>
                  <div>• Launch 3 cold outreach sequences targeting ops managers</div>
                  <div>• Post daily on LinkedIn about SMB productivity wins</div>
                </div>
              </div>
              <div className="mt-1">
                <div className="inline-flex items-center gap-2 bg-[#FF8C1A] text-[#0D0C0B] text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer">✦ Generate 7-Day Content Plan</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PROBLEM DEFINITION PANEL ─── */}
      <section className="relative z-10 px-6 md:px-12 py-20 border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[#FF8C1A] text-[11px] font-bold tracking-widest uppercase mb-4">The Problem</p>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-6">Founders are great at building.<br /><span className="text-white/30">Marketing kills them.</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12 text-left">
            <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
              <div className="text-3xl mb-4">💸</div>
              <h3 className="font-bold text-[15px] mb-2">Agencies cost ₹2–5L/month</h3>
              <p className="text-white/40 text-[13px] leading-relaxed">For a slide deck and a generic social media plan you could have GPT-4 write.</p>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
              <div className="text-3xl mb-4">⏱️</div>
              <h3 className="font-bold text-[15px] mb-2">No time to learn marketing</h3>
              <p className="text-white/40 text-[13px] leading-relaxed">You're shipping, hiring, and selling. A 6-week marketing course isn't happening.</p>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
              <div className="text-3xl mb-4">🎯</div>
              <h3 className="font-bold text-[15px] mb-2">Generic advice doesn't convert</h3>
              <p className="text-white/40 text-[13px] leading-relaxed">"Post on LinkedIn daily" means nothing without knowing your ICP, hook, and offer.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES MATRIX SECTION ─── */}
      <section id="features" className="relative z-10 px-6 md:px-12 py-20 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#FF8C1A] text-[11px] font-bold tracking-widest uppercase mb-4">Everything you need</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">One OS. Every growth lever.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="relative rounded-2xl p-6 border transition-all bg-[#FF8C1A]/10 border-[#FF8C1A]/30 hover:border-[#FF8C1A]/50">
              <div className="flex items-start gap-4">
                <div className="text-3xl flex-shrink-0">🧠</div>
                <div>
                  <div className="flex items-center gap-2 mb-1"><span className="text-[10px] font-bold tracking-widest text-[#FF8C1A]">AI</span></div>
                  <h3 className="font-bold text-[15px] mb-2">CMO Brain — Your personal strategist</h3>
                  <p className="text-white/40 text-[13px] leading-relaxed">Ask anything. Get specific answers tailored to your product, ICP, and stage. Not "post on LinkedIn" — the exact hook, format, and schedule for YOUR audience.</p>
                </div>
              </div>
            </div>
            <div className="relative rounded-2xl p-6 border transition-all bg-white/[0.03] border-white/[0.07] hover:border-white/[0.15]">
              <div className="flex items-start gap-4">
                <div className="text-3xl flex-shrink-0">📅</div>
                <div>
                  <div className="flex items-center gap-2 mb-1"><span className="text-[10px] font-bold tracking-widest text-white/30">CONTENT</span></div>
                  <h3 className="font-bold text-[15px] mb-2">Content Engine — 7 days in 60 seconds</h3>
                  <p className="text-white/40 text-[13px] leading-relaxed">Generates a full week of posts: AI image, headline, body copy, hashtags. One click to approve or revise. Covers LinkedIn, Twitter/X, and Instagram.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── THREE STEP SYSTEM BLOCK ─── */}
      <section id="how" className="relative z-10 px-6 md:px-12 py-20 border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#FF8C1A] text-[11px] font-bold tracking-widest uppercase mb-4">How it works</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">From zero to traction in 3 steps</h2>
          </div>
          <div className="space-y-4 text-left">
            <div className="flex gap-6 bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 hover:border-white/[0.12] transition-all">
              <div className="text-[#FF8C1A] font-black text-[40px] leading-none opacity-30 flex-shrink-0 w-12">01</div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-[16px]">Tell your CMO about your startup</h3>
                  <span className="bg-[#FF8C1A]/10 text-[#FF8C1A] text-[10px] font-bold px-2 py-0.5 rounded-full">5 min</span>
                </div>
                <p className="text-white/40 text-[13px] leading-relaxed">5-minute onboarding: your product, ICP, stage, channels, budget, and 30-day goal. The more context you give, the more personalized every output.</p>
              </div>
            </div>
            <div className="flex gap-6 bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 hover:border-white/[0.12] transition-all">
              <div className="text-[#FF8C1A] font-black text-[40px] leading-none opacity-30 flex-shrink-0 w-12">02</div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-[16px]">Get your full GTM strategy + first week of content</h3>
                  <span className="bg-[#FF8C1A]/10 text-[#FF8C1A] text-[10px] font-bold px-2 py-0.5 rounded-full">Instant</span>
                </div>
                <p className="text-white/40 text-[13px] leading-relaxed">Instantly receive your positioning, messaging, channel priorities, and a 7-day content calendar with fully written posts, AI images, and hashtags.</p>
              </div>
            </div>
            <div className="flex gap-6 bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 hover:border-white/[0.12] transition-all">
              <div className="text-[#FF8C1A] font-black text-[40px] leading-none opacity-30 flex-shrink-0 w-12">03</div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-[16px]">Execute, approve, and iterate daily</h3>
                  <span className="bg-[#FF8C1A]/10 text-[#FF8C1A] text-[10px] font-bold px-2 py-0.5 rounded-full">Daily</span>
                </div>
                <p className="text-white/40 text-[13px] leading-relaxed">Chat with your CMO Brain daily. Approve or revise content. Track your Traction Score. Run experiments. Your CMO learns your business as you go.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PRICING MATRICES SECTION ─── */}
      <section id="pricing" className="relative z-10 px-6 md:px-12 py-20 border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#FF8C1A] text-[11px] font-bold tracking-widest uppercase mb-4">Simple pricing</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">Less than one coffee a day</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            {/* Free */}
            <div className="relative rounded-2xl p-6 border flex flex-col gap-5 bg-white/[0.03] border-white/[0.07]">
              <div>
                <p className="text-white/40 text-[12px] font-bold tracking-widest uppercase mb-2">Founder</p>
                <div className="flex items-baseline gap-1"><span className="text-[36px] font-black">Free</span><span className="text-white/30 text-[13px]">forever</span></div>
              </div>
              <ul className="space-y-2 flex-1 text-white/60 text-[13px]">
                <li><span className="text-[#FF8C1A] mr-2">✓</span>CMO Brain (50 msgs/month)</li>
                <li><span className="text-[#FF8C1A] mr-2">✓</span>7-day content plan</li>
                <li><span className="text-[#FF8C1A] mr-2">✓</span>Basic traction score</li>
              </ul>
              <Link href="/auth/signup" className="w-full py-3 rounded-xl text-[13px] font-bold text-center transition-all border border-white/10 text-white hover:border-white/20">Start free →</Link>
            </div>
            {/* Pro tier */}
            <div className="relative rounded-2xl p-6 border flex flex-col gap-5 bg-[#FF8C1A]/10 border-[#FF8C1A]/40">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FF8C1A] text-[#0D0C0B] text-[10px] font-black px-3 py-1 rounded-full tracking-widest">MOST POPULAR</div>
              <div>
                <p className="text-white/40 text-[12px] font-bold tracking-widest uppercase mb-2">Growth</p>
                <div className="flex items-baseline gap-1"><span className="text-[36px] font-black">₹2,999</span><span className="text-white/30 text-[13px]">/month</span></div>
              </div>
              <ul className="space-y-2 flex-1 text-white/60 text-[13px]">
                <li><span className="text-[#FF8C1A] mr-2">✓</span>CMO Brain (unlimited)</li>
                <li><span className="text-[#FF8C1A] mr-2">✓</span>Weekly content regeneration</li>
                <li><span className="text-[#FF8C1A] mr-2">✓</span>AI image generation</li>
              </ul>
              <Link href="/auth/signup" className="w-full py-3 rounded-xl text-[13px] font-bold text-center transition-all bg-[#FF8C1A] text-[#0D0C0B] hover:bg-[#E67300]">Start 7-day trial →</Link>
            </div>
            {/* Enterprise / Scale tier */}
            <div className="relative rounded-2xl p-6 border flex flex-col gap-5 bg-white/[0.03] border-white/[0.07]">
              <div>
                <p className="text-white/40 text-[12px] font-bold tracking-widest uppercase mb-2">Scale</p>
                <div className="flex items-baseline gap-1"><span className="text-[36px] font-black">₹7,999</span><span className="text-white/30 text-[13px]">/month</span></div>
              </div>
              <ul className="space-y-2 flex-1 text-white/60 text-[13px]">
                <li><span className="text-[#FF8C1A] mr-2">✓</span>Everything in Growth</li>
                <li><span className="text-[#FF8C1A] mr-2">✓</span>Custom brand voice</li>
              </ul>
              <Link href="/auth/signup" className="w-full py-3 rounded-xl text-[13px] font-bold text-center transition-all border border-white/10 text-white hover:border-white/20">Talk to us →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER BAR SUB-CONTAINER ─── */}
      <footer className="relative z-10 border-t border-white/[0.06] px-6 md:px-12 py-8 mt-20">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 flex items-center justify-center overflow-hidden rounded-full">
              <img src="/virtual-cmo-logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-[13px]">Virtual CMO OS</span>
            <span className="text-white/20 text-[12px] ml-2">© 2026</span>
          </div>
          <div className="flex items-center gap-6 text-[12px] text-white/30">
            <Link className="hover:text-white transition-colors" href="/auth/login">Sign in</Link>
            <Link className="hover:text-white transition-colors" href="/auth/signup">Sign up</Link>
            <span>Made for founders who ship</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
