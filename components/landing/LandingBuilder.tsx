'use client'

import { useState, useEffect, useRef } from 'react'
import { Download, Copy, RefreshCw, Plus, Eye } from 'lucide-react'

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
  const [error, setError] = useState('')
  const [quotaMessage, setQuotaMessage] = useState('')
  const [copied, setCopied] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    fetchPages()
  }, [])

  const fetchPages = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/landing')
      const data = await res.json()
      setPages(data.pages || [])
    } finally {
      setLoading(false)
    }
  }

  const generatePage = async () => {
    if (!title.trim() && !description.trim()) {
      setError('Please enter a product name or description')
      return
    }
    setGenerating(true)
    setError('')
    setQuotaMessage('')
    setPreviewHtml('')
    try {
      const res = await fetch('/api/landing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setPreviewHtml(data.html)
      if (data.quota_exceeded && data.message) {
        setQuotaMessage(data.message)
      }
      fetchPages()
    } catch (err: any) {
      setError(err.message || 'Failed to generate. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const downloadHTML = (html: string, name: string) => {
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name.toLowerCase().replace(/\s+/g, '-') + '.html'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const copyHTML = async (html: string) => {
    await navigator.clipboard.writeText(html)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Inject script into iframe HTML to prevent link navigation
  const getSafeHtml = (html: string): string => {
    const script = `<script>
      document.addEventListener('click', function(e) {
        var el = e.target.closest('a');
        if (el) {
          var href = el.getAttribute('href');
          if (!href || href === '#' || href.startsWith('#')) {
            e.preventDefault();
            e.stopPropagation();
            // Smooth scroll within iframe for anchor links
            if (href && href.length > 1) {
              var target = document.querySelector(href);
              if (target) target.scrollIntoView({ behavior: 'smooth' });
            }
          }
        }
      }, true);
    <\/script>`
    // Inject before closing body tag
    if (html.includes('</body>')) {
      return html.replace('</body>', script + '</body>')
    }
    return html + script
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Generator */}
      <div className="bg-white border border-[#EDE9E3] rounded-2xl p-6">
        <h3 className="font-bold text-[#0D0C0B] text-[17px] mb-1">Generate Landing Page</h3>
        <p className="text-[13px] text-[#7A7670] mb-5">
          AI builds a complete, professional landing page. Download the HTML code to use anywhere.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-[11.5px] font-bold text-[#A39E96] uppercase tracking-wider mb-1.5">
              Product / Company Name
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. FinConnect — Loan Aggregator Platform"
              className="w-full px-4 py-3 border border-[#EDE9E3] rounded-xl text-[14px] focus:outline-none focus:border-[#0D0C0B] bg-[#FAFAF8] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11.5px] font-bold text-[#A39E96] uppercase tracking-wider mb-1.5">
              What problem does it solve?
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Borrowers struggle to compare 50+ loan options across banks. We aggregate and show the best rates in 30 seconds."
              className="w-full px-4 py-3 border border-[#EDE9E3] rounded-xl text-[14px] focus:outline-none focus:border-[#0D0C0B] bg-[#FAFAF8] resize-none transition-colors"
              rows={3}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {quotaMessage && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-[13px] px-4 py-3 rounded-xl">
              {quotaMessage}
            </div>
          )}

          <button
            onClick={generatePage}
            disabled={generating}
            className="w-full bg-[#0D0C0B] text-white py-3.5 rounded-xl text-[14px] font-bold hover:bg-[#1A1714] disabled:opacity-50 transition-colors"
          >
            {generating ? (
              <span className="flex items-center justify-center gap-2">
                <RefreshCw size={14} className="animate-spin" />
                Building your landing page...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Plus size={14} />
                Generate Landing Page
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Live preview */}
      {previewHtml && (
        <div className="bg-white border border-[#EDE9E3] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#EDE9E3]">
            <div className="flex items-center gap-2">
              <Eye size={15} className="text-[#FF8C1A]" />
              <span className="font-bold text-[#0D0C0B] text-[14px]">Preview</span>
              <span className="text-[11px] text-[#A39E96] bg-[#F5F3EF] px-2 py-0.5 rounded-full">
                Links disabled in preview
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => copyHTML(previewHtml)}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-[#EDE9E3] rounded-lg text-[12px] font-medium hover:border-[#0D0C0B] transition-colors"
              >
                <Copy size={12} />
                {copied ? 'Copied!' : 'Copy HTML'}
              </button>
              <button
                onClick={() => downloadHTML(previewHtml, title || 'landing-page')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0D0C0B] text-white rounded-lg text-[12px] font-semibold hover:bg-[#1A1714] transition-colors"
              >
                <Download size={12} />
                Download HTML
              </button>
            </div>
          </div>

          {/* iframe with safe HTML - links won't navigate away */}
          <iframe
            ref={iframeRef}
            srcDoc={getSafeHtml(previewHtml)}
            className="w-full border-0"
            style={{ height: '600px' }}
            title="Landing page preview"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      )}

      {/* Saved pages */}
      {pages.length > 0 && (
        <div>
          <h3 className="font-bold text-[#0D0C0B] text-[15px] mb-3">
            Your Landing Pages ({pages.length})
          </h3>
          <div className="space-y-3">
            {pages.map(page => (
              <div key={page.id} className="bg-white border border-[#EDE9E3] rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-[#0D0C0B] text-[14px]">{page.title}</p>
                    <p className="text-[12px] text-[#A39E96] mt-0.5">
                      {new Date(page.created_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPreviewHtml(page.html_content)}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-[#EDE9E3] rounded-lg text-[12px] font-medium hover:border-[#0D0C0B] transition-colors"
                    >
                      <Eye size={12} /> Preview
                    </button>
                    <button
                      onClick={() => downloadHTML(page.html_content, page.title)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0D0C0B] text-white rounded-lg text-[12px] font-semibold hover:bg-[#1A1714] transition-colors"
                    >
                      <Download size={12} /> Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
