'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, ChevronLeft, ChevronRight, Globe, Mail, Linkedin, RefreshCw, TrendingUp, Zap, Building2, User, Rocket, Briefcase, Star, DollarSign } from 'lucide-react'

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
  'VC': 'bg-blue-50 text-blue-700 border border-blue-100',
  'Angel': 'bg-amber-50 text-amber-700 border border-amber-100',
  'Super Angel': 'bg-orange-50 text-orange-700 border border-orange-100',
  'Family Office': 'bg-purple-50 text-purple-700 border border-purple-100',
  'Accelerator': 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  'Corporate VC': 'bg-slate-50 text-slate-700 border border-slate-100',
  'Micro VC': 'bg-cyan-50 text-cyan-700 border border-cyan-100',
}

const TYPE_ICONS: Record<string, any> = {
  'VC': Building2,
  'Angel': User,
  'Super Angel': Star,
  'Family Office': Briefcase,
  'Accelerator': Rocket,
  'Corporate VC': Building2,
  'Micro VC': DollarSign,
}

const SECTORS = ['', 'AI/ML', 'FinTech', 'SaaS', 'HealthTech', 'EdTech', 'Consumer', 'DeepTech', 'Climate', 'Real Estate', 'Cybersecurity']
const TYPES = ['', 'VC', 'Angel', 'Super Angel', 'Family Office', 'Accelerator', 'Corporate VC', 'Micro VC']

function ScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-[#FF8C1A]' : score >= 40 ? 'bg-amber-400' : 'bg-gray-200'
  const label = score >= 80 ? 'High Match' : score >= 60 ? 'Good Match' : score >= 40 ? 'Fair Match' : 'Low Match'
  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${score}%` }} />
        </div>
        <span className="text-[12px] font-bold text-[#0D0C0B] tabular-nums">{score}%</span>
      </div>
      <span className={`text-[10px] font-semibold ${score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-[#FF8C1A]' : 'text-gray-400'}`}>{label}</span>
    </div>
  )
}

function formatCheck(min: number, max: number): string {
  if (!min && !max) return 'Undisclosed'
  const f = (n: number) => n >= 1e9 ? `$${(n/1e9).toFixed(0)}B` : n >= 1e6 ? `$${(n/1e6).toFixed(0)}M` : n >= 1e3 ? `$${(n/1e3).toFixed(0)}K` : `$${n}`
  if (!max || max === min) return min ? f(min) : 'Undisclosed'
  if (!min) return `Up to ${f(max)}`
  return `${f(min)} – ${f(max)}`
}

function isValidUrl(url: string | null): boolean {
  if (!url) return false
  try { new URL(url); return true } catch { return false }
}

function isValidEmail(email: string | null): boolean {
  if (!email) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function isValidLinkedin(url: string | null): boolean {
  if (!url) return false
  return url.includes('linkedin.com') && url.length > 20
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

  const fetchData = useCallback(async (p: number) => {
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

  useEffect(() => { setPage(1); fetchData(1) }, [typeFilter, sectorFilter])
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchData(1) }, 400)
    return () => clearTimeout(t)
  }, [search])

  const refresh = async () => {
    setRefreshing(true)
    await fetch('/api/investors/refresh', { method: 'POST' })
    await fetchData(1)
    setRefreshing(false)
  }

  const getScore = (inv: Investor) => inv.investor_matches?.[0]?.score || 0
  const getReasons = (inv: Investor) => inv.investor_matches?.[0]?.reasons || []

  const statConfig = [
    { type: 'VC', label: 'Venture Capital', Icon: Building2, color: 'text-blue-600 bg-blue-50' },
    { type: 'Angel', label: 'Angel Investors', Icon: User, color: 'text-amber-600 bg-amber-50' },
    { type: 'Family Office', label: 'Family Offices', Icon: Briefcase, color: 'text-purple-600 bg-purple-50' },
    { type: 'Accelerator', label: 'Accelerators', Icon: Rocket, color: 'text-emerald-600 bg-emerald-50' },
    { type: 'Corporate VC', label: 'Corporate VC', Icon: Building2, color: 'text-slate-600 bg-slate-50' },
    { type: 'Micro VC', label: 'Micro VC', Icon: DollarSign, color: 'text-cyan-600 bg-cyan-50' },
  ].filter(s => typeCounts[s.type] > 0)

  return (
    <div className="space-y-6 pb-8">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0D0C0B]">Investor Intelligence</h1>
          <p className="text-[14px] text-[#7A7670] mt-1">
            {total.toLocaleString()} investors in database
            {highMatchCount > 0 && <span className="ml-2 text-emerald-600 font-semibold">· {highMatchCount} high matches (70%+)</span>}
          </p>
        </div>
        <button onClick={refresh} disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#EDE9E3] rounded-xl text-[13px] font-semibold hover:border-[#0D0C0B] disabled:opacity-50 transition-colors">
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Recalculating...' : 'Refresh Matches'}
        </button>
      </div>

      {/* Matching notice */}
      {!matchesReady && (
        <div className="bg-[#FFF8F0] border border-[#FFD4A3] rounded-2xl p-4 flex items-start gap-3">
          <Zap size={15} className="text-[#FF8C1A] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[13px] font-semibold text-[#92400E]">Calculating your matches</p>
            <p className="text-[12px] text-[#92400E]/70 mt-0.5">Analysing {total.toLocaleString()} investors against your profile. Refresh in 30 seconds.</p>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* Total card */}
        <div className="col-span-2 sm:col-span-1 bg-[#0D0C0B] rounded-2xl p-5 flex flex-col justify-between min-h-[100px]">
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Total</p>
          <div>
            <p className="text-3xl font-black text-white mt-2">{total.toLocaleString()}</p>
            <p className="text-[11px] text-white/30 mt-1">Investors</p>
          </div>
        </div>

        {/* Type stat cards */}
        {statConfig.map(({ type, label, Icon, color }) => (
          <button key={type}
            onClick={() => setTypeFilter(typeFilter === type ? '' : type)}
            className={`bg-white border rounded-2xl p-4 text-left transition-all hover:shadow-sm ${
              typeFilter === type ? 'border-[#0D0C0B] shadow-sm' : 'border-[#EDE9E3] hover:border-[#C9C4BC]'
            }`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${color}`}>
              <Icon size={15} />
            </div>
            <p className="text-xl font-black text-[#0D0C0B]">{(typeCounts[type] || 0).toLocaleString()}</p>
            <p className="text-[10px] text-[#A39E96] mt-0.5 leading-tight">{label}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#EDE9E3] rounded-2xl p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A39E96]" />
            <input type="text" placeholder="Search investors or firms..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-[#EDE9E3] rounded-xl text-[13px] focus:outline-none focus:border-[#0D0C0B] transition-colors bg-[#FAFAF8]" />
          </div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="px-3 py-2.5 border border-[#EDE9E3] rounded-xl text-[13px] focus:outline-none focus:border-[#0D0C0B] bg-white min-w-[130px]">
            {TYPES.map(t => <option key={t} value={t}>{t || 'All Types'}</option>)}
          </select>
          <select value={sectorFilter} onChange={e => setSectorFilter(e.target.value)}
            className="px-3 py-2.5 border border-[#EDE9E3] rounded-xl text-[13px] focus:outline-none focus:border-[#0D0C0B] bg-white min-w-[130px]">
            {SECTORS.map(s => <option key={s} value={s}>{s || 'All Sectors'}</option>)}
          </select>
          {(typeFilter || sectorFilter || search) && (
            <button onClick={() => { setTypeFilter(''); setSectorFilter(''); setSearch('') }}
              className="px-3 py-2.5 text-[13px] text-[#7A7670] hover:text-red-500 transition-colors font-medium">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-[#7A7670]">
          Showing <span className="font-semibold text-[#0D0C0B]">{investors.length}</span> of{' '}
          <span className="font-semibold text-[#0D0C0B]">{total.toLocaleString()}</span> investors
          {typeFilter && <span className="text-[#FF8C1A] ml-1">· {typeFilter}</span>}
          {sectorFilter && <span className="text-[#FF8C1A] ml-1">· {sectorFilter}</span>}
        </p>
        <div className="flex items-center gap-1.5 text-[11px] text-[#A39E96]">
          <TrendingUp size={11} />
          Sorted by match score
        </div>
      </div>

      {/* Investor list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white border border-[#EDE9E3] rounded-2xl p-5 animate-pulse">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2.5">
                  <div className="h-4 bg-gray-100 rounded-lg w-48" />
                  <div className="h-3 bg-gray-100 rounded-lg w-full" />
                  <div className="h-3 bg-gray-100 rounded-lg w-3/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : investors.length === 0 ? (
        <div className="bg-white border border-[#EDE9E3] rounded-2xl p-16 text-center">
          <Search size={32} className="text-gray-200 mx-auto mb-3" />
          <p className="font-semibold text-[#0D0C0B]">No investors found</p>
          <p className="text-[13px] text-[#7A7670] mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {investors.map((inv) => {
            const score = getScore(inv)
            const reasons = getReasons(inv)
            const typeClass = TYPE_COLORS[inv.type] || 'bg-gray-50 text-gray-600 border border-gray-100'
            const TypeIcon = TYPE_ICONS[inv.type] || Building2
            const hasWebsite = isValidUrl(inv.website)
            const hasEmail = isValidEmail(inv.email)
            const hasLinkedin = isValidLinkedin(inv.linkedin)
            const hasAnyContact = hasWebsite || hasEmail || hasLinkedin

            return (
              <div key={inv.id} className="bg-white border border-[#EDE9E3] rounded-2xl p-5 hover:shadow-md transition-all">
                <div className="flex items-start gap-4">

                  {/* Avatar */}
                  <div className="w-11 h-11 bg-gradient-to-br from-[#F5F3EF] to-[#EDE9E3] rounded-xl flex items-center justify-center flex-shrink-0 font-black text-[15px] text-[#0D0C0B] select-none">
                    {inv.name[0]?.toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Name + type + score */}
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-[#0D0C0B] text-[15px] leading-tight">{inv.name}</h3>
                          {inv.firm && inv.firm !== inv.name && (
                            <span className="text-[13px] text-[#A39E96]">· {inv.firm}</span>
                          )}
                          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${typeClass}`}>
                            <TypeIcon size={10} />
                            {inv.type}
                          </span>
                        </div>
                        {inv.description && (
                          <p className="text-[13px] text-[#7A7670] mt-1.5 line-clamp-2 leading-relaxed">{inv.description}</p>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        <ScoreBar score={score} />
                        {reasons.length > 0 && (
                          <p className="text-[10px] text-[#A39E96] mt-1 text-right">{reasons.slice(0,2).join(' · ')}</p>
                        )}
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {inv.sectors?.slice(0, 3).map(s => (
                        <span key={s} className="bg-[#F5F3EF] text-[#524F4A] text-[11px] px-2.5 py-0.5 rounded-full font-medium">{s}</span>
                      ))}
                      {inv.stage?.slice(0, 2).map(s => (
                        <span key={s} className="bg-blue-50 text-blue-600 text-[11px] px-2.5 py-0.5 rounded-full">{s}</span>
                      ))}
                      {inv.geography?.slice(0, 2).map(g => (
                        <span key={g} className="bg-slate-50 text-slate-600 text-[11px] px-2.5 py-0.5 rounded-full">{g}</span>
                      ))}
                    </div>

                    {/* Bottom row */}
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#F5F3EF] flex-wrap">
                      {/* Check size */}
                      <div className="flex items-center gap-1.5 text-[12px] text-[#7A7670]">
                        <DollarSign size={12} className="text-[#A39E96]" />
                        {formatCheck(inv.check_size_min, inv.check_size_max)}
                      </div>

                      {/* Portfolio */}
                      {inv.portfolio?.length > 0 && (
                        <p className="text-[12px] text-[#7A7670] truncate max-w-[200px]">
                          Portfolio: {inv.portfolio.slice(0, 3).join(', ')}{inv.portfolio.length > 3 ? ` +${inv.portfolio.length - 3}` : ''}
                        </p>
                      )}

                      {/* Contact links - only show if valid */}
                      {hasAnyContact && (
                        <div className="flex items-center gap-3 ml-auto">
                          {hasWebsite && (
                            <a href={inv.website!} target="_blank" rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="flex items-center gap-1.5 text-[12px] text-[#524F4A] hover:text-[#0D0C0B] transition-colors font-medium">
                              <Globe size={12} className="text-[#A39E96]" />
                              Website
                            </a>
                          )}
                          {hasLinkedin && (
                            <a href={inv.linkedin!} target="_blank" rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="flex items-center gap-1.5 text-[12px] text-blue-600 hover:text-blue-800 transition-colors font-medium">
                              <Linkedin size={12} />
                              LinkedIn
                            </a>
                          )}
                          {hasEmail && (
                            <a href={`mailto:${inv.email}`}
                              onClick={e => e.stopPropagation()}
                              className="flex items-center gap-1.5 text-[12px] text-[#524F4A] hover:text-[#0D0C0B] transition-colors font-medium">
                              <Mail size={12} className="text-[#A39E96]" />
                              Email
                            </a>
                          )}
                        </div>
                      )}
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
          <button onClick={() => { const p = Math.max(1, page-1); setPage(p); fetchData(p) }}
            disabled={page === 1 || loading}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-[#EDE9E3] rounded-xl text-[13px] font-semibold hover:border-[#0D0C0B] disabled:opacity-40 transition-colors">
            <ChevronLeft size={14} /> Previous
          </button>
          <span className="text-[13px] text-[#7A7670]">
            Page <span className="font-bold text-[#0D0C0B]">{page}</span> of <span className="font-bold text-[#0D0C0B]">{totalPages}</span>
          </span>
          <button onClick={() => { const p = Math.min(totalPages, page+1); setPage(p); fetchData(p) }}
            disabled={page === totalPages || loading}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-[#EDE9E3] rounded-xl text-[13px] font-semibold hover:border-[#0D0C0B] disabled:opacity-40 transition-colors">
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* honeypot - anti scraping */}
      <div style={{display:'none'}} aria-hidden="true" className="honeypot-trap" />
    </div>
  )
}
