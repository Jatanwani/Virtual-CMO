import { ContentScheduler } from '@/components/schedule/ContentScheduler'

export default function SchedulePage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#0D0C0B]">Content Scheduler</h1>
        <p className="text-[#7A7670] text-[14px] mt-1">Schedule and queue your content for publishing</p>
      </div>
      <ContentScheduler />
    </div>
  )
}
