import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Input,
  Select,
  Modal,
  message,
  Tooltip,
  Popconfirm,
  Empty,
  Tabs,
  Badge,
  Dropdown,
  Menu,
} from 'antd';
import {
  StarOutlined,
  StarFilled,
  DeleteOutlined,
  FolderOutlined,
  FileTextOutlined,
  SearchOutlined,
  ExportOutlined,
  DownloadOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileMarkdownOutlined,
  Html5Outlined,
  MoreOutlined,
  ClockCircleOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import styles from './index.module.css';
import {
  DocumentFavorite,
  DocumentAccessLog,
  FavoriteFolder,
  getUserFavorites,
  getUserFavoritesByFolder,
  getUserFavoriteFolders,
  removeFavorite,
  batchRemoveFavorites,
  updateFavoriteFolder,
  getRecentAccessDocuments,
  clearAccessHistory,
  downloadDocument,
} from '../../services/api/document';

const { TabPane } = Tabs;
const { Option } = Select;

const FavoritesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('favorites');
  const [favorites, setFavorites] = useState<DocumentFavorite[]>([]);
  const [recentAccess, setRecentAccess] = useState<DocumentAccessLog[]>([]);
  const [folders, setFolders] = useState<FavoriteFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [moveModalVisible, setMoveModalVisible] = useState(false);
  const [moveTargetFolder, setMoveTargetFolder] = useState<string>('');
  const [currentDocument, setCurrentDocument] = useState<DocumentFavorite | null>(null);

  // 模拟当前用户ID
  const currentUserId = 1;

  useEffect(() => {
    loadData();
  }, [activeTab, selectedFolder]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'favorites') {
        // 加载收藏夹分类
        const foldersData = await getUserFavoriteFolders(currentUserId);
        setFolders(foldersData || []);

        // 加载收藏列表
        if (selectedFolder) {
          const data = await getUserFavoritesByFolder(currentUserId, selectedFolder);
          setFavorites(data || []);
        } else {
          const data = await getUserFavorites(currentUserId, 1, 100);
          setFavorites(data || []);
        }
      } else {
        // 加载最近访问
        const data = await getRecentAccessDocuments(currentUserId, 50);
        setRecentAccess(data || []);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (documentId: number) => {
    try {
      await removeFavorite(documentId, currentUserId);
      message.success('已取消收藏');
      loadData();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleBatchRemove = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要取消收藏的文档');
      return;
    }
    try {
      await batchRemoveFavorites(currentUserId, selectedRowKeys as number[]);
      message.success('批量取消收藏成功');
      setSelectedRowKeys([]);
      loadData();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleMoveToFolder = async () => {
    if (!currentDocument) return;
    try {
      await updateFavoriteFolder(currentDocument.documentId, currentUserId, moveTargetFolder);
      message.success('移动成功');
      setMoveModalVisible(false);
      setCurrentDocument(null);
      setMoveTargetFolder('');
      loadData();
    } catch (error) {
      message.error('移动失败');
    }
  };

  const handleClearHistory = async () => {
    try {
      await clearAccessHistory(currentUserId);
      message.success('已清除访问记录');
      loadData();
    } catch (error) {
      message.error('清除失败');
    }
  };

  const handleExport = async (documentId: number, format: 'pdf' | 'word' | 'markdown' | 'html', title?: string) => {
    try {
      message.loading({ content: '正在导出...', key: 'export' });
      await downloadDocument(documentId, format, title);
      message.success({ content: '导出成功', key: 'export' });
    } catch (error) {
      message.error({ content: '导出失败', key: 'export' });
    }
  };

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      draft: { color: 'default', text: '草稿' },
      published: { color: 'success', text: '已发布' },
      archived: { color: 'warning', text: '已归档' },
    };
    const config = statusMap[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const exportMenu = (record: DocumentFavorite | DocumentAccessLog) => (
    <Menu>
      <Menu.Item key="pdf" icon={<FilePdfOutlined />} onClick={() => handleExport(record.documentId, 'pdf', record.documentTitle)}>
        导出为 PDF
      </Menu.Item>
      <Menu.Item key="word" icon={<FileWordOutlined />} onClick={() => handleExport(record.documentId, 'word', record.documentTitle)}>
        导出为 Word
      </Menu.Item>
      <Menu.Item key="markdown" icon={<FileMarkdownOutlined />} onClick={() => handleExport(record.documentId, 'markdown', record.documentTitle)}>
        导出为 Markdown
      </Menu.Item>
      <Menu.Item key="html" icon={<Html5Outlined />} onClick={() => handleExport(record.documentId, 'html', record.documentTitle)}>
        导出为 HTML
      </Menu.Item>
    </Menu>
  );

  const favoriteColumns: ColumnsType<DocumentFavorite> = [
    {
      title: '文档标题',
      dataIndex: 'documentTitle',
      key: 'documentTitle',
      render: (text, record) => (
        <Space>
          <FileTextOutlined style={{ color: '#1890ff' }} />
          <a href={`/documents/${record.documentId}`}>{text || '未命名文档'}</a>
        </Space>
      ),
      filteredValue: searchKeyword ? [searchKeyword] : null,
      onFilter: (value, record) =>
        record.documentTitle?.toLowerCase().includes(String(value).toLowerCase()) || false,
    },
    {
      title: '所属项目',
      dataIndex: 'projectName',
      key: 'projectName',
      render: (text) => text || '-',
    },
    {
      title: '状态',
      dataIndex: 'documentStatus',
      key: 'documentStatus',
      width: 100,
      render: (status) => getStatusTag(status),
    },
    {
      title: '收藏夹',
      dataIndex: 'folderName',
      key: 'folderName',
      width: 120,
      render: (text) => (
        text ? (
          <Tag icon={<FolderOutlined />} color="blue">{text}</Tag>
        ) : (
          <span style={{ color: '#999' }}>未分类</span>
        )
      ),
    },
    {
      title: '收藏时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space>
          <Tooltip title="查看文档">
            <Button type="link" size="small" icon={<EyeOutlined />} href={`/documents/${record.documentId}`} />
          </Tooltip>
          <Dropdown overlay={exportMenu(record)} trigger={['click']}>
            <Button type="link" size="small" icon={<DownloadOutlined />}>
              导出
            </Button>
          </Dropdown>
          <Tooltip title="移动到收藏夹">
            <Button
              type="link"
              size="small"
              icon={<FolderOutlined />}
              onClick={() => {
                setCurrentDocument(record);
                setMoveModalVisible(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="确定取消收藏吗？"
            onConfirm={() => handleRemoveFavorite(record.documentId)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const recentColumns: ColumnsType<DocumentAccessLog> = [
    {
      title: '文档标题',
      dataIndex: 'documentTitle',
      key: 'documentTitle',
      render: (text, record) => (
        <Space>
          <FileTextOutlined style={{ color: '#1890ff' }} />
          <a href={`/documents/${record.documentId}`}>{text || '未命名文档'}</a>
        </Space>
      ),
    },
    {
      title: '所属项目',
      dataIndex: 'projectName',
      key: 'projectName',
      render: (text) => text || '-',
    },
    {
      title: '状态',
      dataIndex: 'documentStatus',
      key: 'documentStatus',
      width: 100,
      render: (status) => getStatusTag(status),
    },
    {
      title: '访问次数',
      dataIndex: 'accessCount',
      key: 'accessCount',
      width: 100,
      render: (count) => <Badge count={count} showZero style={{ backgroundColor: '#52c41a' }} />,
    },
    {
      title: '最后访问',
      dataIndex: 'lastAccessAt',
      key: 'lastAccessAt',
      width: 180,
      sorter: (a, b) => new Date(a.lastAccessAt).getTime() - new Date(b.lastAccessAt).getTime(),
      defaultSortOrder: 'descend',
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title="查看文档">
            <Button type="link" size="small" icon={<EyeOutlined />} href={`/documents/${record.documentId}`} />
          </Tooltip>
          <Dropdown overlay={exportMenu(record)} trigger={['click']}>
            <Button type="link" size="small" icon={<DownloadOutlined />}>
              导出
            </Button>
          </Dropdown>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
  };

  return (
    <div className={styles.container}>
      <Card
        title={
          <Space>
            <StarFilled style={{ color: '#faad14' }} />
            <span>我的收藏</span>
          </Space>
        }
        extra={
          <Space>
            <Input
              placeholder="搜索文档"
              prefix={<SearchOutlined />}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
          </Space>
        }
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane
            tab={
              <span>
                <StarOutlined />
                收藏夹
              </span>
            }
            key="favorites"
          >
            <div className={styles.toolbar}>
              <Space>
                <Select
                  placeholder="选择收藏夹"
                  style={{ width: 150 }}
                  allowClear
                  value={selectedFolder}
                  onChange={setSelectedFolder}
                >
                  {folders.map((folder) => (
                    <Option key={folder.folderName} value={folder.folderName}>
                      <Space>
                        <FolderOutlined />
                        {folder.folderName}
                        <Badge count={folder.count} size="small" />
                      </Space>
                    </Option>
                  ))}
                </Select>
                {selectedRowKeys.length > 0 && (
                  <Popconfirm
                    title={`确定取消收藏选中的 ${selectedRowKeys.length} 个文档吗？`}
                    onConfirm={handleBatchRemove}
                    okText="确定"
                    cancelText="取消"
                  >
                    <Button danger icon={<DeleteOutlined />}>
                      批量取消收藏
                    </Button>
                  </Popconfirm>
                )}
              </Space>
            </div>
            <Table
              rowSelection={rowSelection}
              columns={favoriteColumns}
              dataSource={favorites}
              rowKey="id"
              loading={loading}
              pagination={{
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条`,
              }}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="暂无收藏的文档"
                  />
                ),
              }}
            />
          </TabPane>
          <TabPane
            tab={
              <span>
                <ClockCircleOutlined />
                最近访问
              </span>
            }
            key="recent"
          >
            <div className={styles.toolbar}>
              <Space>
                <Popconfirm
                  title="确定清除所有访问记录吗？"
                  onConfirm={handleClearHistory}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button icon={<DeleteOutlined />}>清除记录</Button>
                </Popconfirm>
              </Space>
            </div>
            <Table
              columns={recentColumns}
              dataSource={recentAccess}
              rowKey="id"
              loading={loading}
              pagination={{
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条`,
              }}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="暂无访问记录"
                  />
                ),
              }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* 移动到收藏夹弹窗 */}
      <Modal
        title="移动到收藏夹"
        open={moveModalVisible}
        onOk={handleMoveToFolder}
        onCancel={() => {
          setMoveModalVisible(false);
          setCurrentDocument(null);
          setMoveTargetFolder('');
        }}
        okText="确定"
        cancelText="取消"
      >
        <div style={{ marginBottom: 16 }}>
          <p>将文档 <strong>{currentDocument?.documentTitle}</strong> 移动到：</p>
        </div>
        <Select
          placeholder="选择或输入收藏夹名称"
          style={{ width: '100%' }}
          value={moveTargetFolder}
          onChange={setMoveTargetFolder}
          showSearch
          allowClear
        >
          {folders.map((folder) => (
            <Option key={folder.folderName} value={folder.folderName}>
              <Space>
                <FolderOutlined />
                {folder.folderName}
              </Space>
            </Option>
          ))}
        </Select>
        <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
          提示：可以输入新的收藏夹名称来创建新分类
        </div>
      </Modal>
    </div>
  );
};

export default FavoritesPage;