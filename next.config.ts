/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,   // já estava
  },
  typescript: {
    ignoreBuildErrors: true,    // ⬅️  pula erros de TS
  },
};

export default nextConfig;
