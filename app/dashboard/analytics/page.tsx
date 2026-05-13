import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard'

export default function AnalyticsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#0D0C0B]">Analytics</h1>
        <p className="text-[#7A7670] text-[14px] mt-1">Track your content performance and growth metrics</p>
      </div>
      <AnalyticsDashboard />
    </div>
  )
}
