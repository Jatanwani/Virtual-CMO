import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const PLATFORM_SIZES: Record<string, { w: number; h: number }> = {
  linkedin: { w: 1200, h: 627 },
  instagram: { w: 1080, h: 1080 },
  twitter: { w: 1600, h: 900 },
  facebook: { w: 1200, h: 630 },
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { prompt, platform = 'linkedin', content_item_id } = await request.json()
    if (!prompt) return NextResponse.json({ error: 'Prompt required' }, { status: 400 })

    const { w, h } = PLATFORM_SIZES[platform.toLowerCase()] || PLATFORM_SIZES.linkedin

    // Pollinations prompt engineered for 90% visual, 10% text, professional marketing
    const engineeredPrompt = `${prompt}, professional marketing social media graphic, 90% visual composition, minimal text overlay area, clean modern design, vibrant colors, high contrast, premium SaaS startup aesthetic, photorealistic quality, no watermark, suitable for ${platform} social media, aspect ratio ${w}x${h}`

    // Pollinations AI - completely free, no API key
    const seed = Math.floor(Math.random() * 999999)
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(engineeredPrompt)}?width=${w}&height=${h}&seed=${seed}&nologo=true&enhance=true&model=flux`

    // Save to DB
    const { data: image } = await supabase
      .from('generated_images')
      .insert({
        user_id: user.id,
        content_item_id: content_item_id || null,
        prompt: engineeredPrompt,
        image_url: imageUrl,
        platform,
        width: w,
        height: h,
        provider: 'pollinations-flux',
      })
      .select()
      .single()

    // Update content item image_url
    if (content_item_id) {
      await supabase
        .from('content_items')
        .update({ image_url: imageUrl, image_prompt: prompt })
        .eq('id', content_item_id)
        .eq('user_id', user.id)
    }

    return NextResponse.json({ image_url: imageUrl, id: image?.id, width: w, height: h })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: images } = await supabase
      .from('generated_images')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30)

    return NextResponse.json({ images: images || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
