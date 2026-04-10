import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Allow embedding in iframes from ribitboats.com
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://ribitboats.com https://*.ribitboats.com https://*.vercel.app",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
