'use client'
import { useState, useEffect } from 'react'

interface LandingPage {
  id: string
  title: string
  slug: string
  html_content: string
  published: boolean
  created_at: string
}

export function LandingBuilder() {
  const [pages, setPages] = useState<LandingPage[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [previewHtml, setPreviewHtml] = useState('')
  const [previewPage, setPreviewPage] = useState<LandingPage | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPages()
  }, [])

  const fetchPages = async () => {
    setLoading(true)
    const res = await fetch('/api/landing')
    const data = await res.json()
    setPages(data.pages || [])
    setLoading(false)
  }

  const generatePage = async () => {
    setGenerating(true)
    setError('')
    try {
      const res = await fetch('/api/landing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setPreviewHtml(data.html)
      fetchPages()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  const copyHTML = (html: string) => {
    navigator.clipboard.writeText(html)
    alert('HTML copied to clipboard!')
  }

  const downloadHTML = (page: LandingPage) => {
    const blob = new Blob([page.html_content], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${page.slug}.html`
    a.click()
  }

  return (
    <div className="space-y-6">
      {/* Generator form */}
      <div className="bg-white border border-[#EDE9E3] rounded-2xl p-6">
        <h3 className="font-bold text-[#0D0C0B] mb-1">Generate Landing Page</h3>
        <p className="text-[13px] text-[#7A7670] mb-4">AI builds a complete, professional landing page for your startup</p>

        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-semibold text-[#524F4A] uppercase tracking-wide mb-1.5">Page Title / Product Name</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. TalentFlow — AI-Powered HR Onboarding"
              className="w-full px-4 py-3 border border-[#EDE9E3] rounded-xl text-[14px] focus:outline-none focus:border-[#0D0C0B] bg-[#FAFAF8]"
            />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-[#524F4A] uppercase tracking-wide mb-1.5">What problem does it solve?</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. HR teams waste 40+ hours per new hire on manual onboarding tasks..."
              className="w-full px-4 py-3 border border-[#EDE9E3] rounded-xl text-[14px] focus:outline-none focus:border-[#0D0C0B] bg-[#FAFAF8] resize-none"
              rows={3}
            />
          </div>

          {error && <p className="text-red-500 text-[13px]">⚠ {error}</p>}

          <button
            onClick={generatePage}
            disabled={generating || (!title && !description)}
            className="w-full bg-[#0D0C0B] text-white py-3 rounded-xl text-[14px] font-semibold hover:bg-[#1A1714] disabled:opacity-50 transition-colors"
          >
            {generating ? '✦ Building your landing page...' : '✦ Generate Landing Page'}
          </button>
        </div>
      </div>

      {/* Live preview */}
      {previewHtml && (
        <div className="bg-white border border-[#EDE9E3] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-[#EDE9E3]">
            <h3 className="font-bold text-[#0D0C0B]">Preview</h3>
            <div className="flex gap-2">
              <button
                onClick={() => copyHTML(previewHtml)}
                className="px-4 py-2 border border-[#EDE9E3] rounded-lg text-[12px] font-medium hover:border-[#0D0C0B] transition-colors"
              >
                Copy HTML
              </button>
            </div>
          </div>
          <iframe
            srcDoc={previewHtml}
            className="w-full h-[600px] border-0"
            title="Landing page preview"
          />
        </div>
      )}

      {/* Saved pages */}
      {pages.length > 0 && (
        <div>
          <h3 className="font-bold text-[#0D0C0B] mb-3">Your Landing Pages ({pages.length})</h3>
          <div className="space-y-3">
            {pages.map(page => (
              <div key={page.id} className="bg-white border border-[#EDE9E3] rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-[#0D0C0B] text-[14px]">{page.title}</p>
                  <p className="text-[12px] text-[#A39E96] mt-0.5">{new Date(page.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPreviewHtml(page.html_content)}
                    className="px-3 py-1.5 border border-[#EDE9E3] rounded-lg text-[12px] hover:border-[#0D0C0B] transition-colors"
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => downloadHTML(page)}
                    className="px-3 py-1.5 bg-[#0D0C0B] text-white rounded-lg text-[12px] hover:bg-[#1A1714] transition-colors"
                  >
                    ↓ Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
