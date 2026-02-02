import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProCard, ProTable } from '@ant-design/pro-components';
import {
  Card,
  Col,
  DatePicker,
  Row,
  Select,
  Space,
  Statistic,
  Tag,
} from 'antd';
import dayjs from 'dayjs';
import type { EChartsOption } from 'echarts';
import ReactECharts from 'echarts-for-react';
import React, { useState } from 'react';

const { RangePicker } = DatePicker;

// 使用记录类型
interface UsageRecord {
  id: number;
  date: string;
  tenantName: string;
  modelName: string;
  callCount: number;
  tokenUsed: number;
  cost: number;
  avgResponseTime: number;
  successRate: number;
}

const UsageStats: React.FC = () => {
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, 'days'),
    dayjs(),
  ]);
  const [selectedModel, setSelectedModel] = useState<string>('all');
  const [selectedTenant, setSelectedTenant] = useState<string>('all');

  // 模拟统计数据
  const statsData = {
    totalCalls: 125678,
    totalTokens: 567890123,
    totalCost: 1234.56,
    avgResponseTime: 1250,
    callsGrowth: 23.5,
    tokensGrowth: 18.2,
    costGrowth: -5.3,
    responseTimeGrowth: -12.5,
  };

  // 模拟使用记录
  const mockData: UsageRecord[] = Array.from({ length: 30 }, (_, i) => ({
    id: i + 1,
    date: dayjs()
      .subtract(29 - i, 'days')
      .format('YYYY-MM-DD'),
    tenantName: ['租户A', '租户B', '租户C', '租户D'][
      Math.floor(Math.random() * 4)
    ],
    modelName: ['GPT-4', 'GPT-3.5', 'Claude 3', 'Gemini'][
      Math.floor(Math.random() * 4)
    ],
    callCount: Math.floor(Math.random() * 5000) + 1000,
    tokenUsed: Math.floor(Math.random() * 20000000) + 5000000,
    cost: Math.random() * 100 + 20,
    avgResponseTime: Math.floor(Math.random() * 1000) + 500,
    successRate: Math.random() * 10 + 90,
  }));

  // 调用量趋势图表
  const getCallsTrendOption = (): EChartsOption => {
    const dates = mockData.map((item) => item.date);
    const calls = mockData.map((item) => item.callCount);

    return {
      title: {
        text: 'API调用量趋势',
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: dates,
        boundaryGap: false,
      },
      yAxis: {
        type: 'value',
        name: '调用次数',
      },
      series: [
        {
          name: '调用次数',
          type: 'line',
          smooth: true,
          data: calls,
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
                { offset: 1, color: 'rgba(24, 144, 255, 0.05)' },
              ],
            },
          },
          itemStyle: {
            color: '#1890ff',
          },
          lineStyle: {
            width: 2,
          },
        },
      ],
    };
  };

  // Token使用统计图表
  const getTokenUsageOption = (): EChartsOption => {
    const dates = mockData.map((item) => item.date);
    const tokens = mockData.map((item) => item.tokenUsed);

    return {
      title: {
        text: 'Token使用量统计',
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params: any) => {
          const param = params[0];
          return `${param.name}<br/>${param.seriesName}: ${(param.value / 1000000).toFixed(2)}M`;
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: dates,
      },
      yAxis: {
        type: 'value',
        name: 'Token数量',
        axisLabel: {
          formatter: (value: number) => `${(value / 1000000).toFixed(0)}M`,
        },
      },
      series: [
        {
          name: 'Token使用量',
          type: 'bar',
          data: tokens,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#52c41a' },
                { offset: 1, color: '#52c41a80' },
              ],
            },
          },
        },
      ],
    };
  };

  // 模型使用分布饼图
  const getModelDistributionOption = (): EChartsOption => {
    const modelStats = mockData.reduce(
      (acc, item) => {
        acc[item.modelName] = (acc[item.modelName] || 0) + item.callCount;
        return acc;
      },
      {} as Record<string, number>,
    );

    const data = Object.entries(modelStats).map(([name, value]) => ({
      name,
      value,
    }));

    return {
      title: {
        text: '模型使用分布',
        left: 'center',
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
      },
      legend: {
        orient: 'vertical',
        right: 'right',
      },
      series: [
        {
          name: '调用次数',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: false,
            position: 'center',
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 20,
              fontWeight: 'bold',
            },
          },
          labelLine: {
            show: false,
          },
          data,
        },
      ],
    };
  };

  // 成本统计图表
  const getCostStatsOption = (): EChartsOption => {
    const dates = mockData.map((item) => item.date);
    const costs = mockData.map((item) => item.cost);

    return {
      title: {
        text: '成本统计',
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'line',
        },
        formatter: (params: any) => {
          const param = params[0];
          return `${param.name}<br/>${param.seriesName}: $${param.value.toFixed(2)}`;
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: dates,
      },
      yAxis: {
        type: 'value',
        name: '成本 ($)',
        axisLabel: {
          formatter: (value: number) => `$${value}`,
        },
      },
      series: [
        {
          name: '每日成本',
          type: 'line',
          smooth: true,
          data: costs,
          itemStyle: {
            color: '#fa8c16',
          },
          lineStyle: {
            width: 2,
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(250, 140, 22, 0.3)' },
                { offset: 1, color: 'rgba(250, 140, 22, 0.05)' },
              ],
            },
          },
        },
      ],
    };
  };

  // 租户使用排行
  const getTenantRankingOption = (): EChartsOption => {
    const tenantStats = mockData.reduce(
      (acc, item) => {
        if (!acc[item.tenantName]) {
          acc[item.tenantName] = { calls: 0, tokens: 0, cost: 0 };
        }
        acc[item.tenantName].calls += item.callCount;
        acc[item.tenantName].tokens += item.tokenUsed;
        acc[item.tenantName].cost += item.cost;
        return acc;
      },
      {} as Record<string, { calls: number; tokens: number; cost: number }>,
    );

    const sortedTenants = Object.entries(tenantStats)
      .sort((a, b) => b[1].calls - a[1].calls)
      .slice(0, 10);

    return {
      title: {
        text: '租户使用排行TOP10',
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        name: '调用次数',
      },
      yAxis: {
        type: 'category',
        data: sortedTenants.map(([name]) => name),
      },
      series: [
        {
          name: '调用次数',
          type: 'bar',
          data: sortedTenants.map(([, stats]) => stats.calls),
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                { offset: 0, color: '#1890ff' },
                { offset: 1, color: '#36cfc9' },
              ],
            },
          },
          barWidth: '60%',
        },
      ],
    };
  };

  // 表格列定义
  const columns: ProColumns<UsageRecord>[] = [
    {
      title: '日期',
      dataIndex: 'date',
      width: 120,
      fixed: 'left',
    },
    {
      title: '租户',
      dataIndex: 'tenantName',
      width: 120,
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: '模型',
      dataIndex: 'modelName',
      width: 120,
      render: (text) => <Tag color="green">{text}</Tag>,
    },
    {
      title: '调用次数',
      dataIndex: 'callCount',
      width: 120,
      sorter: true,
      render: (text) => (text as number).toLocaleString(),
    },
    {
      title: 'Token使用',
      dataIndex: 'tokenUsed',
      width: 150,
      sorter: true,
      render: (text) => `${((text as number) / 1000000).toFixed(2)}M`,
    },
    {
      title: '成本',
      dataIndex: 'cost',
      width: 120,
      sorter: true,
      render: (text) => `$${(text as number).toFixed(2)}`,
    },
    {
      title: '平均响应时间',
      dataIndex: 'avgResponseTime',
      width: 140,
      sorter: true,
      render: (text) => `${text}ms`,
    },
    {
      title: '成功率',
      dataIndex: 'successRate',
      width: 120,
      sorter: true,
      render: (text) => (
        <span style={{ color: (text as number) >= 95 ? '#52c41a' : '#faad14' }}>
          {(text as number).toFixed(2)}%
        </span>
      ),
    },
  ];

  return (
    <PageContainer>
      {/* 筛选器 */}
      <Card style={{ marginBottom: 16 }}>
        <Space size="large">
          <Space>
            <span>时间范围：</span>
            <RangePicker
              value={dateRange}
              onChange={(dates) =>
                dates && setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])
              }
              presets={[
                {
                  label: '最近7天',
                  value: [dayjs().subtract(7, 'days'), dayjs()],
                },
                {
                  label: '最近30天',
                  value: [dayjs().subtract(30, 'days'), dayjs()],
                },
                {
                  label: '最近90天',
                  value: [dayjs().subtract(90, 'days'), dayjs()],
                },
              ]}
            />
          </Space>
          <Space>
            <span>模型：</span>
            <Select
              style={{ width: 150 }}
              value={selectedModel}
              onChange={setSelectedModel}
              options={[
                { label: '全部模型', value: 'all' },
                { label: 'GPT-4', value: 'gpt-4' },
                { label: 'GPT-3.5', value: 'gpt-3.5' },
                { label: 'Claude 3', value: 'claude-3' },
                { label: 'Gemini', value: 'gemini' },
              ]}
            />
          </Space>
          <Space>
            <span>租户：</span>
            <Select
              style={{ width: 150 }}
              value={selectedTenant}
              onChange={setSelectedTenant}
              options={[
                { label: '全部租户', value: 'all' },
                { label: '租户A', value: 'tenant-a' },
                { label: '租户B', value: 'tenant-b' },
                { label: '租户C', value: 'tenant-c' },
              ]}
            />
          </Space>
        </Space>
      </Card>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总调用次数"
              value={statsData.totalCalls}
              suffix="次"
              prefix={
                statsData.callsGrowth > 0 ? (
                  <ArrowUpOutlined />
                ) : (
                  <ArrowDownOutlined />
                )
              }
              valueStyle={{
                color: statsData.callsGrowth > 0 ? '#3f8600' : '#cf1322',
              }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
              较上期 {Math.abs(statsData.callsGrowth)}%
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总Token消耗"
              value={statsData.totalTokens}
              suffix="个"
              formatter={(value) =>
                `${((value as number) / 1000000).toFixed(2)}M`
              }
              prefix={
                statsData.tokensGrowth > 0 ? (
                  <ArrowUpOutlined />
                ) : (
                  <ArrowDownOutlined />
                )
              }
              valueStyle={{
                color: statsData.tokensGrowth > 0 ? '#3f8600' : '#cf1322',
              }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
              较上期 {Math.abs(statsData.tokensGrowth)}%
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总成本"
              value={statsData.totalCost}
              prefix="$"
              precision={2}
              valueStyle={{
                color: statsData.costGrowth < 0 ? '#3f8600' : '#cf1322',
              }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
              较上期 {statsData.costGrowth > 0 ? '+' : ''}
              {statsData.costGrowth}%
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="平均响应时间"
              value={statsData.avgResponseTime}
              suffix="ms"
              prefix={
                statsData.responseTimeGrowth < 0 ? (
                  <ArrowDownOutlined />
                ) : (
                  <ArrowUpOutlined />
                )
              }
              valueStyle={{
                color: statsData.responseTimeGrowth < 0 ? '#3f8600' : '#cf1322',
              }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
              较上期 {Math.abs(statsData.responseTimeGrowth)}%
            </div>
          </Card>
        </Col>
      </Row>

      {/* 图表 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={12}>
          <Card>
            <ReactECharts
              option={getCallsTrendOption()}
              style={{ height: 350 }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card>
            <ReactECharts
              option={getTokenUsageOption()}
              style={{ height: 350 }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={12}>
          <Card>
            <ReactECharts
              option={getModelDistributionOption()}
              style={{ height: 350 }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card>
            <ReactECharts
              option={getCostStatsOption()}
              style={{ height: 350 }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={24}>
          <Card>
            <ReactECharts
              option={getTenantRankingOption()}
              style={{ height: 400 }}
            />
          </Card>
        </Col>
      </Row>

      {/* 详细数据表格 */}
      <ProCard title="使用详情" headerBordered>
        <ProTable<UsageRecord>
          columns={columns}
          dataSource={mockData}
          rowKey="id"
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
          }}
          search={false}
          scroll={{ x: 1200 }}
          options={{
            reload: true,
            density: true,
            setting: true,
          }}
        />
      </ProCard>
    </PageContainer>
  );
};

export default UsageStats;
