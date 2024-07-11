/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
