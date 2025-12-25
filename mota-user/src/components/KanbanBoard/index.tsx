import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { message, Tooltip, Spin } from 'antd';
import {
  PlusOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  LinkOutlined,
  CheckSquareOutlined
} from '@ant-design/icons';
import styles from './index.module.css';

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
  // 依赖关系
  blockedByTasks?: number[]; // 被哪些任务阻塞
  blockingTasks?: number[]; // 阻塞哪些任务
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
  in_progress: { title: '进行中', color: '#1890ff' },
  review: { title: '审核中', color: '#722ed1' },
  done: { title: '已完成', color: '#52c41a' }
};

// 优先级配置
const PRIORITY_CONFIG: Record<TaskPriority, { label: string; className: string }> = {
  low: { label: '低', className: styles.priorityLow },
  normal: { label: '普通', className: styles.priorityNormal },
  high: { label: '高', className: styles.priorityHigh },
  urgent: { label: '紧急', className: styles.priorityUrgent }
};

// 状态转换规则（基于依赖关系）
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
      // 被阻塞的任务
      const blockedBy = blockedByMap.get(dep.taskId) || [];
      blockedBy.push(dep.dependsOnTaskId);
      blockedByMap.set(dep.taskId, blockedBy);

      // 阻塞其他任务
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

    // 获取阻塞任务的状态
    const blockingTasksStatus = blockedByTasks.map(blockingId => {
      const blockingTask = tasks.find(t => t.id === blockingId);
      return blockingTask?.status;
    });

    const targetStatusIndex = STATUS_ORDER.indexOf(targetStatus);

    // 检查FS依赖：前置任务必须完成
    for (let i = 0; i < blockedByTasks.length; i++) {
      const blockingTaskStatus = blockingTasksStatus[i];
      if (!blockingTaskStatus) continue;
      
      // 如果前置任务未完成，当前任务不能进入"进行中"或更后的状态
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
    // 只有当真正离开列时才清除状态
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

    // 调用移动回调
    if (onTaskMove) {
      try {
        const success = await onTaskMove(draggedTask.id, targetStatus);
        if (success) {
          // 本地更新状态
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
  const formatDueDate = (dateStr?: string): { text: string; className: string } => {
    if (!dateStr) return { text: '', className: '' };

    const dueDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `逾期${Math.abs(diffDays)}天`, className: styles.overdue };
    } else if (diffDays === 0) {
      return { text: '今天截止', className: styles.dueToday };
    } else if (diffDays <= 3) {
      return { text: `${diffDays}天后`, className: styles.dueToday };
    } else {
      return {
        text: dueDate.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
        className: ''
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

    return (
      <div
        key={task.id}
        className={`${styles.taskCard} ${draggedTask?.id === task.id ? styles.dragging : ''} ${hasBlockers ? styles.blocked : ''}`}
        draggable
        onDragStart={(e) => handleDragStart(e, task)}
        onDragEnd={handleDragEnd}
        onClick={() => onTaskClick?.(task)}
      >
        {/* 依赖指示器 */}
        {(hasBlockers || isBlocking) && (
          <div className={styles.dependencyIndicator}>
            {hasBlockers && (
              <Tooltip title={`被 ${task.blockedByTasks?.length} 个任务阻塞`}>
                <span className={`${styles.dependencyBadge} ${styles.blockedBy}`}>
                  <LinkOutlined />
                </span>
              </Tooltip>
            )}
            {isBlocking && (
              <Tooltip title={`阻塞 ${task.blockingTasks?.length} 个任务`}>
                <span className={`${styles.dependencyBadge} ${styles.blocking}`}>
                  <LinkOutlined />
                </span>
              </Tooltip>
            )}
          </div>
        )}

        {/* 任务标题 */}
        <div className={styles.taskTitle}>{task.title}</div>

        {/* 任务元信息 */}
        <div className={styles.taskMeta}>
          <span className={`${styles.taskTag} ${PRIORITY_CONFIG[task.priority].className}`}>
            {PRIORITY_CONFIG[task.priority].label}
          </span>
          {task.projectName && (
            <span className={styles.taskTag}>{task.projectName}</span>
          )}
        </div>

        {/* 子任务进度 */}
        {task.subtaskCount && task.subtaskCount > 0 && (
          <div className={styles.subtaskProgress}>
            <CheckSquareOutlined style={{ fontSize: 12, color: 'var(--text-secondary)' }} />
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${subtaskProgress}%` }}
              />
            </div>
            <span className={styles.progressText}>
              {task.completedSubtaskCount}/{task.subtaskCount}
            </span>
          </div>
        )}

        {/* 任务底部 */}
        <div className={styles.taskFooter}>
          {task.assigneeName ? (
            <div className={styles.taskAssignee}>
              <div className={styles.assigneeAvatar}>
                {task.assigneeName.charAt(0).toUpperCase()}
              </div>
              <span className={styles.assigneeName}>{task.assigneeName}</span>
            </div>
          ) : (
            <div />
          )}
          {dueInfo.text && (
            <div className={`${styles.taskDueDate} ${dueInfo.className}`}>
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
        className={`${styles.column} ${isDragOver ? styles.dragOver : ''} ${isInvalidDrop ? styles.invalidDrop : ''}`}
        onDragEnter={(e) => handleDragEnter(e, column.id)}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, column.id)}
      >
        {/* 列头部 */}
        <div className={styles.columnHeader}>
          <div className={styles.columnTitle}>
            <span
              className={styles.columnName}
              style={{ color: column.color }}
            >
              {column.title}
            </span>
            <span className={styles.columnCount}>{column.tasks.length}</span>
          </div>
        </div>

        {/* 列内容 */}
        <div className={styles.columnContent}>
          {/* 拖拽占位符 */}
          {isDragOver && draggedTask && draggedTask.status !== column.id && (
            <div className={`${styles.dropPlaceholder} ${isInvalidDrop ? styles.invalidPlaceholder : ''}`}>
              {isInvalidDrop ? '无法放置' : '放置到此处'}
            </div>
          )}

          {/* 任务卡片 */}
          {column.tasks.map(task => renderTaskCard(task))}

          {/* 空状态 */}
          {column.tasks.length === 0 && !isDragOver && (
            <div className={styles.emptyColumn}>
              <div className={styles.emptyIcon}>📋</div>
              <div className={styles.emptyText}>暂无任务</div>
            </div>
          )}

          {/* 添加任务按钮 */}
          {onAddTask && (
            <button
              className={styles.addTaskButton}
              onClick={() => onAddTask(column.id)}
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
      <div className={styles.kanbanContainer}>
        <div className={styles.loading}>
          <Spin size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.kanbanContainer}>
      {/* 头部 */}
      <div className={styles.kanbanHeader}>
        <div className={styles.headerLeft}>
          <span className={styles.title}>看板视图</span>
          <span className={styles.taskCount}>共 {tasks.length} 个任务</span>
        </div>
      </div>

      {/* 看板主体 */}
      <div className={styles.kanbanBody}>
        {columns.map(column => renderColumn(column))}
      </div>

      {/* 依赖警告提示 */}
      {warningMessage && (
        <div className={styles.dependencyWarning}>
          <ExclamationCircleOutlined className={styles.warningIcon} />
          <span className={styles.warningText}>{warningMessage}</span>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;