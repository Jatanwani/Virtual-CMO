import { LandingBuilder } from '@/components/landing/LandingBuilder'

export default function LandingPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#0D0C0B]">Landing Page Builder</h1>
        <p className="text-[#7A7670] text-[14px] mt-1">Generate and download professional landing pages for your startup</p>
      </div>
      <LandingBuilder />
    </div>
  )
}
