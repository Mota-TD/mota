import { GlobalOutlined, SafetyCertificateOutlined, CustomerServiceOutlined } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-components';
import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <DefaultFooter
      style={{
        background: 'none',
        padding: '16px 50px',
      }}
      copyright={`${currentYear} 摩塔科技 Mota Tech. All rights reserved.`}
      links={[
        {
          key: 'mota-home',
          title: (
            <span style={{ color: '#10B981' }}>
              <GlobalOutlined style={{ marginRight: 4 }} />
              摩塔官网
            </span>
          ),
          href: '/',
          blankTarget: false,
        },
        {
          key: 'mota-docs',
          title: (
            <span style={{ color: '#64748B' }}>
              <SafetyCertificateOutlined style={{ marginRight: 4 }} />
              服务协议
            </span>
          ),
          href: '/docs/terms',
          blankTarget: false,
        },
        {
          key: 'mota-support',
          title: (
            <span style={{ color: '#64748B' }}>
              <CustomerServiceOutlined style={{ marginRight: 4 }} />
              技术支持
            </span>
          ),
          href: '/support',
          blankTarget: false,
        },
      ]}
    />
  );
};

export default Footer;
