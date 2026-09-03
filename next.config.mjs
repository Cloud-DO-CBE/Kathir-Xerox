/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(process.env.NEXT_EXPORT === 'true' ? { output: 'export', trailingSlash: true } : {}),
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['ws', '@prisma/client', '@neondatabase/serverless'],
  },
};

export default nextConfig;
