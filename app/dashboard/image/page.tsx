import { createClient } from '@/lib/supabase/server'
import { ImageGenerator } from '@/components/image/ImageGenerator'

export default async function ImagePage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#0D0C0B]">Image Generator</h1>
        <p className="text-[#7A7670] text-[14px] mt-1">Generate professional marketing creatives for free using AI</p>
      </div>
      <div className="bg-white border border-[#EDE9E3] rounded-2xl p-6">
        <ImageGenerator />
      </div>
    </div>
  )
}
