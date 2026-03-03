/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable Turbopack for production builds to avoid caching issues
  experimental: {
    turbo: undefined,
  },
  output: 'standalone',
};

export default nextConfig;
