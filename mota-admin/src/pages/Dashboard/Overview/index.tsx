import {
  ArrowUpOutlined,
  DollarOutlined,
  RobotOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { Card, Col, Progress, Row, Statistic } from 'antd';
import type { EChartsOption } from 'echarts';
import ReactECharts from 'echarts-for-react';
import React, { useEffect, useState } from 'react';

/**
 * 数据概览页面
 * 展示关键运营指标和数据趋势
 */
const DashboardOverview: React.FC = () => {
  const [loading, setLoading] = useState(false);

  // 模拟数据加载
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  // 用户增长趋势图表配置
  const userGrowthOption: EChartsOption = {
    title: {
      text: '用户增长趋势',
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
      data: ['新增用户', '活跃用户', '付费用户'],
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
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月'],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: '新增用户',
        type: 'line',
        smooth: true,
        data: [120, 232, 301, 434, 590, 730, 820],
        itemStyle: { color: '#10B981' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
              { offset: 1, color: 'rgba(16, 185, 129, 0.05)' },
            ],
          },
        },
      },
      {
        name: '活跃用户',
        type: 'line',
        smooth: true,
        data: [220, 282, 391, 544, 690, 830, 920],
        itemStyle: { color: '#0EA5E9' },
      },
      {
        name: '付费用户',
        type: 'line',
        smooth: true,
        data: [20, 42, 61, 94, 120, 153, 180],
        itemStyle: { color: '#F59E0B' },
      },
    ],
  };

  // 套餐分布饼图配置
  const packageDistributionOption: EChartsOption = {
    title: {
      text: '套餐分布',
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal',
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle',
    },
    series: [
      {
        name: '套餐分布',
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
        data: [
          { value: 156, name: '基础版', itemStyle: { color: '#10B981' } },
          { value: 234, name: '专业版', itemStyle: { color: '#0EA5E9' } },
          { value: 123, name: '企业版', itemStyle: { color: '#F59E0B' } },
          { value: 45, name: '旗舰版', itemStyle: { color: '#8B5CF6' } },
        ],
      },
    ],
  };

  // AI调用趋势图表配置
  const aiUsageOption: EChartsOption = {
    title: {
      text: 'AI调用趋势',
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal',
      },
    },
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['文本生成', '图像识别', '语音识别'],
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
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: '文本生成',
        type: 'bar',
        stack: 'total',
        data: [320, 332, 301, 334, 390, 330, 320],
        itemStyle: { color: '#10B981' },
      },
      {
        name: '图像识别',
        type: 'bar',
        stack: 'total',
        data: [120, 132, 101, 134, 90, 230, 210],
        itemStyle: { color: '#0EA5E9' },
      },
      {
        name: '语音识别',
        type: 'bar',
        stack: 'total',
        data: [220, 182, 191, 234, 290, 330, 310],
        itemStyle: { color: '#F59E0B' },
      },
    ],
  };

  // 租户增长柱状图配置
  const tenantGrowthOption: EChartsOption = {
    title: {
      text: '租户增长',
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
      bottom: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月'],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: '新增租户',
        type: 'bar',
        data: [15, 23, 28, 35, 42, 48, 56],
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#10B981' },
              { offset: 1, color: '#059669' },
            ],
          },
        },
        barWidth: '60%',
      },
    ],
  };

  return (
    <PageContainer
      title="数据概览"
      subTitle="实时监控关键运营指标"
      loading={loading}
    >
      {/* 核心指标卡片 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="总用户数"
              value={12345}
              prefix={<UserOutlined />}
              suffix={
                <span style={{ fontSize: 14, color: '#22C55E', marginLeft: 8 }}>
                  <ArrowUpOutlined /> 12.5%
                </span>
              }
              valueStyle={{ color: '#10B981' }}
            />
            <Progress
              percent={75}
              strokeColor="#10B981"
              showInfo={false}
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="活跃用户"
              value={8901}
              prefix={<UserOutlined />}
              suffix={
                <span style={{ fontSize: 14, color: '#22C55E', marginLeft: 8 }}>
                  <ArrowUpOutlined /> 8.3%
                </span>
              }
              valueStyle={{ color: '#0EA5E9' }}
            />
            <Progress
              percent={72}
              strokeColor="#0EA5E9"
              showInfo={false}
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="租户数量"
              value={456}
              prefix={<TeamOutlined />}
              suffix={
                <span style={{ fontSize: 14, color: '#22C55E', marginLeft: 8 }}>
                  <ArrowUpOutlined /> 5.6%
                </span>
              }
              valueStyle={{ color: '#F59E0B' }}
            />
            <Progress
              percent={68}
              strokeColor="#F59E0B"
              showInfo={false}
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="今日AI调用"
              value={98765}
              prefix={<RobotOutlined />}
              suffix="次"
              valueStyle={{ color: '#8B5CF6' }}
            />
            <Progress
              percent={85}
              strokeColor="#8B5CF6"
              showInfo={false}
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>
      </Row>

      {/* 收入统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="今日收入"
              value={12580}
              prefix={<DollarOutlined />}
              precision={2}
              suffix="元"
              valueStyle={{ color: '#EF4444' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="本月收入"
              value={356789}
              prefix={<DollarOutlined />}
              precision={2}
              suffix={
                <span style={{ fontSize: 14, color: '#22C55E', marginLeft: 8 }}>
                  <ArrowUpOutlined /> 18.2%
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="本年收入"
              value={3567890}
              prefix={<DollarOutlined />}
              precision={2}
              suffix={
                <span style={{ fontSize: 14, color: '#22C55E', marginLeft: 8 }}>
                  <ArrowUpOutlined /> 25.6%
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="续费率"
              value={87.5}
              suffix="%"
              valueStyle={{ color: '#22C55E' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* 用户增长趋势 */}
        <Col xs={24} lg={16}>
          <Card bordered={false}>
            <ReactECharts
              option={userGrowthOption}
              style={{ height: 350 }}
              notMerge={true}
              lazyUpdate={true}
            />
          </Card>
        </Col>

        {/* 套餐分布 */}
        <Col xs={24} lg={8}>
          <Card bordered={false}>
            <ReactECharts
              option={packageDistributionOption}
              style={{ height: 350 }}
              notMerge={true}
              lazyUpdate={true}
            />
          </Card>
        </Col>
      </Row>

      {/* 第二行图表 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* AI调用趋势 */}
        <Col xs={24} lg={12}>
          <Card bordered={false}>
            <ReactECharts
              option={aiUsageOption}
              style={{ height: 350 }}
              notMerge={true}
              lazyUpdate={true}
            />
          </Card>
        </Col>

        {/* 租户增长 */}
        <Col xs={24} lg={12}>
          <Card bordered={false}>
            <ReactECharts
              option={tenantGrowthOption}
              style={{ height: 350 }}
              notMerge={true}
              lazyUpdate={true}
            />
          </Card>
        </Col>
      </Row>

      {/* 最近活动 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="系统状态" bordered={false}>
            <Row gutter={16}>
              <Col span={6}>
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 'bold',
                      color: '#22C55E',
                    }}
                  >
                    99.9%
                  </div>
                  <div style={{ color: '#999', marginTop: 8 }}>系统可用率</div>
                </div>
              </Col>
              <Col span={6}>
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 'bold',
                      color: '#10B981',
                    }}
                  >
                    45ms
                  </div>
                  <div style={{ color: '#999', marginTop: 8 }}>
                    平均响应时间
                  </div>
                </div>
              </Col>
              <Col span={6}>
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 'bold',
                      color: '#F59E0B',
                    }}
                  >
                    1,234
                  </div>
                  <div style={{ color: '#999', marginTop: 8 }}>在线用户</div>
                </div>
              </Col>
              <Col span={6}>
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 'bold',
                      color: '#8B5CF6',
                    }}
                  >
                    5,678
                  </div>
                  <div style={{ color: '#999', marginTop: 8 }}>API调用次数</div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default DashboardOverview;
