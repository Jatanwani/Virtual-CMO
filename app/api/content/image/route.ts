import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// --- THE CREATIVE BRAIN ---
function brainstormConcept(userTopic: string): string {
  // Logic to turn any business topic into a visual metaphor
  const baseConcept = `A high-end visual metaphor for ${userTopic}.`;
  const composition = `90% stunning cinematic scenery with professional lighting, 10% clean negative space for copy.`;
  const typography = `Include a sharp, bold typography hook in the corner that says 'ELEVATE'.`;
  const style = `8k resolution, professional B2B commercial photography, minimalist corporate aesthetic.`;

  return `${baseConcept} ${composition} ${typography} ${style}`;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { postId, imagePrompt: userTopic } = await request.json()

    // 1. THINKING: Transform topic into a Creative Concept
    const finalPrompt = brainstormConcept(userTopic);

    // 2. GENERATION: Fetch via Stealth Proxy
    const seed = Math.floor(Math.random() * 1000000);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?width=1024&height=1024&seed=${seed}&nologo=true&model=flux&nofeed=true`;

    const response = await fetch(pollinationsUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://google.com' }
    });
    if (!response.ok) throw new Error('AI Engine is busy');
    const imageBlob = await response.blob();

    // 3. STORAGE: Upload to your own Supabase Bucket (The Production Way)
    const fileName = `${user.id}/${Date.now()}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from('content-images')
      .upload(fileName, imageBlob, { contentType: 'image/jpeg', upsert: true });

    if (uploadError) throw uploadError;

    // 4. PREVIEW URL: Get the permanent public link
    const { data: { publicUrl } } = supabase.storage
      .from('content-images')
      .getPublicUrl(fileName);

    // 5. SAVE: Update the database
    if (postId) {
      await supabase
        .from('content_items')
        .update({ image_url: publicUrl, image_prompt: finalPrompt })
        .eq('id', postId)
    }

    return NextResponse.json({ imageUrl: publicUrl })

  } catch (err: any) {
    console.error('[IMAGE_ERROR]', err)
    return NextResponse.json({ error: "Creative Engine Timeout" }, { status: 500 })
  }
}