import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function inferSectors(profile: any): string[] {
  const text = `${profile.product||''} ${profile.problem||''} ${profile.icp||''}`.toLowerCase()
  const map: Record<string,string[]> = {
    'AI/ML': ['ai','machine learning','llm','gpt','nlp'],
    'FinTech': ['fintech','financial','payment','banking','loan','insurance','lending'],
    'SaaS': ['saas','software','b2b','platform','tool'],
    'HealthTech': ['health','medical','healthcare','wellness'],
    'EdTech': ['education','learning','training'],
    'Consumer': ['consumer','marketplace','d2c','ecommerce'],
    'DeepTech': ['hardware','robotics','space','quantum'],
    'Climate': ['climate','cleantech','sustainability','renewable'],
  }
  return Object.entries(map).filter(([,kw])=>kw.some(k=>text.includes(k))).map(([s])=>s)
}

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    const p = (profile || {}) as any

    // Delete old matches
    await supabase.from('investor_matches').delete().eq('user_id', user.id)

    const { data: investors } = await supabase
      .from('investors').select('id,type,sectors,stage,geography,check_size_min,check_size_max').eq('active', true).limit(32000)

    if (!investors?.length) return NextResponse.json({ ok: true, count: 0 })

    const founderSectors = inferSectors(p)
    const founderGeo = (p.icp || '').toLowerCase()
    const isIndia = founderGeo.includes('india') || founderGeo.includes('south asia')
    const STAGE_MATCH: Record<string,string[]> = {
      'Idea/Pre-MVP': ['pre-seed','preseed'],
      'MVP Built': ['pre-seed','seed'],
      'Early Traction (1-10 customers)': ['seed','series a'],
      'Growing (10-100 customers)': ['seed','series a','series b'],
      'Scaling (100+ customers)': ['series a','series b','series c'],
    }
    const stageKws = STAGE_MATCH[p.stage] || ['seed','series a']

    const matches = investors.map((inv: any) => {
      let score = 0; const reasons: string[] = []
      const invStages = (inv.stage||[]).join(' ').toLowerCase()
      if (stageKws.some((k:string)=>invStages.includes(k))) { score+=25; reasons.push('Stage aligned') }
      const overlap = (inv.sectors||[]).filter((s:string)=>founderSectors.includes(s))
      if (overlap.length>0) { score+=Math.min(35,overlap.length*15); reasons.push(`${overlap[0]} focus`) }
      const geo = (inv.geography||[]).join(' ').toLowerCase()
      if (isIndia&&(geo.includes('india')||geo.includes('asia')||geo.includes('global'))) { score+=20; reasons.push('India/Asia mandate') }
      else if (geo.includes('global')) { score+=15 }
      if (inv.check_size_max>0) { score+=20; reasons.push('Active investor') }
      else score+=10
      return { user_id: user.id, investor_id: inv.id, score: Math.min(score,100), reasons: reasons.slice(0,3), calculated_at: new Date().toISOString() }
    })

    const BATCH = 500
    for (let i=0;i<matches.length;i+=BATCH) {
      await supabase.from('investor_matches').upsert(matches.slice(i,i+BATCH),{onConflict:'user_id,investor_id'})
    }

    return NextResponse.json({ ok: true, count: matches.length })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
