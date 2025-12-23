import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 3000,
        open: true,
        proxy: {
            // 代理 API 请求到网关服务
            '/api': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                secure: false,
                configure: function (proxy, _options) {
                    proxy.on('error', function (err, _req, _res) {
                        console.log('proxy error', err);
                    });
                    proxy.on('proxyReq', function (proxyReq, req, _res) {
                        console.log('Sending Request:', req.method, req.url, '-> target:', proxyReq.path);
                    });
                    proxy.on('proxyRes', function (proxyRes, req, _res) {
                        console.log('Received Response:', proxyRes.statusCode, req.url);
                        // 移除 WWW-Authenticate 头，防止浏览器弹出基本认证对话框
                        var headers = proxyRes.headers;
                        var keysToDelete = [];
                        for (var _i = 0, _a = Object.keys(headers); _i < _a.length; _i++) {
                            var key = _a[_i];
                            if (key.toLowerCase() === 'www-authenticate') {
                                keysToDelete.push(key);
                            }
                        }
                        for (var _b = 0, keysToDelete_1 = keysToDelete; _b < keysToDelete_1.length; _b++) {
                            var key = keysToDelete_1[_b];
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
});
