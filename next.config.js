/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.vk.com',
      },
      {
        protocol: 'https',
        hostname: '**.userapi.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.yandex.net',
      },
      {
        protocol: 'https',
        hostname: '**.yandex.net',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
