/**
 * 文件版本控制组件
 * 支持版本历史、版本对比、版本回滚、变更记录
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Timeline,
  Button,
  Space,
  Typography,
  Tag,
  Tooltip,
  Modal,
  message,
  Spin,
  Empty,
  Tabs,
  Table,
  Popconfirm,
  Input,
  Select,
  DatePicker,
  Divider,
  Badge,
  Avatar,
  Descriptions
} from 'antd';
import {
  HistoryOutlined,
  RollbackOutlined,
  DiffOutlined,
  DownloadOutlined,
  DeleteOutlined,
  EyeOutlined,
  UserOutlined,
  ClockCircleOutlined,
  FileOutlined,
  EditOutlined,
  PlusOutlined,
  MinusOutlined,
  SwapOutlined,
  SettingOutlined,
  SaveOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import styles from './index.module.css';
import {
  getFileVersions,
  getFileVersion,
  compareVersions,
  rollbackToVersion,
  downloadVersion,
  deleteVersion,
  getVersionChanges,
  getChangeLogs,
  getAutoSaveConfig,
  updateAutoSaveConfig,
  FileVersion,
  VersionDiff,
  VersionChange,
  ChangeLog,
  AutoSaveConfig,
  formatChangeType,
  formatAction,
  getChangeTypeColor,
  calculateDiffStats,
  formatFileSize
} from '../../services/api/knowledgeManagement';

const { Text, Title, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

interface FileVersionControlProps {
  fileId: number;
  fileName: string;
  currentVersion?: number;
  onVersionChange?: (version: FileVersion) => void;
  onRollback?: (version: FileVersion) => void;
  showCard?: boolean;
}

const FileVersionControl: React.FC<FileVersionControlProps> = ({
  fileId,
  fileName,
  currentVersion,
  onVersionChange,
  onRollback,
  showCard = true
}) => {
  const [loading, setLoading] = useState(false);
  const [versions, setVersions] = useState<FileVersion[]>([]);
  const [changeLogs, setChangeLogs] = useState<ChangeLog[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<FileVersion | null>(null);
  const [compareFrom, setCompareFrom] = useState<number | null>(null);
  const [compareTo, setCompareTo] = useState<number | null>(null);
  const [diffResult, setDiffResult] = useState<VersionDiff | null>(null);
  const [versionChanges, setVersionChanges] = useState<VersionChange[]>([]);
  const [autoSaveConfig, setAutoSaveConfig] = useState<AutoSaveConfig | null>(null);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showRollbackModal, setShowRollbackModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [rollbackSummary, setRollbackSummary] = useState('');
  const [activeTab, setActiveTab] = useState('versions');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  // 加载版本历史
  const loadVersions = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getFileVersions(fileId, pagination.current, pagination.pageSize);
      setVersions(result.versions);
      setPagination(prev => ({ ...prev, total: result.total }));
    } catch (error) {
      console.error('加载版本历史失败:', error);
      // 使用模拟数据
      setVersions(mockVersions);
    } finally {
      setLoading(false);
    }
  }, [fileId, pagination.current, pagination.pageSize]);

  // 加载变更记录
  const loadChangeLogs = useCallback(async () => {
    try {
      const result = await getChangeLogs(fileId);
      setChangeLogs(result.logs);
    } catch (error) {
      console.error('加载变更记录失败:', error);
      setChangeLogs(mockChangeLogs);
    }
  }, [fileId]);

  // 加载自动保存配置
  const loadAutoSaveConfig = useCallback(async () => {
    try {
      const config = await getAutoSaveConfig();
      setAutoSaveConfig(config);
    } catch (error) {
      console.error('加载自动保存配置失败:', error);
      setAutoSaveConfig({
        enabled: true,
        intervalMinutes: 5,
        maxVersions: 50,
        keepDays: 30
      });
    }
  }, []);

  useEffect(() => {
    loadVersions();
    loadChangeLogs();
    loadAutoSaveConfig();
  }, [loadVersions, loadChangeLogs, loadAutoSaveConfig]);

  // 模拟数据
  const mockVersions: FileVersion[] = [
    {
      id: 1,
      fileId,
      versionNumber: 5,
      fileName: fileName,
      fileSize: 2048576,
      filePath: '/files/v5/file.pdf',
      changeSummary: '更新了第三章内容',
      changeType: 'update',
      creatorId: 1,
      creatorName: '张三',
      createdAt: '2024-01-15T14:30:00Z',
      isLatest: true,
      contentHash: 'abc123'
    },
    {
      id: 2,
      fileId,
      versionNumber: 4,
      fileName: fileName,
      fileSize: 2000000,
      filePath: '/files/v4/file.pdf',
      changeSummary: '修复了格式问题',
      changeType: 'update',
      creatorId: 2,
      creatorName: '李四',
      createdAt: '2024-01-14T10:20:00Z',
      isLatest: false,
      contentHash: 'def456'
    },
    {
      id: 3,
      fileId,
      versionNumber: 3,
      fileName: fileName,
      fileSize: 1900000,
      filePath: '/files/v3/file.pdf',
      changeSummary: '添加了附录',
      changeType: 'update',
      creatorId: 1,
      creatorName: '张三',
      createdAt: '2024-01-13T16:45:00Z',
      isLatest: false,
      contentHash: 'ghi789'
    },
    {
      id: 4,
      fileId,
      versionNumber: 2,
      fileName: '旧文件名.pdf',
      fileSize: 1800000,
      filePath: '/files/v2/file.pdf',
      changeSummary: '重命名文件',
      changeType: 'rename',
      creatorId: 3,
      creatorName: '王五',
      createdAt: '2024-01-12T09:15:00Z',
      isLatest: false,
      contentHash: 'jkl012'
    },
    {
      id: 5,
      fileId,
      versionNumber: 1,
      fileName: '初始文件.pdf',
      fileSize: 1500000,
      filePath: '/files/v1/file.pdf',
      changeSummary: '初始版本',
      changeType: 'create',
      creatorId: 1,
      creatorName: '张三',
      createdAt: '2024-01-10T08:00:00Z',
      isLatest: false,
      contentHash: 'mno345'
    }
  ];

  const mockChangeLogs: ChangeLog[] = [
    {
      id: 1,
      fileId,
      versionId: 1,
      userId: 1,
      userName: '张三',
      action: 'update',
      description: '更新了第三章内容',
      createdAt: '2024-01-15T14:30:00Z'
    },
    {
      id: 2,
      fileId,
      versionId: 2,
      userId: 2,
      userName: '李四',
      action: 'update',
      description: '修复了格式问题',
      createdAt: '2024-01-14T10:20:00Z'
    },
    {
      id: 3,
      fileId,
      versionId: 3,
      userId: 1,
      userName: '张三',
      action: 'update',
      description: '添加了附录',
      createdAt: '2024-01-13T16:45:00Z'
    },
    {
      id: 4,
      fileId,
      versionId: 4,
      userId: 3,
      userName: '王五',
      action: 'rename',
      description: '重命名文件',
      createdAt: '2024-01-12T09:15:00Z'
    },
    {
      id: 5,
      fileId,
      versionId: 5,
      userId: 1,
      userName: '张三',
      action: 'create',
      description: '创建文件',
      createdAt: '2024-01-10T08:00:00Z'
    }
  ];

  // 查看版本详情
  const handleViewVersion = async (version: FileVersion) => {
    setSelectedVersion(version);
    try {
      const changes = await getVersionChanges(fileId, version.versionNumber);
      setVersionChanges(changes);
    } catch (error) {
      setVersionChanges([]);
    }
  };

  // 版本对比
  const handleCompare = async () => {
    if (!compareFrom || !compareTo) {
      message.warning('请选择要对比的两个版本');
      return;
    }
    if (compareFrom === compareTo) {
      message.warning('请选择不同的版本进行对比');
      return;
    }

    setLoading(true);
    try {
      const diff = await compareVersions(fileId, compareFrom, compareTo);
      setDiffResult(diff);
      setShowCompareModal(true);
    } catch (error) {
      message.error('版本对比失败');
      // 使用模拟数据
      setDiffResult({
        fromVersion: compareFrom,
        toVersion: compareTo,
        additions: 15,
        deletions: 8,
        modifications: 23,
        diffContent: '模拟的差异内容...',
        changes: []
      });
      setShowCompareModal(true);
    } finally {
      setLoading(false);
    }
  };

  // 回滚版本
  const handleRollback = async (version: FileVersion) => {
    setSelectedVersion(version);
    setShowRollbackModal(true);
  };

  const confirmRollback = async () => {
    if (!selectedVersion) return;

    setLoading(true);
    try {
      const newVersion = await rollbackToVersion(
        fileId,
        selectedVersion.versionNumber,
        rollbackSummary || `回滚到版本 ${selectedVersion.versionNumber}`
      );
      message.success(`已回滚到版本 ${selectedVersion.versionNumber}`);
      setShowRollbackModal(false);
      setRollbackSummary('');
      loadVersions();
      onRollback?.(newVersion);
    } catch (error) {
      message.error('回滚失败');
    } finally {
      setLoading(false);
    }
  };

  // 下载版本
  const handleDownload = (version: FileVersion) => {
    const url = downloadVersion(fileId, version.versionNumber);
    window.open(url, '_blank');
  };

  // 删除版本
  const handleDeleteVersion = async (version: FileVersion) => {
    if (version.isLatest) {
      message.warning('不能删除最新版本');
      return;
    }

    try {
      await deleteVersion(fileId, version.versionNumber);
      message.success('版本已删除');
      loadVersions();
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 保存自动保存配置
  const handleSaveConfig = async () => {
    if (!autoSaveConfig) return;

    try {
      await updateAutoSaveConfig(autoSaveConfig);
      message.success('配置已保存');
      setShowSettingsModal(false);
    } catch (error) {
      message.error('保存配置失败');
    }
  };

  // 渲染版本时间线
  const renderVersionTimeline = () => (
    <Timeline
      className={styles.timeline}
      items={versions.map(version => ({
        color: version.isLatest ? 'green' : 'blue',
        dot: version.isLatest ? <Badge status="processing" /> : undefined,
        children: (
          <div className={styles.timelineItem}>
            <div className={styles.versionHeader}>
              <Space>
                <Tag color={version.isLatest ? 'green' : 'default'}>
                  v{version.versionNumber}
                </Tag>
                <Tag color={getChangeTypeColor(version.changeType)}>
                  {formatChangeType(version.changeType)}
                </Tag>
                <Text strong>{version.changeSummary || '无描述'}</Text>
              </Space>
              <Space>
                <Tooltip title="查看详情">
                  <Button
                    type="text"
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => handleViewVersion(version)}
                  />
                </Tooltip>
                <Tooltip title="下载此版本">
                  <Button
                    type="text"
                    size="small"
                    icon={<DownloadOutlined />}
                    onClick={() => handleDownload(version)}
                  />
                </Tooltip>
                {!version.isLatest && (
                  <Tooltip title="回滚到此版本">
                    <Button
                      type="text"
                      size="small"
                      icon={<RollbackOutlined />}
                      onClick={() => handleRollback(version)}
                    />
                  </Tooltip>
                )}
                {!version.isLatest && (
                  <Popconfirm
                    title="确定要删除此版本吗？"
                    onConfirm={() => handleDeleteVersion(version)}
                    okText="确定"
                    cancelText="取消"
                  >
                    <Tooltip title="删除版本">
                      <Button
                        type="text"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                      />
                    </Tooltip>
                  </Popconfirm>
                )}
              </Space>
            </div>
            <div className={styles.versionMeta}>
              <Space split={<Divider type="vertical" />}>
                <span>
                  <UserOutlined /> {version.creatorName}
                </span>
                <span>
                  <ClockCircleOutlined /> {dayjs(version.createdAt).format('YYYY-MM-DD HH:mm')}
                </span>
                <span>
                  <FileOutlined /> {formatFileSize(version.fileSize)}
                </span>
              </Space>
            </div>
          </div>
        )
      }))}
    />
  );

  // 变更记录表格列
  const changeLogColumns: ColumnsType<ChangeLog> = [
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      width: 100,
      render: (action: string) => (
        <Tag color={getChangeTypeColor(action)}>{formatAction(action)}</Tag>
      )
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: '操作人',
      dataIndex: 'userName',
      key: 'userName',
      width: 100,
      render: (name: string) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          {name}
        </Space>
      )
    },
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm')
    }
  ];

  // 渲染版本对比结果
  const renderDiffResult = () => {
    if (!diffResult) return null;

    return (
      <div className={styles.diffResult}>
        <div className={styles.diffStats}>
          <Space size="large">
            <span className={styles.additions}>
              <PlusOutlined /> {diffResult.additions} 新增
            </span>
            <span className={styles.deletions}>
              <MinusOutlined /> {diffResult.deletions} 删除
            </span>
            <span className={styles.modifications}>
              <SwapOutlined /> {diffResult.modifications} 修改
            </span>
          </Space>
        </div>
        <Divider />
        <div className={styles.diffContent}>
          {diffResult.diffHtml ? (
            <div dangerouslySetInnerHTML={{ __html: diffResult.diffHtml }} />
          ) : diffResult.diffContent ? (
            <pre>{diffResult.diffContent}</pre>
          ) : (
            <Empty description="无差异内容" />
          )}
        </div>
      </div>
    );
  };

  const content = (
    <div className={styles.content}>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        tabBarExtraContent={
          <Space>
            <Select
              placeholder="选择版本"
              style={{ width: 120 }}
              value={compareFrom}
              onChange={setCompareFrom}
            >
              {versions.map(v => (
                <Select.Option key={v.versionNumber} value={v.versionNumber}>
                  v{v.versionNumber}
                </Select.Option>
              ))}
            </Select>
            <Text>对比</Text>
            <Select
              placeholder="选择版本"
              style={{ width: 120 }}
              value={compareTo}
              onChange={setCompareTo}
            >
              {versions.map(v => (
                <Select.Option key={v.versionNumber} value={v.versionNumber}>
                  v{v.versionNumber}
                </Select.Option>
              ))}
            </Select>
            <Button
              icon={<DiffOutlined />}
              onClick={handleCompare}
              disabled={!compareFrom || !compareTo}
            >
              对比
            </Button>
            <Button
              icon={<SettingOutlined />}
              onClick={() => setShowSettingsModal(true)}
            >
              设置
            </Button>
          </Space>
        }
        items={[
          {
            key: 'versions',
            label: (
              <span>
                <HistoryOutlined />
                版本历史
              </span>
            ),
            children: loading ? (
              <div className={styles.loading}>
                <Spin />
              </div>
            ) : versions.length === 0 ? (
              <Empty description="暂无版本历史" />
            ) : (
              renderVersionTimeline()
            )
          },
          {
            key: 'changelog',
            label: (
              <span>
                <EditOutlined />
                变更记录
              </span>
            ),
            children: (
              <Table
                columns={changeLogColumns}
                dataSource={changeLogs}
                rowKey="id"
                size="small"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: false
                }}
              />
            )
          }
        ]}
      />

      {/* 版本详情弹窗 */}
      <Modal
        title={`版本 ${selectedVersion?.versionNumber} 详情`}
        open={!!selectedVersion && !showRollbackModal}
        onCancel={() => setSelectedVersion(null)}
        footer={[
          <Button key="close" onClick={() => setSelectedVersion(null)}>
            关闭
          </Button>,
          <Button
            key="download"
            icon={<DownloadOutlined />}
            onClick={() => selectedVersion && handleDownload(selectedVersion)}
          >
            下载
          </Button>,
          !selectedVersion?.isLatest && (
            <Button
              key="rollback"
              type="primary"
              icon={<RollbackOutlined />}
              onClick={() => selectedVersion && handleRollback(selectedVersion)}
            >
              回滚到此版本
            </Button>
          )
        ].filter(Boolean)}
        width={600}
      >
        {selectedVersion && (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="版本号">
              v{selectedVersion.versionNumber}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              {selectedVersion.isLatest ? (
                <Tag color="green">最新版本</Tag>
              ) : (
                <Tag>历史版本</Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="文件名">
              {selectedVersion.fileName}
            </Descriptions.Item>
            <Descriptions.Item label="文件大小">
              {formatFileSize(selectedVersion.fileSize)}
            </Descriptions.Item>
            <Descriptions.Item label="变更类型">
              <Tag color={getChangeTypeColor(selectedVersion.changeType)}>
                {formatChangeType(selectedVersion.changeType)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="创建者">
              {selectedVersion.creatorName}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间" span={2}>
              {dayjs(selectedVersion.createdAt).format('YYYY-MM-DD HH:mm:ss')}
            </Descriptions.Item>
            <Descriptions.Item label="变更说明" span={2}>
              {selectedVersion.changeSummary || '无'}
            </Descriptions.Item>
            {selectedVersion.contentHash && (
              <Descriptions.Item label="内容哈希" span={2}>
                <Text code copyable>{selectedVersion.contentHash}</Text>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>

      {/* 版本对比弹窗 */}
      <Modal
        title={`版本对比: v${compareFrom} → v${compareTo}`}
        open={showCompareModal}
        onCancel={() => setShowCompareModal(false)}
        footer={null}
        width={800}
      >
        {renderDiffResult()}
      </Modal>

      {/* 回滚确认弹窗 */}
      <Modal
        title="确认回滚"
        open={showRollbackModal}
        onCancel={() => {
          setShowRollbackModal(false);
          setRollbackSummary('');
        }}
        onOk={confirmRollback}
        confirmLoading={loading}
        okText="确认回滚"
        cancelText="取消"
      >
        <div className={styles.rollbackForm}>
          <Paragraph>
            确定要回滚到版本 <Text strong>v{selectedVersion?.versionNumber}</Text> 吗？
          </Paragraph>
          <Paragraph type="secondary">
            回滚后将创建一个新版本，当前版本不会被删除。
          </Paragraph>
          <div className={styles.formItem}>
            <Text>回滚说明（可选）：</Text>
            <TextArea
              value={rollbackSummary}
              onChange={e => setRollbackSummary(e.target.value)}
              placeholder="请输入回滚原因..."
              rows={3}
            />
          </div>
        </div>
      </Modal>

      {/* 自动保存设置弹窗 */}
      <Modal
        title="自动保存设置"
        open={showSettingsModal}
        onCancel={() => setShowSettingsModal(false)}
        onOk={handleSaveConfig}
        okText="保存"
        cancelText="取消"
      >
        {autoSaveConfig && (
          <div className={styles.settingsForm}>
            <div className={styles.formItem}>
              <Text>启用自动保存：</Text>
              <Select
                value={autoSaveConfig.enabled ? 'true' : 'false'}
                onChange={v => setAutoSaveConfig({ ...autoSaveConfig, enabled: v === 'true' })}
                style={{ width: 120 }}
              >
                <Select.Option value="true">启用</Select.Option>
                <Select.Option value="false">禁用</Select.Option>
              </Select>
            </div>
            <div className={styles.formItem}>
              <Text>保存间隔（分钟）：</Text>
              <Select
                value={autoSaveConfig.intervalMinutes}
                onChange={v => setAutoSaveConfig({ ...autoSaveConfig, intervalMinutes: v })}
                style={{ width: 120 }}
              >
                <Select.Option value={1}>1 分钟</Select.Option>
                <Select.Option value={5}>5 分钟</Select.Option>
                <Select.Option value={10}>10 分钟</Select.Option>
                <Select.Option value={15}>15 分钟</Select.Option>
                <Select.Option value={30}>30 分钟</Select.Option>
              </Select>
            </div>
            <div className={styles.formItem}>
              <Text>最大版本数：</Text>
              <Select
                value={autoSaveConfig.maxVersions}
                onChange={v => setAutoSaveConfig({ ...autoSaveConfig, maxVersions: v })}
                style={{ width: 120 }}
              >
                <Select.Option value={10}>10 个</Select.Option>
                <Select.Option value={20}>20 个</Select.Option>
                <Select.Option value={50}>50 个</Select.Option>
                <Select.Option value={100}>100 个</Select.Option>
                <Select.Option value={0}>不限制</Select.Option>
              </Select>
            </div>
            <div className={styles.formItem}>
              <Text>版本保留天数：</Text>
              <Select
                value={autoSaveConfig.keepDays}
                onChange={v => setAutoSaveConfig({ ...autoSaveConfig, keepDays: v })}
                style={{ width: 120 }}
              >
                <Select.Option value={7}>7 天</Select.Option>
                <Select.Option value={14}>14 天</Select.Option>
                <Select.Option value={30}>30 天</Select.Option>
                <Select.Option value={90}>90 天</Select.Option>
                <Select.Option value={365}>365 天</Select.Option>
                <Select.Option value={0}>永久保留</Select.Option>
              </Select>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );

  if (showCard) {
    return (
      <Card
        className={styles.container}
        title={
          <Space>
            <HistoryOutlined />
            <span>版本控制</span>
            <Tag color="blue">共 {versions.length} 个版本</Tag>
          </Space>
        }
      >
        {content}
      </Card>
    );
  }

  return content;
};

export default FileVersionControl;