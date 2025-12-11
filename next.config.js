/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    NEXT_PUBLIC_DESIGN_THEME: process.env.NEXT_PUBLIC_DESIGN_THEME || 'flat',
  },
}

module.exports = nextConfig
