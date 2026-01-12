'use client';

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
import 'dayjs/locale/zh-cn';

dayjs.locale('zh-cn');

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
  dependencies?: (string | number)[];
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
  criticalPath?: (string | number)[];
  conflictTaskIds?: (string | number)[];
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
  in_progress: '#10B981',
  completed: '#52c41a',
  cancelled: '#ff4d4f',
};

// 依赖类型颜色
const DependencyTypeColors: Record<string, string> = {
  FS: '#1890ff',
  SS: '#52c41a',
  FF: '#722ed1',
  SF: '#fa8c16',
};

// 依赖类型标签
const DependencyTypeShortLabels: Record<string, string> = {
  FS: '完成-开始',
  SS: '开始-开始',
  FF: '完成-完成',
  SF: '开始-完成',
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

    minDate = minDate.subtract(7, 'day');
    maxDate = maxDate.add(14, 'day');

    return {
      startDate: minDate,
      endDate: maxDate,
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
    return statusColors[task.status] || '#10B981';
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

  // 统计冲突数量
  const conflictCount = useMemo(() => {
    return dependencies.filter(d => d.hasConflict).length;
  }, [dependencies]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', borderRadius: 8 }}>
      {/* 工具栏 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '12px 16px',
        borderBottom: '1px solid #f0f0f0'
      }}>
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
          <span style={{ width: 1, height: 20, background: '#e8e8e8', margin: '0 8px' }} />
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
          <span style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: '#666' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: '#52c41a' }} />
              已完成
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: '#10B981' }} />
              进行中
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: '#d9d9d9' }} />
              待处理
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: '#fa8c16' }} />
              关键路径
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: '#ff4d4f' }} />
              冲突
            </span>
          </span>
        </Space>
      </div>

      {/* 依赖类型图例 */}
      {dependencyVisible && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 16, 
          padding: '8px 16px',
          borderBottom: '1px solid #f0f0f0',
          fontSize: 12,
          color: '#666'
        }}>
          <span style={{ fontWeight: 500 }}>依赖类型:</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 20, height: 2, backgroundColor: DependencyTypeColors.FS }} />
            FS (完成-开始)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 20, height: 2, backgroundColor: DependencyTypeColors.SS, borderStyle: 'dashed', borderWidth: 1, borderColor: DependencyTypeColors.SS }} />
            SS (开始-开始)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 20, height: 2, backgroundColor: DependencyTypeColors.FF, borderStyle: 'dotted', borderWidth: 1, borderColor: DependencyTypeColors.FF }} />
            FF (完成-完成)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 20, height: 2, backgroundColor: DependencyTypeColors.SF }} />
            SF (开始-完成)
          </span>
        </div>
      )}

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* 左侧任务列表 */}
        <div style={{ width: 400, borderRight: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 80px 80px 80px',
            padding: '8px 12px',
            background: '#fafafa',
            borderBottom: '1px solid #f0f0f0',
            fontWeight: 500,
            fontSize: 13
          }}>
            <div>任务名称</div>
            <div>开始日期</div>
            <div>结束日期</div>
            <div>进度</div>
          </div>
          <div style={{ flex: 1, overflow: 'auto' }}>
            {tasks.map(task => (
              <div
                key={task.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 80px 80px 80px',
                  padding: '8px 12px',
                  borderBottom: '1px solid #f5f5f5',
                  cursor: 'pointer',
                  fontSize: 13,
                  height: 40,
                  alignItems: 'center'
                }}
                onClick={() => onTaskClick?.(task)}
                onDoubleClick={() => onTaskDoubleClick?.(task)}
              >
                <div style={{ 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}>
                  {task.isMilestone && <span style={{ color: '#fa8c16' }}>◆</span>}
                  {task.name}
                </div>
                <div style={{ color: '#666' }}>
                  {task.startDate ? dayjs(task.startDate).format('MM-DD') : '-'}
                </div>
                <div style={{ color: '#666' }}>
                  {task.endDate ? dayjs(task.endDate).format('MM-DD') : '-'}
                </div>
                <div>
                  <Progress percent={task.progress} size="small" strokeColor="#10B981" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 右侧甘特图 */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          <div style={{ transform: `translateX(-${scrollLeft}px)`, minWidth: dateColumns.length * cellWidth }}>
            {/* 月份标题 */}
            <div style={{ display: 'flex', background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
              {monthHeaders.map((header, index) => (
                <div
                  key={index}
                  style={{ 
                    width: header.span * cellWidth,
                    padding: '4px 8px',
                    textAlign: 'center',
                    fontWeight: 500,
                    fontSize: 12,
                    borderRight: '1px solid #f0f0f0'
                  }}
                >
                  {header.month}
                </div>
              ))}
            </div>

            {/* 日期标题 */}
            <div style={{ display: 'flex', borderBottom: '1px solid #f0f0f0' }}>
              {dateColumns.map((col, index) => (
                <div
                  key={index}
                  style={{
                    width: cellWidth,
                    padding: '4px 0',
                    textAlign: 'center',
                    fontSize: 10,
                    background: col.isToday ? '#e6f7ff' : col.isWeekend ? '#fafafa' : '#fff',
                    color: col.isToday ? '#1890ff' : col.isWeekend ? '#999' : '#666'
                  }}
                >
                  {viewMode === 'day' && col.date.format('DD')}
                  {viewMode === 'week' && (index % 7 === 0 ? col.date.format('DD') : '')}
                  {viewMode === 'month' && (col.date.date() === 1 ? col.date.format('DD') : '')}
                </div>
              ))}
            </div>

            {/* 任务条 */}
            <div style={{ position: 'relative' }}>
              {/* 网格背景 */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex' }}>
                {dateColumns.map((col, index) => (
                  <div
                    key={index}
                    style={{
                      width: cellWidth,
                      height: tasks.length * 40,
                      borderRight: '1px solid #f5f5f5',
                      background: col.isToday ? 'rgba(16, 185, 129, 0.05)' : col.isWeekend ? '#fafafa' : 'transparent'
                    }}
                  />
                ))}
              </div>

              {/* 今日线 */}
              {showToday && (
                <div
                  style={{
                    position: 'absolute',
                    left: dayjs().diff(startDate, 'day') * cellWidth + cellWidth / 2,
                    top: 0,
                    bottom: 0,
                    width: 2,
                    background: '#10B981',
                    zIndex: 10
                  }}
                />
              )}

              {/* 任务条 */}
              {tasks.map((task, index) => (
                <div
                  key={task.id}
                  style={{
                    position: 'relative',
                    height: 40,
                    display: 'flex',
                    alignItems: 'center'
                  }}
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
                        style={{
                          position: 'absolute',
                          ...getTaskBarStyle(task),
                          height: 24,
                          backgroundColor: getTaskColor(task),
                          borderRadius: 4,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '0 8px',
                          overflow: 'hidden',
                          boxShadow: isOnCriticalPath(task.id) ? '0 0 0 2px #fa8c16' : undefined
                        }}
                        onClick={() => onTaskClick?.(task)}
                        onDoubleClick={() => onTaskDoubleClick?.(task)}
                      >
                        {task.isMilestone ? (
                          <span style={{ color: '#fff', fontSize: 16 }}>◆</span>
                        ) : (
                          <>
                            {showProgress && (
                              <div
                                style={{
                                  position: 'absolute',
                                  left: 0,
                                  top: 0,
                                  bottom: 0,
                                  width: `${task.progress}%`,
                                  background: 'rgba(255,255,255,0.3)',
                                  borderRadius: 4
                                }}
                              />
                            )}
                            <span style={{ 
                              color: '#fff', 
                              fontSize: 11, 
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              position: 'relative',
                              zIndex: 1
                            }}>
                              {task.name}
                            </span>
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
    </div>
  );
};

export default GanttChart;