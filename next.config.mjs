/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use serverExternalPackages instead of experimental
  serverExternalPackages: ['@supabase/ssr'],
  
  images: {
    // remotePatterns is the new standard replacing images.domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;