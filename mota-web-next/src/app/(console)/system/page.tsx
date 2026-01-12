'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Typography,
  Input,
  Button,
  Space,
  Row,
  Col,
  Switch,
  Form,
  Select,
  message,
  Tabs,
  Divider,
  Tag,
  List,
  Avatar,
  Progress,
  Statistic,
  Spin,
  Empty,
} from 'antd';
import {
  SettingOutlined,
  SafetyCertificateOutlined,
  BellOutlined,
  DatabaseOutlined,
  CloudOutlined,
  ApiOutlined,
  UserOutlined,
  LockOutlined,
  MailOutlined,
  MobileOutlined,
  GlobalOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { systemService, type SystemStatus, type ServiceStatus, type OperationLog, type SystemSettings } from '@/services';

const { Title, Text, Paragraph } = Typography;

// 统一主题色 - 薄荷绿
const THEME_COLOR = '#10B981';

export default function SystemPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [operationLogs, setOperationLogs] = useState<OperationLog[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);

  // 获取系统状态
  const fetchSystemStatus = useCallback(async () => {
    try {
      const data = await systemService.getSystemStatus();
      setSystemStatus(data);
    } catch (error) {
      console.error('Failed to fetch system status:', error);
    }
  }, []);

  // 获取服务状态
  const fetchServices = useCallback(async () => {
    try {
      const data = await systemService.getServices();
      setServices(data);
    } catch (error) {
      console.error('Failed to fetch services:', error);
    }
  }, []);

  // 获取操作日志
  const fetchOperationLogs = useCallback(async () => {
    try {
      const data = await systemService.getOperationLogs({ page: 1, pageSize: 10 });
      setOperationLogs(data.records);
    } catch (error) {
      console.error('Failed to fetch operation logs:', error);
    }
  }, []);

  // 获取系统设置
  const fetchSettings = useCallback(async () => {
    try {
      const data = await systemService.getSystemSettings();
      setSettings(data);
      form.setFieldsValue(data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  }, [form]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        fetchSystemStatus(),
        fetchServices(),
        fetchOperationLogs(),
        fetchSettings(),
      ]);
      setLoading(false);
    };
    fetchData();
  }, [fetchSystemStatus, fetchServices, fetchOperationLogs, fetchSettings]);

  const handleSaveSettings = async () => {
    try {
      const values = await form.validateFields();
      await systemService.updateSystemSettings(values);
      message.success('设置已保存');
    } catch (error) {
      message.error('保存设置失败');
    }
  };

  const handleRestartService = async (serviceName: string) => {
    try {
      await systemService.restartService(serviceName);
      message.success(`${serviceName} 重启成功`);
      fetchServices();
    } catch (error) {
      message.error(`${serviceName} 重启失败`);
    }
  };

  const getStatusTag = (status: string) => {
    if (status === 'running') {
      return <Tag color="success" icon={<CheckCircleOutlined />}>运行中</Tag>;
    }
    if (status === 'warning') {
      return <Tag color="warning" icon={<WarningOutlined />}>警告</Tag>;
    }
    return <Tag color="error">停止</Tag>;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      {/* 页面头部 */}
      <div style={{
        background: `linear-gradient(135deg, #64748B 0%, #475569 100%)`,
        borderRadius: 16,
        padding: '20px 24px',
        marginBottom: 24,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <SettingOutlined style={{ fontSize: 24, color: '#fff' }} />
          </div>
          <div>
            <Title level={4} style={{ color: '#fff', margin: 0 }}>系统管理</Title>
            <Text style={{ color: 'rgba(255,255,255,0.8)' }}>系统配置、监控和维护</Text>
          </div>
        </div>
        <Space>
          <Tag color="success">系统正常</Tag>
          <Text style={{ color: 'rgba(255,255,255,0.8)' }}>版本 {systemStatus?.version || '-'}</Text>
        </Space>
      </div>

      {/* 系统状态卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <div style={{ textAlign: 'center' }}>
              <Progress
                type="circle"
                percent={systemStatus?.cpu || 0}
                size={80}
                strokeColor={(systemStatus?.cpu || 0) > 80 ? '#EF4444' : THEME_COLOR}
              />
              <div style={{ marginTop: 12, fontWeight: 600 }}>CPU 使用率</div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <div style={{ textAlign: 'center' }}>
              <Progress
                type="circle"
                percent={systemStatus?.memory || 0}
                size={80}
                strokeColor={(systemStatus?.memory || 0) > 80 ? '#EF4444' : '#3B82F6'}
              />
              <div style={{ marginTop: 12, fontWeight: 600 }}>内存使用率</div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <div style={{ textAlign: 'center' }}>
              <Progress
                type="circle"
                percent={systemStatus?.disk || 0}
                size={80}
                strokeColor={(systemStatus?.disk || 0) > 80 ? '#EF4444' : '#8B5CF6'}
              />
              <div style={{ marginTop: 12, fontWeight: 600 }}>磁盘使用率</div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="系统运行时间"
              value={systemStatus?.uptime || '-'}
              prefix={<ThunderboltOutlined style={{ color: '#F59E0B' }} />}
            />
          </Card>
        </Col>
      </Row>

      <Tabs
        defaultActiveKey="general"
        items={[
          {
            key: 'general',
            label: (
              <span>
                <SettingOutlined /> 基本设置
              </span>
            ),
            children: (
              <Card style={{ borderRadius: 12 }}>
                <Form form={form} layout="vertical" initialValues={settings || undefined}>
                  <Row gutter={24}>
                    <Col span={12}>
                      <Form.Item name="siteName" label="系统名称">
                        <Input placeholder="请输入系统名称" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="siteDescription" label="系统描述">
                        <Input placeholder="请输入系统描述" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="language" label="默认语言">
                        <Select
                          options={[
                            { value: 'zh-CN', label: '简体中文' },
                            { value: 'en-US', label: 'English' },
                          ]}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="timezone" label="时区">
                        <Select
                          options={[
                            { value: 'Asia/Shanghai', label: '中国标准时间 (UTC+8)' },
                            { value: 'America/New_York', label: '美国东部时间' },
                            { value: 'Europe/London', label: '伦敦时间' },
                          ]}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Divider />
                  <Button type="primary" onClick={handleSaveSettings} style={{ background: THEME_COLOR, borderColor: THEME_COLOR }}>
                    保存设置
                  </Button>
                </Form>
              </Card>
            ),
          },
          {
            key: 'security',
            label: (
              <span>
                <SafetyCertificateOutlined /> 安全设置
              </span>
            ),
            children: (
              <Card style={{ borderRadius: 12 }}>
                <Form layout="vertical">
                  <Form.Item label="登录安全">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <Text strong>双因素认证</Text>
                          <br />
                          <Text type="secondary">启用后登录需要额外验证</Text>
                        </div>
                        <Switch />
                      </div>
                      <Divider style={{ margin: '12px 0' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <Text strong>登录失败锁定</Text>
                          <br />
                          <Text type="secondary">连续5次失败后锁定账户30分钟</Text>
                        </div>
                        <Switch />
                      </div>
                      <Divider style={{ margin: '12px 0' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <Text strong>密码强度要求</Text>
                          <br />
                          <Text type="secondary">要求密码包含大小写字母、数字和特殊字符</Text>
                        </div>
                        <Switch />
                      </div>
                      <Divider style={{ margin: '12px 0' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <Text strong>会话超时</Text>
                          <br />
                          <Text type="secondary">无操作30分钟后自动退出</Text>
                        </div>
                        <Switch />
                      </div>
                    </Space>
                  </Form.Item>
                </Form>
              </Card>
            ),
          },
          {
            key: 'notifications',
            label: (
              <span>
                <BellOutlined /> 通知设置
              </span>
            ),
            children: (
              <Card style={{ borderRadius: 12 }}>
                <Form layout="vertical">
                  <Form.Item label="通知渠道">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Space>
                          <MailOutlined style={{ fontSize: 20, color: '#3B82F6' }} />
                          <div>
                            <Text strong>邮件通知</Text>
                            <br />
                            <Text type="secondary">通过邮件发送系统通知</Text>
                          </div>
                        </Space>
                        <Switch />
                      </div>
                      <Divider style={{ margin: '12px 0' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Space>
                          <MobileOutlined style={{ fontSize: 20, color: '#10B981' }} />
                          <div>
                            <Text strong>短信通知</Text>
                            <br />
                            <Text type="secondary">通过短信发送重要通知</Text>
                          </div>
                        </Space>
                        <Switch />
                      </div>
                      <Divider style={{ margin: '12px 0' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Space>
                          <GlobalOutlined style={{ fontSize: 20, color: '#8B5CF6' }} />
                          <div>
                            <Text strong>站内消息</Text>
                            <br />
                            <Text type="secondary">在系统内显示通知消息</Text>
                          </div>
                        </Space>
                        <Switch />
                      </div>
                    </Space>
                  </Form.Item>
                </Form>
              </Card>
            ),
          },
          {
            key: 'services',
            label: (
              <span>
                <CloudOutlined /> 服务状态
              </span>
            ),
            children: (
              <Card style={{ borderRadius: 12 }}>
                {services.length > 0 ? (
                  <List
                    dataSource={services}
                    renderItem={(item) => (
                      <List.Item
                        actions={[
                          <Button key="restart" type="link" icon={<SyncOutlined />} onClick={() => handleRestartService(item.name)}>
                            重启
                          </Button>,
                        ]}
                      >
                        <List.Item.Meta
                          avatar={
                            <Avatar
                              style={{
                                backgroundColor: item.status === 'running' ? '#10B981' : '#F59E0B',
                              }}
                              icon={<ApiOutlined />}
                            />
                          }
                          title={
                            <Space>
                              {item.name}
                              {getStatusTag(item.status)}
                            </Space>
                          }
                          description={`可用性: ${item.uptime}`}
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <Empty description="暂无服务数据" />
                )}
              </Card>
            ),
          },
          {
            key: 'logs',
            label: (
              <span>
                <DatabaseOutlined /> 操作日志
              </span>
            ),
            children: (
              <Card style={{ borderRadius: 12 }}>
                {operationLogs.length > 0 ? (
                  <List
                    dataSource={operationLogs}
                    renderItem={(item) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar icon={<UserOutlined />} />}
                          title={
                            <Space>
                              <Text strong>{item.user}</Text>
                              <Text>{item.action}</Text>
                            </Space>
                          }
                          description={
                            <Space>
                              <Text type="secondary">{item.time}</Text>
                              <Text type="secondary">IP: {item.ip}</Text>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <Empty description="暂无操作日志" />
                )}
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
}