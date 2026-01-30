const fs = require('fs');
const path = require('path');

const template = (title) => `import { PageContainer } from '@ant-design/pro-components';
import { Card } from 'antd';
import React from 'react';

const Page: React.FC = () => {
  return (
    <PageContainer title="${title}">
      <Card>
        <p>${title}页面开发中...</p>
      </Card>
    </PageContainer>
  );
};

export default Page;
`;

const pages = [
  // Tenant
  { path: 'Tenant/PackageList', title: '套餐管理' },
  { path: 'Tenant/OrderList', title: '订单管理' },
  
  // UserManage
  { path: 'UserManage/UserList', title: '用户列表' },
  { path: 'UserManage/UserDetail', title: '用户详情' },
  { path: 'UserManage/Feedback', title: '用户反馈' },
  
  // Content
  { path: 'Content/NewsList', title: '新闻管理' },
  { path: 'Content/NewsEdit', title: '新闻编辑' },
  { path: 'Content/TemplateList', title: '模板管理' },
  { path: 'Content/Audit', title: '内容审核' },
  
  // AI
  { path: 'AI/ModelList', title: 'AI模型管理' },
  { path: 'AI/UsageStats', title: 'AI使用统计' },
  { path: 'AI/CostControl', title: 'AI成本控制' },
  
  // System
  { path: 'System/Config', title: '系统配置' },
  { path: 'System/Role', title: '角色管理' },
  { path: 'System/OperationLog', title: '操作日志' },
  { path: 'System/Monitor', title: '系统监控' },
  
  // Analysis
  { path: 'Analysis/UserAnalysis', title: '用户分析' },
  { path: 'Analysis/Behavior', title: '行为分析' },
  { path: 'Analysis/Report', title: '自定义报表' },
  
  // User
  { path: 'User/Login', title: '登录' },
];

const srcDir = path.join(__dirname, '../src/pages');

pages.forEach(({ path: pagePath, title }) => {
  const fullPath = path.join(srcDir, pagePath);
  
  // 创建目录
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
  
  // 创建文件
  const filePath = path.join(fullPath, 'index.tsx');
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, template(title));
    console.log(`✅ Created: ${pagePath}/index.tsx`);
  } else {
    console.log(`⏭️  Skipped: ${pagePath}/index.tsx (already exists)`);
  }
});

console.log('\n🎉 All placeholder pages created successfully!');