/** @type {import('next').NextConfig} */
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  // 全局关闭 PWA：不注入 Service Worker、不启用 Workbox 运行时缓存（需要时再改回 false）
  disable: true,
  // 顺序很重要：先匹配先生效。勿把「匹配全部 URL 的正则」放在最前，否则会盖住 API、静态资源等规则。
  runtimeCaching: [
    {
      urlPattern: /\/api\/.*/,
      handler: "NetworkOnly",
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "image-cache",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60,
        },
      },
    },
    {
      urlPattern: /\.(?:js|css)$/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "static-resources",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 7 * 24 * 60 * 60,
        },
      },
    },
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/,
      handler: "CacheFirst",
      options: {
        cacheName: "google-fonts-cache",
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 365 * 24 * 60 * 60,
        },
      },
    },
    {
      urlPattern: /^https?:\/\/.+/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "pages-and-fallback",
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 24 * 60 * 60,
        },
      },
    },
  ],
});

const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // ESLint 在 CI 中单独运行，构建时跳过避免模块解析差异
    ignoreDuringBuilds: true,
  },
  // 使用 Turbopack 配置
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
  // 支持 Three.js
  transpilePackages: ["three"],
};

module.exports = withPWA(nextConfig);
