// next.config.ts
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // 🛑 disables blocking on lint errors
  },
  experimental: {
    appDir: true,
  },
};

export default nextConfig;
