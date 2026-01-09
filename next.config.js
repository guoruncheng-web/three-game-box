/** @type {import('next').NextConfig} */
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: false, // 开启 PWA（包括开发环境）
  runtimeCaching: [
    {
      urlPattern: /^https?.*/, // 匹配所有 HTTP(S) 请求
      handler: "NetworkFirst", // 网络优先策略
      options: {
        cacheName: "offlineCache",
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 24 * 60 * 60, // 24 小时
        },
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/, // 图片资源
      handler: "CacheFirst", // 缓存优先
      options: {
        cacheName: "image-cache",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 天
        },
      },
    },
    {
      urlPattern: /\.(?:js|css)$/, // JS 和 CSS 文件
      handler: "StaleWhileRevalidate", // 使用缓存，后台更新
      options: {
        cacheName: "static-resources",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 天
        },
      },
    },
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/, // Google Fonts
      handler: "CacheFirst",
      options: {
        cacheName: "google-fonts-cache",
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 年
        },
      },
    },
    {
      urlPattern: /\/api\/.*/, // API 请求
      handler: "NetworkFirst", // 网络优先
      options: {
        cacheName: "api-cache",
        networkTimeoutSeconds: 5,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 5 * 60, // 5 分钟
        },
      },
    },
  ],
});

const nextConfig = {
  reactStrictMode: true,
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
    ],
  },
  // 支持 Three.js
  transpilePackages: ["three"],
};

module.exports = withPWA(nextConfig);
