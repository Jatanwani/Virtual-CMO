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
    <div 
      className="min-h-screen flex flex-col antialiased" 
      style={{ backgroundColor: '#FAFAF8', color: '#0D0C0B' }}
    >
      {/* ─── STICKY HEADER / NAVIGATION ─── */}
      <nav 
        className="px-8 py-5 flex items-center justify-between" 
        style={{ borderBottom: '1px solid #EDE9E3', backgroundColor: '#FAFAF8' }}
      >
        <div className="flex items-center gap-2">
          {/* Circular Custom Image Logo Asset Wrapper */}
          <div className="w-[28px] h-[28px] flex items-center justify-center overflow-hidden rounded-full">
            <img 
              src="/virtual-cmo-logo.png" 
              alt="Virtual CMO OS" 
              className="w-full h-full object-cover block"
            />
          </div>
          <span 
            className="font-bold text-[15px]" 
            style={{ fontFamily: 'Cabinet Grotesk, Satoshi, sans-serif', trackingTight: '-0.025em', color: '#0D0C0B' }}
          >
            Virtual CMO OS
          </span>
        </div>
        
        <div className="flex items-center gap-6">
          <Link 
            href="/auth/login" 
            className="text-[13.5px] transition-colors font-medium"
            style={{ color: '#524F4A' }}
          >
            Sign in
          </Link>
          <Link 
            href="/auth/signup" 
            className="text-[13.5px] px-4 py-2 rounded-lg transition-colors font-medium text-white"
            style={{ backgroundColor: '#0D0C0B' }}
          >
            Get started free →
          </Link>
        </div>
      </nav>

      {/* ─── HERO BODY ACCELERATION CONTAINER ─── */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        {/* Upper Micro-Badge Capsule */}
        <div 
          className="inline-flex items-center gap-2 text-[12px] font-semibold px-3 py-1.5 rounded-full mb-8 uppercase tracking-wide"
          style={{ backgroundColor: '#FFF8F0', border: '1px solid #FFD4A3', color: '#E67300' }}
        >
          <div 
            className="w-1.5 h-1.5 rounded-full animate-pulse" 
            style={{ backgroundColor: '#FF8C1A' }}
          />
          AI-powered • Always on • Built for traction
        </div>
        
        {/* Main Heading Text Copy */}
        <h1 
          className="text-6xl font-black tracking-tight max-w-3xl leading-[1.05] mb-6"
          style={{ fontFamily: 'Cabinet Grotesk, Satoshi, sans-serif', color: '#0D0C0B' }}
        >
          Your personal CMO.<br />
          <span style={{ color: '#FF8C1A' }}>Not a chatbot.</span>
        </h1>
        
        {/* Subtitle Description */}
        <p 
          className="text-[17px] max-w-xl leading-relaxed mb-10 font-normal"
          style={{ color: '#524F4A' }}
        >
          Get a world-class Chief Marketing Officer in your pocket. Custom GTM strategy, daily action plans, content engine, and real-time growth coaching — all tailored to your startup.
        </p>

        {/* Dynamic Buttons */}
        <div className="flex items-center gap-3">
          <Link 
            href="/auth/signup" 
            className="text-white px-7 py-3.5 rounded-xl text-[15px] font-semibold transition-all hover:shadow-lg"
            style={{ backgroundColor: '#0D0C0B' }}
          >
            Start building traction →
          </Link>
          <Link 
            href="/auth/login" 
            className="px-5 py-3.5 text-[15px] font-medium transition-colors"
            style={{ color: '#524F4A' }}
          >
            Already have an account
          </Link>
        </div>

        {/* Feature Pill Grid Matrix */}
        <div className="flex flex-wrap gap-2 justify-center mt-14 max-w-2xl">
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
            <span 
              key={feature} 
              className="text-[12.5px] px-3 py-1.5 rounded-full font-medium shadow-none select-none"
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDE9E3', color: '#524F4A' }}
            >
              {feature}
            </span>
          ))}
        </div>
      </main>
    </div>
  )
}
