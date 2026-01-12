/**
 * 模板库管理组件
 * 实现功能：
 * - TP-001: 系统模板 - 预置文档模板
 * - TP-002: 自定义模板 - 创建自定义模板
 * - TP-003: 模板分类 - 模板分类管理
 * - TP-004: 模板共享 - 团队共享模板
 * - TP-005: 模板使用 - 一键从模板创建文档
 * - TP-006: 任务模板 - 任务流程模板
 * - TP-007: 项目模板 - 项目结构模板
 * - TP-008: 模板统计 - 模板使用统计
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Tabs,
  Input,
  Select,
  Button,
  Space,
  Tag,
  Empty,
  Spin,
  Modal,
  Form,
  message,
  Tooltip,
  Badge,
  Rate,
  Avatar,
  Dropdown,
  Menu,
  Row,
  Col,
  Statistic,
  Table,
  Drawer,
  Popconfirm,
  Switch,
  Checkbox,
  Radio,
  Divider,
  Progress,
  Timeline,
  List,
  Typography
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  FileTextOutlined,
  ProjectOutlined,
  CheckSquareOutlined,
  ApartmentOutlined,
  StarOutlined,
  StarFilled,
  EyeOutlined,
  CopyOutlined,
  EditOutlined,
  DeleteOutlined,
  ShareAltOutlined,
  DownloadOutlined,
  UploadOutlined,
  MoreOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  TeamOutlined,
  UserOutlined,
  ClockCircleOutlined,
  FireOutlined,
  TrophyOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  FolderOutlined,
  TagOutlined,
  GlobalOutlined,
  LockOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  RocketOutlined,
  BulbOutlined,
  FileAddOutlined,
  FolderAddOutlined,
  ExportOutlined,
  ImportOutlined,
  HistoryOutlined,
  HeartOutlined,
  HeartFilled,
  SendOutlined
} from '@ant-design/icons';
import styles from './index.module.css';
import {
  Template,
  TemplateType,
  TemplateSource,
  TemplateCategory,
  TemplateStats,
  TemplateUsageRecord,
  TemplateReview,
  TemplateShareSettings,
  TemplateQueryParams,
  DocumentTemplateContent,
  TaskTemplateContent,
  ProjectTemplateContent,
  getSystemTemplates,
  getCategories,
  getTemplateStats,
  searchTemplates,
  getMyTemplates,
  getPopularTemplates,
  getRecentlyUsedTemplates,
  getRecommendedTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  duplicateTemplate,
  createDocumentFromTemplate,
  createTaskFromTemplate,
  createProjectFromTemplate,
  getTemplateVariables,
  previewTemplateApplication,
  shareTemplateWithTeam,
  shareTemplateWithUsers,
  setTemplatePublic,
  getShareSettings,
  updateShareSettings,
  getTemplateUsageHistory,
  getTemplateUsageTrend,
  rateTemplate,
  getTemplateReviews,
  exportTemplate,
  importTemplate,
  parseTemplateContent,
  getTemplateTypeLabel,
  getTemplateSourceLabel
} from '@/services/api/templateLibrary';

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;
const { Text, Title, Paragraph } = Typography;

interface TemplateLibraryProps {
  defaultType?: TemplateType;
  onSelectTemplate?: (template: Template) => void;
  onCreateFromTemplate?: (type: string, itemId: number) => void;
  showStats?: boolean;
  compact?: boolean;
}

const TemplateLibrary: React.FC<TemplateLibraryProps> = ({
  defaultType,
  onSelectTemplate,
  onCreateFromTemplate,
  showStats = true,
  compact = false
}) => {
  // 状态
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(defaultType || 'all');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [stats, setStats] = useState<TemplateStats | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);

  // 筛选状态
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [selectedSource, setSelectedSource] = useState<TemplateSource | undefined>();
  const [sortBy, setSortBy] = useState<'useCount' | 'rating' | 'createdAt'>('useCount');

  // 弹窗状态
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showUseModal, setShowUseModal] = useState(false);
  const [showStatsDrawer, setShowStatsDrawer] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // 表单
  const [createForm] = Form.useForm();
  const [useForm] = Form.useForm();
  const [shareForm] = Form.useForm();
  const [categoryForm] = Form.useForm();

  // 加载数据
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [templatesData, categoriesData, statsData] = await Promise.all([
        searchTemplates({
          keyword: searchKeyword,
          type: activeTab === 'all' ? undefined : activeTab as TemplateType,
          source: selectedSource,
          category: selectedCategory,
          sortBy,
          sortOrder: 'desc'
        }),
        getCategories(),
        showStats ? getTemplateStats() : Promise.resolve(null)
      ]);
      setTemplates(templatesData.items);
      setCategories(categoriesData);
      if (statsData) setStats(statsData);
    } catch (error) {
      console.error('加载模板数据失败:', error);
    } finally {
      setLoading(false);
    }
  }, [searchKeyword, activeTab, selectedSource, selectedCategory, sortBy, showStats]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 搜索
  const handleSearch = (value: string) => {
    setSearchKeyword(value);
  };

  // 切换收藏
  const toggleFavorite = (templateId: number) => {
    setFavorites(prev => 
      prev.includes(templateId) 
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  // 创建模板
  const handleCreateTemplate = async (values: Record<string, unknown>) => {
    try {
      const template = await createTemplate({
        name: values.name as string,
        description: values.description as string,
        type: values.type as TemplateType,
        category: values.category as string,
        tags: values.tags as string[],
        content: JSON.stringify(values.content || {})
      });
      message.success('模板创建成功');
      setShowCreateModal(false);
      createForm.resetFields();
      loadData();
      return template;
    } catch (error) {
      message.error('创建模板失败');
    }
  };

  // 复制模板
  const handleDuplicate = async (template: Template) => {
    try {
      await duplicateTemplate(template.id);
      message.success('模板复制成功');
      loadData();
    } catch (error) {
      message.error('复制模板失败');
    }
  };

  // 删除模板
  const handleDelete = async (templateId: number) => {
    try {
      await deleteTemplate(templateId);
      message.success('模板删除成功');
      loadData();
    } catch (error) {
      message.error('删除模板失败');
    }
  };

  // 使用模板
  const handleUseTemplate = async (values: Record<string, unknown>) => {
    if (!selectedTemplate) return;

    try {
      let result;
      switch (selectedTemplate.type) {
        case 'document':
          result = await createDocumentFromTemplate(selectedTemplate.id, {
            projectId: values.projectId as number,
            name: values.name as string,
            variables: values.variables as Record<string, string>
          });
          message.success(`文档 "${result.documentName}" 创建成功`);
          onCreateFromTemplate?.('document', result.documentId);
          break;
        case 'task':
          result = await createTaskFromTemplate(selectedTemplate.id, {
            projectId: values.projectId as number,
            assigneeId: values.assigneeId as number
          });
          message.success(`任务 "${result.taskName}" 创建成功`);
          onCreateFromTemplate?.('task', result.taskId);
          break;
        case 'project':
          result = await createProjectFromTemplate(selectedTemplate.id, {
            name: values.name as string,
            description: values.description as string,
            startDate: values.startDate as string
          });
          message.success(`项目 "${result.projectName}" 创建成功`);
          onCreateFromTemplate?.('project', result.projectId);
          break;
      }
      setShowUseModal(false);
      useForm.resetFields();
    } catch (error) {
      message.error('使用模板失败');
    }
  };

  // 共享模板
  const handleShare = async (values: Record<string, unknown>) => {
    if (!selectedTemplate) return;

    try {
      await updateShareSettings(selectedTemplate.id, {
        isPublic: values.isPublic as boolean,
        sharedWithTeams: values.teamIds as number[] || [],
        sharedWithUsers: values.userIds as number[] || [],
        allowCopy: values.allowCopy as boolean,
        allowModify: values.allowModify as boolean
      });
      message.success('共享设置已更新');
      setShowShareModal(false);
      shareForm.resetFields();
    } catch (error) {
      message.error('更新共享设置失败');
    }
  };

  // 导出模板
  const handleExport = async (template: Template) => {
    try {
      const data = await exportTemplate(template.id, 'json');
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${template.name}.json`;
      a.click();
      URL.revokeObjectURL(url);
      message.success('模板导出成功');
    } catch (error) {
      message.error('导出模板失败');
    }
  };

  // 导入模板
  const handleImport = async (data: string) => {
    try {
      await importTemplate(data, 'json');
      message.success('模板导入成功');
      setShowImportModal(false);
      loadData();
    } catch (error) {
      message.error('导入模板失败');
    }
  };

  // 评分
  const handleRate = async (templateId: number, rating: number) => {
    try {
      await rateTemplate(templateId, rating);
      message.success('评分成功');
      loadData();
    } catch (error) {
      message.error('评分失败');
    }
  };

  // 获取类型图标
  const getTypeIcon = (type: TemplateType) => {
    const icons: Record<TemplateType, React.ReactNode> = {
      document: <FileTextOutlined />,
      task: <CheckSquareOutlined />,
      project: <ProjectOutlined />,
      workflow: <ApartmentOutlined />
    };
    return icons[type];
  };

  // 获取类型颜色
  const getTypeColor = (type: TemplateType) => {
    const colors: Record<TemplateType, string> = {
      document: '#1890ff',
      task: '#52c41a',
      project: '#722ed1',
      workflow: '#fa8c16'
    };
    return colors[type];
  };

  // 获取来源颜色
  const getSourceColor = (source: TemplateSource) => {
    const colors: Record<TemplateSource, string> = {
      system: '#1890ff',
      custom: '#52c41a',
      shared: '#faad14'
    };
    return colors[source];
  };

  // 渲染模板卡片
  const renderTemplateCard = (template: Template) => {
    const isFavorite = favorites.includes(template.id);

    return (
      <Card
        key={template.id}
        className={`${styles.templateCard} ${selectedTemplate?.id === template.id ? styles.selected : ''}`}
        hoverable
        onClick={() => {
          setSelectedTemplate(template);
          onSelectTemplate?.(template);
        }}
        actions={[
          <Tooltip title="预览" key="preview">
            <EyeOutlined onClick={(e) => {
              e.stopPropagation();
              setSelectedTemplate(template);
              setShowPreviewModal(true);
            }} />
          </Tooltip>,
          <Tooltip title="使用" key="use">
            <ThunderboltOutlined onClick={(e) => {
              e.stopPropagation();
              setSelectedTemplate(template);
              setShowUseModal(true);
            }} />
          </Tooltip>,
          <Tooltip title={isFavorite ? '取消收藏' : '收藏'} key="favorite">
            {isFavorite ? (
              <HeartFilled style={{ color: '#ff4d4f' }} onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(template.id);
              }} />
            ) : (
              <HeartOutlined onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(template.id);
              }} />
            )}
          </Tooltip>,
          <Dropdown
            key="more"
            overlay={
              <Menu>
                <Menu.Item key="copy" icon={<CopyOutlined />} onClick={() => handleDuplicate(template)}>
                  复制模板
                </Menu.Item>
                {template.source !== 'system' && (
                  <>
                    <Menu.Item key="edit" icon={<EditOutlined />}>
                      编辑模板
                    </Menu.Item>
                    <Menu.Item key="share" icon={<ShareAltOutlined />} onClick={() => {
                      setSelectedTemplate(template);
                      setShowShareModal(true);
                    }}>
                      共享设置
                    </Menu.Item>
                  </>
                )}
                <Menu.Item key="export" icon={<ExportOutlined />} onClick={() => handleExport(template)}>
                  导出模板
                </Menu.Item>
                {template.source === 'custom' && (
                  <>
                    <Menu.Divider />
                    <Menu.Item key="delete" icon={<DeleteOutlined />} danger>
                      <Popconfirm
                        title="确定要删除这个模板吗？"
                        onConfirm={() => handleDelete(template.id)}
                        okText="确定"
                        cancelText="取消"
                      >
                        删除模板
                      </Popconfirm>
                    </Menu.Item>
                  </>
                )}
              </Menu>
            }
            trigger={['click']}
          >
            <MoreOutlined onClick={(e) => e.stopPropagation()} />
          </Dropdown>
        ]}
      >
        <div className={styles.cardContent}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon} style={{ backgroundColor: getTypeColor(template.type) }}>
              {getTypeIcon(template.type)}
            </div>
            <div className={styles.cardTitleArea}>
              <Text strong className={styles.cardTitle}>{template.name}</Text>
              <div className={styles.cardMeta}>
                <Tag color={getSourceColor(template.source)} style={{ fontSize: 10 }}>
                  {getTemplateSourceLabel(template.source)}
                </Tag>
                <Tag style={{ fontSize: 10 }}>{template.category}</Tag>
              </div>
            </div>
          </div>
          <Paragraph ellipsis={{ rows: 2 }} className={styles.cardDesc}>
            {template.description || '暂无描述'}
          </Paragraph>
          <div className={styles.cardFooter}>
            <Space>
              <Rate disabled defaultValue={template.rating} style={{ fontSize: 12 }} />
              <Text type="secondary" style={{ fontSize: 12 }}>
                ({template.ratingCount})
              </Text>
            </Space>
            <Space>
              <Tooltip title="使用次数">
                <Text type="secondary" style={{ fontSize: 12 }}>
                  <ThunderboltOutlined /> {template.useCount}
                </Text>
              </Tooltip>
            </Space>
          </div>
          {template.tags && template.tags.length > 0 && (
            <div className={styles.cardTags}>
              {template.tags.slice(0, 3).map(tag => (
                <Tag key={tag} style={{ fontSize: 10 }}>{tag}</Tag>
              ))}
              {template.tags.length > 3 && (
                <Tag style={{ fontSize: 10 }}>+{template.tags.length - 3}</Tag>
              )}
            </div>
          )}
        </div>
      </Card>
    );
  };

  // 渲染模板列表项
  const renderTemplateListItem = (template: Template) => {
    const isFavorite = favorites.includes(template.id);

    return (
      <List.Item
        key={template.id}
        className={`${styles.listItem} ${selectedTemplate?.id === template.id ? styles.selected : ''}`}
        onClick={() => {
          setSelectedTemplate(template);
          onSelectTemplate?.(template);
        }}
        actions={[
          <Button
            key="use"
            type="primary"
            size="small"
            icon={<ThunderboltOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedTemplate(template);
              setShowUseModal(true);
            }}
          >
            使用
          </Button>,
          <Button
            key="preview"
            size="small"
            icon={<EyeOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedTemplate(template);
              setShowPreviewModal(true);
            }}
          >
            预览
          </Button>,
          <Dropdown
            key="more"
            overlay={
              <Menu>
                <Menu.Item key="copy" icon={<CopyOutlined />} onClick={() => handleDuplicate(template)}>
                  复制
                </Menu.Item>
                <Menu.Item key="export" icon={<ExportOutlined />} onClick={() => handleExport(template)}>
                  导出
                </Menu.Item>
                {template.source === 'custom' && (
                  <Menu.Item key="delete" icon={<DeleteOutlined />} danger>
                    <Popconfirm
                      title="确定删除？"
                      onConfirm={() => handleDelete(template.id)}
                    >
                      删除
                    </Popconfirm>
                  </Menu.Item>
                )}
              </Menu>
            }
          >
            <Button size="small" icon={<MoreOutlined />} />
          </Dropdown>
        ]}
      >
        <List.Item.Meta
          avatar={
            <div className={styles.listIcon} style={{ backgroundColor: getTypeColor(template.type) }}>
              {getTypeIcon(template.type)}
            </div>
          }
          title={
            <Space>
              <Text strong>{template.name}</Text>
              <Tag color={getSourceColor(template.source)} style={{ fontSize: 10 }}>
                {getTemplateSourceLabel(template.source)}
              </Tag>
              <Tag style={{ fontSize: 10 }}>{template.category}</Tag>
              {isFavorite && <HeartFilled style={{ color: '#ff4d4f' }} />}
            </Space>
          }
          description={
            <Space direction="vertical" size={4}>
              <Text type="secondary">{template.description || '暂无描述'}</Text>
              <Space>
                <Rate disabled defaultValue={template.rating} style={{ fontSize: 12 }} />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {template.useCount} 次使用
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {new Date(template.createdAt).toLocaleDateString()}
                </Text>
              </Space>
            </Space>
          }
        />
      </List.Item>
    );
  };

  // 渲染统计卡片
  const renderStatsCards = () => {
    if (!stats) return null;

    return (
      <Row gutter={16} className={styles.statsRow}>
        <Col span={6}>
          <Card className={styles.statsCard}>
            <Statistic
              title="总模板数"
              value={stats.totalTemplates}
              prefix={<AppstoreOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className={styles.statsCard}>
            <Statistic
              title="总使用次数"
              value={stats.totalUseCount}
              prefix={<ThunderboltOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className={styles.statsCard}>
            <Statistic
              title="平均评分"
              value={stats.averageRating}
              precision={1}
              prefix={<StarFilled style={{ color: '#faad14' }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className={styles.statsCard}>
            <Statistic
              title="我的模板"
              value={stats.customTemplates}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>
    );
  };

  // 渲染工具栏
  const renderToolbar = () => (
    <div className={styles.toolbar}>
      <Space>
        <Search
          placeholder="搜索模板"
          allowClear
          onSearch={handleSearch}
          style={{ width: 250 }}
          prefix={<SearchOutlined />}
        />
        <Select
          placeholder="分类"
          allowClear
          style={{ width: 150 }}
          value={selectedCategory}
          onChange={setSelectedCategory}
        >
          {categories.map(cat => (
            <Option key={cat.id} value={cat.name}>
              {cat.name} ({cat.templateCount})
            </Option>
          ))}
        </Select>
        <Select
          placeholder="来源"
          allowClear
          style={{ width: 120 }}
          value={selectedSource}
          onChange={setSelectedSource}
        >
          <Option value="system">系统预置</Option>
          <Option value="custom">自定义</Option>
          <Option value="shared">团队共享</Option>
        </Select>
        <Select
          value={sortBy}
          onChange={setSortBy}
          style={{ width: 120 }}
        >
          <Option value="useCount">按使用量</Option>
          <Option value="rating">按评分</Option>
          <Option value="createdAt">按时间</Option>
        </Select>
      </Space>
      <Space>
        <Button.Group>
          <Tooltip title="网格视图">
            <Button
              icon={<AppstoreOutlined />}
              type={viewMode === 'grid' ? 'primary' : 'default'}
              onClick={() => setViewMode('grid')}
            />
          </Tooltip>
          <Tooltip title="列表视图">
            <Button
              icon={<UnorderedListOutlined />}
              type={viewMode === 'list' ? 'primary' : 'default'}
              onClick={() => setViewMode('list')}
            />
          </Tooltip>
        </Button.Group>
        <Button icon={<ImportOutlined />} onClick={() => setShowImportModal(true)}>
          导入
        </Button>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setShowCreateModal(true)}
        >
          创建模板
        </Button>
        {showStats && (
          <Button
            icon={<BarChartOutlined />}
            onClick={() => setShowStatsDrawer(true)}
          >
            统计
          </Button>
        )}
      </Space>
    </div>
  );

  // 渲染模板内容
  const renderTemplates = () => {
    if (loading) {
      return (
        <div className={styles.loading}>
          <Spin size="large" />
        </div>
      );
    }

    if (templates.length === 0) {
      return (
        <Empty description="暂无模板">
          <Button type="primary" onClick={() => setShowCreateModal(true)}>
            创建第一个模板
          </Button>
        </Empty>
      );
    }

    if (viewMode === 'grid') {
      return (
        <div className={styles.templateGrid}>
          {templates.map(renderTemplateCard)}
        </div>
      );
    }

    return (
      <List
        className={styles.templateList}
        dataSource={templates}
        renderItem={renderTemplateListItem}
      />
    );
  };

  // 渲染预览弹窗
  const renderPreviewModal = () => {
    if (!selectedTemplate) return null;

    const content = parseTemplateContent<DocumentTemplateContent | TaskTemplateContent | ProjectTemplateContent>(
      selectedTemplate.content
    );

    return (
      <Modal
        title={
          <Space>
            {getTypeIcon(selectedTemplate.type)}
            <span>{selectedTemplate.name}</span>
            <Tag color={getTypeColor(selectedTemplate.type)}>
              {getTemplateTypeLabel(selectedTemplate.type)}
            </Tag>
          </Space>
        }
        open={showPreviewModal}
        onCancel={() => setShowPreviewModal(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setShowPreviewModal(false)}>
            关闭
          </Button>,
          <Button
            key="use"
            type="primary"
            icon={<ThunderboltOutlined />}
            onClick={() => {
              setShowPreviewModal(false);
              setShowUseModal(true);
            }}
          >
            使用此模板
          </Button>
        ]}
      >
        <div className={styles.previewContent}>
          <div className={styles.previewHeader}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Paragraph>{selectedTemplate.description}</Paragraph>
              <Space wrap>
                <Tag color={getSourceColor(selectedTemplate.source)}>
                  {getTemplateSourceLabel(selectedTemplate.source)}
                </Tag>
                <Tag>{selectedTemplate.category}</Tag>
                {selectedTemplate.tags?.map(tag => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </Space>
              <Space>
                <Rate disabled value={selectedTemplate.rating} />
                <Text type="secondary">({selectedTemplate.ratingCount} 评价)</Text>
                <Divider type="vertical" />
                <Text type="secondary">
                  <ThunderboltOutlined /> {selectedTemplate.useCount} 次使用
                </Text>
                <Divider type="vertical" />
                <Text type="secondary">
                  <UserOutlined /> {selectedTemplate.creatorName}
                </Text>
              </Space>
            </Space>
          </div>
          <Divider />
          <div className={styles.previewBody}>
            {selectedTemplate.type === 'document' && (
              <div>
                <Title level={5}>文档结构</Title>
                {(content as DocumentTemplateContent).sections?.map((section, index) => (
                  <div key={index} className={styles.sectionPreview}>
                    <Text strong>{section.title}</Text>
                  </div>
                ))}
                {(content as DocumentTemplateContent).variables && (
                  <>
                    <Title level={5} style={{ marginTop: 16 }}>变量</Title>
                    <Space wrap>
                      {(content as DocumentTemplateContent).variables?.map(v => (
                        <Tag key={v.name} color="blue">
                          {v.label} {v.required && <Text type="danger">*</Text>}
                        </Tag>
                      ))}
                    </Space>
                  </>
                )}
              </div>
            )}
            {selectedTemplate.type === 'task' && (
              <div>
                <Title level={5}>任务信息</Title>
                <Row gutter={16}>
                  <Col span={12}>
                    <Text type="secondary">优先级：</Text>
                    <Tag color={
                      (content as TaskTemplateContent).priority === 'urgent' ? 'red' :
                      (content as TaskTemplateContent).priority === 'high' ? 'orange' :
                      (content as TaskTemplateContent).priority === 'medium' ? 'blue' : 'default'
                    }>
                      {(content as TaskTemplateContent).priority}
                    </Tag>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary">预估工时：</Text>
                    <Text>{(content as TaskTemplateContent).estimatedHours || '-'} 小时</Text>
                  </Col>
                </Row>
                {(content as TaskTemplateContent).subtasks && (
                  <>
                    <Title level={5} style={{ marginTop: 16 }}>子任务</Title>
                    <List
                      size="small"
                      dataSource={(content as TaskTemplateContent).subtasks}
                      renderItem={(item, index) => (
                        <List.Item>
                          <Text>{index + 1}. {item.title}</Text>
                        </List.Item>
                      )}
                    />
                  </>
                )}
              </div>
            )}
            {selectedTemplate.type === 'project' && (
              <div>
                <Title level={5}>项目结构</Title>
                {(content as ProjectTemplateContent).milestones && (
                  <>
                    <Text type="secondary">里程碑：</Text>
                    <Timeline style={{ marginTop: 8 }}>
                      {(content as ProjectTemplateContent).milestones?.map((m, index) => (
                        <Timeline.Item key={index}>
                          {m.name} (第 {m.daysFromStart} 天)
                        </Timeline.Item>
                      ))}
                    </Timeline>
                  </>
                )}
                {(content as ProjectTemplateContent).roles && (
                  <>
                    <Title level={5}>角色</Title>
                    <Space wrap>
                      {(content as ProjectTemplateContent).roles?.map(r => (
                        <Tag key={r.name} icon={<UserOutlined />}>{r.name}</Tag>
                      ))}
                    </Space>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </Modal>
    );
  };

  // 渲染使用模板弹窗
  const renderUseModal = () => {
    if (!selectedTemplate) return null;

    return (
      <Modal
        title={`使用模板: ${selectedTemplate.name}`}
        open={showUseModal}
        onCancel={() => {
          setShowUseModal(false);
          useForm.resetFields();
        }}
        onOk={() => useForm.submit()}
        okText="创建"
      >
        <Form
          form={useForm}
          layout="vertical"
          onFinish={handleUseTemplate}
        >
          {selectedTemplate.type === 'document' && (
            <>
              <Form.Item
                name="name"
                label="文档名称"
                rules={[{ required: true, message: '请输入文档名称' }]}
              >
                <Input placeholder="请输入文档名称" />
              </Form.Item>
              <Form.Item name="projectId" label="所属项目">
                <Select placeholder="选择项目（可选）" allowClear>
                  <Option value={1}>示例项目</Option>
                </Select>
              </Form.Item>
            </>
          )}
          {selectedTemplate.type === 'task' && (
            <>
              <Form.Item
                name="projectId"
                label="所属项目"
                rules={[{ required: true, message: '请选择项目' }]}
              >
                <Select placeholder="选择项目">
                  <Option value={1}>示例项目</Option>
                </Select>
              </Form.Item>
              <Form.Item name="assigneeId" label="负责人">
                <Select placeholder="选择负责人（可选）" allowClear>
                  <Option value={1}>张三</Option>
                  <Option value={2}>李四</Option>
                </Select>
              </Form.Item>
            </>
          )}
          {selectedTemplate.type === 'project' && (
            <>
              <Form.Item
                name="name"
                label="项目名称"
                rules={[{ required: true, message: '请输入项目名称' }]}
              >
                <Input placeholder="请输入项目名称" />
              </Form.Item>
              <Form.Item name="description" label="项目描述">
                <TextArea rows={3} placeholder="请输入项目描述" />
              </Form.Item>
              <Form.Item name="startDate" label="开始日期">
                <Input type="date" />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    );
  };

  // 渲染创建模板弹窗
  const renderCreateModal = () => (
    <Modal
      title="创建模板"
      open={showCreateModal}
      onCancel={() => {
        setShowCreateModal(false);
        createForm.resetFields();
      }}
      onOk={() => createForm.submit()}
      okText="创建"
      width={600}
    >
      <Form
        form={createForm}
        layout="vertical"
        onFinish={handleCreateTemplate}
        initialValues={{ type: 'document' }}
      >
        <Form.Item
          name="name"
          label="模板名称"
          rules={[{ required: true, message: '请输入模板名称' }]}
        >
          <Input placeholder="请输入模板名称" />
        </Form.Item>
        <Form.Item name="description" label="模板描述">
          <TextArea rows={3} placeholder="请输入模板描述" />
        </Form.Item>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="type"
              label="模板类型"
              rules={[{ required: true }]}
            >
              <Select>
                <Option value="document">
                  <Space><FileTextOutlined /> 文档模板</Space>
                </Option>
                <Option value="task">
                  <Space><CheckSquareOutlined /> 任务模板</Space>
                </Option>
                <Option value="project">
                  <Space><ProjectOutlined /> 项目模板</Space>
                </Option>
                <Option value="workflow">
                  <Space><ApartmentOutlined /> 工作流模板</Space>
                </Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="category"
              label="分类"
              rules={[{ required: true, message: '请选择分类' }]}
            >
              <Select placeholder="选择分类">
                {categories.map(cat => (
                  <Option key={cat.id} value={cat.name}>{cat.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="tags" label="标签">
          <Select mode="tags" placeholder="输入标签后按回车" />
        </Form.Item>
      </Form>
    </Modal>
  );

  // 渲染共享设置弹窗
  const renderShareModal = () => (
    <Modal
      title="共享设置"
      open={showShareModal}
      onCancel={() => {
        setShowShareModal(false);
        shareForm.resetFields();
      }}
      onOk={() => shareForm.submit()}
      okText="保存"
    >
      <Form
        form={shareForm}
        layout="vertical"
        onFinish={handleShare}
        initialValues={{ isPublic: false, allowCopy: true, allowModify: false }}
      >
        <Form.Item name="isPublic" valuePropName="checked">
          <Checkbox>
            <Space>
              <GlobalOutlined />
              公开模板（所有人可见）
            </Space>
          </Checkbox>
        </Form.Item>
        <Form.Item name="teamIds" label="共享给团队">
          <Select mode="multiple" placeholder="选择团队">
            <Option value={1}>产品团队</Option>
            <Option value={2}>开发团队</Option>
            <Option value={3}>设计团队</Option>
          </Select>
        </Form.Item>
        <Form.Item name="userIds" label="共享给用户">
          <Select mode="multiple" placeholder="选择用户">
            <Option value={1}>张三</Option>
            <Option value={2}>李四</Option>
            <Option value={3}>王五</Option>
          </Select>
        </Form.Item>
        <Divider />
        <Form.Item name="allowCopy" valuePropName="checked">
          <Checkbox>允许复制模板</Checkbox>
        </Form.Item>
        <Form.Item name="allowModify" valuePropName="checked">
          <Checkbox>允许修改模板</Checkbox>
        </Form.Item>
      </Form>
    </Modal>
  );

  // 渲染统计抽屉
  const renderStatsDrawer = () => (
    <Drawer
      title="模板统计"
      placement="right"
      width={600}
      open={showStatsDrawer}
      onClose={() => setShowStatsDrawer(false)}
    >
      {stats && (
        <div className={styles.statsDrawer}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card>
                <Statistic
                  title="系统模板"
                  value={stats.systemTemplates}
                  prefix={<AppstoreOutlined style={{ color: '#1890ff' }} />}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card>
                <Statistic
                  title="自定义模板"
                  value={stats.customTemplates}
                  prefix={<UserOutlined style={{ color: '#52c41a' }} />}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card>
                <Statistic
                  title="共享模板"
                  value={stats.sharedTemplates}
                  prefix={<TeamOutlined style={{ color: '#faad14' }} />}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card>
                <Statistic
                  title="总使用次数"
                  value={stats.totalUseCount}
                  prefix={<ThunderboltOutlined style={{ color: '#722ed1' }} />}
                />
              </Card>
            </Col>
          </Row>

          <Divider>按类型分布</Divider>
          <Row gutter={16}>
            <Col span={6}>
              <div className={styles.typeStats}>
                <FileTextOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                <div>
                  <Text strong>{stats.documentTemplates}</Text>
                  <br />
                  <Text type="secondary">文档</Text>
                </div>
              </div>
            </Col>
            <Col span={6}>
              <div className={styles.typeStats}>
                <CheckSquareOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                <div>
                  <Text strong>{stats.taskTemplates}</Text>
                  <br />
                  <Text type="secondary">任务</Text>
                </div>
              </div>
            </Col>
            <Col span={6}>
              <div className={styles.typeStats}>
                <ProjectOutlined style={{ fontSize: 24, color: '#722ed1' }} />
                <div>
                  <Text strong>{stats.projectTemplates}</Text>
                  <br />
                  <Text type="secondary">项目</Text>
                </div>
              </div>
            </Col>
            <Col span={6}>
              <div className={styles.typeStats}>
                <ApartmentOutlined style={{ fontSize: 24, color: '#fa8c16' }} />
                <div>
                  <Text strong>{stats.workflowTemplates}</Text>
                  <br />
                  <Text type="secondary">工作流</Text>
                </div>
              </div>
            </Col>
          </Row>

          <Divider>热门分类</Divider>
          {stats.topCategories.map((cat, index) => (
            <div key={cat.name} className={styles.categoryProgress}>
              <Space>
                <Badge count={index + 1} style={{ backgroundColor: index < 3 ? '#faad14' : '#d9d9d9' }} />
                <Text>{cat.name}</Text>
              </Space>
              <Progress
                percent={Math.round((cat.count / stats.totalTemplates) * 100)}
                size="small"
                format={() => cat.count}
              />
            </div>
          ))}

          <Divider>热门模板</Divider>
          <List
            size="small"
            dataSource={stats.popularTemplates.slice(0, 5)}
            renderItem={(template, index) => (
              <List.Item>
                <Space>
                  <Badge count={index + 1} style={{ backgroundColor: index < 3 ? '#ff4d4f' : '#d9d9d9' }} />
                  {getTypeIcon(template.type)}
                  <Text>{template.name}</Text>
                </Space>
                <Text type="secondary">{template.useCount} 次</Text>
              </List.Item>
            )}
          />
        </div>
      )}
    </Drawer>
  );

  // 渲染导入弹窗
  const renderImportModal = () => (
    <Modal
      title="导入模板"
      open={showImportModal}
      onCancel={() => setShowImportModal(false)}
      footer={null}
    >
      <div className={styles.importArea}>
        <TextArea
          rows={10}
          placeholder="粘贴模板JSON内容..."
          id="importContent"
        />
        <Button
          type="primary"
          style={{ marginTop: 16 }}
          onClick={() => {
            const content = (document.getElementById('importContent') as HTMLTextAreaElement)?.value;
            if (content) {
              handleImport(content);
            } else {
              message.warning('请输入模板内容');
            }
          }}
        >
          导入
        </Button>
      </div>
    </Modal>
  );

  return (
    <div className={`${styles.container} ${compact ? styles.compact : ''}`}>
      {showStats && !compact && renderStatsCards()}
      
      <Card className={styles.mainCard}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          tabBarExtraContent={renderToolbar()}
        >
          <Tabs.TabPane
            tab={<span><AppstoreOutlined /> 全部</span>}
            key="all"
          />
          <Tabs.TabPane
            tab={<span><FileTextOutlined /> 文档模板</span>}
            key="document"
          />
          <Tabs.TabPane
            tab={<span><CheckSquareOutlined /> 任务模板</span>}
            key="task"
          />
          <Tabs.TabPane
            tab={<span><ProjectOutlined /> 项目模板</span>}
            key="project"
          />
          <Tabs.TabPane
            tab={<span><ApartmentOutlined /> 工作流模板</span>}
            key="workflow"
          />
        </Tabs>

        {renderTemplates()}
      </Card>

      {renderPreviewModal()}
      {renderUseModal()}
      {renderCreateModal()}
      {renderShareModal()}
      {renderStatsDrawer()}
      {renderImportModal()}
    </div>
  );
};

export default TemplateLibrary;