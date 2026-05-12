import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { imageUrl, postBody } = await req.json();

  const response = await fetch("https://app.ayrshare.com/api/post", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.AYRSHARE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      post: postBody,
      mediaUrls: [imageUrl],
      platforms: ["linkedin", "instagram", "facebook"], // Your chosen socials
    }),
  });

  const result = await response.json();
  return NextResponse.json(result);
}