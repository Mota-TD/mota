/**
 * 页面加载组件
 */

import { Spin } from 'antd';
import React from 'react';

const PageLoading: React.FC<{ tip?: string }> = ({ tip = '加载中...' }) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        width: '100%',
      }}
    >
      <Spin size="large" tip={tip} />
    </div>
  );
};

export default PageLoading;
