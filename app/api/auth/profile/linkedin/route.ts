import { NextResponse } from 'next/server';

export async function GET() {
  // Replace YOUR_CLIENT_ID and YOUR_REDIRECT_URI with your LinkedIn App credentials
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`;
  const scope = 'r_liteprofile r_emailaddress w_member_social';

  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;

  return NextResponse.redirect(authUrl);
}