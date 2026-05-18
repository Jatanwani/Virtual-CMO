import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function inferSectors(profile: any): string[] {
  const text = `${profile.product||''} ${profile.problem||''} ${profile.icp||''}`.toLowerCase()
  const map: Record<string,string[]> = {
    'AI/ML': ['ai','machine learning','artificial intelligence','llm','gpt','nlp'],
    'FinTech': ['fintech','financial','payment','banking','loan','insurance','lending'],
    'SaaS': ['saas','software','b2b','platform','tool','dashboard','api'],
    'HealthTech': ['health','medical','healthcare','wellness','telemedicine'],
    'EdTech': ['education','learning','training','upskilling'],
    'Consumer': ['consumer','marketplace','d2c','ecommerce','retail'],
    'DeepTech': ['hardware','robotics','space','quantum','semiconductor'],
    'Climate': ['climate','cleantech','sustainability','renewable','carbon'],
  }
  return Object.entries(map).filter(([,kw])=>kw.some(k=>text.includes(k))).map(([s])=>s)
}

async function calculateMatches(supabase: any, userId: string, profile: any) {
  const { data: investors } = await supabase
    .from('investors')
    .select('id,type,sectors,stage,geography,check_size_min,check_size_max')
    .eq('active', true)
    .limit(32000)

  if (!investors?.length) return

  const founderStage = (profile.stage || '').toLowerCase()
  const founderSectors = inferSectors(profile)
  const founderGeo = (profile.icp || '').toLowerCase()
  const isIndia = founderGeo.includes('india') || founderGeo.includes('indian') || founderGeo.includes('south asia')

  const STAGE_MATCH: Record<string,string[]> = {
    'Idea/Pre-MVP': ['pre-seed','preseed','pre seed'],
    'MVP Built': ['pre-seed','seed','preseed'],
    'Early Traction (1-10 customers)': ['seed','series a'],
    'Growing (10-100 customers)': ['seed','series a','series b'],
    'Scaling (100+ customers)': ['series a','series b','series c','growth'],
  }
  const stageKws = STAGE_MATCH[profile.stage] || ['seed','series a']

  const matches = investors.map((inv: any) => {
    let score = 0
    const reasons: string[] = []

    // Stage match (25 pts)
    const invStages = (inv.stage || []).join(' ').toLowerCase()
    if (stageKws.some((k: string) => invStages.includes(k))) {
      score += 25; reasons.push('Stage aligned')
    }

    // Sector match (35 pts)
    const overlap = (inv.sectors || []).filter((s: string) => founderSectors.includes(s))
    if (overlap.length > 0) {
      score += Math.min(35, overlap.length * 15)
      reasons.push(`${overlap.slice(0,2).join(' & ')} focus`)
    }

    // Geography (20 pts)
    const geo = (inv.geography || []).join(' ').toLowerCase()
    if (isIndia && (geo.includes('india') || geo.includes('asia') || geo.includes('global'))) {
      score += 20; reasons.push('Invests in India/Asia')
    } else if (!isIndia && (geo.includes('global') || geo.includes('us') || geo.includes('worldwide'))) {
      score += 20; reasons.push('Global mandate')
    } else if (geo.includes('global')) {
      score += 15
    }

    // Check size (20 pts)
    if (inv.check_size_max > 0) {
      score += 20; reasons.push('Check size disclosed')
    } else {
      score += 10
    }

    return {
      user_id: userId,
      investor_id: inv.id,
      score: Math.min(score, 100),
      reasons: reasons.slice(0, 3),
      calculated_at: new Date().toISOString(),
    }
  })

  // Batch upsert
  const BATCH = 500
  for (let i = 0; i < matches.length; i += BATCH) {
    await supabase.from('investor_matches')
      .upsert(matches.slice(i, i + BATCH), { onConflict: 'user_id,investor_id' })
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const typeFilter = searchParams.get('type') || ''
    const sectorFilter = searchParams.get('sector') || ''
    const search = searchParams.get('search') || ''
    const limit = 50
    const offset = (page - 1) * limit

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    const p = (profile || {}) as any

    // Check if matches exist
    const { count: matchCount } = await supabase
      .from('investor_matches')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (!matchCount || matchCount === 0) {
      calculateMatches(supabase, user.id, p).catch(console.error)
    }

    // Build query with match scores
    let query = supabase
      .from('investors')
      .select(`
        id, name, firm, type, stage, sectors, geography,
        check_size_min, check_size_max, portfolio,
        website, email, linkedin, description, thesis, tags,
        investor_matches!left(score, reasons)
      `, { count: 'exact' })
      .eq('active', true)
      .eq('investor_matches.user_id', user.id)

    if (typeFilter) query = query.eq('type', typeFilter)
    if (sectorFilter) query = query.contains('sectors', [sectorFilter])
    if (search) query = query.or(`name.ilike.%${search}%,firm.ilike.%${search}%,description.ilike.%${search}%`)

    const { data: investors, count } = await query
      .order('score', { ascending: false, foreignTable: 'investor_matches', nullsFirst: false })
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1)

    // Get type counts for stats
    const { data: allTypes } = await supabase
      .from('investors')
      .select('type')
      .eq('active', true)

    const typeCounts: Record<string, number> = {}
    allTypes?.forEach((r: any) => { typeCounts[r.type] = (typeCounts[r.type] || 0) + 1 })

    // Get high match count
    const { count: highMatchCount } = await supabase
      .from('investor_matches')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('score', 70)

    return NextResponse.json({
      investors: investors || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
      typeCounts,
      highMatchCount: highMatchCount || 0,
      matchesReady: (matchCount || 0) > 0,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
