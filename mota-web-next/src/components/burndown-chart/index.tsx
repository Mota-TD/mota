'use client';

/**
 * 燃尽图组件
 * Sprint级别燃尽图展示
 */

import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Spin,
  Empty,
  Tag,
  Space,
  Statistic,
  Row,
  Col
} from 'antd';
import { projectService } from '@/services';
import {
  LineChartOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import dynamic from 'next/dynamic';
import type { EChartsOption } from 'echarts';

// 动态导入 ECharts 以避免 SSR 问题
const ReactECharts = dynamic(
  () => import('echarts-for-react').then(mod => mod.default),
  { ssr: false }
) as React.ComponentType<{ option: EChartsOption; style?: React.CSSProperties; notMerge?: boolean }>;

// 统一主题色
const THEME_COLOR = '#10B981';

interface BurndownDataPoint {
  date: string;
  value: number;
  completed: number;
}

interface BurndownChartData {
  projectId: number;
  projectName: string;
  sprintName: string;
  startDate: string;
  endDate: string;
  totalPoints: number;
  remainingPoints: number;
  completionPercentage: number;
  idealLine: BurndownDataPoint[];
  actualLine: BurndownDataPoint[];
  predictedLine: BurndownDataPoint[];
  onTrack: boolean;
  deviationDays: number;
}

interface BurndownChartProps {
  // API 模式 - 通过 projectId 加载数据
  projectId?: string | number;
  sprintId?: number;
  onSprintChange?: (sprintId: number) => void;
  // 直接数据模式 - 直接传入数据
  title?: string;
  startDate?: string;
  endDate?: string;
  totalPoints?: number;
  completedByDate?: { date: string; completed: number }[];
  height?: number;
  showLegend?: boolean;
  unit?: string;
}

const BurndownChart: React.FC<BurndownChartProps> = ({
  projectId,
  sprintId,
  title,
  startDate: propStartDate,
  endDate: propEndDate,
  totalPoints: propTotalPoints,
  completedByDate,
  height = 400,
  showLegend = true,
  unit = '任务'
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BurndownChartData | null>(null);

  useEffect(() => {
    // 如果提供了 projectId，从 API 加载数据
    if (projectId) {
      loadData();
    } else if (completedByDate && propStartDate && propEndDate && propTotalPoints !== undefined) {
      // 如果直接提供了数据，构建本地数据
      buildLocalData();
    }
  }, [projectId, sprintId, completedByDate, propStartDate, propEndDate, propTotalPoints]);

  const loadData = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      // 调用真实 API 获取燃尽图数据
      const burndownData = await projectService.getBurndownChart(String(projectId), sprintId);
      
      // 转换 API 返回的数据格式
      const idealLine: BurndownDataPoint[] = burndownData.idealLine?.map((item: { date: string; value: number; completed?: number }) => ({
        date: item.date,
        value: item.value,
        completed: item.completed || 0
      })) || [];
      
      const actualLine: BurndownDataPoint[] = burndownData.actualLine?.map((item: { date: string; value: number; completed?: number }) => ({
        date: item.date,
        value: item.value,
        completed: item.completed || 0
      })) || [];
      
      const predictedLine: BurndownDataPoint[] = burndownData.predictedLine?.map((item: { date: string; value: number; completed?: number }) => ({
        date: item.date,
        value: item.value,
        completed: item.completed || 0
      })) || [];

      setData({
        projectId: Number(projectId),
        projectName: burndownData.projectName || title || '项目燃尽图',
        sprintName: burndownData.sprintName || title || 'Sprint 1',
        startDate: burndownData.startDate,
        endDate: burndownData.endDate,
        totalPoints: burndownData.totalPoints,
        remainingPoints: burndownData.remainingPoints,
        completionPercentage: burndownData.completionPercentage,
        idealLine,
        actualLine,
        predictedLine,
        onTrack: burndownData.onTrack,
        deviationDays: burndownData.deviationDays
      });
    } catch (error) {
      console.error('Load burndown chart error:', error);
      // API 失败时显示空状态，不使用模拟数据
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const buildLocalData = () => {
    if (!completedByDate || !propStartDate || !propEndDate || propTotalPoints === undefined) return;
    
    // 计算累计完成数
    let cumulative = 0;
    const actualLine = completedByDate.map(item => {
      cumulative += item.completed;
      return {
        date: item.date,
        value: propTotalPoints - cumulative,
        completed: item.completed
      };
    });

    // 计算理想燃尽线
    const start = new Date(propStartDate);
    const end = new Date(propEndDate);
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const dailyBurn = propTotalPoints / totalDays;
    
    const idealLine: BurndownDataPoint[] = [];
    for (let i = 0; i <= totalDays; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      idealLine.push({
        date: date.toISOString().split('T')[0],
        value: Math.max(0, propTotalPoints - dailyBurn * i),
        completed: Math.round(dailyBurn)
      });
    }

    const remaining = propTotalPoints - cumulative;
    const completionPercentage = propTotalPoints > 0 ? ((propTotalPoints - remaining) / propTotalPoints) * 100 : 0;

    setData({
      projectId: 0,
      projectName: title || '燃尽图',
      sprintName: title || '燃尽图',
      startDate: propStartDate,
      endDate: propEndDate,
      totalPoints: propTotalPoints,
      remainingPoints: remaining,
      completionPercentage,
      idealLine,
      actualLine,
      predictedLine: [],
      onTrack: remaining <= (propTotalPoints - cumulative),
      deviationDays: 0
    });
  };

  // 格式化日期显示
  const formatDate = (date: string) => {
    const d = new Date(date);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  // 生成ECharts配置
  const chartOption = useMemo(() => {
    if (!data) return {};

    // 收集所有日期
    const dateSet = new Set<string>();
    data.idealLine?.forEach(p => dateSet.add(p.date));
    data.actualLine?.forEach(p => dateSet.add(p.date));
    data.predictedLine?.forEach(p => dateSet.add(p.date));
    
    const dates = Array.from(dateSet).sort((a, b) => 
      new Date(a).getTime() - new Date(b).getTime()
    );

    // 构建数据映射
    const idealMap = new Map(data.idealLine?.map(p => [p.date, p.value]) || []);
    const actualMap = new Map(data.actualLine?.map(p => [p.date, p.value]) || []);
    const predictedMap = new Map(data.predictedLine?.map(p => [p.date, p.value]) || []);

    return {
      tooltip: {
        trigger: 'axis' as const,
        axisPointer: {
          type: 'cross' as const
        }
      },
      legend: {
        data: ['理想燃尽线', '实际燃尽线', '预测燃尽线'],
        bottom: 0,
        show: showLegend
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: showLegend ? '15%' : '10%',
        top: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category' as const,
        boundaryGap: false,
        data: dates.map(formatDate),
        axisLabel: {
          fontSize: 12
        }
      },
      yAxis: {
        type: 'value' as const,
        name: `剩余${unit}数`,
        nameLocation: 'middle' as const,
        nameGap: 40,
        min: 0
      },
      series: [
        {
          name: '理想燃尽线',
          type: 'line' as const,
          data: dates.map(d => idealMap.get(d) ?? null),
          lineStyle: {
            color: '#1677ff',
            width: 2,
            type: 'dashed' as const
          },
          itemStyle: {
            color: '#1677ff'
          },
          symbol: 'none' as const
        },
        {
          name: '实际燃尽线',
          type: 'line' as const,
          data: dates.map(d => actualMap.get(d) ?? null),
          lineStyle: {
            color: THEME_COLOR,
            width: 3
          },
          itemStyle: {
            color: THEME_COLOR
          },
          symbol: 'circle' as const,
          symbolSize: 6
        },
        {
          name: '预测燃尽线',
          type: 'line' as const,
          data: dates.map(d => predictedMap.get(d) ?? null),
          lineStyle: {
            color: '#faad14',
            width: 2,
            type: 'dashed' as const
          },
          itemStyle: {
            color: '#faad14'
          },
          symbol: 'none' as const
        }
      ]
    };
  }, [data, showLegend, unit]);

  if (loading) {
    return (
      <Card style={{ borderRadius: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card style={{ borderRadius: 12 }}>
        <Empty description="暂无数据" />
      </Card>
    );
  }

  return (
    <Card
      style={{ borderRadius: 12 }}
      title={
        <Space>
          <LineChartOutlined style={{ color: THEME_COLOR }} />
          <span>燃尽图</span>
          {data.sprintName && <Tag color="blue">{data.sprintName}</Tag>}
        </Space>
      }
      extra={
        <Space>
          {data.onTrack ? (
            <Tag icon={<CheckCircleOutlined />} color="success">按计划进行</Tag>
          ) : (
            <Tag icon={<WarningOutlined />} color="warning">
              {data.deviationDays > 0 ? `落后${data.deviationDays}天` : `提前${Math.abs(data.deviationDays)}天`}
            </Tag>
          )}
        </Space>
      }
    >
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Statistic
            title={`总${unit}数`}
            value={data.totalPoints}
            prefix={<TrophyOutlined style={{ color: THEME_COLOR }} />}
            suffix="个"
          />
        </Col>
        <Col span={6}>
          <Statistic
            title={`剩余${unit}`}
            value={data.remainingPoints}
            prefix={<ClockCircleOutlined />}
            suffix="个"
            valueStyle={{ color: data.remainingPoints > 0 ? '#faad14' : '#52c41a' }}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="完成进度"
            value={data.completionPercentage?.toFixed(1)}
            suffix="%"
            valueStyle={{ color: THEME_COLOR }}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="偏差天数"
            value={Math.abs(data.deviationDays)}
            prefix={data.deviationDays > 0 ? '落后' : data.deviationDays < 0 ? '提前' : ''}
            suffix="天"
            valueStyle={{ 
              color: data.deviationDays > 0 ? '#ff4d4f' : 
                     data.deviationDays < 0 ? '#52c41a' : '#1677ff' 
            }}
          />
        </Col>
      </Row>

      {/* 图表 */}
      <div style={{ height }}>
        <ReactECharts
          option={chartOption}
          style={{ height: '100%' }}
          notMerge={true}
        />
      </div>

      {/* 图例说明 */}
      <div style={{ marginTop: 16, padding: '12px 16px', background: '#fafafa', borderRadius: 8 }}>
        <Space size="large" wrap>
          <span>
            <span style={{ 
              display: 'inline-block', 
              width: 12, 
              height: 12, 
              borderRadius: '50%', 
              backgroundColor: '#1677ff',
              marginRight: 8 
            }} /> 
            理想燃尽线：按计划每日应完成的工作量
          </span>
          <span>
            <span style={{ 
              display: 'inline-block', 
              width: 12, 
              height: 12, 
              borderRadius: '50%', 
              backgroundColor: THEME_COLOR,
              marginRight: 8 
            }} /> 
            实际燃尽线：实际每日剩余工作量
          </span>
          <span>
            <span style={{ 
              display: 'inline-block', 
              width: 12, 
              height: 12, 
              borderRadius: '50%', 
              backgroundColor: '#faad14',
              marginRight: 8 
            }} /> 
            预测燃尽线：基于当前速度的预测
          </span>
        </Space>
      </div>

      {/* 时间范围 */}
      <div style={{ marginTop: 12, textAlign: 'center', color: '#666' }}>
        <Space>
          <span>开始日期: {data.startDate}</span>
          <span>|</span>
          <span>结束日期: {data.endDate}</span>
        </Space>
      </div>
    </Card>
  );
};

export default BurndownChart;