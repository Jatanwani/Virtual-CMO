import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function HomePage() {
  // Use await here. If createClient() isn't awaited, 
  // 'supabase' becomes a Promise, and calling .auth on a Promise results in undefined.
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
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col">
      {/* Nav */}
      <nav className="px-8 py-5 flex items-center justify-between border-b border-[#EDE9E3]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#0D0C0B] rounded-lg flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L12 4.5V10L7 13L2 10V4.5L7 1Z" fill="#FF8C1A"/>
            </svg>
          </div>
          <span style={{fontFamily: 'Cabinet Grotesk, sans-serif'}} className="font-bold text-[15px] text-[#0D0C0B]">Virtual CMO OS</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="text-[13.5px] text-[#524F4A] hover:text-[#0D0C0B] transition-colors font-medium">
            Sign in
          </Link>
          <Link href="/auth/signup" className="bg-[#0D0C0B] text-white text-[13.5px] px-4 py-2 rounded-lg hover:bg-[#2C2B29] transition-colors font-medium">
            Get started free →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-[#FFF8F0] border border-[#FFD4A3] text-[#E67300] text-[12px] font-semibold px-3 py-1.5 rounded-full mb-8 uppercase tracking-wide">
          <div className="w-1.5 h-1.5 rounded-full bg-[#FF8C1A] animate-pulse" />
          AI-powered • Always on • Built for traction
        </div>
        
        <h1 style={{fontFamily: 'Cabinet Grotesk, sans-serif'}} className="text-6xl font-black text-[#0D0C0B] tracking-tight max-w-3xl leading-[1.05] mb-6">
          Your personal CMO.<br />
          <span className="text-[#FF8C1A]">Not a chatbot.</span>
        </h1>
        
        <p className="text-[17px] text-[#524F4A] max-w-xl leading-relaxed mb-10">
          Get a world-class Chief Marketing Officer in your pocket. Custom GTM strategy, daily action plans, content engine, and real-time growth coaching — all tailored to your startup.
        </p>

        <div className="flex items-center gap-3">
          <Link href="/auth/signup" className="bg-[#0D0C0B] text-white px-7 py-3.5 rounded-xl text-[15px] font-semibold hover:bg-[#1A1714] transition-all hover:shadow-lg">
            Start building traction →
          </Link>
          <Link href="/auth/login" className="text-[#524F4A] px-5 py-3.5 text-[15px] font-medium hover:text-[#0D0C0B] transition-colors">
            Already have an account
          </Link>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-2 justify-center mt-14">
          {['GTM Strategy', 'Content Calendar', 'Growth Experiments', 'DM Scripts', 'CMO Chat', 'Traction Score', 'Competitor Analysis', 'Lead Generation'].map(f => (
            <span key={f} className="bg-white border border-[#EDE9E3] text-[#524F4A] text-[12.5px] px-3 py-1.5 rounded-full">
              {f}
            </span>
          ))}
        </div>
      </main>
    </div>
  )
}