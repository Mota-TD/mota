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
      // 代理所有 API 请求到网关 (8080)
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        ws: true,
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