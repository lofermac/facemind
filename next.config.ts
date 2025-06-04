import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  eslint: {
    // ⬅️  desliga o ESLint só no build
    ignoreDuringBuilds: true,
  },
}

export default nextConfig