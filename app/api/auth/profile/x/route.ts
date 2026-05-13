import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.X_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`;
  // X uses OAuth 2.0 PKCE - this is a basic redirect
  const scope = 'tweet.read tweet.write users.read offline.access';

  const authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=state&code_challenge=challenge&code_challenge_method=plain`;

  return NextResponse.redirect(authUrl);
}