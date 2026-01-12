import Link from 'next/link';

export default function NotFound() {
  return (
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
        <h1 style={{ fontSize: '72px', color: '#1890ff', marginBottom: '16px' }}>404</h1>
        <h2 style={{ color: '#333', marginBottom: '8px' }}>页面未找到</h2>
        <p style={{ color: '#666', marginBottom: '24px' }}>
          抱歉，您访问的页面不存在
        </p>
        <Link
          href="/dashboard"
          style={{
            display: 'inline-block',
            padding: '8px 24px',
            backgroundColor: '#1890ff',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
          }}
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}