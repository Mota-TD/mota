'use client';

import { useState } from 'react';
import {
  Card,
  Typography,
  Button,
  Input,
  Tabs,
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
  Badge,
  Row,
  Col,
} from 'antd';
import {
  FileOutlined,
  FileTextOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FilePptOutlined,
  FileImageOutlined,
  FileMarkdownOutlined,
  FolderOutlined,
  FolderOpenOutlined,
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
  CopyOutlined,
  LinkOutlined,
  HistoryOutlined,
  CommentOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

// 文档类型
interface Document {
  id: string;
  title: string;
  type: 'markdown' | 'pdf' | 'word' | 'excel' | 'ppt' | 'image' | 'folder' | 'other';
  size?: number;
  parentId: string | null;
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
  collaborators?: Array<{
    id: string;
    name: string;
    avatar?: string;
    role: 'owner' | 'editor' | 'viewer';
  }>;
  version?: number;
  comments?: number;
}

// 文件类型图标映射
const fileTypeIcons: Record<string, React.ReactNode> = {
  markdown: <FileMarkdownOutlined style={{ color: '#1890ff', fontSize: 32 }} />,
  pdf: <FilePdfOutlined style={{ color: '#ff4d4f', fontSize: 32 }} />,
  word: <FileWordOutlined style={{ color: '#1890ff', fontSize: 32 }} />,
  excel: <FileExcelOutlined style={{ color: '#52c41a', fontSize: 32 }} />,
  ppt: <FilePptOutlined style={{ color: '#fa8c16', fontSize: 32 }} />,
  image: <FileImageOutlined style={{ color: '#722ed1', fontSize: 32 }} />,
  folder: <FolderOutlined style={{ color: '#faad14', fontSize: 32 }} />,
  other: <FileOutlined style={{ color: '#8c8c8c', fontSize: 32 }} />,
};

// 小图标
const fileTypeIconsSmall: Record<string, React.ReactNode> = {
  markdown: <FileMarkdownOutlined style={{ color: '#1890ff' }} />,
  pdf: <FilePdfOutlined style={{ color: '#ff4d4f' }} />,
  word: <FileWordOutlined style={{ color: '#1890ff' }} />,
  excel: <FileExcelOutlined style={{ color: '#52c41a' }} />,
  ppt: <FilePptOutlined style={{ color: '#fa8c16' }} />,
  image: <FileImageOutlined style={{ color: '#722ed1' }} />,
  folder: <FolderOutlined style={{ color: '#faad14' }} />,
  other: <FileOutlined style={{ color: '#8c8c8c' }} />,
};

// 权限图标映射
const permissionConfig: Record<string, { icon: React.ReactNode; label: string }> = {
  private: { icon: <LockOutlined />, label: '仅自己' },
  team: { icon: <TeamOutlined />, label: '团队' },
  public: { icon: <GlobalOutlined />, label: '公开' },
};

export default function DocumentsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('all');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [createForm] = Form.useForm();
  const [uploadForm] = Form.useForm();

  // 获取文档列表
  const { data: documents, isLoading } = useQuery<Document[]>({
    queryKey: ['documents', currentFolderId, searchKeyword, activeTab],
    queryFn: async () => {
      try {
        const { documentService } = await import('@/services');
        return await documentService.getDocuments({
          folderId: currentFolderId,
          search: searchKeyword || undefined,
          tab: activeTab,
        });
      } catch {
        return [];
      }
    },
  });

  // 获取面包屑路径
  const { data: breadcrumbPath } = useQuery({
    queryKey: ['document-path', currentFolderId],
    queryFn: async () => {
      if (!currentFolderId) return [];
      try {
        const { documentService } = await import('@/services');
        return await documentService.getBreadcrumbPath(currentFolderId);
      } catch {
        return [];
      }
    },
    enabled: !!currentFolderId,
  });

  // 创建文档/文件夹
  const createDocumentMutation = useMutation({
    mutationFn: async (values: any) => {
      const { documentService } = await import('@/services');
      return await documentService.create({
        title: values.title,
        type: values.type === 'folder' ? 'folder' : 'markdown',
        parentId: currentFolderId,
        template: values.template,
        permission: values.permission,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setIsCreateModalOpen(false);
      createForm.resetFields();
      message.success('创建成功');
    },
    onError: () => {
      message.error('创建失败');
    },
  });

  // 上传文档
  const uploadDocumentMutation = useMutation({
    mutationFn: async (values: any) => {
      const { documentService } = await import('@/services');
      const formData = new FormData();
      if (values.files?.fileList) {
        values.files.fileList.forEach((file: any) => {
          if (file.originFileObj) {
            formData.append('files', file.originFileObj);
          }
        });
      }
      if (currentFolderId) {
        formData.append('parentId', currentFolderId);
      }
      if (values.permission) {
        formData.append('permission', values.permission);
      }
      return await documentService.upload(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setIsUploadModalOpen(false);
      uploadForm.resetFields();
      message.success('上传成功');
    },
    onError: () => {
      message.error('上传失败');
    },
  });

  // 切换收藏
  const toggleStarMutation = useMutation({
    mutationFn: async (id: string) => {
      const { documentService } = await import('@/services');
      return await documentService.toggleStar(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: () => {
      message.error('操作失败');
    },
  });

  // 删除文档
  const deleteDocumentMutation = useMutation({
    mutationFn: async (id: string) => {
      const { documentService } = await import('@/services');
      await documentService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      message.success('已删除');
    },
    onError: () => {
      message.error('删除失败');
    },
  });

  // 格式化文件大小
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '-';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // 处理文档点击
  const handleDocumentClick = (doc: Document) => {
    if (doc.type === 'folder') {
      setCurrentFolderId(doc.id);
    } else {
      // 打开文档
      window.location.href = `/documents/${doc.id}`;
    }
  };

  // 渲染网格视图
  const renderGridView = () => (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
      {documents?.map((doc) => (
        <Card
          key={doc.id}
          hoverable
          className="cursor-pointer"
          onClick={() => handleDocumentClick(doc)}
        >
          <div className="flex flex-col items-center">
            <div className="relative mb-3">
              {fileTypeIcons[doc.type]}
              {doc.starred && (
                <StarFilled className="absolute -right-2 -top-2 text-yellow-500" />
              )}
            </div>
            <Text strong ellipsis className="w-full text-center">
              {doc.title}
            </Text>
            <Text type="secondary" className="text-xs">
              {doc.type === 'folder' ? '文件夹' : formatFileSize(doc.size)}
            </Text>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
            <span>{dayjs(doc.updatedAt).format('MM-DD')}</span>
            <Dropdown
              menu={{
                items: [
                  { key: 'open', label: '打开', icon: <EyeOutlined /> },
                  { key: 'star', label: doc.starred ? '取消收藏' : '收藏', icon: <StarOutlined /> },
                  { key: 'share', label: '分享', icon: <ShareAltOutlined /> },
                  { key: 'download', label: '下载', icon: <DownloadOutlined /> },
                  { type: 'divider' },
                  { key: 'delete', label: '删除', icon: <DeleteOutlined />, danger: true },
                ],
                onClick: ({ key, domEvent }) => {
                  domEvent.stopPropagation();
                  if (key === 'star') {
                    toggleStarMutation.mutate(doc.id);
                  } else if (key === 'delete') {
                    Modal.confirm({
                      title: '确认删除',
                      content: `确定要删除"${doc.title}"吗？`,
                      onOk: () => deleteDocumentMutation.mutate(doc.id),
                    });
                  } else if (key === 'share') {
                    setSelectedDocument(doc);
                    setIsShareModalOpen(true);
                  }
                },
              }}
              trigger={['click']}
            >
              <Button
                type="text"
                size="small"
                icon={<MoreOutlined />}
                onClick={(e) => e.stopPropagation()}
              />
            </Dropdown>
          </div>
        </Card>
      ))}
    </div>
  );

  // 渲染列表视图
  const renderListView = () => (
    <List
      dataSource={documents}
      renderItem={(doc) => (
        <List.Item
          className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
          onClick={() => handleDocumentClick(doc)}
          actions={[
            <Tooltip key="star" title={doc.starred ? '取消收藏' : '收藏'}>
              <Button
                type="text"
                icon={doc.starred ? <StarFilled className="text-yellow-500" /> : <StarOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleStarMutation.mutate(doc.id);
                }}
              />
            </Tooltip>,
            <Tooltip key="share" title="分享">
              <Button
                type="text"
                icon={<ShareAltOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDocument(doc);
                  setIsShareModalOpen(true);
                }}
              />
            </Tooltip>,
            <Tooltip key="download" title="下载">
              <Button
                type="text"
                icon={<DownloadOutlined />}
                onClick={(e) => e.stopPropagation()}
              />
            </Tooltip>,
            <Dropdown
              key="more"
              menu={{
                items: [
                  { key: 'edit', label: '编辑', icon: <EditOutlined /> },
                  { key: 'history', label: '历史版本', icon: <HistoryOutlined /> },
                  { key: 'copy', label: '复制链接', icon: <LinkOutlined /> },
                  { type: 'divider' },
                  { key: 'delete', label: '删除', icon: <DeleteOutlined />, danger: true },
                ],
                onClick: ({ key, domEvent }) => {
                  domEvent.stopPropagation();
                  if (key === 'delete') {
                    Modal.confirm({
                      title: '确认删除',
                      content: `确定要删除"${doc.title}"吗？`,
                      onOk: () => deleteDocumentMutation.mutate(doc.id),
                    });
                  } else if (key === 'copy') {
                    navigator.clipboard.writeText(`${window.location.origin}/documents/${doc.id}`);
                    message.success('链接已复制');
                  }
                },
              }}
            >
              <Button type="text" icon={<MoreOutlined />} onClick={(e) => e.stopPropagation()} />
            </Dropdown>,
          ]}
        >
          <List.Item.Meta
            avatar={fileTypeIconsSmall[doc.type]}
            title={
              <Space>
                <Text strong>{doc.title}</Text>
                {permissionConfig[doc.permission]?.icon}
                {doc.version && doc.version > 1 && (
                  <Tag className="text-xs">v{doc.version}</Tag>
                )}
              </Space>
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
                {doc.type !== 'folder' && (
                  <>
                    <span>
                      <EyeOutlined className="mr-1" />
                      {doc.viewCount}
                    </span>
                    <span>{formatFileSize(doc.size)}</span>
                    {doc.comments !== undefined && doc.comments > 0 && (
                      <span>
                        <CommentOutlined className="mr-1" />
                        {doc.comments}
                      </span>
                    )}
                  </>
                )}
              </Space>
            }
          />
          <Space>
            {doc.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </Space>
        </List.Item>
      )}
    />
  );

  return (
    <div className="documents-page">
      {/* 页面标题 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Title level={3} className="mb-1">
            <FileTextOutlined className="mr-2" />
            文档协作
          </Title>
          <Text type="secondary">创建、编辑和共享团队文档</Text>
        </div>
        <Space>
          <Button icon={<UploadOutlined />} onClick={() => setIsUploadModalOpen(true)}>
            上传
          </Button>
          <Dropdown
            menu={{
              items: [
                { key: 'document', label: '新建文档', icon: <FileMarkdownOutlined /> },
                { key: 'folder', label: '新建文件夹', icon: <FolderOutlined /> },
              ],
              onClick: ({ key }) => {
                createForm.setFieldValue('type', key);
                setIsCreateModalOpen(true);
              },
            }}
          >
            <Button type="primary" icon={<PlusOutlined />}>
              新建
            </Button>
          </Dropdown>
        </Space>
      </div>

      {/* 面包屑导航 */}
      {currentFolderId && (
        <Card className="mb-4" size="small">
          <Breadcrumb
            items={[
              {
                title: (
                  <a onClick={() => setCurrentFolderId(null)}>
                    <HomeOutlined /> 全部文档
                  </a>
                ),
              },
              ...(breadcrumbPath?.map((item) => ({
                title: item.title,
              })) || []),
            ]}
          />
        </Card>
      )}

      {/* 搜索和筛选 */}
      <Card className="mb-4">
        <div className="flex items-center justify-between">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              { key: 'all', label: '全部' },
              { key: 'recent', label: '最近' },
              { key: 'starred', label: '收藏' },
              { key: 'shared', label: '共享' },
            ]}
          />
          <Space>
            <Search
              placeholder="搜索文档..."
              allowClear
              style={{ width: 250 }}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
            <Button.Group>
              <Button
                icon={<AppstoreOutlined />}
                type={viewMode === 'grid' ? 'primary' : 'default'}
                onClick={() => setViewMode('grid')}
              />
              <Button
                icon={<UnorderedListOutlined />}
                type={viewMode === 'list' ? 'primary' : 'default'}
                onClick={() => setViewMode('list')}
              />
            </Button.Group>
          </Space>
        </div>
      </Card>

      {/* 文档列表 */}
      <Card>
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Spin />
          </div>
        ) : documents && documents.length > 0 ? (
          viewMode === 'grid' ? renderGridView() : renderListView()
        ) : (
          <Empty description="暂无文档" />
        )}
      </Card>

      {/* 新建弹窗 */}
      <Modal
        title={createForm.getFieldValue('type') === 'folder' ? '新建文件夹' : '新建文档'}
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onOk={() => createForm.submit()}
        confirmLoading={createDocumentMutation.isPending}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={(values) => createDocumentMutation.mutate(values)}
        >
          <Form.Item name="type" hidden>
            <Input />
          </Form.Item>
          <Form.Item
            name="title"
            label="名称"
            rules={[{ required: true, message: '请输入名称' }]}
          >
            <Input placeholder="请输入名称" />
          </Form.Item>
          {createForm.getFieldValue('type') !== 'folder' && (
            <>
              <Form.Item name="template" label="模板">
                <Select placeholder="选择模板（可选）">
                  <Select.Option value="blank">空白文档</Select.Option>
                  <Select.Option value="prd">产品需求文档</Select.Option>
                  <Select.Option value="tech">技术方案</Select.Option>
                  <Select.Option value="meeting">会议纪要</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="permission" label="权限" initialValue="team">
                <Select>
                  <Select.Option value="private">
                    <Space>
                      <LockOutlined />
                      仅自己可见
                    </Space>
                  </Select.Option>
                  <Select.Option value="team">
                    <Space>
                      <TeamOutlined />
                      团队可见
                    </Space>
                  </Select.Option>
                  <Select.Option value="public">
                    <Space>
                      <GlobalOutlined />
                      公开
                    </Space>
                  </Select.Option>
                </Select>
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>

      {/* 上传弹窗 */}
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
            rules={[{ required: true, message: '请选择文件' }]}
          >
            <Upload.Dragger multiple>
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
              <p className="ant-upload-hint">支持多文件上传</p>
            </Upload.Dragger>
          </Form.Item>
          <Form.Item name="permission" label="权限" initialValue="team">
            <Select>
              <Select.Option value="private">仅自己可见</Select.Option>
              <Select.Option value="team">团队可见</Select.Option>
              <Select.Option value="public">公开</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 分享弹窗 */}
      <Modal
        title="分享文档"
        open={isShareModalOpen}
        onCancel={() => setIsShareModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsShareModalOpen(false)}>
            关闭
          </Button>,
        ]}
      >
        {selectedDocument && (
          <div className="space-y-4">
            <div>
              <Text strong>文档链接</Text>
              <div className="mt-2 flex gap-2">
                <Input
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/documents/${selectedDocument.id}`}
                  readOnly
                />
                <Button
                  icon={<CopyOutlined />}
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/documents/${selectedDocument.id}`
                    );
                    message.success('链接已复制');
                  }}
                >
                  复制
                </Button>
              </div>
            </div>
            <div>
              <Text strong>访问权限</Text>
              <Select
                className="mt-2 w-full"
                defaultValue={selectedDocument.permission}
              >
                <Select.Option value="private">
                  <Space>
                    <LockOutlined />
                    仅自己可见
                  </Space>
                </Select.Option>
                <Select.Option value="team">
                  <Space>
                    <TeamOutlined />
                    团队可见
                  </Space>
                </Select.Option>
                <Select.Option value="public">
                  <Space>
                    <GlobalOutlined />
                    公开（任何人可访问）
                  </Space>
                </Select.Option>
              </Select>
            </div>
            {selectedDocument.collaborators && (
              <div>
                <Text strong>协作者</Text>
                <List
                  className="mt-2"
                  dataSource={selectedDocument.collaborators}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar src={item.avatar}>{item.name[0]}</Avatar>}
                        title={item.name}
                        description={
                          item.role === 'owner'
                            ? '所有者'
                            : item.role === 'editor'
                            ? '可编辑'
                            : '可查看'
                        }
                      />
                    </List.Item>
                  )}
                />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}