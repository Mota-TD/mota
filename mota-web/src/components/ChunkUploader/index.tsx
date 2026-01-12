/**
 * 大文件分片上传组件
 * 支持拖拽上传、批量上传、断点续传、秒传
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  Upload,
  Progress,
  Button,
  Card,
  List,
  Typography,
  Space,
  Tag,
  Tooltip,
  message,
  Modal,
  Popconfirm
} from 'antd';
import {
  InboxOutlined,
  FileOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FilePptOutlined,
  FileZipOutlined,
  FileTextOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  CloudUploadOutlined
} from '@ant-design/icons';
import type { UploadFile, RcFile } from 'antd/es/upload/interface';
import styles from './index.module.css';
import {
  uploadLargeFile,
  ChunkUploadCompleteResponse,
  formatFileSize,
  supportsThumbnail,
  generateThumbnail,
  getAIClassification
} from '../../services/api/knowledgeManagement';

const { Dragger } = Upload;
const { Text, Title } = Typography;

interface UploadTask {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'paused' | 'completed' | 'failed';
  progress: number;
  uploadedChunks: number;
  totalChunks: number;
  speed?: number;
  remainingTime?: number;
  error?: string;
  result?: ChunkUploadCompleteResponse;
}

interface ChunkUploaderProps {
  projectId?: number;
  folderId?: number;
  maxFileSize?: number; // 最大文件大小（字节），默认2GB
  chunkSize?: number; // 分片大小（字节），默认5MB
  maxConcurrent?: number; // 最大并发上传数
  accept?: string; // 接受的文件类型
  multiple?: boolean; // 是否支持多文件
  autoGenerateThumbnail?: boolean; // 是否自动生成缩略图
  autoAIClassify?: boolean; // 是否自动AI分类
  onUploadComplete?: (file: ChunkUploadCompleteResponse) => void;
  onAllComplete?: (files: ChunkUploadCompleteResponse[]) => void;
}

const ChunkUploader: React.FC<ChunkUploaderProps> = ({
  projectId,
  folderId,
  maxFileSize = 2 * 1024 * 1024 * 1024, // 2GB
  chunkSize = 5 * 1024 * 1024, // 5MB
  maxConcurrent = 3,
  accept,
  multiple = true,
  autoGenerateThumbnail = true,
  autoAIClassify = true,
  onUploadComplete,
  onAllComplete
}) => {
  const [tasks, setTasks] = useState<UploadTask[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const uploadingRef = useRef<Set<string>>(new Set());
  const completedFiles = useRef<ChunkUploadCompleteResponse[]>([]);

  // 获取文件图标
  const getFileIcon = (file: File) => {
    const type = file.type;
    const name = file.name.toLowerCase();
    
    if (type.startsWith('image/')) return <FileImageOutlined style={{ color: '#1890ff' }} />;
    if (type === 'application/pdf') return <FilePdfOutlined style={{ color: '#ff4d4f' }} />;
    if (type.includes('word') || name.endsWith('.doc') || name.endsWith('.docx')) 
      return <FileWordOutlined style={{ color: '#2b579a' }} />;
    if (type.includes('excel') || name.endsWith('.xls') || name.endsWith('.xlsx')) 
      return <FileExcelOutlined style={{ color: '#217346' }} />;
    if (type.includes('powerpoint') || name.endsWith('.ppt') || name.endsWith('.pptx')) 
      return <FilePptOutlined style={{ color: '#d24726' }} />;
    if (type.includes('zip') || type.includes('rar') || type.includes('7z')) 
      return <FileZipOutlined style={{ color: '#faad14' }} />;
    if (type.startsWith('text/') || name.endsWith('.txt') || name.endsWith('.md')) 
      return <FileTextOutlined style={{ color: '#52c41a' }} />;
    return <FileOutlined style={{ color: '#8c8c8c' }} />;
  };

  // 获取状态标签
  const getStatusTag = (task: UploadTask) => {
    switch (task.status) {
      case 'pending':
        return <Tag color="default">等待中</Tag>;
      case 'uploading':
        return <Tag color="processing" icon={<CloudUploadOutlined spin />}>上传中</Tag>;
      case 'paused':
        return <Tag color="warning" icon={<PauseCircleOutlined />}>已暂停</Tag>;
      case 'completed':
        return <Tag color="success" icon={<CheckCircleOutlined />}>已完成</Tag>;
      case 'failed':
        return <Tag color="error" icon={<CloseCircleOutlined />}>失败</Tag>;
      default:
        return null;
    }
  };

  // 格式化速度
  const formatSpeed = (bytesPerSecond: number): string => {
    if (bytesPerSecond < 1024) return `${bytesPerSecond.toFixed(0)} B/s`;
    if (bytesPerSecond < 1024 * 1024) return `${(bytesPerSecond / 1024).toFixed(1)} KB/s`;
    return `${(bytesPerSecond / 1024 / 1024).toFixed(1)} MB/s`;
  };

  // 格式化剩余时间
  const formatRemainingTime = (seconds: number): string => {
    if (seconds < 60) return `${Math.ceil(seconds)}秒`;
    if (seconds < 3600) return `${Math.ceil(seconds / 60)}分钟`;
    return `${Math.floor(seconds / 3600)}小时${Math.ceil((seconds % 3600) / 60)}分钟`;
  };

  // 处理文件上传
  const handleUpload = useCallback(async (task: UploadTask) => {
    if (uploadingRef.current.has(task.id)) return;
    uploadingRef.current.add(task.id);

    const startTime = Date.now();
    let lastLoaded = 0;

    try {
      setTasks(prev => prev.map(t => 
        t.id === task.id ? { ...t, status: 'uploading' } : t
      ));

      const result = await uploadLargeFile(task.file, {
        projectId,
        folderId,
        chunkSize,
        onProgress: (progress, uploadedChunks, totalChunks) => {
          const now = Date.now();
          const elapsed = (now - startTime) / 1000;
          const loaded = (progress / 100) * task.file.size;
          const speed = elapsed > 0 ? loaded / elapsed : 0;
          const remaining = speed > 0 ? (task.file.size - loaded) / speed : 0;

          setTasks(prev => prev.map(t => 
            t.id === task.id ? {
              ...t,
              progress,
              uploadedChunks,
              totalChunks,
              speed,
              remainingTime: remaining
            } : t
          ));
          lastLoaded = loaded;
        },
        onComplete: async (response) => {
          setTasks(prev => prev.map(t => 
            t.id === task.id ? { ...t, status: 'completed', progress: 100, result: response } : t
          ));

          // 自动生成缩略图
          if (autoGenerateThumbnail && supportsThumbnail(task.file.type)) {
            try {
              await generateThumbnail({ fileId: response.fileId });
            } catch (error) {
              console.error('生成缩略图失败:', error);
            }
          }

          // 自动AI分类
          if (autoAIClassify) {
            try {
              await getAIClassification(response.fileId);
            } catch (error) {
              console.error('AI分类失败:', error);
            }
          }

          completedFiles.current.push(response);
          onUploadComplete?.(response);

          // 检查是否所有任务都完成
          const allCompleted = tasks.every(t => 
            t.id === task.id || t.status === 'completed' || t.status === 'failed'
          );
          if (allCompleted && completedFiles.current.length > 0) {
            onAllComplete?.(completedFiles.current);
          }
        },
        onError: (error) => {
          setTasks(prev => prev.map(t => 
            t.id === task.id ? { ...t, status: 'failed', error: error.message } : t
          ));
          message.error(`${task.file.name} 上传失败: ${error.message}`);
        }
      });
    } catch (error) {
      setTasks(prev => prev.map(t => 
        t.id === task.id ? { 
          ...t, 
          status: 'failed', 
          error: error instanceof Error ? error.message : '上传失败' 
        } : t
      ));
    } finally {
      uploadingRef.current.delete(task.id);
      
      // 检查是否还有待上传的任务
      const pendingTasks = tasks.filter(t => t.status === 'pending');
      if (pendingTasks.length > 0 && uploadingRef.current.size < maxConcurrent) {
        handleUpload(pendingTasks[0]);
      } else if (uploadingRef.current.size === 0) {
        setIsUploading(false);
      }
    }
  }, [projectId, folderId, chunkSize, maxConcurrent, autoGenerateThumbnail, autoAIClassify, onUploadComplete, onAllComplete, tasks]);

  // 开始上传所有待上传的任务
  const startUpload = useCallback(() => {
    setIsUploading(true);
    completedFiles.current = [];
    
    const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'paused');
    const toStart = pendingTasks.slice(0, maxConcurrent);
    
    toStart.forEach(task => {
      handleUpload(task);
    });
  }, [tasks, maxConcurrent, handleUpload]);

  // 暂停上传
  const pauseUpload = useCallback((taskId: string) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId && t.status === 'uploading' ? { ...t, status: 'paused' } : t
    ));
    // 注意：实际暂停需要在 uploadLargeFile 中实现取消逻辑
  }, []);

  // 重试上传
  const retryUpload = useCallback((taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task && task.status === 'failed') {
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, status: 'pending', progress: 0, error: undefined } : t
      ));
      if (!isUploading) {
        startUpload();
      }
    }
  }, [tasks, isUploading, startUpload]);

  // 删除任务
  const removeTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  }, []);

  // 清空已完成的任务
  const clearCompleted = useCallback(() => {
    setTasks(prev => prev.filter(t => t.status !== 'completed'));
  }, []);

  // 处理文件选择
  const handleBeforeUpload = useCallback((file: RcFile, fileList: RcFile[]) => {
    // 检查文件大小
    if (file.size > maxFileSize) {
      message.error(`${file.name} 超过最大文件大小限制 (${formatFileSize(maxFileSize)})`);
      return false;
    }

    // 创建上传任务
    const task: UploadTask = {
      id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      status: 'pending',
      progress: 0,
      uploadedChunks: 0,
      totalChunks: Math.ceil(file.size / chunkSize)
    };

    setTasks(prev => [...prev, task]);
    return false; // 阻止默认上传行为
  }, [maxFileSize, chunkSize]);

  // 计算总体进度
  const totalProgress = tasks.length > 0
    ? tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length
    : 0;

  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const failedCount = tasks.filter(t => t.status === 'failed').length;
  const pendingCount = tasks.filter(t => t.status === 'pending' || t.status === 'uploading').length;

  return (
    <div className={styles.container}>
      {/* 拖拽上传区域 */}
      <Dragger
        multiple={multiple}
        accept={accept}
        beforeUpload={handleBeforeUpload}
        showUploadList={false}
        className={styles.dragger}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
        <p className="ant-upload-hint">
          支持单个或批量上传，大文件将自动分片上传。最大支持 {formatFileSize(maxFileSize)}
        </p>
      </Dragger>

      {/* 上传任务列表 */}
      {tasks.length > 0 && (
        <Card 
          className={styles.taskList}
          title={
            <Space>
              <span>上传队列</span>
              <Tag color="blue">{tasks.length} 个文件</Tag>
              {completedCount > 0 && <Tag color="success">{completedCount} 已完成</Tag>}
              {failedCount > 0 && <Tag color="error">{failedCount} 失败</Tag>}
            </Space>
          }
          extra={
            <Space>
              {pendingCount > 0 && !isUploading && (
                <Button 
                  type="primary" 
                  icon={<PlayCircleOutlined />}
                  onClick={startUpload}
                >
                  开始上传
                </Button>
              )}
              {completedCount > 0 && (
                <Button onClick={clearCompleted}>
                  清除已完成
                </Button>
              )}
            </Space>
          }
        >
          {/* 总体进度 */}
          {isUploading && (
            <div className={styles.totalProgress}>
              <Text>总体进度</Text>
              <Progress percent={Math.round(totalProgress)} status="active" />
            </div>
          )}

          {/* 任务列表 */}
          <List
            dataSource={tasks}
            renderItem={(task) => (
              <List.Item
                className={styles.taskItem}
                actions={[
                  task.status === 'uploading' && (
                    <Tooltip title="暂停">
                      <Button 
                        type="text" 
                        icon={<PauseCircleOutlined />}
                        onClick={() => pauseUpload(task.id)}
                      />
                    </Tooltip>
                  ),
                  task.status === 'paused' && (
                    <Tooltip title="继续">
                      <Button 
                        type="text" 
                        icon={<PlayCircleOutlined />}
                        onClick={() => retryUpload(task.id)}
                      />
                    </Tooltip>
                  ),
                  task.status === 'failed' && (
                    <Tooltip title="重试">
                      <Button 
                        type="text" 
                        icon={<ReloadOutlined />}
                        onClick={() => retryUpload(task.id)}
                      />
                    </Tooltip>
                  ),
                  <Popconfirm
                    key="delete"
                    title="确定要删除这个上传任务吗？"
                    onConfirm={() => removeTask(task.id)}
                    okText="确定"
                    cancelText="取消"
                  >
                    <Tooltip title="删除">
                      <Button type="text" danger icon={<DeleteOutlined />} />
                    </Tooltip>
                  </Popconfirm>
                ].filter(Boolean)}
              >
                <List.Item.Meta
                  avatar={getFileIcon(task.file)}
                  title={
                    <Space>
                      <Text ellipsis style={{ maxWidth: 300 }}>{task.file.name}</Text>
                      {getStatusTag(task)}
                    </Space>
                  }
                  description={
                    <div className={styles.taskMeta}>
                      <Space split="·">
                        <Text type="secondary">{formatFileSize(task.file.size)}</Text>
                        {task.status === 'uploading' && task.speed && (
                          <Text type="secondary">{formatSpeed(task.speed)}</Text>
                        )}
                        {task.status === 'uploading' && task.remainingTime && (
                          <Text type="secondary">剩余 {formatRemainingTime(task.remainingTime)}</Text>
                        )}
                        {task.status === 'uploading' && (
                          <Text type="secondary">
                            {task.uploadedChunks}/{task.totalChunks} 分片
                          </Text>
                        )}
                        {task.error && (
                          <Text type="danger">{task.error}</Text>
                        )}
                      </Space>
                      {(task.status === 'uploading' || task.status === 'paused') && (
                        <Progress 
                          percent={Math.round(task.progress)} 
                          size="small"
                          status={task.status === 'paused' ? 'exception' : 'active'}
                        />
                      )}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      )}
    </div>
  );
};

export default ChunkUploader;