'use client';

import { useState } from 'react';
import { Form, Input, Button, Checkbox, Divider, message, Tabs } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  MobileOutlined,
  WechatOutlined,
  DingdingOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import Image from 'next/image';

import { useAuth } from '@/components/providers/auth-provider';

interface LoginFormValues {
  username: string;
  password: string;
  remember: boolean;
}

interface PhoneLoginFormValues {
  phone: string;
  code: string;
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { login } = useAuth();
  const [form] = Form.useForm();

  // 账号密码登录
  const handleLogin = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      await login(values.username, values.password);
      message.success('登录成功');
    } catch (error) {
      message.error(error instanceof Error ? error.message : '登录失败');
    } finally {
      setLoading(false);
    }
  };

  // 发送验证码
  const handleSendCode = async () => {
    try {
      const phone = form.getFieldValue('phone');
      if (!phone) {
        message.error('请输入手机号');
        return;
      }
      // TODO: 调用发送验证码API
      message.success('验证码已发送');
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      message.error('发送验证码失败');
    }
  };

  // 手机号登录
  const handlePhoneLogin = async (values: PhoneLoginFormValues) => {
    setLoading(true);
    try {
      // TODO: 调用手机号登录API
      message.success('登录成功');
    } catch (error) {
      message.error('登录失败');
    } finally {
      setLoading(false);
    }
  };

  const tabItems = [
    {
      key: 'account',
      label: '账号密码登录',
      children: (
        <Form
          form={form}
          name="login"
          onFinish={handleLogin}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名/邮箱/手机号' }]}
          >
            <Input
              prefix={<UserOutlined className="text-muted-foreground" />}
              placeholder="用户名/邮箱/手机号"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-muted-foreground" />}
              placeholder="密码"
            />
          </Form.Item>

          <Form.Item>
            <div className="flex items-center justify-between">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>记住我</Checkbox>
              </Form.Item>
              <Link href="/forgot-password" className="text-primary hover:text-primary/80">
                忘记密码？
              </Link>
            </div>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              登录
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'phone',
      label: '手机号登录',
      children: (
        <Form
          name="phone-login"
          onFinish={handlePhoneLogin}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="phone"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
            ]}
          >
            <Input
              prefix={<MobileOutlined className="text-muted-foreground" />}
              placeholder="手机号"
            />
          </Form.Item>

          <Form.Item
            name="code"
            rules={[{ required: true, message: '请输入验证码' }]}
          >
            <div className="flex gap-2">
              <Input
                prefix={<LockOutlined className="text-muted-foreground" />}
                placeholder="验证码"
              />
              <Button
                onClick={handleSendCode}
                disabled={countdown > 0}
                style={{ width: 120 }}
              >
                {countdown > 0 ? `${countdown}s` : '获取验证码'}
              </Button>
            </div>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              登录
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen">
      {/* 左侧背景 */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary/80 items-center justify-center p-12">
        <div className="text-white max-w-md">
          <h1 className="text-4xl font-bold mb-4">欢迎使用 Mota</h1>
          <p className="text-lg opacity-90 mb-8">
            AI驱动的智能项目管理平台，让团队协作更高效
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                ✓
              </div>
              <span>智能任务分解与分配</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                ✓
              </div>
              <span>实时协作与文档共享</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                ✓
              </div>
              <span>AI助手全程辅助</span>
            </div>
          </div>
        </div>
      </div>

      {/* 右侧登录表单 */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xl">
                M
              </div>
              <span className="text-2xl font-bold">Mota</span>
            </div>
          </div>

          {/* 标题 */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold mb-2">登录到您的账户</h2>
            <p className="text-muted-foreground">
              还没有账户？{' '}
              <Link href="/register" className="text-primary hover:text-primary/80">
                立即注册
              </Link>
            </p>
          </div>

          {/* 登录表单 */}
          <Tabs items={tabItems} centered />

          {/* 第三方登录 */}
          <Divider plain className="text-muted-foreground">
            其他登录方式
          </Divider>

          <div className="flex justify-center gap-4">
            <Button
              shape="circle"
              size="large"
              icon={<WechatOutlined style={{ color: '#07c160' }} />}
              onClick={() => message.info('企业微信登录')}
            />
            <Button
              shape="circle"
              size="large"
              icon={<DingdingOutlined style={{ color: '#0089ff' }} />}
              onClick={() => message.info('钉钉登录')}
            />
          </div>

          {/* 底部链接 */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            登录即表示您同意我们的{' '}
            <Link href="/terms" className="text-primary hover:underline">
              服务条款
            </Link>{' '}
            和{' '}
            <Link href="/privacy" className="text-primary hover:underline">
              隐私政策
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}