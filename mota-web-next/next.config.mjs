/** @type {import('next').NextConfig} */
const nextConfig = {
  // 启用React严格模式
  reactStrictMode: true,
  
  // 输出模式：standalone用于Docker部署
  output: 'standalone',
  
  // 图片优化配置
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.mota.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  
  // 实验性功能
  experimental: {
    // 优化包导入
    optimizePackageImports: ['antd', '@ant-design/icons', 'lodash-es', 'recharts'],
  },
  
  // 环境变量
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001',
  },
  
  // 重定向配置
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: false,
      },
    ];
  },
  
  // 重写配置（API代理）
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/:path*`,
      },
    ];
  },
  
  // 自定义headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Webpack配置
  webpack: (config, { isServer }) => {
    // Monaco Editor配置
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    
    return config;
  },
  
  // 编译器选项
  compiler: {
    // 移除console.log（生产环境）
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // 页面扩展名
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  
  // 压缩
  compress: true,
  
  // 生成ETags
  generateEtags: true,
  
  // 尾部斜杠
  trailingSlash: false,
  
  // 构建时忽略TypeScript错误（开发阶段）
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // 构建时忽略ESLint错误（开发阶段）
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;