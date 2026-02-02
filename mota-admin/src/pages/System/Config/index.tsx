import { SaveOutlined, UndoOutlined } from '@ant-design/icons';
import type { ProFormInstance } from '@ant-design/pro-components';
import {
  PageContainer,
  ProCard,
  ProForm,
  ProFormDigit,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Button, Divider, message, Space, Tabs } from 'antd';
import React, { useRef, useState } from 'react';

const SystemConfig: React.FC = () => {
  const [activeTab, setActiveTab] = useState('basic');
  const basicFormRef = useRef<ProFormInstance>(undefined as any);
  const emailFormRef = useRef<ProFormInstance>(undefined as any);
  const storageFormRef = useRef<ProFormInstance>(undefined as any);
  const securityFormRef = useRef<ProFormInstance>(undefined as any);

  // 模拟配置数据
  const mockConfig = {
    basic: {
      siteName: 'Mota管理平台',
      siteUrl: 'https://admin.mota.com',
      companyName: 'Mota Technology Co., Ltd.',
      contactEmail: 'contact@mota.com',
      contactPhone: '+86 400-123-4567',
      icp: '京ICP备12345678号',
      recordNumber: '京公网安备11010802012345号',
      copyright: '© 2024 Mota. All rights reserved.',
      siteDescription:
        '企业级AI智能管理平台，提供全方位的租户管理、用户管理和AI服务管理功能。',
      keywords: 'AI管理,SaaS,租户管理,企业服务',
    },
    email: {
      smtpHost: 'smtp.exmail.qq.com',
      smtpPort: 465,
      smtpUser: 'noreply@mota.com',
      smtpPassword: '********',
      smtpFrom: 'Mota Platform <noreply@mota.com>',
      smtpSecure: true,
      testEmail: '',
    },
    storage: {
      storageType: 'oss',
      ossEndpoint: 'oss-cn-beijing.aliyuncs.com',
      ossBucket: 'mota-files',
      ossAccessKey: 'LTAI***************',
      ossSecretKey: '********',
      ossRegion: 'cn-beijing',
      maxFileSize: 10,
      allowedExtensions: 'jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx,ppt,pptx',
      cdnDomain: 'https://cdn.mota.com',
    },
    security: {
      sessionTimeout: 7200,
      passwordMinLength: 8,
      passwordRequireNumber: true,
      passwordRequireUppercase: true,
      passwordRequireSpecial: true,
      maxLoginAttempts: 5,
      lockoutDuration: 1800,
      enableCaptcha: true,
      enableTwoFactor: false,
      allowedIPs: '',
      enableApiRateLimit: true,
      apiRateLimit: 1000,
      enableAuditLog: true,
    },
  };

  // 保存基础配置
  const handleSaveBasic = async (values: any) => {
    console.log('保存基础配置:', values);
    message.success('基础配置保存成功');
    return true;
  };

  // 保存邮件配置
  const handleSaveEmail = async (values: any) => {
    console.log('保存邮件配置:', values);
    message.success('邮件配置保存成功');
    return true;
  };

  // 测试邮件
  const handleTestEmail = async () => {
    const testEmail = emailFormRef.current?.getFieldValue('testEmail');
    if (!testEmail) {
      message.warning('请输入测试邮箱地址');
      return;
    }
    message.loading('发送测试邮件中...', 0);
    setTimeout(() => {
      message.destroy();
      message.success('测试邮件发送成功，请检查邮箱');
    }, 2000);
  };

  // 保存存储配置
  const handleSaveStorage = async (values: any) => {
    console.log('保存存储配置:', values);
    message.success('存储配置保存成功');
    return true;
  };

  // 保存安全配置
  const handleSaveSecurity = async (values: any) => {
    console.log('保存安全配置:', values);
    message.success('安全配置保存成功');
    return true;
  };

  // 重置表单
  const handleReset = (formRef: React.RefObject<ProFormInstance>) => {
    formRef.current?.resetFields();
    message.info('已重置为初始值');
  };

  return (
    <PageContainer>
      <ProCard>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'basic',
              label: '基础配置',
              children: (
                <ProForm
                  formRef={basicFormRef}
                  initialValues={mockConfig.basic}
                  onFinish={handleSaveBasic}
                  submitter={{
                    render: (_, dom) => (
                      <Space
                        style={{ width: '100%', justifyContent: 'center' }}
                      >
                        {dom}
                        <Button
                          icon={<UndoOutlined />}
                          onClick={() => handleReset(basicFormRef)}
                        >
                          重置
                        </Button>
                      </Space>
                    ),
                    submitButtonProps: {
                      icon: <SaveOutlined />,
                    },
                  }}
                >
                  <Divider orientation="left">网站信息</Divider>
                  <ProFormText
                    name="siteName"
                    label="网站名称"
                    placeholder="请输入网站名称"
                    rules={[{ required: true, message: '请输入网站名称' }]}
                    width="lg"
                  />
                  <ProFormText
                    name="siteUrl"
                    label="网站地址"
                    placeholder="请输入网站地址"
                    rules={[
                      { required: true, message: '请输入网站地址' },
                      { type: 'url', message: '请输入有效的URL' },
                    ]}
                    width="lg"
                  />
                  <ProFormTextArea
                    name="siteDescription"
                    label="网站描述"
                    placeholder="请输入网站描述"
                    fieldProps={{ rows: 3 }}
                    width="lg"
                  />
                  <ProFormText
                    name="keywords"
                    label="网站关键词"
                    placeholder="请输入关键词，用逗号分隔"
                    width="lg"
                  />

                  <Divider orientation="left">公司信息</Divider>
                  <ProFormText
                    name="companyName"
                    label="公司名称"
                    placeholder="请输入公司名称"
                    rules={[{ required: true, message: '请输入公司名称' }]}
                    width="lg"
                  />
                  <ProFormText
                    name="contactEmail"
                    label="联系邮箱"
                    placeholder="请输入联系邮箱"
                    rules={[
                      { required: true, message: '请输入联系邮箱' },
                      { type: 'email', message: '请输入有效的邮箱地址' },
                    ]}
                    width="lg"
                  />
                  <ProFormText
                    name="contactPhone"
                    label="联系电话"
                    placeholder="请输入联系电话"
                    width="lg"
                  />

                  <Divider orientation="left">备案信息</Divider>
                  <ProFormText
                    name="icp"
                    label="ICP备案号"
                    placeholder="请输入ICP备案号"
                    width="lg"
                  />
                  <ProFormText
                    name="recordNumber"
                    label="公安备案号"
                    placeholder="请输入公安备案号"
                    width="lg"
                  />
                  <ProFormText
                    name="copyright"
                    label="版权信息"
                    placeholder="请输入版权信息"
                    width="lg"
                  />
                </ProForm>
              ),
            },
            {
              key: 'email',
              label: '邮件配置',
              children: (
                <ProForm
                  formRef={emailFormRef}
                  initialValues={mockConfig.email}
                  onFinish={handleSaveEmail}
                  submitter={{
                    render: (_, dom) => (
                      <Space
                        style={{ width: '100%', justifyContent: 'center' }}
                      >
                        {dom}
                        <Button onClick={handleTestEmail}>发送测试邮件</Button>
                        <Button
                          icon={<UndoOutlined />}
                          onClick={() => handleReset(emailFormRef)}
                        >
                          重置
                        </Button>
                      </Space>
                    ),
                    submitButtonProps: {
                      icon: <SaveOutlined />,
                    },
                  }}
                >
                  <Divider orientation="left">SMTP服务器配置</Divider>
                  <ProFormText
                    name="smtpHost"
                    label="SMTP服务器"
                    placeholder="请输入SMTP服务器地址"
                    rules={[
                      { required: true, message: '请输入SMTP服务器地址' },
                    ]}
                    width="lg"
                  />
                  <ProFormDigit
                    name="smtpPort"
                    label="SMTP端口"
                    placeholder="请输入SMTP端口"
                    rules={[{ required: true, message: '请输入SMTP端口' }]}
                    fieldProps={{ min: 1, max: 65535 }}
                    width="lg"
                  />
                  <ProFormText
                    name="smtpUser"
                    label="SMTP用户名"
                    placeholder="请输入SMTP用户名"
                    rules={[{ required: true, message: '请输入SMTP用户名' }]}
                    width="lg"
                  />
                  <ProFormText.Password
                    name="smtpPassword"
                    label="SMTP密码"
                    placeholder="请输入SMTP密码"
                    rules={[{ required: true, message: '请输入SMTP密码' }]}
                    width="lg"
                  />
                  <ProFormText
                    name="smtpFrom"
                    label="发件人"
                    placeholder="请输入发件人，格式：名称 <邮箱>"
                    rules={[{ required: true, message: '请输入发件人' }]}
                    width="lg"
                  />
                  <ProFormSwitch
                    name="smtpSecure"
                    label="启用SSL/TLS"
                    width="lg"
                  />

                  <Divider orientation="left">测试邮件</Divider>
                  <ProFormText
                    name="testEmail"
                    label="测试邮箱"
                    placeholder="请输入测试邮箱地址"
                    rules={[{ type: 'email', message: '请输入有效的邮箱地址' }]}
                    width="lg"
                    extra="用于测试邮件发送功能"
                  />
                </ProForm>
              ),
            },
            {
              key: 'storage',
              label: '存储配置',
              children: (
                <ProForm
                  formRef={storageFormRef}
                  initialValues={mockConfig.storage}
                  onFinish={handleSaveStorage}
                  submitter={{
                    render: (_, dom) => (
                      <Space
                        style={{ width: '100%', justifyContent: 'center' }}
                      >
                        {dom}
                        <Button
                          icon={<UndoOutlined />}
                          onClick={() => handleReset(storageFormRef)}
                        >
                          重置
                        </Button>
                      </Space>
                    ),
                    submitButtonProps: {
                      icon: <SaveOutlined />,
                    },
                  }}
                >
                  <Divider orientation="left">存储类型</Divider>
                  <ProFormSelect
                    name="storageType"
                    label="存储类型"
                    placeholder="请选择存储类型"
                    options={[
                      { label: '阿里云OSS', value: 'oss' },
                      { label: '腾讯云COS', value: 'cos' },
                      { label: 'AWS S3', value: 's3' },
                      { label: '本地存储', value: 'local' },
                    ]}
                    rules={[{ required: true, message: '请选择存储类型' }]}
                    width="lg"
                  />

                  <Divider orientation="left">OSS配置</Divider>
                  <ProFormText
                    name="ossEndpoint"
                    label="OSS Endpoint"
                    placeholder="请输入OSS Endpoint"
                    rules={[{ required: true, message: '请输入OSS Endpoint' }]}
                    width="lg"
                  />
                  <ProFormText
                    name="ossBucket"
                    label="OSS Bucket"
                    placeholder="请输入OSS Bucket"
                    rules={[{ required: true, message: '请输入OSS Bucket' }]}
                    width="lg"
                  />
                  <ProFormText
                    name="ossAccessKey"
                    label="Access Key"
                    placeholder="请输入Access Key"
                    rules={[{ required: true, message: '请输入Access Key' }]}
                    width="lg"
                  />
                  <ProFormText.Password
                    name="ossSecretKey"
                    label="Secret Key"
                    placeholder="请输入Secret Key"
                    rules={[{ required: true, message: '请输入Secret Key' }]}
                    width="lg"
                  />
                  <ProFormText
                    name="ossRegion"
                    label="OSS Region"
                    placeholder="请输入OSS Region"
                    width="lg"
                  />

                  <Divider orientation="left">上传限制</Divider>
                  <ProFormDigit
                    name="maxFileSize"
                    label="最大文件大小"
                    placeholder="请输入最大文件大小"
                    fieldProps={{ min: 1, max: 1024, addonAfter: 'MB' }}
                    width="lg"
                  />
                  <ProFormText
                    name="allowedExtensions"
                    label="允许的文件类型"
                    placeholder="请输入允许的文件扩展名，用逗号分隔"
                    width="lg"
                  />
                  <ProFormText
                    name="cdnDomain"
                    label="CDN域名"
                    placeholder="请输入CDN域名"
                    rules={[{ type: 'url', message: '请输入有效的URL' }]}
                    width="lg"
                    extra="用于加速文件访问"
                  />
                </ProForm>
              ),
            },
            {
              key: 'security',
              label: '安全配置',
              children: (
                <ProForm
                  formRef={securityFormRef}
                  initialValues={mockConfig.security}
                  onFinish={handleSaveSecurity}
                  submitter={{
                    render: (_, dom) => (
                      <Space
                        style={{ width: '100%', justifyContent: 'center' }}
                      >
                        {dom}
                        <Button
                          icon={<UndoOutlined />}
                          onClick={() => handleReset(securityFormRef)}
                        >
                          重置
                        </Button>
                      </Space>
                    ),
                    submitButtonProps: {
                      icon: <SaveOutlined />,
                    },
                  }}
                >
                  <Divider orientation="left">会话安全</Divider>
                  <ProFormDigit
                    name="sessionTimeout"
                    label="会话超时时间"
                    placeholder="请输入会话超时时间"
                    fieldProps={{ min: 300, max: 86400, addonAfter: '秒' }}
                    width="lg"
                    extra="用户无操作后自动退出的时间"
                  />

                  <Divider orientation="left">密码策略</Divider>
                  <ProFormDigit
                    name="passwordMinLength"
                    label="密码最小长度"
                    placeholder="请输入密码最小长度"
                    fieldProps={{ min: 6, max: 32 }}
                    width="lg"
                  />
                  <ProFormSwitch
                    name="passwordRequireNumber"
                    label="要求包含数字"
                    width="lg"
                  />
                  <ProFormSwitch
                    name="passwordRequireUppercase"
                    label="要求包含大写字母"
                    width="lg"
                  />
                  <ProFormSwitch
                    name="passwordRequireSpecial"
                    label="要求包含特殊字符"
                    width="lg"
                  />

                  <Divider orientation="left">登录安全</Divider>
                  <ProFormDigit
                    name="maxLoginAttempts"
                    label="最大登录尝试次数"
                    placeholder="请输入最大登录尝试次数"
                    fieldProps={{ min: 3, max: 10 }}
                    width="lg"
                  />
                  <ProFormDigit
                    name="lockoutDuration"
                    label="账号锁定时长"
                    placeholder="请输入账号锁定时长"
                    fieldProps={{ min: 300, max: 86400, addonAfter: '秒' }}
                    width="lg"
                  />
                  <ProFormSwitch
                    name="enableCaptcha"
                    label="启用验证码"
                    width="lg"
                  />
                  <ProFormSwitch
                    name="enableTwoFactor"
                    label="启用双因素认证"
                    width="lg"
                  />

                  <Divider orientation="left">IP白名单</Divider>
                  <ProFormTextArea
                    name="allowedIPs"
                    label="允许的IP地址"
                    placeholder="请输入允许的IP地址，每行一个，支持CIDR格式"
                    fieldProps={{ rows: 4 }}
                    width="lg"
                    extra="留空则允许所有IP访问"
                  />

                  <Divider orientation="left">API安全</Divider>
                  <ProFormSwitch
                    name="enableApiRateLimit"
                    label="启用API限流"
                    width="lg"
                  />
                  <ProFormDigit
                    name="apiRateLimit"
                    label="API调用限制"
                    placeholder="请输入API调用限制"
                    fieldProps={{
                      min: 100,
                      max: 100000,
                      addonAfter: '次/小时',
                    }}
                    width="lg"
                  />

                  <Divider orientation="left">审计日志</Divider>
                  <ProFormSwitch
                    name="enableAuditLog"
                    label="启用审计日志"
                    width="lg"
                    extra="记录所有关键操作，用于安全审计"
                  />
                </ProForm>
              ),
            },
          ]}
        />
      </ProCard>
    </PageContainer>
  );
};

export default SystemConfig;
