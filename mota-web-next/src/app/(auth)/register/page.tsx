'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Form,
  Input,
  Button,
  Checkbox,
  Typography,
  Space,
  Divider,
  Steps,
  message,
  Cascader,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  BankOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { apiClient } from '@/lib/api-client';

const { Title, Text, Paragraph } = Typography;

// 注册表单数据类型
interface RegisterFormData {
  username: string;
  email?: string;
  phone: string;
  password: string;
  confirmPassword: string;
  enterpriseName: string;
  industryId: string | number;
  inviteCode?: string;
  agreement: boolean;
}

// 行业类型
interface Industry {
  id: string | number;
  name: string;
  code: string;
  parentId?: string | number | null;
  level?: number;
  children?: Industry[];
}

// Cascader 选项类型
interface CascaderOption {
  value: string | number;
  label: string;
  children?: CascaderOption[];
}

export default function RegisterPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [hasInviteCode, setHasInviteCode] = useState(false);

  // 获取行业列表
  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        const response = await apiClient.get<{ data: Industry[] }>('/api/v1/auth/industries');
        if (response.data?.data) {
          setIndustries(response.data.data);
        }
      } catch (error) {
        console.error('获取行业列表失败:', error);
        // 使用默认行业列表
        setIndustries([
          { id: 1, name: '互联网/IT', code: 'IT', level: 1, parentId: null },
          { id: 2, name: '金融/银行', code: 'FINANCE', level: 1, parentId: null },
          { id: 3, name: '制造业', code: 'MANUFACTURING', level: 1, parentId: null },
          { id: 4, name: '教育/培训', code: 'EDUCATION', level: 1, parentId: null },
          { id: 5, name: '医疗/健康', code: 'HEALTHCARE', level: 1, parentId: null },
          { id: 6, name: '零售/电商', code: 'RETAIL', level: 1, parentId: null },
          { id: 7, name: '房地产/建筑', code: 'REALESTATE', level: 1, parentId: null },
          { id: 8, name: '政府/公共事业', code: 'GOVERNMENT', level: 1, parentId: null },
          { id: 9, name: '其他', code: 'OTHER', level: 1, parentId: null },
        ]);
      }
    };
    fetchIndustries();
  }, []);

  // 将平铺的行业数据转换为树形结构
  const industryOptions = useMemo((): CascaderOption[] => {
    // 获取一级行业（parentId 为 null 或 undefined）
    const topLevelIndustries = industries.filter(
      (ind) => ind.parentId === null || ind.parentId === undefined || ind.level === 1
    );

    // 构建树形结构
    return topLevelIndustries.map((parent) => {
      // 获取该一级行业下的二级行业
      const children = industries.filter(
        (ind) => ind.parentId === parent.id || (ind.parentId && String(ind.parentId) === String(parent.id))
      );

      return {
        value: parent.id,
        label: parent.name,
        children: children.length > 0
          ? children.map((child) => ({
              value: child.id,
              label: child.name,
            }))
          : undefined,
      };
    });
  }, [industries]);

  // 下一步
  const handleNext = async () => {
    try {
      if (currentStep === 0) {
        // 验证基本信息
        await form.validateFields(['username', 'phone', 'email']);
        setCurrentStep(1);
      } else if (currentStep === 1) {
        // 验证密码
        await form.validateFields(['password', 'confirmPassword']);
        setCurrentStep(2);
      }
    } catch (error) {
      // 表单验证失败
    }
  };

  // 上一步
  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  // 提交注册
  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      const registerData = {
        username: values.username,
        email: values.email || null,
        phone: values.phone,
        password: values.password,
        confirmPassword: values.confirmPassword,
        enterpriseName: values.enterpriseName,
        industryId: values.industryId,
        inviteCode: hasInviteCode ? values.inviteCode : null,
      };

      await apiClient.post('/api/v1/auth/register', registerData);
      message.success('注册成功！请登录');
      
      // 跳转到登录页
      router.push('/login?registered=true');
    } catch (error: any) {
      message.error(error.response?.data?.message || error.message || '注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 步骤配置
  const steps = [
    {
      title: '基本信息',
      icon: <UserOutlined />,
    },
    {
      title: '设置密码',
      icon: <LockOutlined />,
    },
    {
      title: '企业信息',
      icon: <TeamOutlined />,
    },
  ];

  return (
    <div className="flex min-h-screen">
      {/* 左侧装饰区域 */}
      <div className="hidden w-1/2 bg-gradient-to-br from-primary to-primary-dark lg:flex lg:flex-col lg:items-center lg:justify-center">
        <div className="max-w-md px-8 text-center text-white">
          <Title level={1} className="!text-white">
            加入 Mota
          </Title>
          <Paragraph className="text-lg text-white/80">
            开启智能化项目管理之旅，让团队协作更高效
          </Paragraph>
          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3 rounded-lg bg-white/10 p-4">
              <CheckCircleOutlined className="text-2xl" />
              <Text className="text-white">AI 驱动的智能任务分配</Text>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-white/10 p-4">
              <CheckCircleOutlined className="text-2xl" />
              <Text className="text-white">实时协作与进度追踪</Text>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-white/10 p-4">
              <CheckCircleOutlined className="text-2xl" />
              <Text className="text-white">企业级安全与权限管理</Text>
            </div>
          </div>
        </div>
      </div>

      {/* 右侧注册表单 */}
      <div className="flex w-full items-center justify-center px-4 py-8 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 text-center">
            <Link href="/" className="inline-block">
              <Title level={2} className="!mb-2 text-primary">
                Mota
              </Title>
            </Link>
            <Text type="secondary">创建您的账户</Text>
          </div>

          {/* 步骤条 */}
          <Steps
            current={currentStep}
            items={steps}
            className="mb-8"
            size="small"
          />

          {/* 注册表单 */}
          <Form
            form={form}
            layout="vertical"
            size="large"
            requiredMark={false}
          >
            {/* 步骤1：基本信息 */}
            <div style={{ display: currentStep === 0 ? 'block' : 'none' }}>
              <Form.Item
                name="username"
                rules={[
                  { required: true, message: '请输入用户名' },
                  { min: 3, max: 20, message: '用户名长度为3-20个字符' },
                  { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线' },
                ]}
              >
                <Input
                  prefix={<UserOutlined className="text-gray-400" />}
                  placeholder="用户名"
                />
              </Form.Item>

              <Form.Item
                name="phone"
                rules={[
                  { required: true, message: '请输入手机号' },
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
                ]}
              >
                <Input
                  prefix={<PhoneOutlined className="text-gray-400" />}
                  placeholder="手机号"
                />
              </Form.Item>

              <Form.Item
                name="email"
                rules={[
                  { type: 'email', message: '请输入正确的邮箱格式' },
                ]}
              >
                <Input
                  prefix={<MailOutlined className="text-gray-400" />}
                  placeholder="邮箱（选填）"
                />
              </Form.Item>
            </div>

            {/* 步骤2：设置密码 */}
            <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
              <Form.Item
                name="password"
                rules={[
                  { required: true, message: '请输入密码' },
                  { min: 6, message: '密码至少6个字符' },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="设置密码"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  { required: true, message: '请确认密码' },
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
                  placeholder="确认密码"
                />
              </Form.Item>

              <div className="mb-4 rounded bg-gray-50 p-3 text-sm text-gray-500 dark:bg-gray-800">
                <Text type="secondary">密码要求：</Text>
                <ul className="mt-1 list-inside list-disc">
                  <li>至少6个字符</li>
                </ul>
              </div>
            </div>

            {/* 步骤3：企业信息 */}
            <div style={{ display: currentStep === 2 ? 'block' : 'none' }}>
              {/* 邀请码选项 */}
              <div className="mb-4">
                <Checkbox
                  checked={hasInviteCode}
                  onChange={(e) => setHasInviteCode(e.target.checked)}
                >
                  我有邀请码（加入已有企业）
                </Checkbox>
              </div>

              {hasInviteCode ? (
                <Form.Item
                  name="inviteCode"
                  rules={[{ required: true, message: '请输入邀请码' }]}
                >
                  <Input
                    prefix={<TeamOutlined className="text-gray-400" />}
                    placeholder="邀请码"
                  />
                </Form.Item>
              ) : (
                <>
                  <Form.Item
                    name="enterpriseName"
                    rules={[
                      { required: true, message: '请输入企业名称' },
                      { min: 2, max: 50, message: '企业名称长度为2-50个字符' },
                    ]}
                  >
                    <Input
                      prefix={<BankOutlined className="text-gray-400" />}
                      placeholder="企业名称"
                    />
                  </Form.Item>

                  <Form.Item
                    name="industryId"
                    rules={[{ required: true, message: '请选择所属行业' }]}
                    getValueFromEvent={(value: (string | number)[]) => {
                      // 返回最后一级选中的值（二级行业ID，如果没有二级则返回一级）
                      return value && value.length > 0 ? value[value.length - 1] : undefined;
                    }}
                    getValueProps={(value: string | number) => {
                      // 根据ID找到完整的级联路径
                      if (!value) return { value: undefined };
                      
                      // 查找该行业
                      const industry = industries.find((ind) => ind.id === value || String(ind.id) === String(value));
                      if (!industry) return { value: undefined };
                      
                      // 如果是一级行业
                      if (!industry.parentId || industry.level === 1) {
                        return { value: [value] };
                      }
                      
                      // 如果是二级行业，需要返回 [一级ID, 二级ID]
                      return { value: [industry.parentId, value] };
                    }}
                  >
                    <Cascader
                      options={industryOptions}
                      placeholder="选择所属行业"
                      expandTrigger="hover"
                      changeOnSelect
                      showSearch={{
                        filter: (inputValue, path) =>
                          path.some(
                            (option) =>
                              (option.label as string)
                                .toLowerCase()
                                .indexOf(inputValue.toLowerCase()) > -1
                          ),
                      }}
                    />
                  </Form.Item>
                </>
              )}

              <Form.Item
                name="agreement"
                valuePropName="checked"
                rules={[
                  {
                    validator: (_, value) =>
                      value
                        ? Promise.resolve()
                        : Promise.reject(new Error('请阅读并同意服务协议')),
                  },
                ]}
              >
                <Checkbox>
                  我已阅读并同意{' '}
                  <Link href="/terms" className="text-primary">
                    服务协议
                  </Link>{' '}
                  和{' '}
                  <Link href="/privacy" className="text-primary">
                    隐私政策
                  </Link>
                </Checkbox>
              </Form.Item>
            </div>

            {/* 操作按钮 */}
            <Form.Item className="mb-4">
              <Space className="w-full" direction="vertical">
                <div className="flex gap-4">
                  {currentStep > 0 && (
                    <Button onClick={handlePrev} className="flex-1">
                      上一步
                    </Button>
                  )}
                  {currentStep < steps.length - 1 ? (
                    <Button
                      type="primary"
                      onClick={handleNext}
                      className="flex-1"
                    >
                      下一步
                    </Button>
                  ) : (
                    <Button
                      type="primary"
                      onClick={handleSubmit}
                      loading={loading}
                      className="flex-1"
                    >
                      完成注册
                    </Button>
                  )}
                </div>
              </Space>
            </Form.Item>
          </Form>

          <Divider plain>
            <Text type="secondary">已有账户？</Text>
          </Divider>

          <div className="text-center">
            <Link href="/login">
              <Button type="link" size="large">
                立即登录
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}