import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET() {
  const { data: posts } = await supabase
    .from('content_items')
    .select('*, profiles(*)')
    .eq('status', 'scheduled')
    .lte('scheduled_at', new Date().toISOString());

  if (!posts) return Response.json({ status: "No posts" });

  for (const post of posts) {
    const user = post.profiles;

    // --- 1. LINKEDIN POST ---
    if (user.linkedin_token) {
      await fetch('https://api.linkedin.com/v2/ugcPosts', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user.linkedin_token}` },
        body: JSON.stringify({
          "author": `urn:li:person:${user.linkedin_id}`,
          "lifecycleState": "PUBLISHED",
          "specificContent": {
            "com.linkedin.ugc.ShareContent": {
              "shareCommentary": { "text": post.body_content },
              "shareMediaCategory": "IMAGE",
              "media": [{ "status": "READY", "originalUrl": post.image_url }]
            }
          },
          "visibility": { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" }
        })
      });
    }

    // --- 2. INSTAGRAM POST (via Meta Graph API) ---
    if (user.meta_token) {
      // Step A: Create Media Container
      const container = await fetch(`https://graph.facebook.com/v20.0/${user.ig_user_id}/media?image_url=${encodeURIComponent(post.image_url)}&caption=${encodeURIComponent(post.body_content)}&access_token=${user.meta_token}`, { method: 'POST' }).then(r => r.json());
      // Step B: Publish
      await fetch(`https://graph.facebook.com/v20.0/${user.ig_user_id}/media_publish?creation_id=${container.id}&access_token=${user.meta_token}`, { method: 'POST' });
    }

    // --- 3. FACEBOOK POST ---
    if (user.meta_token) {
      await fetch(`https://graph.facebook.com/v20.0/${user.fb_page_id}/photos?url=${encodeURIComponent(post.image_url)}&message=${encodeURIComponent(post.body_content)}&access_token=${user.meta_token}`, { method: 'POST' });
    }

    // --- 4. X (TWITTER) POST ---
    if (user.x_token) {
      // Use 'twitter-api-v2' library for easier free-tier posting
      // Requires OAuth 1.0a User Context (Free for 1,500 posts/mo)
    }
    // Inside your for-loop for posts
    if (user.meta_token && process.env.META_APP_ID) {
    // Only run this if the keys exist
    
  await postToMeta(post);
} else {
  console.log("Skipping Meta: Keys or user token not provided.");
}
    await supabase.from('content_items').update({ status: 'posted' }).eq('id', post.id);
  }
  return Response.json({ success: true });
}