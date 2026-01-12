'use client';

import { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Typography,
  Steps,
  message,
  Result,
} from 'antd';
import {
  PhoneOutlined,
  SafetyOutlined,
  LockOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { apiClient } from '@/lib/api-client';

const { Title, Text, Paragraph } = Typography;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [phone, setPhone] = useState('');

  // 发送验证码
  const handleSendCode = async () => {
    try {
      const phoneValue = form.getFieldValue('phone');
      if (!phoneValue) {
        message.error('请输入手机号');
        return;
      }

      // 验证手机号格式
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phoneRegex.test(phoneValue)) {
        message.error('请输入正确的手机号');
        return;
      }

      // 发送验证码
      await apiClient.post('/api/auth/send-code', {
        phone: phoneValue,
        type: 'reset-password',
      });
      message.success('验证码已发送');
      setPhone(phoneValue);

      // 开始倒计时
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
    } catch (error: any) {
      message.error(error.message || '发送验证码失败');
    }
  };

  // 验证手机号和验证码
  const handleVerify = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields(['phone', 'verifyCode']);

      // 验证验证码
      await apiClient.post('/api/auth/verify-code', {
        phone: values.phone,
        code: values.verifyCode,
        type: 'reset-password',
      });

      setCurrentStep(1);
    } catch (error: any) {
      message.error(error.message || '验证失败');
    } finally {
      setLoading(false);
    }
  };

  // 重置密码
  const handleResetPassword = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields(['password', 'confirmPassword']);

      await apiClient.post('/api/auth/reset-password', {
        phone,
        verifyCode: form.getFieldValue('verifyCode'),
        newPassword: values.password,
      });

      setCurrentStep(2);
    } catch (error: any) {
      message.error(error.message || '重置密码失败');
    } finally {
      setLoading(false);
    }
  };

  // 步骤配置
  const steps = [
    {
      title: '验证身份',
      icon: <PhoneOutlined />,
    },
    {
      title: '设置新密码',
      icon: <LockOutlined />,
    },
    {
      title: '完成',
      icon: <CheckCircleOutlined />,
    },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900">
      <div className="w-full max-w-md">
        {/* 返回登录 */}
        <div className="mb-6">
          <Link href="/login" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary">
            <ArrowLeftOutlined />
            <span>返回登录</span>
          </Link>
        </div>

        {/* 卡片容器 */}
        <div className="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
          {/* 标题 */}
          <div className="mb-8 text-center">
            <Title level={3} className="!mb-2">
              找回密码
            </Title>
            <Text type="secondary">
              {currentStep === 0 && '请输入您的手机号验证身份'}
              {currentStep === 1 && '请设置新的登录密码'}
              {currentStep === 2 && '密码重置成功'}
            </Text>
          </div>

          {/* 步骤条 */}
          <Steps
            current={currentStep}
            items={steps}
            className="mb-8"
            size="small"
          />

          {/* 步骤1：验证身份 */}
          {currentStep === 0 && (
            <Form
              form={form}
              layout="vertical"
              size="large"
              requiredMark={false}
            >
              <Form.Item
                name="phone"
                rules={[
                  { required: true, message: '请输入手机号' },
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
                ]}
              >
                <Input
                  prefix={<PhoneOutlined className="text-gray-400" />}
                  placeholder="请输入注册时的手机号"
                />
              </Form.Item>

              <Form.Item
                name="verifyCode"
                rules={[
                  { required: true, message: '请输入验证码' },
                  { len: 6, message: '验证码为6位数字' },
                ]}
              >
                <div className="flex gap-2">
                  <Input
                    prefix={<SafetyOutlined className="text-gray-400" />}
                    placeholder="验证码"
                    maxLength={6}
                    className="flex-1"
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

              <Form.Item className="mb-0">
                <Button
                  type="primary"
                  block
                  onClick={handleVerify}
                  loading={loading}
                >
                  下一步
                </Button>
              </Form.Item>
            </Form>
          )}

          {/* 步骤2：设置新密码 */}
          {currentStep === 1 && (
            <Form
              form={form}
              layout="vertical"
              size="large"
              requiredMark={false}
            >
              <Form.Item
                name="password"
                rules={[
                  { required: true, message: '请输入新密码' },
                  { min: 8, message: '密码至少8个字符' },
                  {
                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message: '密码需包含大小写字母和数字',
                  },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="设置新密码"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  { required: true, message: '请确认新密码' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('两次输入的密码不一致'));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="确认新密码"
                />
              </Form.Item>

              <div className="mb-4 rounded bg-gray-50 p-3 text-sm text-gray-500 dark:bg-gray-700">
                <Text type="secondary">密码要求：</Text>
                <ul className="mt-1 list-inside list-disc">
                  <li>至少8个字符</li>
                  <li>包含大写字母</li>
                  <li>包含小写字母</li>
                  <li>包含数字</li>
                </ul>
              </div>

              <Form.Item className="mb-0">
                <Button
                  type="primary"
                  block
                  onClick={handleResetPassword}
                  loading={loading}
                >
                  重置密码
                </Button>
              </Form.Item>
            </Form>
          )}

          {/* 步骤3：完成 */}
          {currentStep === 2 && (
            <Result
              status="success"
              title="密码重置成功"
              subTitle="您的密码已成功重置，请使用新密码登录"
              extra={[
                <Button
                  type="primary"
                  key="login"
                  onClick={() => router.push('/login')}
                >
                  立即登录
                </Button>,
              ]}
            />
          )}
        </div>

        {/* 底部提示 */}
        <div className="mt-6 text-center">
          <Text type="secondary">
            如果您无法收到验证码，请联系{' '}
            <Link href="/support" className="text-primary">
              客服支持
            </Link>
          </Text>
        </div>
      </div>
    </div>
  );
}