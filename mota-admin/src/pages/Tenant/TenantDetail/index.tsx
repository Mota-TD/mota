import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  EditOutlined,
  StopOutlined,
} from '@ant-design/icons';
import {
  PageContainer,
  ProCard,
  ProDescriptions,
} from '@ant-design/pro-components';
import { history, useParams } from '@umijs/max';
import {
  Badge,
  Button,
  message,
  Popconfirm,
  Progress,
  Space,
  Statistic,
  Tag,
} from 'antd';
import type { EChartsOption } from 'echarts';
import ReactECharts from 'echarts-for-react';
import React, { useEffect, useState } from 'react';
import { getTenantDetail, toggleTenantStatus } from '@/services/tenant';
import type { Tenant } from '@/types/tenant';

/**
 * 租户详情页面
 * 展示租户的完整信息和使用统计
 */
const TenantDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(false);

  // 加载租户详情
  useEffect(() => {
    if (id) {
      loadTenantDetail();
    }
  }, [id]);

  const loadTenantDetail = async () => {
    setLoading(true);
    try {
      const response = await getTenantDetail(id || '');
      if (response.code === 200) {
        setTenant(response.data);
      }
    } catch (_error) {
      message.error('加载租户详情失败');
    } finally {
      setLoading(false);
    }
  };

  // 切换租户状态
  const handleToggleStatus = async (status: 'active' | 'inactive') => {
    try {
      await toggleTenantStatus(id || '', status);
      message.success(`${status === 'active' ? '启用' : '暂停'}成功`);
      loadTenantDetail();
    } catch (_error) {
      message.error('操作失败');
    }
  };

  // 存储使用图表
  const storageOption: EChartsOption = {
    title: {
      text: '存储空间使用',
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal',
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c}GB ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle',
    },
    series: [
      {
        name: '存储使用',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: '{b}: {d}%',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
          },
        },
        data: [
          {
            value: tenant ? Number((tenant.storageUsed / 1024).toFixed(2)) : 0,
            name: '已使用',
            itemStyle: { color: '#10B981' },
          },
          {
            value: tenant
              ? Number(
                  ((tenant.storageLimit - tenant.storageUsed) / 1024).toFixed(
                    2,
                  ),
                )
              : 0,
            name: '剩余',
            itemStyle: { color: '#e8e8e8' },
          },
        ],
      },
    ],
  };

  // AI配额使用图表
  const aiQuotaOption: EChartsOption = {
    title: {
      text: 'AI配额使用',
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal',
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c}次 ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle',
    },
    series: [
      {
        name: 'AI配额',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: '{b}: {d}%',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
          },
        },
        data: [
          {
            value: tenant?.aiQuotaUsed || 0,
            name: '已使用',
            itemStyle: { color: '#0EA5E9' },
          },
          {
            value: tenant ? tenant.aiQuotaLimit - tenant.aiQuotaUsed : 0,
            name: '剩余',
            itemStyle: { color: '#e8e8e8' },
          },
        ],
      },
    ],
  };

  // 使用趋势图表（模拟数据）
  const usageTrendOption: EChartsOption = {
    title: {
      text: '最近30天使用趋势',
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
      data: ['活跃用户', 'AI调用', '存储使用(GB)'],
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
      data: Array.from({ length: 30 }, (_, i) => `${i + 1}日`),
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: '活跃用户',
        type: 'line',
        smooth: true,
        data: Array.from({ length: 30 }, () =>
          Math.floor(Math.random() * 50 + 20),
        ),
        itemStyle: { color: '#10B981' },
      },
      {
        name: 'AI调用',
        type: 'line',
        smooth: true,
        data: Array.from({ length: 30 }, () =>
          Math.floor(Math.random() * 500 + 200),
        ),
        itemStyle: { color: '#0EA5E9' },
      },
      {
        name: '存储使用(GB)',
        type: 'line',
        smooth: true,
        data: Array.from({ length: 30 }, (_, i) => Math.floor(i * 2 + 50)),
        itemStyle: { color: '#F59E0B' },
      },
    ],
  };

  if (!tenant && !loading) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>租户不存在或已被删除</p>
          <Button onClick={() => history.back()}>返回</Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={`租户详情 - ${tenant?.name || ''}`}
      loading={loading}
      extra={
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => history.back()}>
            返回
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => message.info('编辑功能开发中')}
          >
            编辑
          </Button>
          {tenant?.status === 'active' ? (
            <Popconfirm
              title="确认暂停该租户？"
              onConfirm={() => handleToggleStatus('inactive')}
            >
              <Button danger icon={<StopOutlined />}>
                暂停
              </Button>
            </Popconfirm>
          ) : (
            <Popconfirm
              title="确认启用该租户？"
              onConfirm={() => handleToggleStatus('active')}
            >
              <Button type="primary" icon={<CheckCircleOutlined />}>
                启用
              </Button>
            </Popconfirm>
          )}
        </Space>
      }
    >
      {/* 基本信息 */}
      <ProCard title="基本信息" bordered style={{ marginBottom: 16 }}>
        <ProDescriptions column={2}>
          <ProDescriptions.Item label="租户ID">
            {tenant?.id}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="租户编码" copyable>
            {tenant?.code}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="租户名称">
            {tenant?.name}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="状态">
            {tenant?.status === 'active' ? (
              <Badge status="success" text="正常" />
            ) : (
              <Badge status="error" text="暂停" />
            )}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="套餐">
            <Tag color="blue">{tenant?.packageName}</Tag>
          </ProDescriptions.Item>
          <ProDescriptions.Item label="到期时间">
            {tenant?.expireDate}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="联系人">
            {tenant?.contactName}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="联系电话">
            {tenant?.contactPhone}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="联系邮箱" copyable>
            {tenant?.contactEmail}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="创建时间">
            {tenant?.createdAt}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="备注" span={2}>
            {tenant?.remark || '-'}
          </ProDescriptions.Item>
        </ProDescriptions>
      </ProCard>

      {/* 使用统计 */}
      <ProCard title="使用统计" bordered style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: 200 }}>
            <Statistic
              title="用户数"
              value={tenant?.userCount || 0}
              suffix={`/ ${tenant?.maxUsers}`}
              valueStyle={{ color: '#10B981' }}
            />
            <Progress
              percent={
                tenant
                  ? Number(
                      ((tenant.userCount / tenant.maxUsers) * 100).toFixed(1),
                    )
                  : 0
              }
              strokeColor="#10B981"
              style={{ marginTop: 8 }}
            />
          </div>
          <div style={{ flex: '1', minWidth: 200 }}>
            <Statistic
              title="存储空间"
              value={(tenant?.storageUsed || 0) / 1024}
              suffix={`GB / ${(tenant?.storageLimit || 0) / 1024}GB`}
              precision={2}
              valueStyle={{ color: '#0EA5E9' }}
            />
            <Progress
              percent={
                tenant
                  ? Number(
                      (
                        (tenant.storageUsed / tenant.storageLimit) *
                        100
                      ).toFixed(1),
                    )
                  : 0
              }
              strokeColor="#0EA5E9"
              style={{ marginTop: 8 }}
            />
          </div>
          <div style={{ flex: '1', minWidth: 200 }}>
            <Statistic
              title="AI配额"
              value={tenant?.aiQuotaUsed || 0}
              suffix={`/ ${tenant?.aiQuotaLimit}`}
              valueStyle={{ color: '#F59E0B' }}
            />
            <Progress
              percent={
                tenant
                  ? Number(
                      (
                        (tenant.aiQuotaUsed / tenant.aiQuotaLimit) *
                        100
                      ).toFixed(1),
                    )
                  : 0
              }
              strokeColor="#F59E0B"
              style={{ marginTop: 8 }}
            />
          </div>
        </div>
      </ProCard>

      {/* 资源使用图表 */}
      <ProCard.Group direction="row" style={{ marginBottom: 16 }}>
        <ProCard title="存储空间" colSpan="50%">
          <ReactECharts
            option={storageOption}
            style={{ height: 300 }}
            notMerge={true}
            lazyUpdate={true}
          />
        </ProCard>
        <ProCard title="AI配额" colSpan="50%">
          <ReactECharts
            option={aiQuotaOption}
            style={{ height: 300 }}
            notMerge={true}
            lazyUpdate={true}
          />
        </ProCard>
      </ProCard.Group>

      {/* 使用趋势 */}
      <ProCard title="使用趋势" bordered>
        <ReactECharts
          option={usageTrendOption}
          style={{ height: 400 }}
          notMerge={true}
          lazyUpdate={true}
        />
      </ProCard>
    </PageContainer>
  );
};

export default TenantDetail;
