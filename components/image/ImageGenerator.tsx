'use client'
import { useState } from 'react'

const PLATFORMS = [
  { id: 'linkedin', label: 'LinkedIn', size: '1200×627' },
  { id: 'instagram', label: 'Instagram', size: '1080×1080' },
  { id: 'twitter', label: 'Twitter/X', size: '1600×900' },
  { id: 'facebook', label: 'Facebook', size: '1200×630' },
]

interface Props {
  contentItemId?: string
  initialPrompt?: string
  onGenerated?: (url: string) => void
}

export function ImageGenerator({ contentItemId, initialPrompt = '', onGenerated }: Props) {
  const [prompt, setPrompt] = useState(initialPrompt)
  const [platform, setPlatform] = useState('linkedin')
  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [error, setError] = useState('')

  const generate = async () => {
    if (!prompt.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, platform, content_item_id: contentItemId }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setImageUrl(data.image_url)
      onGenerated?.(data.image_url)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-[12px] font-semibold text-[#524F4A] uppercase tracking-wide mb-2">Platform</label>
        <div className="grid grid-cols-4 gap-2">
          {PLATFORMS.map(p => (
            <button
              key={p.id}
              onClick={() => setPlatform(p.id)}
              className={`py-2 px-3 rounded-lg text-[12px] font-medium border transition-all ${
                platform === p.id
                  ? 'bg-[#0D0C0B] text-white border-[#0D0C0B]'
                  : 'bg-white text-[#524F4A] border-[#EDE9E3] hover:border-[#0D0C0B]'
              }`}
            >
              <div>{p.label}</div>
              <div className="text-[10px] opacity-60">{p.size}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-[12px] font-semibold text-[#524F4A] uppercase tracking-wide mb-2">Image Description</label>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="e.g. Professional founder working on laptop in modern office, clean minimalist style..."
          className="w-full px-4 py-3 border border-[#EDE9E3] rounded-xl text-[14px] text-[#0D0C0B] placeholder:text-[#C9C4BC] focus:outline-none focus:border-[#0D0C0B] bg-white resize-none"
          rows={3}
        />
      </div>

      {error && <p className="text-red-500 text-[13px]">⚠ {error}</p>}

      <button
        onClick={generate}
        disabled={loading || !prompt.trim()}
        className="w-full bg-[#FF8C1A] text-white py-3 rounded-xl text-[14px] font-semibold hover:bg-[#E67300] transition-colors disabled:opacity-50"
      >
        {loading ? '✦ Generating image...' : '✦ Generate Image (Free)'}
      </button>

      {loading && (
        <div className="bg-[#FFF8F0] border border-[#FFD4A3] rounded-xl p-4 text-center">
          <div className="animate-spin text-2xl mb-2">⟳</div>
          <p className="text-[13px] text-[#E67300]">Creating your marketing graphic...</p>
          <p className="text-[12px] text-[#A39E96] mt-1">This takes 10-20 seconds</p>
        </div>
      )}

      {imageUrl && !loading && (
        <div className="space-y-3">
          <img
            src={imageUrl}
            alt="Generated marketing image"
            className="w-full rounded-xl border border-[#EDE9E3] shadow-sm"
          />
          <div className="flex gap-2">
            <a
              href={imageUrl}
              download="marketing-image.jpg"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-[#0D0C0B] text-white py-2.5 rounded-lg text-[13px] font-medium text-center hover:bg-[#1A1714] transition-colors"
            >
              ↓ Download
            </a>
            <button
              onClick={generate}
              className="flex-1 border border-[#EDE9E3] text-[#524F4A] py-2.5 rounded-lg text-[13px] font-medium hover:border-[#0D0C0B] transition-colors"
            >
              ↺ Regenerate
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
