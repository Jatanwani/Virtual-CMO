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
      {/* Structural Grain Overlay Background effect */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.035]" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px'
        }}
      />

      {/* ─── NAVIGATION BAR ─── */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          {/* Linked Target Custom Logo Image Asset Replacement */}
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
          <a href="#how" class="hover:text-white transition-colors">How it works</a>
          <a href="#pricing" class="hover:text-white transition-colors">Pricing</a>
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

      {/* ─── HERO INTRO SECTION ─── */}
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
          <div className="flex items-center gap-2"><div class="w-1 h-1 rounded-full bg-[#FF8C1A]/60"></div>500+ founders using it</div>
          <div className="flex items-center gap-2"><div class="w-1 h-1 rounded-full bg-[#FF8C1A]/60"></div>7-day content in 60 seconds</div>
          <div className="flex items-center gap-2"><div class="w-1 h-1 rounded-full bg-[#FF8C1A]/60"></div>Works with $0 budget</div>
          <div className="flex items-center gap-2"><div class="w-1 h-1 rounded-full bg-[#FF8C1A]/60"></div>6 AI providers for reliability</div>
        </div>
      </section>

      {/* ─── LIVE APP PREVIEW INTERFACE GRAPHIC ─── */}
      <section className="relative z-10 px-6 md:px-12 pb-24 max-w-5xl mx-auto">
        <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
          <div className="bg-[#1A1714] px-4 py-3 flex items-center gap-2 border-b border-white/[0.06]">
            <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
            <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
            <div className="w-3 h-3 rounded-full bg-[#28C840]" />
            <div className="flex-1 mx-4 bg-white/5 rounded-md px-3 py-1 text-[11px] text-white/30 text-left">app.virtualcmo.io/dashboard</div>
          </div>
          <div className="bg-[#FDFCFA] flex flex-col md:flex-row min-height-[340px]">
            {/* Embedded Mini Sidebar */}
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
                <div className="text-white text-[18px] font-black">42<span class="text-white/30 text-[11px]">/100</span></div>
                <div className="w-full bg-white/10 rounded-full h-1.5 mt-1.5">
                  <div className="bg-[#FF8C1A] h-1.5 rounded-full" style={{ width: '42%' }} />
                </div>
              </div>
            </div>
            {/* Dashboard Workspace Mock */}
            <div className="flex-1 flex flex-col p-5 gap-3 text-left overflow-hidden">
              <div className="text-[#0D0C0B] font-bold text-[13px]">CMO Brain <span class="text-[10px] text-[#A39E96] font-normal ml-1">AI strategy advisor</span></div>
              <div className="flex gap-2 flex-row-reverse">
                <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[9px] font-bold bg-[#FF8C1A] text-white">F</div>
                <div className="text-[10px] leading-relaxed rounded-xl px-3 py-2 max-w-[80%] bg-[#0D0C0B] text-white">
                  <div>Create a 30-day marketing plan for my SaaS targeting SMBs</div>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="w-6 h-6
