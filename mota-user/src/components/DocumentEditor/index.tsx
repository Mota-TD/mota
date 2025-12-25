import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Input,
  Button,
  Space,
  Dropdown,
  Tag,
  Avatar,
  Tooltip,
  message,
  Modal,
  List,
  Badge,
  Divider
} from 'antd';
import {
  SaveOutlined,
  HistoryOutlined,
  ShareAltOutlined,
  ExportOutlined,
  CommentOutlined,
  UserOutlined,
  FileTextOutlined,
  DownloadOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileMarkdownOutlined,
  RollbackOutlined,
  EyeOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import styles from './index.module.css';
import {
  Document,
  DocumentVersion,
  DocumentCollaborator,
  getDocument,
  updateDocument,
  createVersion,
  getVersionHistory,
  getVersion,
  rollbackToVersion,
  getCollaborators,
  getOnlineCollaborators,
  exportToMarkdown,
  exportToPdf,
  exportToWord
} from '../../services/api/document';

interface DocumentEditorProps {
  documentId: number;
  userId: number;
  readOnly?: boolean;
  onSave?: (document: Document) => void;
}

const DocumentEditor: React.FC<DocumentEditorProps> = ({
  documentId,
  userId,
  readOnly = false,
  onSave
}) => {
  const [document, setDocument] = useState<Document | null>(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [collaborators, setCollaborators] = useState<DocumentCollaborator[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<DocumentCollaborator[]>([]);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showCollaborators, setShowCollaborators] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<DocumentVersion | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  // 加载文档
  const loadDocument = useCallback(async () => {
    setLoading(true);
    try {
      const doc = await getDocument(documentId);
      setDocument(doc);
      setTitle(doc.title);
      setContent(doc.content);
    } catch (error) {
      message.error('加载文档失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  // 加载版本历史
  const loadVersionHistory = async () => {
    try {
      const history = await getVersionHistory(documentId);
      setVersions(history);
    } catch (error) {
      console.error('加载版本历史失败', error);
    }
  };

  // 加载协作者
  const loadCollaborators = async () => {
    try {
      const [allCollaborators, online] = await Promise.all([
        getCollaborators(documentId),
        getOnlineCollaborators(documentId)
      ]);
      setCollaborators(allCollaborators);
      setOnlineUsers(online);
    } catch (error) {
      console.error('加载协作者失败', error);
    }
  };

  useEffect(() => {
    loadDocument();
    loadCollaborators();
    
    // 定期刷新在线用户
    const interval = setInterval(loadCollaborators, 30000);
    return () => clearInterval(interval);
  }, [loadDocument]);

  // 保存文档
  const handleSave = async () => {
    if (!document) return;
    
    setSaving(true);
    try {
      const updatedDoc = await updateDocument(documentId, {
        title,
        content
      });
      
      // 创建新版本
      await createVersion(documentId, {
        title,
        content,
        editorId: userId,
        versionType: 'auto',
        changeSummary: '自动保存'
      });
      
      setDocument(updatedDoc);
      setHasChanges(false);
      message.success('保存成功');
      onSave?.(updatedDoc);
    } catch (error) {
      message.error('保存失败');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  // 内容变化
  const handleContentChange = (value: string) => {
    setContent(value);
    setHasChanges(true);
  };

  // 标题变化
  const handleTitleChange = (value: string) => {
    setTitle(value);
    setHasChanges(true);
  };

  // 查看版本
  const handleViewVersion = async (versionNumber: number) => {
    try {
      const version = await getVersion(documentId, versionNumber);
      setSelectedVersion(version);
    } catch (error) {
      message.error('加载版本失败');
    }
  };

  // 回滚版本
  const handleRollback = async (versionNumber: number) => {
    Modal.confirm({
      title: '确认回滚',
      content: `确定要回滚到版本 ${versionNumber} 吗？当前未保存的更改将丢失。`,
      onOk: async () => {
        try {
          const doc = await rollbackToVersion(documentId, versionNumber);
          setDocument(doc);
          setTitle(doc.title);
          setContent(doc.content);
          setHasChanges(false);
          setShowVersionHistory(false);
          message.success('回滚成功');
        } catch (error) {
          message.error('回滚失败');
        }
      }
    });
  };

  // 导出菜单
  const exportMenuItems: MenuProps['items'] = [
    {
      key: 'markdown',
      icon: <FileMarkdownOutlined />,
      label: '导出为 Markdown',
      onClick: async () => {
        try {
          const md = await exportToMarkdown(documentId);
          const blob = new Blob([md], { type: 'text/markdown' });
          const url = URL.createObjectURL(blob);
          const a = window.document.createElement('a');
          a.href = url;
          a.download = `${title}.md`;
          a.click();
          URL.revokeObjectURL(url);
        } catch (error) {
          message.error('导出失败');
        }
      }
    },
    {
      key: 'pdf',
      icon: <FilePdfOutlined />,
      label: '导出为 PDF',
      onClick: async () => {
        try {
          const blob = await exportToPdf(documentId);
          const url = URL.createObjectURL(blob as unknown as Blob);
          const a = window.document.createElement('a');
          a.href = url;
          a.download = `${title}.pdf`;
          a.click();
          URL.revokeObjectURL(url);
        } catch (error) {
          message.error('导出失败');
        }
      }
    },
    {
      key: 'word',
      icon: <FileWordOutlined />,
      label: '导出为 Word',
      onClick: async () => {
        try {
          const blob = await exportToWord(documentId);
          const url = URL.createObjectURL(blob as unknown as Blob);
          const a = window.document.createElement('a');
          a.href = url;
          a.download = `${title}.docx`;
          a.click();
          URL.revokeObjectURL(url);
        } catch (error) {
          message.error('导出失败');
        }
      }
    }
  ];

  // 渲染Markdown预览
  const renderMarkdownPreview = () => {
    // 简单的Markdown渲染，实际项目中可以使用marked或react-markdown
    return (
      <div 
        className={styles.preview}
        dangerouslySetInnerHTML={{ 
          __html: content
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*)\*/gim, '<em>$1</em>')
            .replace(/\n/gim, '<br>')
        }}
      />
    );
  };

  if (loading) {
    return <Card loading />;
  }

  return (
    <div className={styles.container}>
      <Card
        className={styles.editorCard}
        title={
          <Space>
            <FileTextOutlined />
            <Input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="文档标题"
              bordered={false}
              className={styles.titleInput}
              disabled={readOnly}
            />
            {hasChanges && <Tag color="orange">未保存</Tag>}
          </Space>
        }
        extra={
          <Space>
            {/* 在线用户 */}
            <Avatar.Group maxCount={3}>
              {onlineUsers.map((user) => (
                <Tooltip key={user.userId} title={`用户 ${user.userId}`}>
                  <Avatar 
                    icon={<UserOutlined />} 
                    style={{ backgroundColor: '#1890ff' }}
                  />
                </Tooltip>
              ))}
            </Avatar.Group>

            <Divider type="vertical" />

            {/* 预览模式 */}
            <Tooltip title={previewMode ? '编辑模式' : '预览模式'}>
              <Button
                icon={<EyeOutlined />}
                onClick={() => setPreviewMode(!previewMode)}
                type={previewMode ? 'primary' : 'default'}
              />
            </Tooltip>

            {/* 版本历史 */}
            <Tooltip title="版本历史">
              <Button
                icon={<HistoryOutlined />}
                onClick={() => {
                  loadVersionHistory();
                  setShowVersionHistory(true);
                }}
              />
            </Tooltip>

            {/* 协作者 */}
            <Tooltip title="协作者">
              <Badge count={collaborators.length} size="small">
                <Button
                  icon={<ShareAltOutlined />}
                  onClick={() => setShowCollaborators(true)}
                />
              </Badge>
            </Tooltip>

            {/* 评论 */}
            <Tooltip title="评论">
              <Button icon={<CommentOutlined />} />
            </Tooltip>

            {/* 导出 */}
            <Dropdown menu={{ items: exportMenuItems }}>
              <Button icon={<ExportOutlined />}>
                导出 <DownloadOutlined />
              </Button>
            </Dropdown>

            {/* 保存 */}
            {!readOnly && (
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSave}
                loading={saving}
                disabled={!hasChanges}
              >
                保存
              </Button>
            )}
          </Space>
        }
      >
        <div className={styles.editorContent}>
          {previewMode ? (
            renderMarkdownPreview()
          ) : (
            <Input.TextArea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="开始编写文档..."
              className={styles.textarea}
              disabled={readOnly}
              autoSize={{ minRows: 20 }}
            />
          )}
        </div>

        {/* 文档信息 */}
        {document && (
          <div className={styles.docInfo}>
            <Space split={<Divider type="vertical" />}>
              <span>版本: v{document.currentVersion}</span>
              <span>浏览: {document.viewCount}</span>
              <span>更新: {new Date(document.updatedAt).toLocaleString()}</span>
            </Space>
          </div>
        )}
      </Card>

      {/* 版本历史弹窗 */}
      <Modal
        title="版本历史"
        open={showVersionHistory}
        onCancel={() => {
          setShowVersionHistory(false);
          setSelectedVersion(null);
        }}
        footer={null}
        width={800}
      >
        <div className={styles.versionModal}>
          <div className={styles.versionList}>
            <List
              dataSource={versions}
              renderItem={(version) => (
                <List.Item
                  className={styles.versionItem}
                  actions={[
                    <Button
                      key="view"
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => handleViewVersion(version.versionNumber)}
                    >
                      查看
                    </Button>,
                    <Button
                      key="rollback"
                      size="small"
                      icon={<RollbackOutlined />}
                      onClick={() => handleRollback(version.versionNumber)}
                      disabled={readOnly}
                    >
                      回滚
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <Tag color="blue">v{version.versionNumber}</Tag>
                        <span>{version.title}</span>
                        <Tag>{version.versionType}</Tag>
                      </Space>
                    }
                    description={
                      <Space>
                        <span>{version.changeSummary || '无描述'}</span>
                        <span>·</span>
                        <span>{new Date(version.createdAt).toLocaleString()}</span>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </div>
          
          {selectedVersion && (
            <div className={styles.versionPreview}>
              <h4>版本 {selectedVersion.versionNumber} 内容预览</h4>
              <div className={styles.versionContent}>
                {selectedVersion.content}
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* 协作者弹窗 */}
      <Modal
        title="协作者"
        open={showCollaborators}
        onCancel={() => setShowCollaborators(false)}
        footer={null}
      >
        <List
          dataSource={collaborators}
          renderItem={(collaborator) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Badge
                    dot
                    status={onlineUsers.some(u => u.userId === collaborator.userId) ? 'success' : 'default'}
                  >
                    <Avatar icon={<UserOutlined />} />
                  </Badge>
                }
                title={`用户 ${collaborator.userId}`}
                description={
                  <Tag color={
                    collaborator.permission === 'admin' ? 'red' :
                    collaborator.permission === 'edit' ? 'blue' : 'default'
                  }>
                    {collaborator.permission}
                  </Tag>
                }
              />
            </List.Item>
          )}
        />
      </Modal>
    </div>
  );
};

export default DocumentEditor;