import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { campaignTopic } = await req.json();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const posts = [];
  for (let day = 1; day <= 7; day++) {
    // 90/10 Rule Logic
    const creativePrompt = `Professional B2B visual metaphor for ${campaignTopic}. 90% cinematic industrial scenery, 10% clean negative space for 'DAY ${day}' text. 8k, minimalist corporate aesthetic.`;
    
    // Stealth Image Generation (Bypasses Localhost Redirect)
    const aiUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(creativePrompt)}?width=1024&height=1024&nologo=true&model=flux`;
    const imgRes = await fetch(aiUrl);
    const blob = await imgRes.blob();
    
    // Upload to YOUR storage (Free hosting)
    const path = `${user.id}/campaigns/day-${day}-${Date.now()}.png`;
    await supabase.storage.from('content-images').upload(path, blob);
    const { data: { publicUrl } } = supabase.storage.from('content-images').getPublicUrl(path);

    // Save Draft
    const { data: post } = await supabase.from('content_items').insert({
      user_id: user.id,
      image_url: publicUrl,
      headline: `Hook for ${campaignTopic} - Day ${day}`,
      body_content: `Expert manufacturing insight for ${campaignTopic}...`,
      status: 'draft',
      scheduled_at: new Date(Date.now() + day * 24 * 60 * 60 * 1000).toISOString()
    }).select().single();
    
    posts.push(post);
  }
  return NextResponse.json({ posts });
}