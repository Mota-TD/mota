import { PageContainer } from '@ant-design/pro-components';
import { Card, Col, DatePicker, Row, Space, Statistic, Table } from 'antd';
import dayjs from 'dayjs';
import type { EChartsOption } from 'echarts';
import ReactECharts from 'echarts-for-react';
import React, { useState } from 'react';

const { RangePicker } = DatePicker;

const BehaviorAnalysis: React.FC = () => {
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(7, 'days'),
    dayjs(),
  ]);

  const getFeatureUsageOption = (): EChartsOption => ({
    title: { text: '功能使用排行TOP10', left: 'center' },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: { type: 'value' },
    yAxis: {
      type: 'category',
      data: [
        'AI对话',
        '文档生成',
        '数据分析',
        '模板管理',
        '用户管理',
        '租户管理',
        '报表导出',
        '内容审核',
        '系统配置',
        '日志查看',
      ],
    },
    series: [
      {
        name: '使用次数',
        type: 'bar',
        data: [8900, 7200, 6500, 5800, 4900, 4200, 3600, 2800, 2100, 1500],
        itemStyle: {
          color: (params) => {
            const colors = [
              '#5470c6',
              '#91cc75',
              '#fac858',
              '#ee6666',
              '#73c0de',
              '#3ba272',
              '#fc8452',
              '#9a60b4',
              '#ea7ccc',
              '#5470c6',
            ];
            return colors[params.dataIndex];
          },
        },
      },
    ],
  });

  const getPathAnalysisOption = (): EChartsOption => ({
    title: { text: '用户路径分析（桑基图）', left: 'center' },
    tooltip: { trigger: 'item', triggerOn: 'mousemove' },
    series: [
      {
        type: 'sankey',
        emphasis: { focus: 'adjacency' },
        data: [
          { name: '首页' },
          { name: 'AI对话' },
          { name: '文档生成' },
          { name: '模板管理' },
          { name: '用户管理' },
          { name: '退出' },
        ],
        links: [
          { source: '首页', target: 'AI对话', value: 3500 },
          { source: '首页', target: '文档生成', value: 2800 },
          { source: '首页', target: '模板管理', value: 1500 },
          { source: 'AI对话', target: '文档生成', value: 2000 },
          { source: 'AI对话', target: '退出', value: 1000 },
          { source: '文档生成', target: '模板管理', value: 1200 },
          { source: '文档生成', target: '退出', value: 800 },
          { source: '模板管理', target: '退出', value: 600 },
        ],
      },
    ],
  });

  const getConversionOption = (): EChartsOption => ({
    title: { text: '转化漏斗分析', left: 'center' },
    tooltip: { trigger: 'item', formatter: '{b}: {c}' },
    series: [
      {
        name: '转化漏斗',
        type: 'funnel',
        left: '10%',
        width: '80%',
        data: [
          { value: 10000, name: '访问' },
          { value: 7500, name: '注册' },
          { value: 5000, name: '激活' },
          { value: 3500, name: '使用功能' },
          { value: 2000, name: '付费转化' },
        ],
      },
    ],
  });

  const columns = [
    { title: '操作行为', dataIndex: 'action', key: 'action' },
    {
      title: '操作次数',
      dataIndex: 'count',
      key: 'count',
      sorter: (a: any, b: any) => a.count - b.count,
    },
    { title: '用户数', dataIndex: 'users', key: 'users' },
    {
      title: '人均次数',
      dataIndex: 'avg',
      key: 'avg',
      render: (val: number) => val.toFixed(2),
    },
  ];

  const data = [
    { key: 1, action: '登录', count: 15234, users: 5678, avg: 2.68 },
    { key: 2, action: '查看文档', count: 12456, users: 4567, avg: 2.73 },
    { key: 3, action: '创建内容', count: 8934, users: 3456, avg: 2.58 },
    { key: 4, action: '导出数据', count: 5678, users: 2345, avg: 2.42 },
    { key: 5, action: '修改配置', count: 3456, users: 1234, avg: 2.8 },
  ];

  return (
    <PageContainer>
      <Card style={{ marginBottom: 16 }}>
        <Space size="large">
          <span>时间范围：</span>
          <RangePicker
            value={dateRange}
            onChange={(dates) =>
              dates && setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])
            }
          />
        </Space>
      </Card>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="总操作次数" value={45678} suffix="次" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="活跃用户数" value={5678} suffix="人" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="人均操作" value={8.05} suffix="次" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="转化率"
              value={20}
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={12}>
          <Card>
            <ReactECharts
              option={getFeatureUsageOption()}
              style={{ height: 400 }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card>
            <ReactECharts
              option={getConversionOption()}
              style={{ height: 400 }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={24}>
          <Card>
            <ReactECharts
              option={getPathAnalysisOption()}
              style={{ height: 400 }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="操作行为统计">
        <Table columns={columns} dataSource={data} pagination={false} />
      </Card>
    </PageContainer>
  );
};

export default BehaviorAnalysis;
