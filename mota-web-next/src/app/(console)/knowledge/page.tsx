'use client';

import { useState } from 'react';
import {
  Card,
  Typography,
  Button,
  Input,
  Tabs,
  Tree,
  List,
  Avatar,
  Tag,
  Space,
  Dropdown,
  Empty,
  Spin,
  message,
  Modal,
  Form,
  Select,
  Upload,
  Breadcrumb,
  Tooltip,
  Progress,
  Statistic,
  Row,
  Col,
} from 'antd';
import {
  BookOutlined,
  FolderOutlined,
  FolderOpenOutlined,
  FileOutlined,
  FileTextOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FilePptOutlined,
  FileImageOutlined,
  FileZipOutlined,
  FileMarkdownOutlined,
  PlusOutlined,
  SearchOutlined,
  UploadOutlined,
  DownloadOutlined,
  EditOutlined,
  DeleteOutlined,
  ShareAltOutlined,
  StarOutlined,
  StarFilled,
  EyeOutlined,
  ClockCircleOutlined,
  UserOutlined,
  TeamOutlined,
  LockOutlined,
  GlobalOutlined,
  MoreOutlined,
  HomeOutlined,
  RobotOutlined,
  BulbOutlined,
  LinkOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { TreeNode } = Tree;

// 知识库类型
interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'personal' | 'team' | 'public';
  documentCount: number;
  memberCount: number;
  updatedAt: string;
  starred: boolean;
}

// 文件夹类型
interface Folder {
  key: string;
  title: string;
  icon?: React.ReactNode;
  children?: Folder[];
  isLeaf?: boolean;
  documentCount?: number;
}

// 文档类型
interface Document {
  id: string;
  title: string;
  type: 'markdown' | 'pdf' | 'word' | 'excel' | 'ppt' | 'image' | 'other';
  size: number;
  folderId: string;
  createdBy: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  starred: boolean;
  tags: string[];
  permission: 'private' | 'team' | 'public';
}

// 文件类型图标映射
const fileTypeIcons: Record<string, React.ReactNode> = {
  markdown: <FileMarkdownOutlined style={{ color: '#1890ff' }} />,
  pdf: <FilePdfOutlined style={{ color: '#ff4d4f' }} />,
  word: <FileWordOutlined style={{ color: '#1890ff' }} />,
  excel: <FileExcelOutlined style={{ color: '#52c41a' }} />,
  ppt: <FilePptOutlined style={{ color: '#fa8c16' }} />,
  image: <FileImageOutlined style={{ color: '#722ed1' }} />,
  other: <FileOutlined style={{ color: '#8c8c8c' }} />,
};

// 权限图标映射
const permissionIcons: Record<string, React.ReactNode> = {
  private: <LockOutlined />,
  team: <TeamOutlined />,
  public: <GlobalOutlined />,
};

export default function KnowledgePage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [createForm] = Form.useForm();
  const [uploadForm] = Form.useForm();

  // 获取知识库列表
  const { data: knowledgeBases, isLoading: isLoadingBases } = useQuery<KnowledgeBase[]>({
    queryKey: ['knowledge-bases'],
    queryFn: async () => [
      {
        id: '1',
        name: '产品文档',
        description: '产品需求、设计文档、用户手册等',
        icon: '📚',
        type: 'team',
        documentCount: 156,
        memberCount: 12,
        updatedAt: dayjs().subtract(1, 'hour').toISOString(),
        starred: true,
      },
      {
        id: '2',
        name: '技术文档',
        description: '技术方案、架构设计、API文档等',
        icon: '💻',
        type: 'team',
        documentCount: 89,
        memberCount: 8,
        updatedAt: dayjs().subtract(2, 'hour').toISOString(),
        starred: true,
      },
      {
        id: '3',
        name: '个人笔记',
        description: '个人学习笔记和工作记录',
        icon: '📝',
        type: 'personal',
        documentCount: 45,
        memberCount: 1,
        updatedAt: dayjs().subtract(1, 'day').toISOString(),
        starred: false,
      },
      {
        id: '4',
        name: '公司制度',
        description: '公司规章制度、流程规范等',
        icon: '📋',
        type: 'public',
        documentCount: 32,
        memberCount: 50,
        updatedAt: dayjs().subtract(3, 'day').toISOString(),
        starred: false,
      },
    ],
  });

  // 获取文件夹树
  const { data: folderTree } = useQuery<Folder[]>({
    queryKey: ['folder-tree', selectedKnowledgeBase],
    queryFn: async () => [
      {
        key: '1',
        title: '需求文档',
        icon: <FolderOutlined />,
        documentCount: 25,
        children: [
          { key: '1-1', title: 'PRD', isLeaf: true, documentCount: 10 },
          { key: '1-2', title: '用户故事', isLeaf: true, documentCount: 15 },
        ],
      },
      {
        key: '2',
        title: '设计文档',
        icon: <FolderOutlined />,
        documentCount: 18,
        children: [
          { key: '2-1', title: 'UI设计', isLeaf: true, documentCount: 8 },
          { key: '2-2', title: '交互设计', isLeaf: true, documentCount: 10 },
        ],
      },
      {
        key: '3',
        title: '技术方案',
        icon: <FolderOutlined />,
        documentCount: 30,
        children: [
          { key: '3-1', title: '架构设计', isLeaf: true, documentCount: 12 },
          { key: '3-2', title: 'API文档', isLeaf: true, documentCount: 18 },
        ],
      },
      {
        key: '4',
        title: '会议记录',
        icon: <FolderOutlined />,
        documentCount: 45,
      },
    ],
    enabled: !!selectedKnowledgeBase,
  });

  // 获取文档列表
  const { data: documents, isLoading: isLoadingDocs } = useQuery<Document[]>({
    queryKey: ['documents', selectedKnowledgeBase, selectedFolder, searchKeyword],
    queryFn: async () => {
      const allDocs: Document[] = [
        {
          id: '1',
          title: '摩塔项目管理系统PRD v2.0',
          type: 'markdown',
          size: 256000,
          folderId: '1-1',
          createdBy: { id: '1', name: '张三' },
          createdAt: dayjs().subtract(2, 'day').toISOString(),
          updatedAt: dayjs().subtract(1, 'hour').toISOString(),
          viewCount: 128,
          starred: true,
          tags: ['PRD', '核心功能'],
          permission: 'team',
        },
        {
          id: '2',
          title: '系统架构设计文档',
          type: 'pdf',
          size: 1024000,
          folderId: '3-1',
          createdBy: { id: '2', name: '李四' },
          createdAt: dayjs().subtract(5, 'day').toISOString(),
          updatedAt: dayjs().subtract(2, 'day').toISOString(),
          viewCount: 89,
          starred: true,
          tags: ['架构', '技术方案'],
          permission: 'team',
        },
        {
          id: '3',
          title: 'API接口文档',
          type: 'markdown',
          size: 128000,
          folderId: '3-2',
          createdBy: { id: '2', name: '李四' },
          createdAt: dayjs().subtract(3, 'day').toISOString(),
          updatedAt: dayjs().subtract(1, 'day').toISOString(),
          viewCount: 256,
          starred: false,
          tags: ['API', '接口'],
          permission: 'public',
        },
        {
          id: '4',
          title: 'UI设计规范',
          type: 'pdf',
          size: 2048000,
          folderId: '2-1',
          createdBy: { id: '3', name: '王五' },
          createdAt: dayjs().subtract(7, 'day').toISOString(),
          updatedAt: dayjs().subtract(3, 'day').toISOString(),
          viewCount: 67,
          starred: false,
          tags: ['UI', '设计规范'],
          permission: 'team',
        },
        {
          id: '5',
          title: '项目周会记录 - 2024W01',
          type: 'word',
          size: 64000,
          folderId: '4',
          createdBy: { id: '1', name: '张三' },
          createdAt: dayjs().subtract(1, 'day').toISOString(),
          updatedAt: dayjs().subtract(1, 'day').toISOString(),
          viewCount: 23,
          starred: false,
          tags: ['会议', '周报'],
          permission: 'team',
        },
      ];

      if (searchKeyword) {
        return allDocs.filter(
          (doc) =>
            doc.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            doc.tags.some((tag) => tag.toLowerCase().includes(searchKeyword.toLowerCase()))
        );
      }

      return allDocs;
    },
    enabled: !!selectedKnowledgeBase,
  });

  // 获取统计数据
  const { data: stats } = useQuery({
    queryKey: ['knowledge-stats'],
    queryFn: async () => ({
      totalDocuments: 322,
      totalViews: 12580,
      totalStorage: 2.5, // GB
      recentUpdates: 28,
    }),
  });

  // 获取AI推荐
  const { data: aiRecommendations } = useQuery({
    queryKey: ['ai-recommendations'],
    queryFn: async () => [
      { id: '1', title: '系统架构设计文档', reason: '与您最近查看的内容相关' },
      { id: '2', title: 'API接口文档', reason: '团队成员正在频繁查看' },
      { id: '3', title: 'UI设计规范', reason: '最近更新' },
    ],
  });

  // 创建知识库
  const createKnowledgeBaseMutation = useMutation({
    mutationFn: async (values: any) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return values;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-bases'] });
      setIsCreateModalOpen(false);
      createForm.resetFields();
      message.success('知识库创建成功');
    },
  });

  // 上传文档
  const uploadDocumentMutation = useMutation({
    mutationFn: async (values: any) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return values;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setIsUploadModalOpen(false);
      uploadForm.resetFields();
      message.success('文档上传成功');
    },
  });

  // 切换收藏
  const toggleStarMutation = useMutation({
    mutationFn: async ({ id, type }: { id: string; type: 'base' | 'document' }) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return { id, type };
    },
    onSuccess: (_, { type }) => {
      if (type === 'base') {
        queryClient.invalidateQueries({ queryKey: ['knowledge-bases'] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['documents'] });
      }
    },
  });

  // 删除文档
  const deleteDocumentMutation = useMutation({
    mutationFn: async (id: string) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      message.success('文档已删除');
    },
  });

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // 渲染知识库卡片
  const renderKnowledgeBaseCard = (base: KnowledgeBase) => (
    <Card
      key={base.id}
      hoverable
      className="cursor-pointer"
      onClick={() => setSelectedKnowledgeBase(base.id)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{base.icon}</div>
          <div>
            <div className="flex items-center gap-2">
              <Text strong>{base.name}</Text>
              {base.starred && <StarFilled className="text-yellow-500" />}
            </div>
            <Text type="secondary" className="text-sm">
              {base.description}
            </Text>
          </div>
        </div>
        <Dropdown
          menu={{
            items: [
              { key: 'edit', label: '编辑', icon: <EditOutlined /> },
              { key: 'share', label: '分享', icon: <ShareAltOutlined /> },
              { type: 'divider' },
              { key: 'delete', label: '删除', icon: <DeleteOutlined />, danger: true },
            ],
          }}
          trigger={['click']}
        >
          <Button
            type="text"
            icon={<MoreOutlined />}
            onClick={(e) => e.stopPropagation()}
          />
        </Dropdown>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <Space>
          <span>
            <FileOutlined className="mr-1" />
            {base.documentCount} 文档
          </span>
          <span>
            <UserOutlined className="mr-1" />
            {base.memberCount} 成员
          </span>
        </Space>
        <span>
          <ClockCircleOutlined className="mr-1" />
          {dayjs(base.updatedAt).fromNow()}更新
        </span>
      </div>
    </Card>
  );

  // 渲染文档列表项
  const renderDocumentItem = (doc: Document) => (
    <List.Item
      key={doc.id}
      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
      actions={[
        <Tooltip key="star" title={doc.starred ? '取消收藏' : '收藏'}>
          <Button
            type="text"
            icon={doc.starred ? <StarFilled className="text-yellow-500" /> : <StarOutlined />}
            onClick={() => toggleStarMutation.mutate({ id: doc.id, type: 'document' })}
          />
        </Tooltip>,
        <Tooltip key="download" title="下载">
          <Button type="text" icon={<DownloadOutlined />} />
        </Tooltip>,
        <Tooltip key="share" title="分享">
          <Button type="text" icon={<ShareAltOutlined />} />
        </Tooltip>,
        <Dropdown
          key="more"
          menu={{
            items: [
              { key: 'edit', label: '编辑', icon: <EditOutlined /> },
              { key: 'copy', label: '复制链接', icon: <LinkOutlined /> },
              { type: 'divider' },
              { key: 'delete', label: '删除', icon: <DeleteOutlined />, danger: true },
            ],
            onClick: ({ key }) => {
              if (key === 'delete') {
                Modal.confirm({
                  title: '确认删除',
                  content: `确定要删除文档"${doc.title}"吗？`,
                  onOk: () => deleteDocumentMutation.mutate(doc.id),
                });
              } else if (key === 'copy') {
                navigator.clipboard.writeText(`${window.location.origin}/knowledge/doc/${doc.id}`);
                message.success('链接已复制');
              }
            },
          }}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>,
      ]}
    >
      <List.Item.Meta
        avatar={fileTypeIcons[doc.type]}
        title={
          <div className="flex items-center gap-2">
            <Link href={`/knowledge/doc/${doc.id}`} className="hover:text-blue-500">
              {doc.title}
            </Link>
            {permissionIcons[doc.permission]}
          </div>
        }
        description={
          <Space size="middle" className="text-xs">
            <span>
              <UserOutlined className="mr-1" />
              {doc.createdBy.name}
            </span>
            <span>
              <ClockCircleOutlined className="mr-1" />
              {dayjs(doc.updatedAt).format('YYYY-MM-DD HH:mm')}
            </span>
            <span>
              <EyeOutlined className="mr-1" />
              {doc.viewCount}
            </span>
            <span>{formatFileSize(doc.size)}</span>
          </Space>
        }
      />
      <Space>
        {doc.tags.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </Space>
    </List.Item>
  );

  return (
    <div className="knowledge-page">
      {/* 页面标题 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Title level={3} className="mb-1">
            <BookOutlined className="mr-2" />
            知识库
          </Title>
          <Text type="secondary">管理和分享团队知识资产</Text>
        </div>
        <Space>
          <Button icon={<UploadOutlined />} onClick={() => setIsUploadModalOpen(true)}>
            上传文档
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsCreateModalOpen(true)}>
            新建知识库
          </Button>
        </Space>
      </div>

      {/* 统计卡片 */}
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic
              title="文档总数"
              value={stats?.totalDocuments || 0}
              prefix={<FileOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总浏览量"
              value={stats?.totalViews || 0}
              prefix={<EyeOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="存储空间"
              value={stats?.totalStorage || 0}
              suffix="GB"
              precision={1}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="近期更新"
              value={stats?.recentUpdates || 0}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {selectedKnowledgeBase ? (
        // 知识库详情视图
        <div className="flex gap-6">
          {/* 左侧文件夹树 */}
          <Card className="w-64 flex-shrink-0">
            <div className="mb-4">
              <Breadcrumb
                items={[
                  {
                    title: (
                      <a onClick={() => setSelectedKnowledgeBase(null)}>
                        <HomeOutlined /> 知识库
                      </a>
                    ),
                  },
                  {
                    title: knowledgeBases?.find((b) => b.id === selectedKnowledgeBase)?.name,
                  },
                ]}
              />
            </div>
            <div className="mb-4">
              <Button type="dashed" block icon={<PlusOutlined />}>
                新建文件夹
              </Button>
            </div>
            <Tree
              showIcon
              defaultExpandAll
              selectedKeys={selectedFolder ? [selectedFolder] : []}
              onSelect={(keys) => setSelectedFolder(keys[0] as string)}
              treeData={folderTree}
              titleRender={(node) => (
                <div className="flex items-center justify-between">
                  <span>{node.title as string}</span>
                  {node.documentCount && (
                    <span className="text-xs text-gray-400">{node.documentCount}</span>
                  )}
                </div>
              )}
            />
          </Card>

          {/* 右侧文档列表 */}
          <div className="flex-1">
            {/* 搜索和筛选 */}
            <Card className="mb-4">
              <div className="flex items-center justify-between">
                <Search
                  placeholder="搜索文档..."
                  allowClear
                  style={{ width: 300 }}
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                />
                <Space>
                  <Select defaultValue="all" style={{ width: 120 }}>
                    <Select.Option value="all">全部类型</Select.Option>
                    <Select.Option value="markdown">Markdown</Select.Option>
                    <Select.Option value="pdf">PDF</Select.Option>
                    <Select.Option value="word">Word</Select.Option>
                    <Select.Option value="excel">Excel</Select.Option>
                  </Select>
                  <Select defaultValue="updated" style={{ width: 120 }}>
                    <Select.Option value="updated">最近更新</Select.Option>
                    <Select.Option value="created">创建时间</Select.Option>
                    <Select.Option value="views">浏览量</Select.Option>
                    <Select.Option value="name">名称</Select.Option>
                  </Select>
                </Space>
              </div>
            </Card>

            {/* AI推荐 */}
            {aiRecommendations && aiRecommendations.length > 0 && (
              <Card className="mb-4" size="small">
                <div className="flex items-center gap-2 text-sm">
                  <RobotOutlined className="text-purple-500" />
                  <Text strong>AI推荐：</Text>
                  {aiRecommendations.map((rec, index) => (
                    <span key={rec.id}>
                      <Tooltip title={rec.reason}>
                        <Link href={`/knowledge/doc/${rec.id}`} className="text-blue-500">
                          {rec.title}
                        </Link>
                      </Tooltip>
                      {index < aiRecommendations.length - 1 && '、'}
                    </span>
                  ))}
                </div>
              </Card>
            )}

            {/* 文档列表 */}
            <Card>
              {isLoadingDocs ? (
                <div className="flex h-64 items-center justify-center">
                  <Spin />
                </div>
              ) : documents && documents.length > 0 ? (
                <List
                  dataSource={documents}
                  renderItem={renderDocumentItem}
                  pagination={{
                    pageSize: 10,
                    showTotal: (total) => `共 ${total} 个文档`,
                  }}
                />
              ) : (
                <Empty description="暂无文档" />
              )}
            </Card>
          </div>
        </div>
      ) : (
        // 知识库列表视图
        <div>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              { key: 'all', label: '全部知识库' },
              { key: 'starred', label: '我的收藏' },
              { key: 'recent', label: '最近访问' },
            ]}
          />

          {isLoadingBases ? (
            <div className="flex h-64 items-center justify-center">
              <Spin />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {knowledgeBases
                ?.filter((base) => {
                  if (activeTab === 'starred') return base.starred;
                  return true;
                })
                .map(renderKnowledgeBaseCard)}
            </div>
          )}
        </div>
      )}

      {/* 创建知识库弹窗 */}
      <Modal
        title="新建知识库"
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onOk={() => createForm.submit()}
        confirmLoading={createKnowledgeBaseMutation.isPending}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={(values) => createKnowledgeBaseMutation.mutate(values)}
        >
          <Form.Item
            name="name"
            label="知识库名称"
            rules={[{ required: true, message: '请输入知识库名称' }]}
          >
            <Input placeholder="请输入知识库名称" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="请输入知识库描述" />
          </Form.Item>
          <Form.Item
            name="type"
            label="类型"
            rules={[{ required: true, message: '请选择类型' }]}
          >
            <Select placeholder="请选择类型">
              <Select.Option value="personal">
                <Space>
                  <LockOutlined />
                  个人知识库
                </Space>
              </Select.Option>
              <Select.Option value="team">
                <Space>
                  <TeamOutlined />
                  团队知识库
                </Space>
              </Select.Option>
              <Select.Option value="public">
                <Space>
                  <GlobalOutlined />
                  公开知识库
                </Space>
              </Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="icon" label="图标">
            <Input placeholder="选择或输入表情符号" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 上传文档弹窗 */}
      <Modal
        title="上传文档"
        open={isUploadModalOpen}
        onCancel={() => setIsUploadModalOpen(false)}
        onOk={() => uploadForm.submit()}
        confirmLoading={uploadDocumentMutation.isPending}
      >
        <Form
          form={uploadForm}
          layout="vertical"
          onFinish={(values) => uploadDocumentMutation.mutate(values)}
        >
          <Form.Item
            name="files"
            label="选择文件"
            rules={[{ required: true, message: '请选择文件' }]}
          >
            <Upload.Dragger multiple>
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
              <p className="ant-upload-hint">
                支持 Markdown、PDF、Word、Excel、PPT 等格式
              </p>
            </Upload.Dragger>
          </Form.Item>
          <Form.Item name="folder" label="目标文件夹">
            <Select placeholder="选择文件夹">
              <Select.Option value="1">需求文档</Select.Option>
              <Select.Option value="2">设计文档</Select.Option>
              <Select.Option value="3">技术方案</Select.Option>
              <Select.Option value="4">会议记录</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="tags" label="标签">
            <Select mode="tags" placeholder="添加标签" />
          </Form.Item>
          <Form.Item name="permission" label="权限">
            <Select defaultValue="team">
              <Select.Option value="private">仅自己可见</Select.Option>
              <Select.Option value="team">团队可见</Select.Option>
              <Select.Option value="public">公开</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}