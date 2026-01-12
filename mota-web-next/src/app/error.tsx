'use client';

import { useEffect } from 'react';
import { Button, Result } from 'antd';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 记录错误到错误报告服务
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Result
        status="error"
        title="出错了"
        subTitle={error.message || '抱歉，页面出现了一些问题'}
        extra={[
          <Button type="primary" key="retry" onClick={reset}>
            重试
          </Button>,
          <Button key="home" onClick={() => window.location.href = '/dashboard'}>
            返回首页
          </Button>,
        ]}
      />
    </div>
  );
}