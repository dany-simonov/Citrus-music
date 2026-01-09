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
        hostname: '**.vk-cdn.net',
      },
      {
        protocol: 'https',
        hostname: '**.vkuseraudio.net',
      },
      {
        protocol: 'https',
        hostname: 'sun*.userapi.com',
      },
      {
        protocol: 'https',
        hostname: 'pp.userapi.com',
      },
      {
        protocol: 'http',
        hostname: '**.vk.com',
      },
      {
        protocol: 'http',
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
    // Разрешаем внешние изображения без оптимизации для проблемных URL
    unoptimized: false,
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
