import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.META_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`;
  const scope = 'public_profile,email,pages_show_list,instagram_basic';

  const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;

  return NextResponse.redirect(authUrl);
}