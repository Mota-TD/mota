'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 记录错误到错误报告服务
    console.error('Global error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          backgroundColor: '#f5f5f5',
        }}>
          <div style={{
            textAlign: 'center',
            padding: '40px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}>
            <h1 style={{ color: '#ff4d4f', marginBottom: '16px' }}>系统错误</h1>
            <p style={{ color: '#666', marginBottom: '24px' }}>
              {error.message || '抱歉，系统出现了一些问题'}
            </p>
            <button
              onClick={reset}
              style={{
                padding: '8px 24px',
                backgroundColor: '#1890ff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginRight: '12px',
              }}
            >
              重试
            </button>
            <button
              onClick={() => window.location.href = '/'}
              style={{
                padding: '8px 24px',
                backgroundColor: '#fff',
                color: '#333',
                border: '1px solid #d9d9d9',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              返回首页
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}