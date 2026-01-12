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
  Empty,
  Tag,
  Avatar,
  Tabs,
  Modal,
  Form,
  Select,
  message,
  Dropdown,
  Badge,
  Spin,
} from 'antd';
import {
  AppstoreOutlined,
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  EyeOutlined,
  MoreOutlined,
  ProjectOutlined,
  FileTextOutlined,
  CalendarOutlined,
  TeamOutlined,
  StarOutlined,
  StarFilled,
  DownloadOutlined,
  ThunderboltOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { apiClient } from '@/lib/api-client';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// 统一主题色 - 薄荷绿
const THEME_COLOR = '#10B981';

// 模板分类
const templateCategories = [
  { key: 'all', label: '全部模板' },
  { key: 'project', label: '项目模板' },
  { key: 'task', label: '任务模板' },
  { key: 'document', label: '文档模板' },
  { key: 'workflow', label: '工作流模板' },
];

// 模板类型
interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  color?: string;
  useCount?: number;
  starred?: boolean;
  tags?: string[];
}

// 获取分类图标
const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'project':
      return <ProjectOutlined />;
    case 'task':
      return <TeamOutlined />;
    case 'document':
      return <FileTextOutlined />;
    case 'workflow':
      return <ThunderboltOutlined />;
    default:
      return <AppstoreOutlined />;
  }
};

// 获取分类颜色
const getCategoryColor = (category: string) => {
  switch (category) {
    case 'project':
      return '#10B981';
    case 'task':
      return '#06B6D4';
    case 'document':
      return '#8B5CF6';
    case 'workflow':
      return '#EF4444';
    default:
      return '#64748B';
  }
};

export default function TemplatesPage() {
  const [searchText, setSearchText] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<Template[]>([]);

  // 获取模板列表
  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<{ data: Template[] }>('/api/v1/templates');
      setTemplates(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleCreateTemplate = async () => {
    try {
      const values = await form.validateFields();
      await apiClient.post('/api/v1/templates', values);
      message.success('模板创建成功');
      setCreateModalVisible(false);
      form.resetFields();
      fetchTemplates();
    } catch (error) {
      console.error('Failed to create template:', error);
      message.error('模板创建失败');
    }
  };

  const handleUseTemplate = async (template: Template) => {
    try {
      await apiClient.post(`/api/v1/templates/${template.id}/use`);
      message.success(`已使用模板: ${template.name}`);
    } catch (error) {
      console.error('Failed to use template:', error);
      message.error('使用模板失败');
    }
  };

  const handleToggleStar = async (templateId: string) => {
    try {
      await apiClient.post(`/api/v1/templates/${templateId}/star`);
      message.success('收藏状态已更新');
      fetchTemplates();
    } catch (error) {
      console.error('Failed to toggle star:', error);
      message.error('操作失败');
    }
  };

  const filteredTemplates = templates.filter((template) => {
    if (searchText && !template.name.includes(searchText) && !template.description?.includes(searchText)) {
      return false;
    }
    if (activeCategory !== 'all' && template.category !== activeCategory) {
      return false;
    }
    return true;
  });

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      project: '项目模板',
      task: '任务模板',
      document: '文档模板',
      workflow: '工作流模板',
    };
    return labels[category] || category;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
      </div>
    );
  }

  return (
    <div>
      {/* 页面头部 */}
      <div style={{
        background: `linear-gradient(135deg, #F59E0B 0%, #D97706 100%)`,
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
            <AppstoreOutlined style={{ fontSize: 24, color: '#fff' }} />
          </div>
          <div>
            <Title level={4} style={{ color: '#fff', margin: 0 }}>模板库</Title>
            <Text style={{ color: 'rgba(255,255,255,0.8)' }}>使用模板快速创建项目、任务和文档</Text>
          </div>
        </div>
        <Button
          icon={<PlusOutlined />}
          onClick={() => setCreateModalVisible(true)}
          style={{ background: 'rgba(255,255,255,0.2)', borderColor: 'transparent', color: '#fff' }}
        >
          创建模板
        </Button>
      </div>

      {/* 搜索和筛选 */}
      <Card style={{ borderRadius: 12, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Input
              placeholder="搜索模板"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
              allowClear
            />
          </Space>
          <Space>
            {templateCategories.map((cat) => (
              <Button
                key={cat.key}
                type={activeCategory === cat.key ? 'primary' : 'default'}
                onClick={() => setActiveCategory(cat.key)}
                style={activeCategory === cat.key ? { background: THEME_COLOR, borderColor: THEME_COLOR } : {}}
              >
                {cat.label}
              </Button>
            ))}
          </Space>
        </div>
      </Card>

      {/* 模板列表 */}
      {filteredTemplates.length === 0 ? (
        <Empty description="暂无模板" image={Empty.PRESENTED_IMAGE_SIMPLE}>
          <Button type="primary" onClick={() => setCreateModalVisible(true)}>
            创建第一个模板
          </Button>
        </Empty>
      ) : (
        <Row gutter={[16, 16]}>
          {filteredTemplates.map((template) => (
            <Col key={template.id} xs={24} sm={12} lg={8} xl={6}>
              <Card
                hoverable
                style={{ borderRadius: 12, height: '100%' }}
                actions={[
                  <Tooltip key="use" title="使用模板">
                    <Button type="text" icon={<CopyOutlined />} onClick={() => handleUseTemplate(template)}>
                      使用
                    </Button>
                  </Tooltip>,
                  <Tooltip key="preview" title="预览">
                    <Button type="text" icon={<EyeOutlined />} />
                  </Tooltip>,
                  <Dropdown
                    key="more"
                    menu={{
                      items: [
                        { key: 'edit', label: '编辑', icon: <EditOutlined /> },
                        { key: 'download', label: '下载', icon: <DownloadOutlined /> },
                        { type: 'divider' },
                        { key: 'delete', label: '删除', icon: <DeleteOutlined />, danger: true },
                      ],
                    }}
                  >
                    <Button type="text" icon={<MoreOutlined />} />
                  </Dropdown>,
                ]}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <Avatar
                    size={48}
                    style={{ backgroundColor: template.color || getCategoryColor(template.category), borderRadius: 12 }}
                    icon={getCategoryIcon(template.category)}
                  />
                  <Button
                    type="text"
                    icon={template.starred ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
                    onClick={() => handleToggleStar(template.id)}
                  />
                </div>
                <div style={{ marginBottom: 8 }}>
                  <Text strong style={{ fontSize: 16 }}>{template.name}</Text>
                </div>
                <Paragraph
                  type="secondary"
                  ellipsis={{ rows: 2 }}
                  style={{ marginBottom: 12, minHeight: 44 }}
                >
                  {template.description}
                </Paragraph>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Tag color="blue">{getCategoryLabel(template.category)}</Tag>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    <DownloadOutlined /> {template.useCount || 0} 次使用
                  </Text>
                </div>
                <div>
                  {template.tags?.map((tag) => (
                    <Tag key={tag} style={{ marginBottom: 4 }}>{tag}</Tag>
                  ))}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* 创建模板弹窗 */}
      <Modal
        title={
          <Space>
            <AppstoreOutlined style={{ color: THEME_COLOR }} />
            创建模板
          </Space>
        }
        open={createModalVisible}
        onOk={handleCreateTemplate}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="模板名称"
            rules={[{ required: true, message: '请输入模板名称' }]}
          >
            <Input placeholder="请输入模板名称" />
          </Form.Item>
          <Form.Item
            name="category"
            label="模板类型"
            rules={[{ required: true, message: '请选择模板类型' }]}
          >
            <Select
              placeholder="请选择模板类型"
              options={[
                { value: 'project', label: '项目模板' },
                { value: 'task', label: '任务模板' },
                { value: 'document', label: '文档模板' },
                { value: 'workflow', label: '工作流模板' },
              ]}
            />
          </Form.Item>
          <Form.Item name="description" label="模板描述">
            <TextArea rows={3} placeholder="请输入模板描述" />
          </Form.Item>
          <Form.Item name="tags" label="标签">
            <Select
              mode="tags"
              placeholder="输入标签后按回车添加"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

// Tooltip 组件需要单独导入
import { Tooltip } from 'antd';