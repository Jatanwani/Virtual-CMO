import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase
      .from('profiles').select('onboarded').eq('id', user.id).single()
    if (profile?.onboarded) redirect('/dashboard')
    else redirect('/onboarding')
  }

  return (
    <div className="min-h-screen bg-[#0D0C0B] text-white overflow-x-hidden">

      {/* ── Grain overlay ─────────────────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.035]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundRepeat: 'repeat', backgroundSize: '128px' }}
      />

      {/* ── NAV ──────────────────────────────────────────────────── */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#FF8C1A] rounded-lg flex items-center justify-center shadow-[0_0_20px_#FF8C1A55]">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L12 4.5V10L7 13L2 10V4.5L7 1Z" fill="#0D0C0B"/>
            </svg>
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
          <Link href="/auth/signup"
            className="bg-[#FF8C1A] hover:bg-[#E67300] text-[#0D0C0B] text-[13px] font-bold px-4 py-2 rounded-lg transition-all hover:shadow-[0_0_20px_#FF8C1A55]">
            Get started free →
          </Link>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative z-10 px-6 md:px-12 pt-24 pb-20 text-center max-w-5xl mx-auto">
        {/* Glow */}
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
          Virtual CMO OS gives every founder a personal Chief Marketing Officer —
          custom strategy, daily content, growth experiments, and real coaching.
          Tailored to your exact product, ICP, and stage.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
          <Link href="/auth/signup"
            className="bg-[#FF8C1A] hover:bg-[#E67300] text-[#0D0C0B] px-8 py-4 rounded-xl text-[15px] font-black transition-all hover:shadow-[0_0_40px_#FF8C1A40] w-full sm:w-auto text-center">
            Start free — no credit card →
          </Link>
          <Link href="/auth/login"
            className="border border-white/10 hover:border-white/20 text-white/60 hover:text-white px-8 py-4 rounded-xl text-[15px] font-medium transition-all w-full sm:w-auto text-center">
            I have an account
          </Link>
        </div>

        {/* Social proof bar */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[12px] text-white/30 font-medium">
          {['500+ founders using it', '7-day content in 60 seconds', 'Works with $0 budget', '6 AI providers for reliability'].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-[#FF8C1A]/60" />
              {s}
            </div>
          ))}
        </div>
      </section>

      {/* ── DASHBOARD PREVIEW ────────────────────────────────────── */}
      <section className="relative z-10 px-6 md:px-12 pb-24 max-w-5xl mx-auto">
        <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
          {/* Fake browser chrome */}
          <div className="bg-[#1A1714] px-4 py-3 flex items-center gap-2 border-b border-white/[0.06]">
            <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
            <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
            <div className="w-3 h-3 rounded-full bg-[#28C840]" />
            <div className="flex-1 mx-4 bg-white/5 rounded-md px-3 py-1 text-[11px] text-white/30">
              app.virtualcmo.io/dashboard
            </div>
          </div>
          {/* Dashboard mockup */}
          <div className="bg-[#FDFCFA] flex" style={{ minHeight: 340 }}>
            {/* Sidebar */}
            <div className="w-52 bg-[#0D0C0B] p-4 flex flex-col gap-1 flex-shrink-0">
              <div className="flex items-center gap-2 mb-6 mt-1">
                <div className="w-7 h-7 bg-[#FF8C1A] rounded-lg flex items-center justify-center">
                  <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M7 1L12 4.5V10L7 13L2 10V4.5L7 1Z" fill="#0D0C0B"/></svg>
                </div>
                <div>
                  <div className="text-white text-[11px] font-bold">Virtual CMO</div>
                  <div className="text-white/30 text-[9px]">Growth Brain</div>
                </div>
              </div>
              {['Dashboard', 'CMO Brain', 'Content Engine', 'Experiments', 'Results', 'Settings'].map((item, i) => (
                <div key={item} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-medium ${i === 1 ? 'bg-[#FF8C1A] text-[#0D0C0B]' : 'text-white/40'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${i === 1 ? 'bg-[#0D0C0B]' : 'bg-white/20'}`} />
                  {item}
                </div>
              ))}
              <div className="mt-auto bg-[#1A1714] rounded-xl p-3">
                <div className="text-[9px] text-[#FF8C1A] font-bold mb-1">TRACTION SCORE</div>
                <div className="text-white text-[18px] font-black">42<span className="text-white/30 text-[11px]">/100</span></div>
                <div className="w-full bg-white/10 rounded-full h-1.5 mt-1.5">
                  <div className="bg-[#FF8C1A] h-1.5 rounded-full" style={{ width: '42%' }} />
                </div>
              </div>
            </div>
            {/* Main area — CMO Brain chat */}
            <div className="flex-1 flex flex-col p-5 gap-3 overflow-hidden">
              <div className="text-[#0D0C0B] font-bold text-[13px]">CMO Brain <span className="text-[10px] text-[#A39E96] font-normal ml-1">AI strategy advisor</span></div>
              {[
                { role: 'user', text: 'Create a 30-day marketing plan for my SaaS targeting SMBs' },
                { role: 'ai', text: "Here's your personalized 30-day GTM plan for SMB SaaS:\n\n**Week 1 — Nail the Message**\n• Rewrite your homepage headline around the #1 SMB pain\n• Launch 3 cold outreach sequences targeting ops managers\n• Post daily on LinkedIn about SMB productivity wins" },
              ].map((m, i) => (
                <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[9px] font-bold ${m.role === 'ai' ? 'bg-[#0D0C0B] text-[#FF8C1A]' : 'bg-[#FF8C1A] text-white'}`}>
                    {m.role === 'ai' ? 'C' : 'F'}
                  </div>
                  <div className={`text-[10px] leading-relaxed rounded-xl px-3 py-2 max-w-[80%] ${m.role === 'ai' ? 'bg-white border border-[#EDE9E3] text-[#0D0C0B]' : 'bg-[#0D0C0B] text-white'}`}>
                    {m.text.split('\n').map((line, j) => (
                      <div key={j} className={line.startsWith('**') ? 'font-bold' : ''}>
                        {line.replace(/\*\*/g, '')}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {/* Generate content button */}
              <div className="mt-1">
                <div className="inline-flex items-center gap-2 bg-[#FF8C1A] text-[#0D0C0B] text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer">
                  ✦ Generate 7-Day Content Plan
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROBLEM ──────────────────────────────────────────────── */}
      <section className="relative z-10 px-6 md:px-12 py-20 border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[#FF8C1A] text-[11px] font-bold tracking-widest uppercase mb-4">The Problem</p>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-6">
            Founders are great at building.<br />
            <span className="text-white/30">Marketing kills them.</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
            {[
              { icon: '💸', title: 'Agencies cost ₹2–5L/month', body: 'For a slide deck and a generic social media plan you could have GPT-4 write.' },
              { icon: '⏱️', title: 'No time to learn marketing', body: 'You\'re shipping, hiring, and selling. A 6-week marketing course isn\'t happening.' },
              { icon: '🎯', title: 'Generic advice doesn\'t convert', body: '"Post on LinkedIn daily" means nothing without knowing your ICP, hook, and offer.' },
            ].map(p => (
              <div key={p.title} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 text-left">
                <div className="text-3xl mb-4">{p.icon}</div>
                <h3 className="font-bold text-[15px] mb-2">{p.title}</h3>
                <p className="text-white/40 text-[13px] leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────── */}
      <section id="features" className="relative z-10 px-6 md:px-12 py-20 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#FF8C1A] text-[11px] font-bold tracking-widest uppercase mb-4">Everything you need</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">One OS. Every growth lever.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                tag: 'AI', icon: '🧠', title: 'CMO Brain — Your personal strategist',
                body: 'Ask anything. Get specific answers tailored to your product, ICP, and stage. Not "post on LinkedIn" — the exact hook, format, and schedule for YOUR audience.',
                highlight: true,
              },
              {
                tag: 'CONTENT', icon: '📅', title: 'Content Engine — 7 days in 60 seconds',
                body: 'Generates a full week of posts: AI image, headline, body copy, hashtags. One click to approve or revise. Covers LinkedIn, Twitter/X, and Instagram.',
              },
              {
                tag: 'GROWTH', icon: '🧪', title: 'Experiments — Test what works',
                body: 'Structured A/B experiments with hypothesis, success metrics, and results tracking. Your CMO reviews and suggests the next test.',
              },
              {
                tag: 'RESULTS', icon: '📊', title: 'Traction Score — Track real progress',
                body: 'A single 0–100 score that measures your actual traction across channels, content, and experiments. Goes up when you do the work.',
              },
              {
                tag: 'TASKS', icon: '✅', title: 'Daily task engine — Know exactly what to do',
                body: 'AI-generated daily priorities based on your goal and stage. Not a generic to-do list — actions ranked by leverage and tied to your 30-day target.',
              },
              {
                tag: 'STRATEGY', icon: '🗺️', title: 'GTM Strategy — Built on your context',
                body: 'Full go-to-market strategy generated from your onboarding. Positioning, channels, ICP, messaging hierarchy, and 90-day roadmap.',
              },
            ].map(f => (
              <div key={f.title}
                className={`relative rounded-2xl p-6 border transition-all ${f.highlight
                  ? 'bg-[#FF8C1A]/10 border-[#FF8C1A]/30 hover:border-[#FF8C1A]/50'
                  : 'bg-white/[0.03] border-white/[0.07] hover:border-white/[0.15]'}`}>
                <div className="flex items-start gap-4">
                  <div className="text-3xl flex-shrink-0">{f.icon}</div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold tracking-widest ${f.highlight ? 'text-[#FF8C1A]' : 'text-white/30'}`}>{f.tag}</span>
                    </div>
                    <h3 className="font-bold text-[15px] mb-2">{f.title}</h3>
                    <p className="text-white/40 text-[13px] leading-relaxed">{f.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <section id="how" className="relative z-10 px-6 md:px-12 py-20 border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#FF8C1A] text-[11px] font-bold tracking-widest uppercase mb-4">How it works</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">From zero to traction in 3 steps</h2>
          </div>
          <div className="space-y-4">
            {[
              {
                step: '01',
                title: 'Tell your CMO about your startup',
                body: '5-minute onboarding: your product, ICP, stage, channels, budget, and 30-day goal. The more context you give, the more personalized every output.',
                time: '5 min',
              },
              {
                step: '02',
                title: 'Get your full GTM strategy + first week of content',
                body: 'Instantly receive your positioning, messaging, channel priorities, and a 7-day content calendar with fully written posts, AI images, and hashtags.',
                time: 'Instant',
              },
              {
                step: '03',
                title: 'Execute, approve, and iterate daily',
                body: 'Chat with your CMO Brain daily. Approve or revise content. Track your Traction Score. Run experiments. Your CMO learns your business as you go.',
                time: 'Daily',
              },
            ].map((s, i) => (
              <div key={s.step} className="flex gap-6 bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 hover:border-white/[0.12] transition-all">
                <div className="text-[#FF8C1A] font-black text-[40px] leading-none opacity-30 flex-shrink-0 w-12">{s.step}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-[16px]">{s.title}</h3>
                    <span className="bg-[#FF8C1A]/10 text-[#FF8C1A] text-[10px] font-bold px-2 py-0.5 rounded-full">{s.time}</span>
                  </div>
                  <p className="text-white/40 text-[13px] leading-relaxed">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ─────────────────────────────────────────── */}
      <section className="relative z-10 px-6 md:px-12 py-20 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-white/20 text-[12px] font-bold tracking-widest uppercase mb-12">What founders say</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                quote: 'I got my first 3 B2B customers in 2 weeks using the outreach scripts my CMO generated. Generic advice never worked — this was surgical.',
                name: 'Arjun S.', role: 'SaaS founder, Pune', score: '→ 0 to ₹1.2L MRR',
              },
              {
                quote: 'The content engine alone saves me 6 hours a week. Each post is actually tailored to my manufacturing ICP, not copy-paste LinkedIn fluff.',
                name: 'Priya K.', role: 'B2B marketplace founder', score: '→ 3x LinkedIn reach',
              },
              {
                quote: 'My traction score went from 12 to 67 in 6 weeks. Having daily prioritized tasks from something that actually knows my business changed everything.',
                name: 'Rohit M.', role: 'EdTech founder, Bangalore', score: '→ 500 signups in 45 days',
              },
            ].map(t => (
              <div key={t.name} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 flex flex-col gap-4">
                <p className="text-white/60 text-[13px] leading-relaxed">"{t.quote}"</p>
                <div className="mt-auto">
                  <div className="font-bold text-[13px]">{t.name}</div>
                  <div className="text-white/30 text-[11px]">{t.role}</div>
                  <div className="text-[#FF8C1A] text-[11px] font-bold mt-2">{t.score}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────── */}
      <section id="pricing" className="relative z-10 px-6 md:px-12 py-20 border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#FF8C1A] text-[11px] font-bold tracking-widest uppercase mb-4">Simple pricing</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">Less than one coffee a day</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                plan: 'Founder', price: 'Free', period: 'forever',
                features: ['CMO Brain (50 msgs/month)', '7-day content plan', 'Basic traction score', 'GTM strategy (1-time)', '3 experiments/month'],
                cta: 'Start free', href: '/auth/signup', highlight: false,
              },
              {
                plan: 'Growth', price: '₹2,999', period: '/month',
                features: ['CMO Brain (unlimited)', 'Weekly content regeneration', 'AI image generation', 'Unlimited experiments', 'Advanced traction analytics', 'Priority AI (Claude + GPT-4o)'],
                cta: 'Start 7-day trial', href: '/auth/signup', highlight: true,
              },
              {
                plan: 'Scale', price: '₹7,999', period: '/month',
                features: ['Everything in Growth', 'Team members (5 seats)', 'Custom brand voice', 'Competitor monitoring', 'Monthly 1:1 strategy review', 'WhatsApp daily briefing'],
                cta: 'Talk to us', href: '/auth/signup', highlight: false,
              },
            ].map(p => (
              <div key={p.plan}
                className={`relative rounded-2xl p-6 border flex flex-col gap-5 ${p.highlight
                  ? 'bg-[#FF8C1A]/10 border-[#FF8C1A]/40'
                  : 'bg-white/[0.03] border-white/[0.07]'}`}>
                {p.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FF8C1A] text-[#0D0C0B] text-[10px] font-black px-3 py-1 rounded-full tracking-widest">
                    MOST POPULAR
                  </div>
                )}
                <div>
                  <p className="text-white/40 text-[12px] font-bold tracking-widest uppercase mb-2">{p.plan}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[36px] font-black">{p.price}</span>
                    <span className="text-white/30 text-[13px]">{p.period}</span>
                  </div>
                </div>
                <ul className="space-y-2 flex-1">
                  {p.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-[13px] text-white/60">
                      <span className="text-[#FF8C1A] flex-shrink-0 mt-0.5">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={p.href}
                  className={`w-full py-3 rounded-xl text-[13px] font-bold text-center transition-all ${p.highlight
                    ? 'bg-[#FF8C1A] text-[#0D0C0B] hover:bg-[#E67300]'
                    : 'border border-white/10 text-white hover:border-white/20'}`}>
                  {p.cta} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section className="relative z-10 px-6 md:px-12 py-20 border-t border-white/[0.06]">
        <div className="max-w-2xl mx-auto">
          <p className="text-center text-[#FF8C1A] text-[11px] font-bold tracking-widest uppercase mb-12">FAQ</p>
          <div className="space-y-4">
            {[
              { q: 'Is this just ChatGPT with a different UI?', a: 'No. Virtual CMO OS uses a multi-provider AI system (Claude, GPT-4o, Llama, Gemini) but the intelligence is in the context layer — it knows your product, ICP, stage, and goals. That\'s why every output is actionable, not generic.' },
              { q: 'Do I need a big marketing budget?', a: 'No. Many features are designed for $0 budget — organic content, cold outreach, community, and SEO. The system adapts its strategy to your actual budget.' },
              { q: 'What industries does it support?', a: 'SaaS, D2C, B2B services, marketplaces, edtech, healthtech, fintech, manufacturing — any startup that needs customers. The ICP-first approach means it works regardless of niche.' },
              { q: 'How is content different from other AI writers?', a: 'It writes from your founder\'s POV, tailored to your specific ICP\'s pain points, using your product\'s unique angle. Not templates — actual posts ready to publish.' },
            ].map(faq => (
              <div key={faq.q} className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-5">
                <h3 className="font-bold text-[14px] mb-2">{faq.q}</h3>
                <p className="text-white/40 text-[13px] leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────── */}
      <section className="relative z-10 px-6 md:px-12 py-20 border-t border-white/[0.06]">
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="absolute inset-0 bg-[#FF8C1A] opacity-[0.06] blur-[80px] rounded-full pointer-events-none" />
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
            Your competitors are<br />
            <span className="text-[#FF8C1A]">already using AI.</span>
          </h2>
          <p className="text-white/40 text-[16px] mb-8 max-w-xl mx-auto">
            Start free today. No credit card. No agency retainer. Just a CMO that knows your startup and never stops working.
          </p>
          <Link href="/auth/signup"
            className="inline-block bg-[#FF8C1A] hover:bg-[#E67300] text-[#0D0C0B] px-10 py-4 rounded-xl text-[16px] font-black transition-all hover:shadow-[0_0_60px_#FF8C1A40]">
            Get your Virtual CMO free →
          </Link>
          <p className="text-white/20 text-[12px] mt-4">Setup takes 5 minutes. First strategy in 60 seconds.</p>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/[0.06] px-6 md:px-12 py-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#FF8C1A] rounded-md flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 14 14" fill="none"><path d="M7 1L12 4.5V10L7 13L2 10V4.5L7 1Z" fill="#0D0C0B"/></svg>
            </div>
            <span className="font-bold text-[13px]">Virtual CMO OS</span>
            <span className="text-white/20 text-[12px] ml-2">© 2026</span>
          </div>
          <div className="flex items-center gap-6 text-[12px] text-white/30">
            <Link href="/auth/login" className="hover:text-white transition-colors">Sign in</Link>
            <Link href="/auth/signup" className="hover:text-white transition-colors">Sign up</Link>
            <span>Made for founders who ship</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
