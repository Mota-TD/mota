import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true, // 允许局域网访问
    port: 3000,
    open: true,
    proxy: {
      // 代理认证 API 请求到认证服务 (8081)
      '/api/v1/auth': {
        target: 'http://127.0.0.1:8081',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('auth proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Auth Request:', req.method, req.url, '-> target:', proxyReq.path);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Auth Response:', proxyRes.statusCode, req.url);
          });
        },
      },
      // 代理 AI 相关 API 请求到 AI 服务 (8083)
      '/api/v1/ai': {
        target: 'http://127.0.0.1:8083',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('ai proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('AI Request:', req.method, req.url, '-> target:', proxyReq.path);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('AI Response:', proxyRes.statusCode, req.url);
          });
        },
      },
      // 代理 AI 新闻 API 请求到项目服务 (8084) - 新闻功能在项目服务中
      '/api/ai/news': {
        target: 'http://127.0.0.1:8084',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('ai news proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('AI News Request:', req.method, req.url, '-> target:', proxyReq.path);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('AI News Response:', proxyRes.statusCode, req.url);
          });
        },
      },
      // 代理其他 API 请求到项目服务 (8084)
      '/api': {
        target: 'http://127.0.0.1:8084',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, req, res) => {
            console.log('project proxy error:', err.message);
            console.log('project proxy error stack:', err.stack);
            // 返回 500 错误
            if (!res.headersSent) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ code: 500, message: '代理错误: ' + err.message }));
            }
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Project Request:', req.method, req.url, '-> target:', proxyReq.path);
            // 打印所有请求头
            console.log('Project Request Headers:', JSON.stringify(req.headers, null, 2));
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Project Response:', proxyRes.statusCode, req.url);
            console.log('Project Response Headers:', JSON.stringify(proxyRes.headers, null, 2));
            // 移除 WWW-Authenticate 头，防止浏览器弹出基本认证对话框
            const headers = proxyRes.headers;
            const keysToDelete: string[] = [];
            for (const key of Object.keys(headers)) {
              if (key.toLowerCase() === 'www-authenticate') {
                keysToDelete.push(key);
              }
            }
            for (const key of keysToDelete) {
              delete headers[key];
            }
          });
        },
      },
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        modifyVars: {
          // Ant Design 主题定制
          '@primary-color': '#2b7de9',
          '@border-radius-base': '8px',
        },
      },
    },
  },
})