import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const PLATFORM_SIZES: Record<string, { w: number; h: number }> = {
  linkedin: { w: 1200, h: 627 },
  instagram: { w: 1080, h: 1080 },
  x: { w: 1600, h: 900 },
  twitter: { w: 1600, h: 900 },
  facebook: { w: 1200, h: 630 },
  default: { w: 1200, h: 627 },
}

// Step 1: Use GPT to generate a high-quality image prompt
async function generateImagePrompt(rawPrompt: string, platform: string, topic: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return buildFallbackPrompt(rawPrompt, platform)

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 300,
        messages: [
          {
            role: 'system',
            content: `You are an expert AI image prompt engineer specializing in professional marketing visuals.
Your job: Transform a basic idea into a detailed, vivid image generation prompt.

STRICT RULES:
- 90% visual composition, 10% or less text elements
- Professional marketing aesthetic, NOT stock photo style
- Specify: lighting, color palette, mood, composition, style
- Include: "photorealistic", "professional photography", "high resolution"
- NO people's faces (use silhouettes or hands instead)
- Optimized for ${platform} social media dimensions
- Output ONLY the prompt, no explanation`,
          },
          {
            role: 'user',
            content: `Create a detailed image generation prompt for this marketing post:
Topic: ${topic}
Basic idea: ${rawPrompt}
Platform: ${platform}

Generate a professional, creative, high-quality prompt that will create a stunning marketing visual.`,
          },
        ],
      }),
      signal: AbortSignal.timeout(15000),
    })

    if (!res.ok) throw new Error('GPT failed')
    const data = await res.json() as any
    const prompt = data.choices?.[0]?.message?.content?.trim()
    if (!prompt) throw new Error('Empty prompt')
    return prompt
  } catch {
    return buildFallbackPrompt(rawPrompt, platform)
  }
}

function buildFallbackPrompt(rawPrompt: string, platform: string): string {
  return `${rawPrompt}, professional marketing visual, 90% visual composition with minimal text, photorealistic high quality photography, dramatic studio lighting, vibrant brand colors, modern minimalist design, premium SaaS aesthetic, ${platform} social media optimized, no faces, cinematic composition, 8K resolution`
}

// Step 2: Generate image using best free model on Pollinations
async function generateImage(prompt: string, w: number, h: number): Promise<string> {
  const seed = Math.floor(Math.random() * 9999999)
  // Use flux-pro model for best quality on Pollinations (free, unlimited)
  const encoded = encodeURIComponent(prompt)
  return `https://image.pollinations.ai/prompt/${encoded}?width=${w}&height=${h}&seed=${seed}&nologo=true&enhance=true&model=flux-pro`
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { prompt, platform = 'linkedin', content_item_id, topic = '' } = await request.json()
    if (!prompt) return NextResponse.json({ error: 'Prompt required' }, { status: 400 })

    const platformKey = platform.toLowerCase().replace(/\s/g, '')
    const { w, h } = PLATFORM_SIZES[platformKey] || PLATFORM_SIZES.default

    // Step 1: GPT engineers the prompt
    const engineeredPrompt = await generateImagePrompt(prompt, platform, topic)

    // Step 2: Pollinations generates the image with flux-pro
    const imageUrl = await generateImage(engineeredPrompt, w, h)

    // Save to DB
    const { data: image } = await supabase
      .from('generated_images')
      .insert({
        user_id: user.id,
        content_item_id: content_item_id || null,
        prompt: engineeredPrompt,
        image_url: imageUrl,
        platform: platformKey,
        width: w,
        height: h,
        provider: 'pollinations-flux-pro',
      })
      .select()
      .single()

    if (content_item_id) {
      await supabase
        .from('content_items')
        .update({ image_url: imageUrl, image_prompt: prompt })
        .eq('id', content_item_id)
        .eq('user_id', user.id)
    }

    return NextResponse.json({
      image_url: imageUrl,
      engineered_prompt: engineeredPrompt,
      id: (image as any)?.id,
      width: w,
      height: h,
    })
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
