import {
  ArrowUpOutlined,
  CheckCircleOutlined,
  ExportOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import type { ActionType } from '@ant-design/pro-components';
import {
  PageContainer,
  type ProColumns,
  ProDescriptions,
  ProTable,
} from '@ant-design/pro-components';
import {
  Badge,
  Button,
  Card,
  Col,
  Drawer,
  message,
  Progress,
  Row,
  Space,
  Statistic,
  Tag,
  Timeline,
} from 'antd';
import React, { useRef, useState } from 'react';

/**
 * 订单数据类型
 */
interface Order {
  id: string;
  orderNo: string;
  tenantId: number;
  tenantName: string;
  packageName: string;
  packagePrice: number;
  duration: number; // 月数
  totalAmount: number;
  discountAmount: number;
  actualAmount: number;
  status: 'pending' | 'paid' | 'cancelled' | 'refunded';
  paymentMethod?: string;
  paymentTime?: string;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 支付记录类型
 */
interface PaymentRecord {
  id: number;
  orderId: string;
  amount: number;
  method: string;
  status: string;
  transactionId: string;
  createdAt: string;
}

/**
 * 订单管理页面
 * 完整的订单管理功能，包括状态管理、支付记录、统计图表等
 */
const OrderList: React.FC = () => {
  const actionRef = useRef<ActionType>(null);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  // 模拟订单数据
  const mockOrders: Order[] = [
    {
      id: '1',
      orderNo: 'ORD202402010001',
      tenantId: 1,
      tenantName: '阿里巴巴集团',
      packageName: '企业版',
      packagePrice: 2999,
      duration: 12,
      totalAmount: 35988,
      discountAmount: 3598.8,
      actualAmount: 32389.2,
      status: 'paid',
      paymentMethod: '支付宝',
      paymentTime: '2024-02-01 10:30:00',
      transactionId: '2024020122001234567890',
      createdAt: '2024-02-01 10:00:00',
      updatedAt: '2024-02-01 10:30:00',
    },
    {
      id: '2',
      orderNo: 'ORD202402010002',
      tenantId: 2,
      tenantName: '腾讯科技',
      packageName: '旗舰版',
      packagePrice: 9999,
      duration: 12,
      totalAmount: 119988,
      discountAmount: 11998.8,
      actualAmount: 107989.2,
      status: 'paid',
      paymentMethod: '微信支付',
      paymentTime: '2024-02-01 14:15:00',
      transactionId: '4200001234567890123456789',
      createdAt: '2024-02-01 14:00:00',
      updatedAt: '2024-02-01 14:15:00',
    },
    {
      id: '3',
      orderNo: 'ORD202402010003',
      tenantId: 3,
      tenantName: '字节跳动',
      packageName: '专业版',
      packagePrice: 999,
      duration: 6,
      totalAmount: 5994,
      discountAmount: 299.7,
      actualAmount: 5694.3,
      status: 'pending',
      createdAt: '2024-02-01 16:00:00',
      updatedAt: '2024-02-01 16:00:00',
    },
    {
      id: '4',
      orderNo: 'ORD202401310001',
      tenantId: 4,
      tenantName: '百度公司',
      packageName: '基础版',
      packagePrice: 299,
      duration: 3,
      totalAmount: 897,
      discountAmount: 0,
      actualAmount: 897,
      status: 'paid',
      paymentMethod: '银行转账',
      paymentTime: '2024-01-31 09:20:00',
      transactionId: 'BANK20240131001',
      createdAt: '2024-01-31 09:00:00',
      updatedAt: '2024-01-31 09:20:00',
    },
    {
      id: '5',
      orderNo: 'ORD202401300001',
      tenantId: 5,
      tenantName: '美团',
      packageName: '专业版',
      packagePrice: 999,
      duration: 1,
      totalAmount: 999,
      discountAmount: 0,
      actualAmount: 999,
      status: 'cancelled',
      createdAt: '2024-01-30 11:00:00',
      updatedAt: '2024-01-30 11:30:00',
    },
  ];

  // 模拟支付记录
  const _mockPaymentRecords: PaymentRecord[] = [
    {
      id: 1,
      orderId: '1',
      amount: 32389.2,
      method: '支付宝',
      status: 'success',
      transactionId: '2024020122001234567890',
      createdAt: '2024-02-01 10:30:00',
    },
    {
      id: 2,
      orderId: '2',
      amount: 107989.2,
      method: '微信支付',
      status: 'success',
      transactionId: '4200001234567890123456789',
      createdAt: '2024-02-01 14:15:00',
    },
  ];

  // 统计数据
  const stats = {
    total: mockOrders.length,
    paid: mockOrders.filter((o) => o.status === 'paid').length,
    pending: mockOrders.filter((o) => o.status === 'pending').length,
    revenue: mockOrders
      .filter((o) => o.status === 'paid')
      .reduce((sum, o) => sum + o.actualAmount, 0),
  };

  // 近期收入统计
  const recentRevenue = {
    today: 140378.4,
    yesterday: 897,
    growth: (((140378.4 - 897) / 897) * 100).toFixed(1),
  };

  // 定义表格列
  const columns: ProColumns<Order>[] = [
    {
      title: '订单号',
      dataIndex: 'orderNo',
      width: 160,
      fixed: 'left',
      copyable: true,
      render: (_, record) => (
        <a
          onClick={() => {
            setCurrentOrder(record);
            setDetailDrawerVisible(true);
          }}
        >
          {record.orderNo}
        </a>
      ),
    },
    {
      title: '租户名称',
      dataIndex: 'tenantName',
      width: 150,
    },
    {
      title: '套餐',
      dataIndex: 'packageName',
      width: 120,
      render: (_, record) => <Tag color="blue">{record.packageName}</Tag>,
    },
    {
      title: '购买时长',
      dataIndex: 'duration',
      width: 100,
      search: false,
      render: (_, record) => `${record.duration}个月`,
    },
    {
      title: '订单金额',
      dataIndex: 'totalAmount',
      width: 120,
      search: false,
      render: (_, record) => (
        <span style={{ fontWeight: 'bold' }}>
          ¥{record.totalAmount.toFixed(2)}
        </span>
      ),
    },
    {
      title: '优惠金额',
      dataIndex: 'discountAmount',
      width: 120,
      search: false,
      render: (_, record) => (
        <span
          style={{ color: record.discountAmount > 0 ? '#ff4d4f' : undefined }}
        >
          {record.discountAmount > 0
            ? `-¥${record.discountAmount.toFixed(2)}`
            : '-'}
        </span>
      ),
    },
    {
      title: '实付金额',
      dataIndex: 'actualAmount',
      width: 120,
      search: false,
      sorter: true,
      render: (_, record) => (
        <span style={{ color: '#1890ff', fontWeight: 'bold', fontSize: 14 }}>
          ¥{record.actualAmount.toFixed(2)}
        </span>
      ),
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      width: 110,
      valueType: 'select',
      valueEnum: {
        pending: { text: '待支付', status: 'Warning' },
        paid: { text: '已支付', status: 'Success' },
        cancelled: { text: '已取消', status: 'Default' },
        refunded: { text: '已退款', status: 'Error' },
      },
      render: (_, record) => {
        const statusConfig = {
          pending: { color: 'warning', text: '待支付' },
          paid: { color: 'success', text: '已支付' },
          cancelled: { color: 'default', text: '已取消' },
          refunded: { color: 'error', text: '已退款' },
        };
        const config = statusConfig[record.status];
        return <Badge status={config.color as any} text={config.text} />;
      },
    },
    {
      title: '支付方式',
      dataIndex: 'paymentMethod',
      width: 120,
      search: false,
      render: (_, record) => record.paymentMethod || '-',
    },
    {
      title: '支付时间',
      dataIndex: 'paymentTime',
      width: 160,
      valueType: 'dateTime',
      search: false,
      render: (_, record) => record.paymentTime || '-',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 160,
      valueType: 'dateTime',
      hideInSearch: true,
      sorter: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      valueType: 'dateRange',
      hideInTable: true,
      search: {
        transform: (value) => {
          return {
            startTime: value[0],
            endTime: value[1],
          };
        },
      },
    },
    {
      title: '操作',
      width: 150,
      fixed: 'right',
      search: false,
      render: (_, record) => (
        <Space>
          <a
            onClick={() => {
              setCurrentOrder(record);
              setDetailDrawerVisible(true);
            }}
          >
            <EyeOutlined /> 查看
          </a>
          {record.status === 'pending' && (
            <a
              onClick={() => {
                message.info('支付功能开发中');
              }}
              style={{ color: '#52c41a' }}
            >
              <CheckCircleOutlined /> 支付
            </a>
          )}
        </Space>
      ),
    },
  ];

  return (
    <PageContainer>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic title="订单总数" value={stats.total} suffix="笔" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已支付"
              value={stats.paid}
              suffix="笔"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待支付"
              value={stats.pending}
              suffix="笔"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总收入"
              value={stats.revenue}
              prefix="¥"
              precision={2}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 收入统计 */}
      <Card title="收入统计" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Card size="small">
              <Statistic
                title="今日收入"
                value={recentRevenue.today}
                precision={2}
                prefix="¥"
                suffix={
                  <span style={{ fontSize: 14, color: '#52c41a' }}>
                    <ArrowUpOutlined /> {recentRevenue.growth}%
                  </span>
                }
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small">
              <Statistic
                title="昨日收入"
                value={recentRevenue.yesterday}
                precision={2}
                prefix="¥"
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small">
              <div style={{ marginBottom: 8 }}>订单完成率</div>
              <Progress
                percent={(stats.paid / stats.total) * 100}
                strokeColor="#52c41a"
                format={(percent) => `${percent?.toFixed(1)}%`}
              />
              <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
                {stats.paid}/{stats.total} 笔已完成
              </div>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* 订单列表 */}
      <ProTable<Order>
        columns={columns}
        actionRef={actionRef}
        request={async (params) => {
          // 模拟API请求
          await new Promise((resolve) => setTimeout(resolve, 500));

          let data = [...mockOrders];

          // 搜索过滤
          if (params.orderNo) {
            data = data.filter((item) =>
              item.orderNo.includes(params.orderNo as string),
            );
          }
          if (params.tenantName) {
            data = data.filter((item) =>
              item.tenantName.includes(params.tenantName as string),
            );
          }
          if (params.status) {
            data = data.filter((item) => item.status === params.status);
          }

          return {
            data,
            total: data.length,
            success: true,
          };
        }}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
        }}
        scroll={{ x: 1800 }}
        toolBarRender={() => [
          <Button
            key="export"
            icon={<ExportOutlined />}
            onClick={() => message.success('导出功能开发中')}
          >
            导出订单
          </Button>,
        ]}
      />

      {/* 订单详情抽屉 */}
      <Drawer
        title="订单详情"
        width={720}
        open={detailDrawerVisible}
        onClose={() => {
          setDetailDrawerVisible(false);
          setCurrentOrder(null);
        }}
      >
        {currentOrder && (
          <div>
            <ProDescriptions
              title="基本信息"
              column={2}
              style={{ marginBottom: 24 }}
            >
              <ProDescriptions.Item label="订单号" copyable>
                {currentOrder.orderNo}
              </ProDescriptions.Item>
              <ProDescriptions.Item label="订单状态">
                <Badge
                  status={
                    currentOrder.status === 'paid'
                      ? 'success'
                      : currentOrder.status === 'pending'
                        ? 'warning'
                        : currentOrder.status === 'cancelled'
                          ? 'default'
                          : 'error'
                  }
                  text={
                    currentOrder.status === 'paid'
                      ? '已支付'
                      : currentOrder.status === 'pending'
                        ? '待支付'
                        : currentOrder.status === 'cancelled'
                          ? '已取消'
                          : '已退款'
                  }
                />
              </ProDescriptions.Item>
              <ProDescriptions.Item label="租户名称">
                {currentOrder.tenantName}
              </ProDescriptions.Item>
              <ProDescriptions.Item label="套餐">
                <Tag color="blue">{currentOrder.packageName}</Tag>
              </ProDescriptions.Item>
              <ProDescriptions.Item label="购买时长">
                {currentOrder.duration}个月
              </ProDescriptions.Item>
              <ProDescriptions.Item label="创建时间">
                {currentOrder.createdAt}
              </ProDescriptions.Item>
            </ProDescriptions>

            <ProDescriptions
              title="金额信息"
              column={2}
              style={{ marginBottom: 24 }}
            >
              <ProDescriptions.Item label="订单金额">
                ¥{currentOrder.totalAmount.toFixed(2)}
              </ProDescriptions.Item>
              <ProDescriptions.Item label="优惠金额">
                <span style={{ color: '#ff4d4f' }}>
                  {currentOrder.discountAmount > 0
                    ? `-¥${currentOrder.discountAmount.toFixed(2)}`
                    : '-'}
                </span>
              </ProDescriptions.Item>
              <ProDescriptions.Item label="实付金额" span={2}>
                <span
                  style={{ color: '#1890ff', fontWeight: 'bold', fontSize: 16 }}
                >
                  ¥{currentOrder.actualAmount.toFixed(2)}
                </span>
              </ProDescriptions.Item>
            </ProDescriptions>

            {currentOrder.status === 'paid' && (
              <ProDescriptions
                title="支付信息"
                column={2}
                style={{ marginBottom: 24 }}
              >
                <ProDescriptions.Item label="支付方式">
                  {currentOrder.paymentMethod}
                </ProDescriptions.Item>
                <ProDescriptions.Item label="支付时间">
                  {currentOrder.paymentTime}
                </ProDescriptions.Item>
                <ProDescriptions.Item label="交易流水号" span={2} copyable>
                  {currentOrder.transactionId}
                </ProDescriptions.Item>
              </ProDescriptions>
            )}

            <Card title="订单状态流转" size="small">
              <Timeline
                items={[
                  {
                    color: 'green',
                    children: (
                      <>
                        <p>订单创建</p>
                        <p style={{ color: '#999', fontSize: 12 }}>
                          {currentOrder.createdAt}
                        </p>
                      </>
                    ),
                  },
                  currentOrder.status === 'paid'
                    ? {
                        color: 'green',
                        children: (
                          <>
                            <p>支付成功</p>
                            <p style={{ color: '#999', fontSize: 12 }}>
                              {currentOrder.paymentTime}
                            </p>
                          </>
                        ),
                      }
                    : currentOrder.status === 'cancelled'
                      ? {
                          color: 'gray',
                          children: (
                            <>
                              <p>订单取消</p>
                              <p style={{ color: '#999', fontSize: 12 }}>
                                {currentOrder.updatedAt}
                              </p>
                            </>
                          ),
                        }
                      : {
                          color: 'blue',
                          children: <p>等待支付...</p>,
                        },
                ]}
              />
            </Card>
          </div>
        )}
      </Drawer>
    </PageContainer>
  );
};

export default OrderList;
