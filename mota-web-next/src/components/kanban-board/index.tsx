'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { message, Tooltip, Spin } from 'antd';
import {
  PlusOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  LinkOutlined,
  CheckSquareOutlined
} from '@ant-design/icons';

// 任务状态定义
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';

// 任务优先级
export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';

// 任务依赖类型
export interface TaskDependency {
  id: number;
  taskId: number;
  dependsOnTaskId: number;
  dependencyType: 'FS' | 'SS' | 'FF' | 'SF';
}

// 任务接口
export interface KanbanTask {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: number;
  assigneeName?: string;
  assigneeAvatar?: string;
  dueDate?: string;
  projectId: number;
  projectName?: string;
  subtaskCount?: number;
  completedSubtaskCount?: number;
  blockedByTasks?: number[];
  blockingTasks?: number[];
}

// 列定义
export interface KanbanColumn {
  id: TaskStatus;
  title: string;
  color: string;
  tasks: KanbanTask[];
}

// 状态配置
const STATUS_CONFIG: Record<TaskStatus, { title: string; color: string }> = {
  todo: { title: '待办', color: '#8c8c8c' },
  in_progress: { title: '进行中', color: '#10B981' },
  review: { title: '审核中', color: '#8B5CF6' },
  done: { title: '已完成', color: '#52c41a' }
};

// 优先级配置
const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; bgColor: string }> = {
  low: { label: '低', color: '#52c41a', bgColor: '#f6ffed' },
  normal: { label: '普通', color: '#1890ff', bgColor: '#e6f7ff' },
  high: { label: '高', color: '#fa8c16', bgColor: '#fff7e6' },
  urgent: { label: '紧急', color: '#ff4d4f', bgColor: '#fff2f0' }
};

// 状态转换规则
const STATUS_ORDER: TaskStatus[] = ['todo', 'in_progress', 'review', 'done'];

interface KanbanBoardProps {
  tasks: KanbanTask[];
  dependencies?: TaskDependency[];
  loading?: boolean;
  onTaskMove?: (taskId: number, newStatus: TaskStatus) => Promise<boolean>;
  onTaskClick?: (task: KanbanTask) => void;
  onAddTask?: (status: TaskStatus) => void;
  validateDependencies?: boolean;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  dependencies = [],
  loading = false,
  onTaskMove,
  onTaskClick,
  onAddTask,
  validateDependencies = true
}) => {
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [draggedTask, setDraggedTask] = useState<KanbanTask | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);
  const [isValidDrop, setIsValidDrop] = useState(true);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // 构建依赖关系映射
  const dependencyMap = useMemo(() => {
    const blockedByMap = new Map<number, number[]>();
    const blockingMap = new Map<number, number[]>();

    dependencies.forEach(dep => {
      const blockedBy = blockedByMap.get(dep.taskId) || [];
      blockedBy.push(dep.dependsOnTaskId);
      blockedByMap.set(dep.taskId, blockedBy);

      const blocking = blockingMap.get(dep.dependsOnTaskId) || [];
      blocking.push(dep.taskId);
      blockingMap.set(dep.dependsOnTaskId, blocking);
    });

    return { blockedByMap, blockingMap };
  }, [dependencies]);

  // 初始化列
  useEffect(() => {
    const newColumns: KanbanColumn[] = STATUS_ORDER.map(status => ({
      id: status,
      title: STATUS_CONFIG[status].title,
      color: STATUS_CONFIG[status].color,
      tasks: tasks
        .filter(task => task.status === status)
        .map(task => ({
          ...task,
          blockedByTasks: dependencyMap.blockedByMap.get(task.id) || [],
          blockingTasks: dependencyMap.blockingMap.get(task.id) || []
        }))
    }));
    setColumns(newColumns);
  }, [tasks, dependencyMap]);

  // 检查任务是否可以移动到目标状态
  const canMoveToStatus = useCallback((task: KanbanTask, targetStatus: TaskStatus): { valid: boolean; reason?: string } => {
    if (!validateDependencies) {
      return { valid: true };
    }

    const blockedByTasks = dependencyMap.blockedByMap.get(task.id) || [];
    
    if (blockedByTasks.length === 0) {
      return { valid: true };
    }

    const blockingTasksStatus = blockedByTasks.map(blockingId => {
      const blockingTask = tasks.find(t => t.id === blockingId);
      return blockingTask?.status;
    });

    const targetStatusIndex = STATUS_ORDER.indexOf(targetStatus);

    for (let i = 0; i < blockedByTasks.length; i++) {
      const blockingTaskStatus = blockingTasksStatus[i];
      if (!blockingTaskStatus) continue;
      
      if (blockingTaskStatus !== 'done' && targetStatusIndex >= 1) {
        const blockingTask = tasks.find(t => t.id === blockedByTasks[i]);
        return {
          valid: false,
          reason: `任务被 "${blockingTask?.title || '未知任务'}" 阻塞，需要先完成前置任务`
        };
      }
    }

    return { valid: true };
  }, [validateDependencies, dependencyMap, tasks]);

  // 拖拽开始
  const handleDragStart = (e: React.DragEvent, task: KanbanTask) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task.id.toString());
  };

  // 拖拽结束
  const handleDragEnd = () => {
    setDraggedTask(null);
    setDragOverColumn(null);
    setIsValidDrop(true);
    setWarningMessage(null);
  };

  // 拖拽进入列
  const handleDragEnter = (e: React.DragEvent, columnId: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(columnId);

    if (draggedTask && draggedTask.status !== columnId) {
      const result = canMoveToStatus(draggedTask, columnId);
      setIsValidDrop(result.valid);
      if (!result.valid) {
        setWarningMessage(result.reason || '无法移动到此状态');
      } else {
        setWarningMessage(null);
      }
    }
  };

  // 拖拽离开列
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!relatedTarget || !e.currentTarget.contains(relatedTarget)) {
      setDragOverColumn(null);
      setIsValidDrop(true);
      setWarningMessage(null);
    }
  };

  // 拖拽悬停
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = isValidDrop ? 'move' : 'none';
  };

  // 放置
  const handleDrop = async (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();

    if (!draggedTask || draggedTask.status === targetStatus) {
      handleDragEnd();
      return;
    }

    const result = canMoveToStatus(draggedTask, targetStatus);
    if (!result.valid) {
      message.error(result.reason || '无法移动任务');
      handleDragEnd();
      return;
    }

    if (onTaskMove) {
      try {
        const success = await onTaskMove(draggedTask.id, targetStatus);
        if (success) {
          setColumns(prevColumns => {
            return prevColumns.map(column => {
              if (column.id === draggedTask.status) {
                return {
                  ...column,
                  tasks: column.tasks.filter(t => t.id !== draggedTask.id)
                };
              }
              if (column.id === targetStatus) {
                return {
                  ...column,
                  tasks: [...column.tasks, { ...draggedTask, status: targetStatus }]
                };
              }
              return column;
            });
          });
          message.success('任务状态已更新');
        }
      } catch (error) {
        message.error('更新任务状态失败');
      }
    }

    handleDragEnd();
  };

  // 格式化截止日期
  const formatDueDate = (dateStr?: string): { text: string; isOverdue: boolean; isDueToday: boolean } => {
    if (!dateStr) return { text: '', isOverdue: false, isDueToday: false };

    const dueDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `逾期${Math.abs(diffDays)}天`, isOverdue: true, isDueToday: false };
    } else if (diffDays === 0) {
      return { text: '今天截止', isOverdue: false, isDueToday: true };
    } else if (diffDays <= 3) {
      return { text: `${diffDays}天后`, isOverdue: false, isDueToday: true };
    } else {
      return {
        text: dueDate.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
        isOverdue: false,
        isDueToday: false
      };
    }
  };

  // 渲染任务卡片
  const renderTaskCard = (task: KanbanTask) => {
    const dueInfo = formatDueDate(task.dueDate);
    const hasBlockers = (task.blockedByTasks?.length || 0) > 0;
    const isBlocking = (task.blockingTasks?.length || 0) > 0;
    const subtaskProgress = task.subtaskCount
      ? Math.round((task.completedSubtaskCount || 0) / task.subtaskCount * 100)
      : 0;
    const priorityConfig = PRIORITY_CONFIG[task.priority];

    return (
      <div
        key={task.id}
        draggable
        onDragStart={(e) => handleDragStart(e, task)}
        onDragEnd={handleDragEnd}
        onClick={() => onTaskClick?.(task)}
        style={{
          padding: 12,
          marginBottom: 8,
          background: draggedTask?.id === task.id ? '#f5f5f5' : '#fff',
          borderRadius: 8,
          border: hasBlockers ? '1px solid #ff4d4f' : '1px solid #f0f0f0',
          cursor: 'grab',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          opacity: draggedTask?.id === task.id ? 0.5 : 1,
          transition: 'all 0.2s'
        }}
      >
        {/* 依赖指示器 */}
        {(hasBlockers || isBlocking) && (
          <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
            {hasBlockers && (
              <Tooltip title={`被 ${task.blockedByTasks?.length} 个任务阻塞`}>
                <span style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  padding: '2px 6px', 
                  borderRadius: 4, 
                  background: '#fff2f0', 
                  color: '#ff4d4f',
                  fontSize: 11
                }}>
                  <LinkOutlined style={{ marginRight: 4 }} />
                  被阻塞
                </span>
              </Tooltip>
            )}
            {isBlocking && (
              <Tooltip title={`阻塞 ${task.blockingTasks?.length} 个任务`}>
                <span style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  padding: '2px 6px', 
                  borderRadius: 4, 
                  background: '#fff7e6', 
                  color: '#fa8c16',
                  fontSize: 11
                }}>
                  <LinkOutlined style={{ marginRight: 4 }} />
                  阻塞中
                </span>
              </Tooltip>
            )}
          </div>
        )}

        {/* 任务标题 */}
        <div style={{ fontWeight: 500, marginBottom: 8, lineHeight: 1.4 }}>{task.title}</div>

        {/* 任务元信息 */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
          <span style={{ 
            padding: '2px 8px', 
            borderRadius: 4, 
            fontSize: 11,
            background: priorityConfig.bgColor,
            color: priorityConfig.color
          }}>
            {priorityConfig.label}
          </span>
          {task.projectName && (
            <span style={{ 
              padding: '2px 8px', 
              borderRadius: 4, 
              fontSize: 11,
              background: '#f5f5f5',
              color: '#666'
            }}>
              {task.projectName}
            </span>
          )}
        </div>

        {/* 子任务进度 */}
        {task.subtaskCount && task.subtaskCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <CheckSquareOutlined style={{ fontSize: 12, color: '#999' }} />
            <div style={{ flex: 1, height: 4, background: '#f0f0f0', borderRadius: 2, overflow: 'hidden' }}>
              <div
                style={{ 
                  width: `${subtaskProgress}%`, 
                  height: '100%', 
                  background: '#10B981',
                  borderRadius: 2,
                  transition: 'width 0.3s'
                }}
              />
            </div>
            <span style={{ fontSize: 11, color: '#999' }}>
              {task.completedSubtaskCount}/{task.subtaskCount}
            </span>
          </div>
        )}

        {/* 任务底部 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {task.assigneeName ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ 
                width: 24, 
                height: 24, 
                borderRadius: '50%', 
                background: '#10B981', 
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 500
              }}>
                {task.assigneeName.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: 12, color: '#666' }}>{task.assigneeName}</span>
            </div>
          ) : (
            <div />
          )}
          {dueInfo.text && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 4,
              fontSize: 11,
              color: dueInfo.isOverdue ? '#ff4d4f' : dueInfo.isDueToday ? '#fa8c16' : '#999'
            }}>
              <ClockCircleOutlined />
              {dueInfo.text}
            </div>
          )}
        </div>
      </div>
    );
  };

  // 渲染列
  const renderColumn = (column: KanbanColumn) => {
    const isDragOver = dragOverColumn === column.id;
    const isInvalidDrop = isDragOver && !isValidDrop;

    return (
      <div
        key={column.id}
        onDragEnter={(e) => handleDragEnter(e, column.id)}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, column.id)}
        style={{
          flex: 1,
          minWidth: 280,
          maxWidth: 320,
          display: 'flex',
          flexDirection: 'column',
          background: isDragOver ? (isInvalidDrop ? '#fff2f0' : '#e6f7ff') : '#f5f5f5',
          borderRadius: 8,
          transition: 'background 0.2s'
        }}
      >
        {/* 列头部 */}
        <div style={{ 
          padding: '12px 16px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid #e8e8e8'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ 
              fontWeight: 600, 
              color: column.color 
            }}>
              {column.title}
            </span>
            <span style={{ 
              padding: '2px 8px', 
              borderRadius: 10, 
              background: '#fff',
              fontSize: 12,
              color: '#666'
            }}>
              {column.tasks.length}
            </span>
          </div>
        </div>

        {/* 列内容 */}
        <div style={{ flex: 1, padding: 8, overflow: 'auto' }}>
          {/* 拖拽占位符 */}
          {isDragOver && draggedTask && draggedTask.status !== column.id && (
            <div style={{
              padding: 16,
              marginBottom: 8,
              borderRadius: 8,
              border: `2px dashed ${isInvalidDrop ? '#ff4d4f' : '#10B981'}`,
              background: isInvalidDrop ? '#fff2f0' : '#f6ffed',
              textAlign: 'center',
              color: isInvalidDrop ? '#ff4d4f' : '#10B981',
              fontSize: 13
            }}>
              {isInvalidDrop ? '无法放置' : '放置到此处'}
            </div>
          )}

          {/* 任务卡片 */}
          {column.tasks.map(task => renderTaskCard(task))}

          {/* 空状态 */}
          {column.tasks.length === 0 && !isDragOver && (
            <div style={{ 
              padding: 24, 
              textAlign: 'center', 
              color: '#999'
            }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>📋</div>
              <div>暂无任务</div>
            </div>
          )}

          {/* 添加任务按钮 */}
          {onAddTask && (
            <button
              onClick={() => onAddTask(column.id)}
              style={{
                width: '100%',
                padding: '8px 12px',
                marginTop: 8,
                border: '1px dashed #d9d9d9',
                borderRadius: 8,
                background: 'transparent',
                color: '#666',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                fontSize: 13,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#10B981';
                e.currentTarget.style.color = '#10B981';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#d9d9d9';
                e.currentTarget.style.color = '#666';
              }}
            >
              <PlusOutlined />
              添加任务
            </button>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: 400,
        background: '#fff',
        borderRadius: 8
      }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 头部 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '12px 16px',
        background: '#fff',
        borderRadius: '8px 8px 0 0',
        borderBottom: '1px solid #f0f0f0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontWeight: 600, fontSize: 16 }}>看板视图</span>
          <span style={{ color: '#999', fontSize: 13 }}>共 {tasks.length} 个任务</span>
        </div>
      </div>

      {/* 看板主体 */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        gap: 12, 
        padding: 12,
        overflow: 'auto',
        background: '#fff',
        borderRadius: '0 0 8px 8px'
      }}>
        {columns.map(column => renderColumn(column))}
      </div>

      {/* 依赖警告提示 */}
      {warningMessage && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '12px 24px',
          background: '#fff2f0',
          border: '1px solid #ffccc7',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000
        }}>
          <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
          <span style={{ color: '#ff4d4f' }}>{warningMessage}</span>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;