import { PageContainer } from '@ant-design/pro-components';
import { Alert, Badge, Card, Col, Row, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { EChartsOption } from 'echarts';
import ReactECharts from 'echarts-for-react';
import React, { useEffect, useState } from 'react';

/**
 * 实时监控页面
 * 展示系统实时运行状态和性能指标
 */
const DashboardMonitor: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [cpuData, setCpuData] = useState<number[]>([]);
  const [memoryData, setMemoryData] = useState<number[]>([]);
  const [timeData, setTimeData] = useState<string[]>([]);

  // 模拟实时数据更新
  useEffect(() => {
    setLoading(true);

    // 初始化数据
    const now = new Date();
    const initialTimeData: string[] = [];
    const initialCpuData: number[] = [];
    const initialMemoryData: number[] = [];

    for (let i = 19; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 3000);
      initialTimeData.push(time.toLocaleTimeString());
      initialCpuData.push(Math.random() * 30 + 20);
      initialMemoryData.push(Math.random() * 20 + 40);
    }

    setCpuData(initialCpuData);
    setMemoryData(initialMemoryData);
    setTimeData(initialTimeData);
    setLoading(false);

    // 模拟数据实时更新
    const interval = setInterval(() => {
      const time = new Date().toLocaleTimeString();
      const newCpu = Math.random() * 30 + 20;
      const newMemory = Math.random() * 20 + 40;

      setCpuData((prev) => [...prev.slice(1), newCpu]);
      setMemoryData((prev) => [...prev.slice(1), newMemory]);
      setTimeData((prev) => [...prev.slice(1), time]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // CPU使用率实时图表
  const cpuOption: EChartsOption = {
    title: {
      text: 'CPU使用率',
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal',
      },
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const data = params[0];
        return `${data.name}<br/>CPU: ${data.value.toFixed(1)}%`;
      },
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: timeData,
      axisLabel: {
        rotate: 45,
      },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLabel: {
        formatter: '{value}%',
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true,
    },
    series: [
      {
        name: 'CPU',
        type: 'line',
        smooth: true,
        data: cpuData,
        itemStyle: { color: '#10B981' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(16, 185, 129, 0.5)' },
              { offset: 1, color: 'rgba(16, 185, 129, 0.1)' },
            ],
          },
        },
      },
    ],
  };

  // 内存使用率实时图表
  const memoryOption: EChartsOption = {
    title: {
      text: '内存使用率',
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal',
      },
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const data = params[0];
        return `${data.name}<br/>内存: ${data.value.toFixed(1)}%`;
      },
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: timeData,
      axisLabel: {
        rotate: 45,
      },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLabel: {
        formatter: '{value}%',
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true,
    },
    series: [
      {
        name: '内存',
        type: 'line',
        smooth: true,
        data: memoryData,
        itemStyle: { color: '#0EA5E9' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(14, 165, 233, 0.5)' },
              { offset: 1, color: 'rgba(14, 165, 233, 0.1)' },
            ],
          },
        },
      },
    ],
  };

  // API请求统计图表
  const apiRequestOption: EChartsOption = {
    title: {
      text: 'API请求统计（最近1小时）',
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
    legend: {
      data: ['成功', '失败'],
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
      data: ['00:00', '00:10', '00:20', '00:30', '00:40', '00:50'],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: '成功',
        type: 'bar',
        stack: 'total',
        data: [320, 332, 301, 334, 390, 330],
        itemStyle: { color: '#22C55E' },
      },
      {
        name: '失败',
        type: 'bar',
        stack: 'total',
        data: [12, 8, 15, 6, 10, 8],
        itemStyle: { color: '#EF4444' },
      },
    ],
  };

  // 响应时间分布图表
  const responseTimeOption: EChartsOption = {
    title: {
      text: '响应时间分布',
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
        name: '响应时间',
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
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
        data: [
          { value: 856, name: '<50ms', itemStyle: { color: '#22C55E' } },
          { value: 234, name: '50-100ms', itemStyle: { color: '#10B981' } },
          { value: 123, name: '100-200ms', itemStyle: { color: '#F59E0B' } },
          { value: 45, name: '>200ms', itemStyle: { color: '#EF4444' } },
        ],
      },
    ],
  };

  // 服务状态表格数据
  interface ServiceStatus {
    key: string;
    service: string;
    status: 'running' | 'stopped' | 'error';
    cpu: string;
    memory: string;
    requests: number;
    uptime: string;
  }

  const serviceData: ServiceStatus[] = [
    {
      key: '1',
      service: 'API Gateway',
      status: 'running',
      cpu: '15.2%',
      memory: '512MB',
      requests: 12345,
      uptime: '15天3小时',
    },
    {
      key: '2',
      service: 'Tenant Service',
      status: 'running',
      cpu: '8.5%',
      memory: '256MB',
      requests: 8901,
      uptime: '15天3小时',
    },
    {
      key: '3',
      service: 'User Service',
      status: 'running',
      cpu: '12.3%',
      memory: '384MB',
      requests: 15678,
      uptime: '15天3小时',
    },
    {
      key: '4',
      service: 'AI Service',
      status: 'running',
      cpu: '45.6%',
      memory: '1.2GB',
      requests: 98765,
      uptime: '10天8小时',
    },
    {
      key: '5',
      service: 'File Service',
      status: 'running',
      cpu: '6.2%',
      memory: '128MB',
      requests: 5432,
      uptime: '15天3小时',
    },
  ];

  const serviceColumns: ColumnsType<ServiceStatus> = [
    {
      title: '服务名称',
      dataIndex: 'service',
      key: 'service',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap = {
          running: <Badge status="success" text="运行中" />,
          stopped: <Badge status="default" text="已停止" />,
          error: <Badge status="error" text="异常" />,
        };
        return statusMap[status as keyof typeof statusMap];
      },
    },
    {
      title: 'CPU使用率',
      dataIndex: 'cpu',
      key: 'cpu',
    },
    {
      title: '内存使用',
      dataIndex: 'memory',
      key: 'memory',
    },
    {
      title: '请求数',
      dataIndex: 'requests',
      key: 'requests',
      render: (val: number) => val.toLocaleString(),
    },
    {
      title: '运行时间',
      dataIndex: 'uptime',
      key: 'uptime',
    },
  ];

  // 最近告警数据
  interface Alert {
    key: string;
    level: 'error' | 'warning' | 'info';
    message: string;
    time: string;
  }

  const alertData: Alert[] = [
    {
      key: '1',
      level: 'warning',
      message: 'AI Service CPU使用率超过40%',
      time: '2分钟前',
    },
    {
      key: '2',
      level: 'info',
      message: '数据库连接池使用率正常',
      time: '5分钟前',
    },
    {
      key: '3',
      level: 'warning',
      message: 'Redis缓存命中率下降',
      time: '10分钟前',
    },
  ];

  return (
    <PageContainer
      title="实时监控"
      subTitle="系统运行状态实时监控"
      loading={loading}
    >
      {/* 告警通知 */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          {alertData.map((alert) => (
            <Alert
              key={alert.key}
              message={alert.message}
              description={`发生时间: ${alert.time}`}
              type={alert.level}
              showIcon
              closable
              style={{ marginBottom: 8 }}
            />
          ))}
        </Col>
      </Row>

      {/* 系统状态卡片 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{ fontSize: 28, fontWeight: 'bold', color: '#22C55E' }}
              >
                99.9%
              </div>
              <div style={{ color: '#999', marginTop: 8 }}>系统可用率</div>
              <Badge status="success" text="正常" style={{ marginTop: 8 }} />
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{ fontSize: 28, fontWeight: 'bold', color: '#10B981' }}
              >
                {cpuData[cpuData.length - 1]?.toFixed(1) || 0}%
              </div>
              <div style={{ color: '#999', marginTop: 8 }}>CPU使用率</div>
              <Badge
                status="processing"
                text="运行中"
                style={{ marginTop: 8 }}
              />
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{ fontSize: 28, fontWeight: 'bold', color: '#0EA5E9' }}
              >
                {memoryData[memoryData.length - 1]?.toFixed(1) || 0}%
              </div>
              <div style={{ color: '#999', marginTop: 8 }}>内存使用率</div>
              <Badge status="processing" text="正常" style={{ marginTop: 8 }} />
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{ fontSize: 28, fontWeight: 'bold', color: '#F59E0B' }}
              >
                1,234
              </div>
              <div style={{ color: '#999', marginTop: 8 }}>在线用户</div>
              <Badge status="processing" text="活跃" style={{ marginTop: 8 }} />
            </div>
          </Card>
        </Col>
      </Row>

      {/* 实时图表 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card bordered={false}>
            <ReactECharts
              option={cpuOption}
              style={{ height: 300 }}
              notMerge={true}
              lazyUpdate={true}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card bordered={false}>
            <ReactECharts
              option={memoryOption}
              style={{ height: 300 }}
              notMerge={true}
              lazyUpdate={true}
            />
          </Card>
        </Col>
      </Row>

      {/* API统计图表 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card bordered={false}>
            <ReactECharts
              option={apiRequestOption}
              style={{ height: 300 }}
              notMerge={true}
              lazyUpdate={true}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card bordered={false}>
            <ReactECharts
              option={responseTimeOption}
              style={{ height: 300 }}
              notMerge={true}
              lazyUpdate={true}
            />
          </Card>
        </Col>
      </Row>

      {/* 服务状态表格 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="服务状态" bordered={false}>
            <Table
              columns={serviceColumns}
              dataSource={serviceData}
              pagination={false}
            />
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default DashboardMonitor;
