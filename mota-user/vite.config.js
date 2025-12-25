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
        host: true, // 允许局域网访问
        port: 3000,
        open: true,
        proxy: {
            // 代理认证 API 请求到认证服务 (8081)
            '/api/v1/auth': {
                target: 'http://localhost:8081',
                changeOrigin: true,
                secure: false,
                configure: function (proxy, _options) {
                    proxy.on('error', function (err, _req, _res) {
                        console.log('auth proxy error', err);
                    });
                    proxy.on('proxyReq', function (proxyReq, req, _res) {
                        console.log('Auth Request:', req.method, req.url, '-> target:', proxyReq.path);
                    });
                    proxy.on('proxyRes', function (proxyRes, req, _res) {
                        console.log('Auth Response:', proxyRes.statusCode, req.url);
                    });
                },
            },
            // 代理项目 API 请求到项目服务 (8083)
            '/api': {
                target: 'http://localhost:8083',
                changeOrigin: true,
                secure: false,
                configure: function (proxy, _options) {
                    proxy.on('error', function (err, _req, _res) {
                        console.log('project proxy error', err);
                    });
                    proxy.on('proxyReq', function (proxyReq, req, _res) {
                        console.log('Project Request:', req.method, req.url, '-> target:', proxyReq.path);
                    });
                    proxy.on('proxyRes', function (proxyRes, req, _res) {
                        console.log('Project Response:', proxyRes.statusCode, req.url);
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
