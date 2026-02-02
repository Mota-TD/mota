import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProCard, ProTable } from '@ant-design/pro-components';
import { Alert, Card, Col, Progress, Row, Statistic, Tag } from 'antd';
import type { EChartsOption } from 'echarts';
import ReactECharts from 'echarts-for-react';
import React, { useEffect, useState } from 'react';

interface ServiceStatus {
  name: string;
  status: 'running' | 'stopped' | 'warning';
  uptime: string;
  cpu: number;
  memory: number;
  responseTime: number;
  lastCheck: string;
}

const SystemMonitor: React.FC = () => {
  const [cpuData, setCpuData] = useState<number[]>([]);
  const [memoryData, setMemoryData] = useState<number[]>([]);
  const [timeData, setTimeData] = useState<string[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().toLocaleTimeString();
      const newCpu = Math.random() * 30 + 20;
      const newMemory = Math.random() * 20 + 60;

      setCpuData((prev) => [...prev.slice(-29), newCpu]);
      setMemoryData((prev) => [...prev.slice(-29), newMemory]);
      setTimeData((prev) => [...prev.slice(-29), now]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const services: ServiceStatus[] = [
    {
      name: 'API Gateway',
      status: 'running',
      uptime: '15天',
      cpu: 25,
      memory: 45,
      responseTime: 85,
      lastCheck: '刚刚',
    },
    {
      name: 'Auth Service',
      status: 'running',
      uptime: '15天',
      cpu: 18,
      memory: 38,
      responseTime: 45,
      lastCheck: '刚刚',
    },
    {
      name: 'Database',
      status: 'running',
      uptime: '30天',
      cpu: 35,
      memory: 72,
      responseTime: 12,
      lastCheck: '刚刚',
    },
    {
      name: 'Redis Cache',
      status: 'running',
      uptime: '30天',
      cpu: 8,
      memory: 25,
      responseTime: 3,
      lastCheck: '刚刚',
    },
    {
      name: 'AI Service',
      status: 'warning',
      uptime: '2天',
      cpu: 65,
      memory: 85,
      responseTime: 350,
      lastCheck: '刚刚',
    },
    {
      name: 'File Storage',
      status: 'running',
      uptime: '15天',
      cpu: 12,
      memory: 42,
      responseTime: 95,
      lastCheck: '刚刚',
    },
  ];

  const getResourceOption = (): EChartsOption => ({
    title: { text: '系统资源实时监控', left: 'center' },
    tooltip: { trigger: 'axis' },
    legend: { data: ['CPU使用率', '内存使用率'], bottom: 0 },
    xAxis: { type: 'category', data: timeData, boundaryGap: false },
    yAxis: { type: 'value', name: '使用率(%)', min: 0, max: 100 },
    series: [
      {
        name: 'CPU使用率',
        type: 'line',
        smooth: true,
        data: cpuData,
        itemStyle: { color: '#1890ff' },
        areaStyle: { color: 'rgba(24, 144, 255, 0.2)' },
      },
      {
        name: '内存使用率',
        type: 'line',
        smooth: true,
        data: memoryData,
        itemStyle: { color: '#52c41a' },
        areaStyle: { color: 'rgba(82, 196, 26, 0.2)' },
      },
    ],
  });

  const columns: ProColumns<ServiceStatus>[] = [
    {
      title: '服务名称',
      dataIndex: 'name',
      width: 200,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 120,
      render: (_, record) => (
        <Tag
          icon={
            record.status === 'running' ? (
              <CheckCircleOutlined />
            ) : record.status === 'warning' ? (
              <WarningOutlined />
            ) : (
              <CloseCircleOutlined />
            )
          }
          color={
            record.status === 'running'
              ? 'success'
              : record.status === 'warning'
                ? 'warning'
                : 'error'
          }
        >
          {record.status === 'running'
            ? '运行中'
            : record.status === 'warning'
              ? '告警'
              : '已停止'}
        </Tag>
      ),
    },
    {
      title: '运行时长',
      dataIndex: 'uptime',
      width: 120,
    },
    {
      title: 'CPU使用',
      dataIndex: 'cpu',
      width: 150,
      render: (text) => (
        <Progress
          percent={text as number}
          size="small"
          status={(text as number) > 80 ? 'exception' : 'active'}
        />
      ),
    },
    {
      title: '内存使用',
      dataIndex: 'memory',
      width: 150,
      render: (text) => (
        <Progress
          percent={text as number}
          size="small"
          status={(text as number) > 80 ? 'exception' : 'active'}
        />
      ),
    },
    {
      title: '响应时间',
      dataIndex: 'responseTime',
      width: 120,
      render: (text) => (
        <span style={{ color: (text as number) > 200 ? '#ff4d4f' : '#52c41a' }}>
          {text}ms
        </span>
      ),
    },
    {
      title: '最后检查',
      dataIndex: 'lastCheck',
      width: 120,
    },
  ];

  return (
    <PageContainer>
      {services.some((s) => s.status === 'warning') && (
        <Alert
          message="系统告警"
          description="AI Service服务资源使用率过高，请及时处理"
          type="warning"
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="在线服务"
              value={services.filter((s) => s.status === 'running').length}
              suffix={`/ ${services.length}`}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="告警服务"
              value={services.filter((s) => s.status === 'warning').length}
              suffix="个"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="平均CPU"
              value={Math.round(
                services.reduce((s, v) => s + v.cpu, 0) / services.length,
              )}
              suffix="%"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="平均内存"
              value={Math.round(
                services.reduce((s, v) => s + v.memory, 0) / services.length,
              )}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginBottom: 16 }}>
        <ReactECharts option={getResourceOption()} style={{ height: 350 }} />
      </Card>

      <ProCard title="服务状态监控" headerBordered>
        <ProTable<ServiceStatus>
          columns={columns}
          dataSource={services}
          rowKey="name"
          search={false}
          pagination={false}
          options={{ reload: true }}
        />
      </ProCard>
    </PageContainer>
  );
};

export default SystemMonitor;
