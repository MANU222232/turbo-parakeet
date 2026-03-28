import { withSentryConfig } from '@sentry/nextjs';
import { fileURLToPath } from 'url';
import path from 'path';

/** @type {import('next').NextConfig} */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve the API origin for CSP — supports both http/https and ws/wss.
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
// Build websocket equivalent: http→ws, https→wss
const apiWsUrl = apiUrl.replace(/^http/, 'ws');

const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com https://maps.gstatic.com https://*.stripe.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://*.gstatic.com https://*.googleapis.com https://*.google.com https://*.googleusercontent.com https://*.unsplash.com https://*.pexels.com https://*.pixabay.com https://*.picsum.photos https://*.gravatar.com https://*.pravatar.cc",
              "media-src 'self' https://assets.mixkit.co https://*.pexels.com https://*.pixabay.com",
              `connect-src 'self' https://*.google.com https://*.googleapis.com https://*.stripe.com ${apiUrl} ${apiWsUrl} https://vitals.vercel-insights.com https://ipapi.co`,
              "frame-src 'self' https://*.stripe.com",
            ].join('; '),
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 'videos.pexels.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'i.pravatar.cc' },
      { protocol: 'https', hostname: 'maps.gstatic.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: '*.googleusercontent.com' },
      { protocol: 'https', hostname: 'cdn.pixabay.com' },
      { protocol: 'https', hostname: '*.pravatar.cc' },
      { protocol: 'https', hostname: 'fastly.picsum.photos' },
    ],
  },
  webpack: (config) => {
    // Explicitly resolve the @ alias so Vercel's webpack always finds it,
    // regardless of how tsconfig paths are picked up in a monorepo.
    config.resolve.alias['@'] = __dirname;
    return config;
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  org: "swifttow",
  project: "swifttor-web",
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
});
