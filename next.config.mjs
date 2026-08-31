/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(process.env.NEXT_EXPORT === 'true' ? { output: 'export', trailingSlash: true } : {}),
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
};

export default nextConfig;
