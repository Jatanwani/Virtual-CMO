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
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col font-sans select-none antialiased">
      {/* Navigation Bar */}
      <nav className="px-8 py-5 flex items-center justify-between border-b border-[#EDE9E3] bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          {/* Logo container utilizing your new image asset */}
          <div className="w-8 h-8 flex items-center justify-center overflow-hidden rounded-full">
            <img 
              src="/virtual-cmo-logo.png" 
              alt="Virtual CMO OS" 
              className="w-full h-full object-cover block"
            />
          </div>
          <span className="font-bold text-[16px] text-[#0D0C0B] tracking-tight">
            Virtual CMO OS
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <Link href="/auth/login" className="text-[13.5px] text-[#524F4A] hover:text-[#0D0C0B] transition-colors font-medium">
            Sign in
          </Link>
          <Link href="/auth/signup" className="bg-[#0D0C0B] text-white text-[13.5px] px-4 py-2 rounded-lg hover:bg-[#2C2B29] transition-all duration-200 font-medium active:scale-95 shadow-sm">
            Get started free →
          </Link>
        </div>
      </nav>

      {/* Hero Section Container */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center max-w-5xl mx-auto w-full">
        {/* Decorative Badge */}
        <div className="inline-flex items-center gap-2 bg-[#FFF8F0] border border-[#FFD4A3] text-[#E67300] text-[11px] md:text-[12px] font-semibold px-3 py-1.5 rounded-full mb-8 uppercase tracking-wider">
          <div className="w-1.5 h-1.5 rounded-full bg-[#FF8C1A] animate-pulse" />
          AI-powered • Always on • Built for traction
        </div>
        
        {/* Main Pitch Heading */}
        <h1 className="text-5xl md:text-7xl font-black text-[#0D0C0B] tracking-tight max-w-4xl leading-[1.05] mb-6">
          Your personal CMO.<br />
          <span className="text-[#FF8C1A]">Not a chatbot.</span>
        </h1>
        
        {/* Supporting Context Text */}
        <p className="text-[16px] md:text-[18px] text-[#524F4A] max-w-2xl leading-relaxed mb-10 font-normal">
          Get a world-class Chief Marketing Officer in your pocket. Custom GTM strategy, daily action plans, content engine, and real-time growth coaching — all tailored to your startup.
        </p>

        {/* Primary Interaction Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
          <Link href="/auth/signup" className="bg-[#0D0C0B] text-white px-8 py-4 rounded-xl text-[15px] font-semibold hover:bg-[#1A1714] transition-all duration-200 hover:shadow-xl active:scale-98 w-full sm:w-auto">
            Start building traction →
          </Link>
          <Link href="/auth/login" className="text-[#524F4A] px-5 py-4 text-[15px] font-medium hover:text-[#0D0C0B] transition-colors w-full sm:w-auto">
            Already have an account
          </Link>
        </div>

        {/* Feature Pill Matrix */}
        <div className="flex flex-wrap gap-2.5 justify-center max-w-3xl">
          {[
            'GTM Strategy', 
            'Content Calendar', 
            'Growth Experiments', 
            'DM Scripts', 
            'CMO Chat', 
            'Traction Score', 
            'Competitor Analysis', 
            'Lead Generation'
          ].map(feature => (
            <span key={feature} className="bg-white border border-[#EDE9E3] text-[#524F4A] text-[13px] font-medium px-4 py-2 rounded-full shadow-sm hover:border-[#FFD4A3] hover:text-[#0D0C0B] transition-all cursor-default">
              {feature}
            </span>
          ))}
        </div>
      </main>
    </div>
  )
}
