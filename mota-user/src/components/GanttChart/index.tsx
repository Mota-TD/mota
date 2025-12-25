import React, { useMemo, useState, useCallback } from 'react';
import { Tooltip, Progress, Button, Space, Select, Switch, Badge } from 'antd';
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  CalendarOutlined,
  LinkOutlined,
  WarningOutlined
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import styles from './index.module.css';
import { DependencyTypeColors, DependencyTypeShortLabels } from '../../services/api/taskDependency';

// 任务类型
export interface GanttTask {
  id: string | number;
  name: string;
  startDate: string | null;
  endDate: string | null;
  progress: number;
  status: string;
  priority: string;
  assigneeId?: string | number;
  assigneeName?: string;
  dependencies?: (string | number)[]; // 前置任务ID列表
  isMilestone?: boolean;
  color?: string;
}

// 依赖关系类型
export interface GanttDependency {
  id?: number;
  predecessorId: string | number;
  successorId: string | number;
  dependencyType: 'FS' | 'SS' | 'FF' | 'SF';
  lagDays?: number;
  hasConflict?: boolean;
  conflictDescription?: string;
}

// 组件属性
interface GanttChartProps {
  tasks: GanttTask[];
  dependencies?: GanttDependency[];
  onTaskClick?: (task: GanttTask) => void;
  onTaskDoubleClick?: (task: GanttTask) => void;
  onDependencyClick?: (dependency: GanttDependency) => void;
  criticalPath?: (string | number)[]; // 关键路径上的任务ID
  conflictTaskIds?: (string | number)[]; // 有冲突的任务ID
  showDependencies?: boolean;
  showProgress?: boolean;
  showToday?: boolean;
  showConflicts?: boolean;
}

// 视图模式
type ViewMode = 'day' | 'week' | 'month';

// 状态颜色映射
const statusColors: Record<string, string> = {
  pending: '#d9d9d9',
  in_progress: '#1890ff',
  completed: '#52c41a',
  cancelled: '#ff4d4f',
};

const GanttChart: React.FC<GanttChartProps> = ({
  tasks,
  dependencies = [],
  onTaskClick,
  onTaskDoubleClick,
  onDependencyClick,
  criticalPath = [],
  conflictTaskIds = [],
  showDependencies = true,
  showProgress = true,
  showToday = true,
  showConflicts = true,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [scrollLeft, setScrollLeft] = useState(0);
  const [dependencyVisible, setDependencyVisible] = useState(showDependencies);
  const [hoveredDependency, setHoveredDependency] = useState<GanttDependency | null>(null);

  // 计算日期范围
  const { startDate, endDate } = useMemo(() => {
    if (tasks.length === 0) {
      const today = dayjs();
      return {
        startDate: today.subtract(7, 'day'),
        endDate: today.add(30, 'day'),
        totalDays: 37,
      };
    }

    let minDate = dayjs();
    let maxDate = dayjs();

    tasks.forEach(task => {
      if (task.startDate) {
        const start = dayjs(task.startDate);
        if (start.isBefore(minDate)) minDate = start;
      }
      if (task.endDate) {
        const end = dayjs(task.endDate);
        if (end.isAfter(maxDate)) maxDate = end;
      }
    });

    // 添加前后缓冲
    minDate = minDate.subtract(7, 'day');
    maxDate = maxDate.add(14, 'day');

    return {
      startDate: minDate,
      endDate: maxDate,
      totalDays: maxDate.diff(minDate, 'day') + 1,
    };
  }, [tasks]);

  // 计算单元格宽度
  const cellWidth = useMemo(() => {
    switch (viewMode) {
      case 'day': return 40;
      case 'week': return 20;
      case 'month': return 8;
      default: return 20;
    }
  }, [viewMode]);

  // 生成日期列
  const dateColumns = useMemo(() => {
    const columns: { date: Dayjs; isWeekend: boolean; isToday: boolean }[] = [];
    let current = startDate;
    
    while (current.isBefore(endDate) || current.isSame(endDate, 'day')) {
      columns.push({
        date: current,
        isWeekend: current.day() === 0 || current.day() === 6,
        isToday: current.isSame(dayjs(), 'day'),
      });
      current = current.add(1, 'day');
    }
    
    return columns;
  }, [startDate, endDate]);

  // 生成月份标题
  const monthHeaders = useMemo(() => {
    const headers: { month: string; startIndex: number; span: number }[] = [];
    let currentMonth = '';
    let startIndex = 0;
    let span = 0;

    dateColumns.forEach((col, index) => {
      const month = col.date.format('YYYY年MM月');
      if (month !== currentMonth) {
        if (currentMonth) {
          headers.push({ month: currentMonth, startIndex, span });
        }
        currentMonth = month;
        startIndex = index;
        span = 1;
      } else {
        span++;
      }
    });

    if (currentMonth) {
      headers.push({ month: currentMonth, startIndex, span });
    }

    return headers;
  }, [dateColumns]);

  // 计算任务条位置
  const getTaskBarStyle = useCallback((task: GanttTask) => {
    if (!task.startDate || !task.endDate) {
      return { display: 'none' };
    }

    const taskStart = dayjs(task.startDate);
    const taskEnd = dayjs(task.endDate);
    
    const left = taskStart.diff(startDate, 'day') * cellWidth;
    const width = (taskEnd.diff(taskStart, 'day') + 1) * cellWidth;

    return {
      left: `${left}px`,
      width: `${Math.max(width, cellWidth)}px`,
    };
  }, [startDate, cellWidth]);

  // 判断是否在关键路径上
  const isOnCriticalPath = useCallback((taskId: string | number) => {
    return criticalPath.some(id => String(id) === String(taskId));
  }, [criticalPath]);

  // 判断是否有冲突
  const hasConflict = useCallback((taskId: string | number) => {
    return conflictTaskIds.some(id => String(id) === String(taskId));
  }, [conflictTaskIds]);

  // 获取任务颜色
  const getTaskColor = useCallback((task: GanttTask) => {
    if (task.color) return task.color;
    if (hasConflict(task.id)) return '#ff4d4f';
    if (isOnCriticalPath(task.id)) return '#fa8c16';
    return statusColors[task.status] || '#1890ff';
  }, [isOnCriticalPath, hasConflict]);

  // 滚动到今天
  const scrollToToday = useCallback(() => {
    const today = dayjs();
    const daysDiff = today.diff(startDate, 'day');
    const newScrollLeft = Math.max(0, daysDiff * cellWidth - 200);
    setScrollLeft(newScrollLeft);
  }, [startDate, cellWidth]);

  // 缩放控制
  const handleZoomIn = () => {
    if (viewMode === 'month') setViewMode('week');
    else if (viewMode === 'week') setViewMode('day');
  };

  const handleZoomOut = () => {
    if (viewMode === 'day') setViewMode('week');
    else if (viewMode === 'week') setViewMode('month');
  };

  // 获取依赖线颜色
  const getDependencyColor = useCallback((dep: GanttDependency) => {
    if (dep.hasConflict) return '#ff4d4f';
    return DependencyTypeColors[dep.dependencyType] || '#999';
  }, []);

  // 获取依赖线样式
  const getDependencyStroke = useCallback((dep: GanttDependency) => {
    // 不同依赖类型使用不同的线条样式
    switch (dep.dependencyType) {
      case 'FS': return { dasharray: 'none', width: 2 }; // 实线
      case 'SS': return { dasharray: '8,4', width: 2 }; // 长虚线
      case 'FF': return { dasharray: '4,4', width: 2 }; // 短虚线
      case 'SF': return { dasharray: '2,2,8,2', width: 2 }; // 点划线
      default: return { dasharray: '4,2', width: 1 };
    }
  }, []);

  // 计算依赖线的连接点
  const calculateDependencyPoints = useCallback((dep: GanttDependency) => {
    const predecessorTask = tasks.find(t => String(t.id) === String(dep.predecessorId));
    const successorTask = tasks.find(t => String(t.id) === String(dep.successorId));

    if (!predecessorTask || !successorTask) return null;

    const predecessorIndex = tasks.findIndex(t => String(t.id) === String(dep.predecessorId));
    const successorIndex = tasks.findIndex(t => String(t.id) === String(dep.successorId));

    let x1: number, y1: number, x2: number, y2: number;
    const rowHeight = 40;
    const barHeight = 24;
    const barOffset = (rowHeight - barHeight) / 2;

    // 根据依赖类型确定连接点
    switch (dep.dependencyType) {
      case 'FS': // 完成-开始：从前置任务的结束连接到后继任务的开始
        if (!predecessorTask.endDate || !successorTask.startDate) return null;
        x1 = (dayjs(predecessorTask.endDate).diff(startDate, 'day') + 1) * cellWidth;
        y1 = predecessorIndex * rowHeight + rowHeight / 2;
        x2 = dayjs(successorTask.startDate).diff(startDate, 'day') * cellWidth;
        y2 = successorIndex * rowHeight + rowHeight / 2;
        break;
      case 'SS': // 开始-开始：从前置任务的开始连接到后继任务的开始
        if (!predecessorTask.startDate || !successorTask.startDate) return null;
        x1 = dayjs(predecessorTask.startDate).diff(startDate, 'day') * cellWidth;
        y1 = predecessorIndex * rowHeight + rowHeight / 2;
        x2 = dayjs(successorTask.startDate).diff(startDate, 'day') * cellWidth;
        y2 = successorIndex * rowHeight + rowHeight / 2;
        break;
      case 'FF': // 完成-完成：从前置任务的结束连接到后继任务的结束
        if (!predecessorTask.endDate || !successorTask.endDate) return null;
        x1 = (dayjs(predecessorTask.endDate).diff(startDate, 'day') + 1) * cellWidth;
        y1 = predecessorIndex * rowHeight + rowHeight / 2;
        x2 = (dayjs(successorTask.endDate).diff(startDate, 'day') + 1) * cellWidth;
        y2 = successorIndex * rowHeight + rowHeight / 2;
        break;
      case 'SF': // 开始-完成：从前置任务的开始连接到后继任务的结束
        if (!predecessorTask.startDate || !successorTask.endDate) return null;
        x1 = dayjs(predecessorTask.startDate).diff(startDate, 'day') * cellWidth;
        y1 = predecessorIndex * rowHeight + rowHeight / 2;
        x2 = (dayjs(successorTask.endDate).diff(startDate, 'day') + 1) * cellWidth;
        y2 = successorIndex * rowHeight + rowHeight / 2;
        break;
      default:
        return null;
    }

    return { x1, y1, x2, y2 };
  }, [tasks, startDate, cellWidth]);

  // 生成依赖线路径
  const generateDependencyPath = useCallback((dep: GanttDependency) => {
    const points = calculateDependencyPoints(dep);
    if (!points) return null;

    const { x1, y1, x2, y2 } = points;
    const offset = 10; // 折线偏移量

    // 根据依赖类型生成不同的路径
    let path: string;
    
    if (dep.dependencyType === 'FS') {
      // FS: 从右侧出发，折线连接到左侧
      if (x2 > x1 + offset) {
        // 正常情况：后继任务在前置任务之后
        const midX = x1 + offset;
        path = `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
      } else {
        // 特殊情况：后继任务在前置任务之前（可能有冲突）
        const midY = y1 < y2 ? y1 + 20 : y1 - 20;
        path = `M ${x1} ${y1} L ${x1 + offset} ${y1} L ${x1 + offset} ${midY} L ${x2 - offset} ${midY} L ${x2 - offset} ${y2} L ${x2} ${y2}`;
      }
    } else if (dep.dependencyType === 'SS') {
      // SS: 从左侧出发，折线连接到左侧
      const minX = Math.min(x1, x2) - offset;
      path = `M ${x1} ${y1} L ${minX} ${y1} L ${minX} ${y2} L ${x2} ${y2}`;
    } else if (dep.dependencyType === 'FF') {
      // FF: 从右侧出发，折线连接到右侧
      const maxX = Math.max(x1, x2) + offset;
      path = `M ${x1} ${y1} L ${maxX} ${y1} L ${maxX} ${y2} L ${x2} ${y2}`;
    } else if (dep.dependencyType === 'SF') {
      // SF: 从左侧出发，折线连接到右侧
      if (x1 < x2 - offset) {
        const midX = (x1 + x2) / 2;
        path = `M ${x1} ${y1} L ${x1 - offset} ${y1} L ${x1 - offset} ${y2} L ${x2} ${y2}`;
      } else {
        const midY = y1 < y2 ? y1 + 20 : y1 - 20;
        path = `M ${x1} ${y1} L ${x1 - offset} ${y1} L ${x1 - offset} ${midY} L ${x2 + offset} ${midY} L ${x2 + offset} ${y2} L ${x2} ${y2}`;
      }
    } else {
      path = `M ${x1} ${y1} L ${x2} ${y2}`;
    }

    return path;
  }, [calculateDependencyPoints]);

  // 渲染依赖线
  const renderDependencyLines = () => {
    if (!dependencyVisible) return null;

    return dependencies.map((dep, index) => {
      const path = generateDependencyPath(dep);
      if (!path) return null;

      const color = getDependencyColor(dep);
      const strokeStyle = getDependencyStroke(dep);
      const isHovered = hoveredDependency &&
        hoveredDependency.predecessorId === dep.predecessorId &&
        hoveredDependency.successorId === dep.successorId;

      const predecessorTask = tasks.find(t => String(t.id) === String(dep.predecessorId));
      const successorTask = tasks.find(t => String(t.id) === String(dep.successorId));

      return (
        <g key={`dep-${index}`}>
          {/* 依赖线 */}
          <path
            d={path}
            fill="none"
            stroke={color}
            strokeWidth={isHovered ? strokeStyle.width + 1 : strokeStyle.width}
            strokeDasharray={strokeStyle.dasharray}
            markerEnd={`url(#arrowhead-${dep.dependencyType})`}
            style={{
              cursor: 'pointer',
              transition: 'stroke-width 0.2s',
              opacity: isHovered ? 1 : 0.8
            }}
            onMouseEnter={() => setHoveredDependency(dep)}
            onMouseLeave={() => setHoveredDependency(null)}
            onClick={() => onDependencyClick?.(dep)}
          />
          {/* 冲突标记 */}
          {dep.hasConflict && showConflicts && (
            <g>
              <circle
                cx={(calculateDependencyPoints(dep)?.x1 || 0) + 15}
                cy={(calculateDependencyPoints(dep)?.y1 || 0) - 10}
                r="8"
                fill="#ff4d4f"
              />
              <text
                x={(calculateDependencyPoints(dep)?.x1 || 0) + 15}
                y={(calculateDependencyPoints(dep)?.y1 || 0) - 6}
                textAnchor="middle"
                fill="white"
                fontSize="10"
                fontWeight="bold"
              >
                !
              </text>
            </g>
          )}
          {/* 悬停提示 */}
          {isHovered && (
            <foreignObject
              x={(calculateDependencyPoints(dep)?.x1 || 0) + 20}
              y={(calculateDependencyPoints(dep)?.y1 || 0) - 30}
              width="200"
              height="60"
            >
              <div className={styles.dependencyTooltip}>
                <div><strong>{DependencyTypeShortLabels[dep.dependencyType]}</strong></div>
                <div>{predecessorTask?.name} → {successorTask?.name}</div>
                {dep.lagDays !== undefined && dep.lagDays !== 0 && (
                  <div>延迟: {dep.lagDays}天</div>
                )}
                {dep.hasConflict && (
                  <div style={{ color: '#ff4d4f' }}>⚠ {dep.conflictDescription}</div>
                )}
              </div>
            </foreignObject>
          )}
        </g>
      );
    });
  };

  // 渲染箭头标记定义
  const renderArrowMarkers = () => {
    const types: Array<'FS' | 'SS' | 'FF' | 'SF'> = ['FS', 'SS', 'FF', 'SF'];
    return types.map(type => (
      <marker
        key={`arrowhead-${type}`}
        id={`arrowhead-${type}`}
        markerWidth="10"
        markerHeight="7"
        refX="9"
        refY="3.5"
        orient="auto"
      >
        <polygon points="0 0, 10 3.5, 0 7" fill={DependencyTypeColors[type]} />
      </marker>
    ));
  };

  // 统计冲突数量
  const conflictCount = useMemo(() => {
    return dependencies.filter(d => d.hasConflict).length;
  }, [dependencies]);

  return (
    <div className={styles.ganttContainer}>
      {/* 工具栏 */}
      <div className={styles.toolbar}>
        <Space>
          <Button icon={<ZoomInOutlined />} onClick={handleZoomIn} disabled={viewMode === 'day'}>
            放大
          </Button>
          <Button icon={<ZoomOutOutlined />} onClick={handleZoomOut} disabled={viewMode === 'month'}>
            缩小
          </Button>
          <Button icon={<CalendarOutlined />} onClick={scrollToToday}>
            今天
          </Button>
          <Select
            value={viewMode}
            onChange={setViewMode}
            style={{ width: 100 }}
            options={[
              { value: 'day', label: '日视图' },
              { value: 'week', label: '周视图' },
              { value: 'month', label: '月视图' },
            ]}
          />
          <span className={styles.separator} />
          <Space>
            <LinkOutlined />
            <Switch
              checked={dependencyVisible}
              onChange={setDependencyVisible}
              size="small"
            />
            <span>显示依赖</span>
          </Space>
          {conflictCount > 0 && (
            <Badge count={conflictCount} size="small">
              <Button
                icon={<WarningOutlined />}
                danger
                size="small"
                title={`${conflictCount} 个依赖冲突`}
              >
                冲突
              </Button>
            </Badge>
          )}
        </Space>
        <Space>
          <span className={styles.legend}>
            <span className={styles.legendItem}>
              <span className={styles.legendColor} style={{ backgroundColor: '#52c41a' }} />
              已完成
            </span>
            <span className={styles.legendItem}>
              <span className={styles.legendColor} style={{ backgroundColor: '#1890ff' }} />
              进行中
            </span>
            <span className={styles.legendItem}>
              <span className={styles.legendColor} style={{ backgroundColor: '#d9d9d9' }} />
              待处理
            </span>
            <span className={styles.legendItem}>
              <span className={styles.legendColor} style={{ backgroundColor: '#fa8c16' }} />
              关键路径
            </span>
            <span className={styles.legendItem}>
              <span className={styles.legendColor} style={{ backgroundColor: '#ff4d4f' }} />
              冲突
            </span>
          </span>
        </Space>
      </div>

      {/* 依赖类型图例 */}
      {dependencyVisible && (
        <div className={styles.dependencyLegend}>
          <span className={styles.legendTitle}>依赖类型:</span>
          <span className={styles.legendItem}>
            <span className={styles.legendLine} style={{ borderColor: DependencyTypeColors.FS, borderStyle: 'solid' }} />
            FS (完成-开始)
          </span>
          <span className={styles.legendItem}>
            <span className={styles.legendLine} style={{ borderColor: DependencyTypeColors.SS, borderStyle: 'dashed' }} />
            SS (开始-开始)
          </span>
          <span className={styles.legendItem}>
            <span className={styles.legendLine} style={{ borderColor: DependencyTypeColors.FF, borderStyle: 'dotted' }} />
            FF (完成-完成)
          </span>
          <span className={styles.legendItem}>
            <span className={styles.legendLine} style={{ borderColor: DependencyTypeColors.SF, borderStyle: 'double' }} />
            SF (开始-完成)
          </span>
        </div>
      )}

      <div className={styles.ganttWrapper}>
        {/* 左侧任务列表 */}
        <div className={styles.taskList}>
          <div className={styles.taskListHeader}>
            <div className={styles.taskListHeaderCell}>任务名称</div>
            <div className={styles.taskListHeaderCell}>开始日期</div>
            <div className={styles.taskListHeaderCell}>结束日期</div>
            <div className={styles.taskListHeaderCell}>进度</div>
          </div>
          <div className={styles.taskListBody}>
            {tasks.map(task => (
              <div
                key={task.id}
                className={styles.taskListRow}
                onClick={() => onTaskClick?.(task)}
                onDoubleClick={() => onTaskDoubleClick?.(task)}
              >
                <div className={styles.taskListCell} title={task.name}>
                  {task.isMilestone && <span className={styles.milestoneIcon}>◆</span>}
                  {task.name}
                </div>
                <div className={styles.taskListCell}>
                  {task.startDate ? dayjs(task.startDate).format('MM-DD') : '-'}
                </div>
                <div className={styles.taskListCell}>
                  {task.endDate ? dayjs(task.endDate).format('MM-DD') : '-'}
                </div>
                <div className={styles.taskListCell}>
                  <Progress percent={task.progress} size="small" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 右侧甘特图 */}
        <div 
          className={styles.ganttChart}
          style={{ transform: `translateX(-${scrollLeft}px)` }}
        >
          {/* 月份标题 */}
          <div className={styles.monthHeader}>
            {monthHeaders.map((header, index) => (
              <div
                key={index}
                className={styles.monthHeaderCell}
                style={{ width: `${header.span * cellWidth}px` }}
              >
                {header.month}
              </div>
            ))}
          </div>

          {/* 日期标题 */}
          <div className={styles.dateHeader}>
            {dateColumns.map((col, index) => (
              <div
                key={index}
                className={`${styles.dateHeaderCell} ${col.isWeekend ? styles.weekend : ''} ${col.isToday ? styles.today : ''}`}
                style={{ width: `${cellWidth}px` }}
              >
                {viewMode === 'day' && col.date.format('DD')}
                {viewMode === 'week' && (index % 7 === 0 ? col.date.format('DD') : '')}
                {viewMode === 'month' && (col.date.date() === 1 ? col.date.format('DD') : '')}
              </div>
            ))}
          </div>

          {/* 任务条 */}
          <div className={styles.ganttBody}>
            {/* 网格背景 */}
            <div className={styles.gridBackground}>
              {dateColumns.map((col, index) => (
                <div
                  key={index}
                  className={`${styles.gridCell} ${col.isWeekend ? styles.weekend : ''} ${col.isToday ? styles.todayLine : ''}`}
                  style={{ width: `${cellWidth}px` }}
                />
              ))}
            </div>

            {/* 今日线 */}
            {showToday && (
              <div
                className={styles.todayMarker}
                style={{
                  left: `${dayjs().diff(startDate, 'day') * cellWidth + cellWidth / 2}px`,
                }}
              />
            )}

            {/* 依赖线 SVG */}
            <svg className={styles.dependencyLayer}>
              <defs>
                {renderArrowMarkers()}
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3.5, 0 7" fill="#999" />
                </marker>
                <marker
                  id="arrowhead-conflict"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3.5, 0 7" fill="#ff4d4f" />
                </marker>
              </defs>
              {renderDependencyLines()}
            </svg>

            {/* 任务条 */}
            {tasks.map((task, index) => (
              <div
                key={task.id}
                className={styles.taskRow}
                style={{ top: `${index * 40}px` }}
              >
                {task.startDate && task.endDate && (
                  <Tooltip
                    title={
                      <div>
                        <div><strong>{task.name}</strong></div>
                        <div>开始: {dayjs(task.startDate).format('YYYY-MM-DD')}</div>
                        <div>结束: {dayjs(task.endDate).format('YYYY-MM-DD')}</div>
                        <div>进度: {task.progress}%</div>
                        {task.assigneeName && <div>负责人: {task.assigneeName}</div>}
                        {isOnCriticalPath(task.id) && <div style={{ color: '#fa8c16' }}>⚠ 关键路径</div>}
                        {hasConflict(task.id) && <div style={{ color: '#ff4d4f' }}>⚠ 存在依赖冲突</div>}
                      </div>
                    }
                  >
                    <div
                      className={`${styles.taskBar} ${isOnCriticalPath(task.id) ? styles.criticalPath : ''}`}
                      style={{
                        ...getTaskBarStyle(task),
                        backgroundColor: getTaskColor(task),
                      }}
                      onClick={() => onTaskClick?.(task)}
                      onDoubleClick={() => onTaskDoubleClick?.(task)}
                    >
                      {task.isMilestone ? (
                        <span className={styles.milestoneMarker}>◆</span>
                      ) : (
                        <>
                          {showProgress && (
                            <div
                              className={styles.taskProgress}
                              style={{ width: `${task.progress}%` }}
                            />
                          )}
                          <span className={styles.taskLabel}>{task.name}</span>
                        </>
                      )}
                    </div>
                  </Tooltip>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GanttChart;