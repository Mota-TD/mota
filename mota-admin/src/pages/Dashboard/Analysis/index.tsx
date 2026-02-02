import { PageContainer } from '@ant-design/pro-components';
import {
  Card,
  Col,
  DatePicker,
  Row,
  Select,
  Space,
  Statistic,
  Table,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { EChartsOption } from 'echarts';
import ReactECharts from 'echarts-for-react';
import React, { useState } from 'react';

const { RangePicker } = DatePicker;
const { Option } = Select;

/**
 * 数据分析页面
 * 提供深度数据分析和多维度报表
 */
const DashboardAnalysis: React.FC = () => {
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, 'day'),
    dayjs(),
  ]);
  const [dimension, setDimension] = useState<string>('daily');

  // 用户行为漏斗图
  const funnelOption: EChartsOption = {
    title: {
      text: '用户转化漏斗',
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal',
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c}人 ({d}%)',
    },
    series: [
      {
        name: '转化漏斗',
        type: 'funnel',
        left: '10%',
        top: 60,
        bottom: 60,
        width: '80%',
        min: 0,
        max: 100,
        minSize: '0%',
        maxSize: '100%',
        sort: 'descending',
        gap: 2,
        label: {
          show: true,
          position: 'inside',
        },
        labelLine: {
          length: 10,
          lineStyle: {
            width: 1,
            type: 'solid',
          },
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 1,
        },
        emphasis: {
          label: {
            fontSize: 20,
          },
        },
        data: [
          { value: 10000, name: '访问', itemStyle: { color: '#5470c6' } },
          { value: 8000, name: '注册', itemStyle: { color: '#91cc75' } },
          { value: 5000, name: '登录', itemStyle: { color: '#fac858' } },
          { value: 3000, name: '使用功能', itemStyle: { color: '#ee6666' } },
          { value: 1500, name: '付费', itemStyle: { color: '#73c0de' } },
        ],
      },
    ],
  };

  // 用户留存率分析
  const retentionOption: EChartsOption = {
    title: {
      text: '用户留存率分析',
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal',
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
    },
    legend: {
      data: ['次日留存', '7日留存', '30日留存'],
      bottom: 10,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['第1周', '第2周', '第3周', '第4周', '第5周', '第6周'],
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value}%',
      },
    },
    series: [
      {
        name: '次日留存',
        type: 'line',
        smooth: true,
        data: [85, 83, 84, 86, 85, 87],
        itemStyle: { color: '#1890ff' },
      },
      {
        name: '7日留存',
        type: 'line',
        smooth: true,
        data: [68, 65, 67, 70, 68, 72],
        itemStyle: { color: '#52c41a' },
      },
      {
        name: '30日留存',
        type: 'line',
        smooth: true,
        data: [45, 42, 44, 48, 46, 50],
        itemStyle: { color: '#faad14' },
      },
    ],
  };

  // 用户活跃度热力图
  const heatmapOption: EChartsOption = {
    title: {
      text: '用户活跃度热力图',
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal',
      },
    },
    tooltip: {
      position: 'top',
      formatter: (params: any) => {
        return `${params.name}: ${params.value[2]}人`;
      },
    },
    grid: {
      height: '50%',
      top: '15%',
    },
    xAxis: {
      type: 'category',
      data: [
        '0时',
        '2时',
        '4时',
        '6时',
        '8时',
        '10时',
        '12时',
        '14时',
        '16时',
        '18时',
        '20时',
        '22时',
      ],
      splitArea: {
        show: true,
      },
    },
    yAxis: {
      type: 'category',
      data: ['周日', '周六', '周五', '周四', '周三', '周二', '周一'],
      splitArea: {
        show: true,
      },
    },
    visualMap: {
      min: 0,
      max: 1000,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '5%',
      inRange: {
        color: ['#e0f3f8', '#abd9e9', '#74add1', '#4575b4', '#313695'],
      },
    },
    series: [
      {
        name: '活跃用户',
        type: 'heatmap',
        data: [
          [0, 0, 150],
          [1, 0, 180],
          [2, 0, 200],
          [3, 0, 220],
          [4, 0, 300],
          [5, 0, 350],
          [6, 0, 400],
          [7, 0, 450],
          [8, 0, 500],
          [9, 0, 550],
          [10, 0, 600],
          [11, 0, 650],
          [0, 1, 200],
          [1, 1, 250],
          [2, 1, 280],
          [3, 1, 300],
          [4, 1, 400],
          [5, 1, 450],
          [6, 1, 500],
          [7, 1, 550],
          [8, 1, 600],
          [9, 1, 650],
          [10, 1, 700],
          [11, 1, 750],
          [0, 2, 180],
          [1, 2, 220],
          [2, 2, 250],
          [3, 2, 280],
          [4, 2, 380],
          [5, 2, 420],
          [6, 2, 480],
          [7, 2, 520],
          [8, 2, 580],
          [9, 2, 620],
          [10, 2, 680],
          [11, 2, 720],
          [0, 3, 200],
          [1, 3, 240],
          [2, 3, 270],
          [3, 3, 300],
          [4, 3, 400],
          [5, 3, 450],
          [6, 3, 500],
          [7, 3, 550],
          [8, 3, 600],
          [9, 3, 650],
          [10, 3, 700],
          [11, 3, 750],
          [0, 4, 220],
          [1, 4, 260],
          [2, 4, 290],
          [3, 4, 320],
          [4, 4, 420],
          [5, 4, 470],
          [6, 4, 520],
          [7, 4, 570],
          [8, 4, 620],
          [9, 4, 670],
          [10, 4, 720],
          [11, 4, 770],
          [0, 5, 240],
          [1, 5, 280],
          [2, 5, 310],
          [3, 5, 340],
          [4, 5, 440],
          [5, 5, 490],
          [6, 5, 540],
          [7, 5, 590],
          [8, 5, 640],
          [9, 5, 690],
          [10, 5, 740],
          [11, 5, 790],
          [0, 6, 160],
          [1, 6, 190],
          [2, 6, 210],
          [3, 6, 230],
          [4, 6, 320],
          [5, 6, 360],
          [6, 6, 410],
          [7, 6, 460],
          [8, 6, 510],
          [9, 6, 560],
          [10, 6, 610],
          [11, 6, 660],
        ],
        label: {
          show: false,
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  };

  // 功能使用排行
  const featureRankOption: EChartsOption = {
    title: {
      text: '功能使用排行TOP10',
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal',
      },
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
      boundaryGap: [0, 0.01],
    },
    yAxis: {
      type: 'category',
      data: [
        'AI对话',
        '文档管理',
        '任务管理',
        '项目协作',
        '知识图谱',
        '数据分析',
        '日程管理',
        '团队沟通',
        '文件共享',
        '报表生成',
      ].reverse(),
    },
    series: [
      {
        name: '使用次数',
        type: 'bar',
        data: [
          98765, 87654, 76543, 65432, 54321, 43210, 32109, 21098, 10987, 9876,
        ],
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              { offset: 0, color: '#1890ff' },
              { offset: 1, color: '#096dd9' },
            ],
          },
        },
      },
    ],
  };

  // 地域分布数据表格
  interface RegionData {
    key: string;
    region: string;
    users: number;
    activeUsers: number;
    revenue: number;
    growth: string;
  }

  const regionData: RegionData[] = [
    {
      key: '1',
      region: '北京',
      users: 12345,
      activeUsers: 8901,
      revenue: 567890,
      growth: '+15.2%',
    },
    {
      key: '2',
      region: '上海',
      users: 10234,
      activeUsers: 7654,
      revenue: 456789,
      growth: '+12.8%',
    },
    {
      key: '3',
      region: '广东',
      users: 9876,
      activeUsers: 7123,
      revenue: 398765,
      growth: '+18.5%',
    },
    {
      key: '4',
      region: '浙江',
      users: 8765,
      activeUsers: 6543,
      revenue: 345678,
      growth: '+14.3%',
    },
    {
      key: '5',
      region: '江苏',
      users: 7654,
      activeUsers: 5678,
      revenue: 298765,
      growth: '+11.7%',
    },
  ];

  const regionColumns: ColumnsType<RegionData> = [
    {
      title: '地区',
      dataIndex: 'region',
      key: 'region',
    },
    {
      title: '总用户数',
      dataIndex: 'users',
      key: 'users',
      render: (val: number) => val.toLocaleString(),
      sorter: (a, b) => a.users - b.users,
    },
    {
      title: '活跃用户',
      dataIndex: 'activeUsers',
      key: 'activeUsers',
      render: (val: number) => val.toLocaleString(),
      sorter: (a, b) => a.activeUsers - b.activeUsers,
    },
    {
      title: '收入（元）',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (val: number) => `¥${val.toLocaleString()}`,
      sorter: (a, b) => a.revenue - b.revenue,
    },
    {
      title: '增长率',
      dataIndex: 'growth',
      key: 'growth',
      render: (val: string) => (
        <span style={{ color: '#52c41a', fontWeight: 'bold' }}>{val}</span>
      ),
    },
  ];

  return (
    <PageContainer
      title="数据分析"
      subTitle="深度数据分析和多维度报表"
      extra={
        <Space>
          <RangePicker
            value={dateRange}
            onChange={(dates) =>
              dates && setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])
            }
          />
          <Select
            value={dimension}
            onChange={setDimension}
            style={{ width: 120 }}
          >
            <Option value="daily">按天</Option>
            <Option value="weekly">按周</Option>
            <Option value="monthly">按月</Option>
          </Select>
        </Space>
      }
    >
      {/* 核心指标 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="转化率"
              value={15.8}
              precision={1}
              suffix="%"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="平均客单价"
              value={1288}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="用户生命周期价值"
              value={5678}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="获客成本"
              value={156}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 转化漏斗和留存分析 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card bordered={false}>
            <ReactECharts
              option={funnelOption}
              style={{ height: 400 }}
              notMerge={true}
              lazyUpdate={true}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card bordered={false}>
            <ReactECharts
              option={retentionOption}
              style={{ height: 400 }}
              notMerge={true}
              lazyUpdate={true}
            />
          </Card>
        </Col>
      </Row>

      {/* 热力图 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card bordered={false}>
            <ReactECharts
              option={heatmapOption}
              style={{ height: 400 }}
              notMerge={true}
              lazyUpdate={true}
            />
          </Card>
        </Col>
      </Row>

      {/* 功能排行和地域分布 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card bordered={false}>
            <ReactECharts
              option={featureRankOption}
              style={{ height: 400 }}
              notMerge={true}
              lazyUpdate={true}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="地域分布" bordered={false}>
            <Table
              columns={regionColumns}
              dataSource={regionData}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default DashboardAnalysis;
