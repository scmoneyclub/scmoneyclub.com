import type { NextConfig } from "next";

const securityHeaders = [
  // Prevents page from being embedded in iframes (clickjacking protection)
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  // Prevents MIME-type sniffing
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // Controls referrer information
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // Disables access to sensitive browser features
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  // Enforces HTTPS (enabled in production only via HSTS)
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Content Security Policy
  // Note: Phantom wallet injects scripts into the page — add 'unsafe-inline' only if required by wallet SDK.
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Scripts: self + inline for Next.js hydration + Recharts/Radix
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      // Styles: self + inline (Tailwind inlines critical CSS)
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Fonts
      "font-src 'self' https://fonts.gstatic.com",
      // Images: self + data URIs + token logos from external CDNs
      "img-src 'self' data: blob: https:",
      // Media: self (video assets)
      "media-src 'self'",
      // API connections: self proxy routes + Solana RPC + wallet extensions
      "connect-src 'self' https://api.mainnet-beta.solana.com https://solana-mainnet.g.alchemy.com wss: https:",
      // Frames: none
      "frame-src 'none'",
      // Objects: none
      "object-src 'none'",
      // Base URI restriction
      "base-uri 'self'",
      // Form submissions only to self
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  images: {
    // Allow token logo images from common crypto CDNs
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.birdeye.so",
      },
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "assets.coingecko.com",
      },
    ],
  },
};

export default nextConfig;
