import { ArrowUpOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { Card, Col, DatePicker, Row, Select, Space, Statistic } from 'antd';
import dayjs from 'dayjs';
import type { EChartsOption } from 'echarts';
import ReactECharts from 'echarts-for-react';
import React, { useState } from 'react';

const { RangePicker } = DatePicker;

const UserAnalysis: React.FC = () => {
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, 'days'),
    dayjs(),
  ]);

  const getUserGrowthOption = (): EChartsOption => ({
    title: { text: '用户增长趋势', left: 'center' },
    tooltip: { trigger: 'axis' },
    legend: { data: ['新增用户', '活跃用户', '留存用户'], bottom: 0 },
    xAxis: {
      type: 'category',
      data: Array.from({ length: 30 }, (_, i) => `${i + 1}日`),
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: '新增用户',
        type: 'line',
        data: Array.from(
          { length: 30 },
          () => Math.floor(Math.random() * 200) + 100,
        ),
        smooth: true,
        itemStyle: { color: '#1890ff' },
      },
      {
        name: '活跃用户',
        type: 'line',
        data: Array.from(
          { length: 30 },
          () => Math.floor(Math.random() * 500) + 300,
        ),
        smooth: true,
        itemStyle: { color: '#52c41a' },
      },
      {
        name: '留存用户',
        type: 'line',
        data: Array.from(
          { length: 30 },
          () => Math.floor(Math.random() * 400) + 200,
        ),
        smooth: true,
        itemStyle: { color: '#faad14' },
      },
    ],
  });

  const getUserSourceOption = (): EChartsOption => ({
    title: { text: '用户来源分布', left: 'center' },
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        data: [
          { value: 1200, name: '自然搜索' },
          { value: 800, name: '广告投放' },
          { value: 600, name: '社交媒体' },
          { value: 400, name: '直接访问' },
          { value: 300, name: '其他渠道' },
        ],
        itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
      },
    ],
  });

  const getRetentionOption = (): EChartsOption => ({
    title: { text: '用户留存分析', left: 'center' },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['次日', '3日', '7日', '14日', '30日'] },
    yAxis: { type: 'value', name: '留存率(%)', max: 100 },
    series: [
      {
        name: '留存率',
        type: 'bar',
        data: [85, 72, 65, 58, 45],
        itemStyle: {
          color: (params) => {
            const colors = [
              '#5470c6',
              '#91cc75',
              '#fac858',
              '#ee6666',
              '#73c0de',
            ];
            return colors[params.dataIndex];
          },
        },
      },
    ],
  });

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
          <span>用户分组：</span>
          <Select
            style={{ width: 150 }}
            defaultValue="all"
            options={[
              { label: '全部用户', value: 'all' },
              { label: '新用户', value: 'new' },
              { label: '活跃用户', value: 'active' },
            ]}
          />
        </Space>
      </Card>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="用户总数"
              value={12567}
              prefix={<ArrowUpOutlined />}
              suffix="人"
              valueStyle={{ color: '#3f8600' }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
              较上期 +15.2%
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="新增用户" value={1234} suffix="人" />
            <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
              较上期 +8.5%
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="活跃用户"
              value={8956}
              suffix="人"
              valueStyle={{ color: '#1890ff' }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
              活跃率 71.3%
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="用户留存率"
              value={65.8}
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
              7日留存
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={24}>
          <Card>
            <ReactECharts
              option={getUserGrowthOption()}
              style={{ height: 400 }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <Card>
            <ReactECharts
              option={getUserSourceOption()}
              style={{ height: 350 }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card>
            <ReactECharts
              option={getRetentionOption()}
              style={{ height: 350 }}
            />
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default UserAnalysis;
