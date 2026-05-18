'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, ChevronLeft, ChevronRight, Globe, Mail, Linkedin, RefreshCw, TrendingUp, Zap } from 'lucide-react'

interface Investor {
  id: string
  name: string
  firm: string | null
  type: string
  stage: string[]
  sectors: string[]
  geography: string[]
  check_size_min: number
  check_size_max: number
  portfolio: string[]
  website: string | null
  email: string | null
  linkedin: string | null
  description: string | null
  thesis: string | null
  tags: string[]
  investor_matches: { score: number; reasons: string[] }[]
}

const TYPE_COLORS: Record<string, string> = {
  'VC': 'bg-blue-50 text-blue-700 border-blue-100',
  'Angel': 'bg-orange-50 text-orange-700 border-orange-100',
  'Super Angel': 'bg-rose-50 text-rose-700 border-rose-100',
  'Family Office': 'bg-purple-50 text-purple-700 border-purple-100',
  'Accelerator': 'bg-green-50 text-green-700 border-green-100',
  'Corporate VC': 'bg-slate-50 text-slate-700 border-slate-100',
  'Micro VC': 'bg-cyan-50 text-cyan-700 border-cyan-100',
  'Hedge Fund': 'bg-gray-50 text-gray-700 border-gray-100',
  'Private Equity': 'bg-indigo-50 text-indigo-700 border-indigo-100',
}

const TYPE_ICONS: Record<string, string> = {
  'VC': '🏦', 'Angel': '👼', 'Family Office': '🏛️',
  'Accelerator': '🚀', 'Corporate VC': '🏢',
  'Micro VC': '💎', 'Super Angel': '⭐',
  'Hedge Fund': '📊', 'Private Equity': '🏗️',
}

const TYPE_ORDER = ['VC', 'Angel', 'Super Angel', 'Family Office', 'Accelerator', 'Corporate VC', 'Micro VC']
const SECTORS = ['', 'AI/ML', 'FinTech', 'SaaS', 'HealthTech', 'EdTech', 'Consumer', 'DeepTech', 'Climate', 'Real Estate', 'Cybersecurity']

function ScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-[#FF8C1A]' : score >= 40 ? 'bg-yellow-400' : 'bg-gray-200'
  const label = score >= 80 ? 'High Match' : score >= 60 ? 'Good Match' : score >= 40 ? 'Fair Match' : 'Low Match'
  return (
    <div className="flex items-center gap-2 min-w-[140px]">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-[11px] font-bold text-gray-500 whitespace-nowrap">{score}%</span>
    </div>
  )
}

function formatCheck(min: number, max: number): string {
  if (!min && !max) return 'Undisclosed'
  const f = (n: number) => n >= 1e9 ? `$${(n/1e9).toFixed(0)}B` : n >= 1e6 ? `$${(n/1e6).toFixed(0)}M` : n >= 1e3 ? `$${(n/1e3).toFixed(0)}K` : `$${n}`
  if (!max || max === min) return f(min)
  if (!min) return `Up to ${f(max)}`
  return `${f(min)}–${f(max)}`
}

export function InvestorDashboard() {
  const [investors, setInvestors] = useState<Investor[]>([])
  const [typeCounts, setTypeCounts] = useState<Record<string, number>>({})
  const [total, setTotal] = useState(0)
  const [highMatchCount, setHighMatchCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [matchesReady, setMatchesReady] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [sectorFilter, setSectorFilter] = useState('')

  const fetch_ = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(p) })
      if (typeFilter) params.set('type', typeFilter)
      if (sectorFilter) params.set('sector', sectorFilter)
      if (search) params.set('search', search)
      const res = await fetch(`/api/investors?${params}`)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setInvestors(data.investors || [])
      setTotal(data.total || 0)
      setTotalPages(data.totalPages || 1)
      setTypeCounts(data.typeCounts || {})
      setHighMatchCount(data.highMatchCount || 0)
      setMatchesReady(data.matchesReady || false)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [typeFilter, sectorFilter, search])

  useEffect(() => { setPage(1); fetch_(1) }, [typeFilter, sectorFilter])
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetch_(1) }, 400)
    return () => clearTimeout(t)
  }, [search])

  const refresh = async () => {
    setRefreshing(true)
    await fetch('/api/investors/refresh', { method: 'POST' })
    await fetch_(1)
    setRefreshing(false)
  }

  const getScore = (inv: Investor) => inv.investor_matches?.[0]?.score || 0
  const getReasons = (inv: Investor) => inv.investor_matches?.[0]?.reasons || []

  const statCards = TYPE_ORDER.filter(t => typeCounts[t] > 0).map(t => ({
    type: t, count: typeCounts[t], icon: TYPE_ICONS[t] || '💼'
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0D0C0B]">Investor Intelligence</h1>
          <p className="text-[14px] text-[#7A7670] mt-1">
            {total.toLocaleString()} investors matched to your profile
            {highMatchCount > 0 && ` · `}
            {highMatchCount > 0 && <span className="text-green-600 font-semibold">{highMatchCount} high matches (70%+)</span>}
          </p>
        </div>
        <button onClick={refresh} disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2.5 border border-[#EDE9E3] bg-white rounded-xl text-[13px] font-semibold hover:border-[#0D0C0B] disabled:opacity-50 transition-colors">
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Recalculating...' : 'Refresh Matches'}
        </button>
      </div>

      {/* Matching notice */}
      {!matchesReady && (
        <div className="bg-[#FFF8F0] border border-[#FFD4A3] rounded-2xl p-4 flex items-center gap-3">
          <Zap size={16} className="text-[#FF8C1A] flex-shrink-0" />
          <p className="text-[13px] text-[#92400E]">
            Calculating your investor matches in the background... Refresh the page in 30 seconds for personalized scores.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
        <div className="col-span-2 bg-[#0D0C0B] rounded-2xl p-4 text-white flex flex-col justify-between">
          <p className="text-[11px] font-bold text-white/40 uppercase tracking-wider">Total Investors</p>
          <p className="text-3xl font-black mt-2">{total.toLocaleString()}</p>
          <p className="text-[11px] text-white/30 mt-1">In database</p>
        </div>
        {statCards.slice(0, 6).map(s => (
          <div key={s.type}
            onClick={() => setTypeFilter(typeFilter === s.type ? '' : s.type)}
            className={`bg-white border rounded-2xl p-4 cursor-pointer transition-all hover:shadow-sm ${
              typeFilter === s.type ? 'border-[#0D0C0B] shadow-sm' : 'border-[#EDE9E3]'
            }`}>
            <p className="text-xl">{s.icon}</p>
            <p className="text-xl font-black text-[#0D0C0B] mt-1">{s.count.toLocaleString()}</p>
            <p className="text-[10px] text-[#A39E96] mt-0.5 leading-tight">{s.type}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#EDE9E3] rounded-2xl p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[180px] relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A39E96]" />
            <input type="text" placeholder="Search investors or firms..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-[#EDE9E3] rounded-xl text-[13px] focus:outline-none focus:border-[#0D0C0B] transition-colors" />
          </div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="px-3 py-2.5 border border-[#EDE9E3] rounded-xl text-[13px] focus:outline-none focus:border-[#0D0C0B] bg-white">
            {['', 'VC', 'Angel', 'Super Angel', 'Family Office', 'Accelerator', 'Corporate VC', 'Micro VC'].map(t =>
              <option key={t} value={t}>{t || 'All Types'}</option>)}
          </select>
          <select value={sectorFilter} onChange={e => setSectorFilter(e.target.value)}
            className="px-3 py-2.5 border border-[#EDE9E3] rounded-xl text-[13px] focus:outline-none focus:border-[#0D0C0B] bg-white">
            {SECTORS.map(s => <option key={s} value={s}>{s || 'All Sectors'}</option>)}
          </select>
          {(typeFilter || sectorFilter || search) && (
            <button onClick={() => { setTypeFilter(''); setSectorFilter(''); setSearch('') }}
              className="px-3 py-2.5 text-[13px] text-[#7A7670] hover:text-red-500 transition-colors">
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Results header */}
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-[#7A7670]">
          <span className="font-semibold text-[#0D0C0B]">{investors.length}</span> of{' '}
          <span className="font-semibold text-[#0D0C0B]">{total.toLocaleString()}</span> investors
          {typeFilter && <span className="ml-1 text-[#FF8C1A]">· {typeFilter}</span>}
          {sectorFilter && <span className="ml-1 text-[#FF8C1A]">· {sectorFilter}</span>}
        </p>
        <div className="flex items-center gap-1 text-[11px] text-[#A39E96]">
          <TrendingUp size={11} /> Sorted by match score
        </div>
      </div>

      {/* Investor list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white border border-[#EDE9E3] rounded-2xl p-5 animate-pulse">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-48" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : investors.length === 0 ? (
        <div className="bg-white border border-[#EDE9E3] rounded-2xl p-12 text-center">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-semibold text-[#0D0C0B]">No investors found</p>
          <p className="text-[13px] text-[#7A7670] mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {investors.map((inv, idx) => {
            const score = getScore(inv)
            const reasons = getReasons(inv)
            const typeClass = TYPE_COLORS[inv.type] || 'bg-gray-50 text-gray-600 border-gray-100'
            return (
              <div key={inv.id}
                className="bg-white border border-[#EDE9E3] rounded-2xl p-5 hover:shadow-md transition-all group">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-11 h-11 bg-gradient-to-br from-[#F5F3EF] to-[#EDE9E3] rounded-xl flex items-center justify-center flex-shrink-0 text-[15px] font-black text-[#0D0C0B]">
                    {inv.name[0]?.toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-[#0D0C0B] text-[15px]">{inv.name}</h3>
                          {inv.firm && inv.firm !== inv.name && (
                            <span className="text-[13px] text-[#A39E96]">· {inv.firm}</span>
                          )}
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${typeClass}`}>
                            {TYPE_ICONS[inv.type]} {inv.type}
                          </span>
                        </div>
                        {inv.description && (
                          <p className="text-[13px] text-[#7A7670] mt-1 line-clamp-2 leading-relaxed">
                            {inv.description}
                          </p>
                        )}
                      </div>

                      {/* Match score */}
                      <div className="flex-shrink-0 flex flex-col items-end gap-1">
                        <ScoreBar score={score} />
                        {reasons.length > 0 && (
                          <p className="text-[10px] text-[#A39E96] text-right">
                            {reasons.slice(0, 2).join(' · ')}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {inv.sectors?.slice(0, 3).map(s => (
                        <span key={s} className="bg-[#F5F3EF] text-[#524F4A] text-[11px] px-2.5 py-0.5 rounded-full font-medium">{s}</span>
                      ))}
                      {inv.stage?.slice(0, 2).map(s => (
                        <span key={s} className="bg-blue-50 text-blue-600 text-[11px] px-2.5 py-0.5 rounded-full">{s}</span>
                      ))}
                      {inv.geography?.slice(0, 2).map(g => (
                        <span key={g} className="bg-green-50 text-green-700 text-[11px] px-2.5 py-0.5 rounded-full">📍 {g}</span>
                      ))}
                    </div>

                    {/* Bottom row */}
                    <div className="flex items-center gap-5 mt-3 pt-3 border-t border-[#F5F3EF] flex-wrap">
                      <span className="text-[12px] text-[#7A7670] font-medium">
                        💰 {formatCheck(inv.check_size_min, inv.check_size_max)}
                      </span>
                      {inv.portfolio?.length > 0 && (
                        <span className="text-[12px] text-[#7A7670]">
                          🏆 {inv.portfolio.slice(0, 3).join(', ')}{inv.portfolio.length > 3 ? ` +${inv.portfolio.length - 3}` : ''}
                        </span>
                      )}

                      {/* Contact links */}
                      <div className="flex items-center gap-3 ml-auto">
                        {inv.website && (
                          <a href={inv.website.startsWith('http') ? inv.website : `https://${inv.website}`}
                            target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                            className="flex items-center gap-1 text-[12px] text-[#7A7670] hover:text-[#0D0C0B] transition-colors">
                            <Globe size={11} /> Website
                          </a>
                        )}
                        {inv.linkedin && (
                          <a href={inv.linkedin.startsWith('http') ? inv.linkedin : `https://linkedin.com/in/${inv.linkedin}`}
                            target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                            className="flex items-center gap-1 text-[12px] text-blue-600 hover:text-blue-800 transition-colors">
                            <Linkedin size={11} /> LinkedIn
                          </a>
                        )}
                        {inv.email && (
                          <a href={`mailto:${inv.email}`} onClick={e => e.stopPropagation()}
                            className="flex items-center gap-1 text-[12px] text-[#7A7670] hover:text-[#0D0C0B] transition-colors">
                            <Mail size={11} /> Email
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button onClick={() => { const p = Math.max(1, page-1); setPage(p); fetch_(p) }}
            disabled={page === 1 || loading}
            className="flex items-center gap-1.5 px-4 py-2.5 border border-[#EDE9E3] bg-white rounded-xl text-[13px] font-semibold hover:border-[#0D0C0B] disabled:opacity-40 transition-colors">
            <ChevronLeft size={14} /> Previous
          </button>
          <span className="text-[13px] text-[#7A7670] px-2">
            Page <span className="font-bold text-[#0D0C0B]">{page}</span> of{' '}
            <span className="font-bold text-[#0D0C0B]">{totalPages}</span>
          </span>
          <button onClick={() => { const p = Math.min(totalPages, page+1); setPage(p); fetch_(p) }}
            disabled={page === totalPages || loading}
            className="flex items-center gap-1.5 px-4 py-2.5 border border-[#EDE9E3] bg-white rounded-xl text-[13px] font-semibold hover:border-[#0D0C0B] disabled:opacity-40 transition-colors">
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Anti-scraping notice - invisible to users but blocks scrapers */}
      <div style={{display:'none'}} aria-hidden="true" className="honeypot">
        {/* Data protected. Unauthorized scraping prohibited. */}
      </div>
    </div>
  )
}
