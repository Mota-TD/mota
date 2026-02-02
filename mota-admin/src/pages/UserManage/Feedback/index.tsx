import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import type { ActionType } from '@ant-design/pro-components';
import {
  ModalForm,
  PageContainer,
  type ProColumns,
  ProFormSelect,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import {
  Badge,
  Button,
  Card,
  Col,
  Drawer,
  Image,
  message,
  Row,
  Space,
  Statistic,
  Tag,
} from 'antd';
import React, { useRef, useState } from 'react';

/**
 * 反馈数据类型
 */
interface Feedback {
  id: number;
  userId: number;
  username: string;
  userAvatar?: string;
  tenantName: string;
  type: 'bug' | 'feature' | 'improvement' | 'other';
  title: string;
  content: string;
  images?: string[];
  status: 'pending' | 'processing' | 'resolved' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reply?: string;
  repliedBy?: string;
  repliedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 用户反馈页面
 * 反馈列表展示、反馈处理、状态筛选等功能
 */
const FeedbackPage: React.FC = () => {
  const actionRef = useRef<ActionType>(null);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<Feedback | null>(null);

  // 模拟反馈数据
  const mockFeedbacks: Feedback[] = [
    {
      id: 1,
      userId: 1,
      username: '系统管理员',
      tenantName: '阿里巴巴集团',
      type: 'bug',
      title: 'AI对话响应速度慢',
      content:
        '在使用AI对话功能时，经常需要等待10秒以上才能收到回复，严重影响使用体验。建议优化响应速度。',
      images: [
        'https://gw.alipayobjects.com/zos/antfincdn/LlvErxo8H9/photo-1503185912284-5271ff81b9a8.webp',
      ],
      status: 'pending',
      priority: 'high',
      createdAt: '2024-02-01 10:30:00',
      updatedAt: '2024-02-01 10:30:00',
    },
    {
      id: 2,
      userId: 2,
      username: '运营人员01',
      tenantName: '阿里巴巴集团',
      type: 'feature',
      title: '希望添加批量导出功能',
      content: '目前只能单个导出数据，希望能添加批量导出功能，方便日常工作。',
      status: 'processing',
      priority: 'medium',
      createdAt: '2024-02-01 09:15:00',
      updatedAt: '2024-02-01 14:20:00',
    },
    {
      id: 3,
      userId: 3,
      username: '观察者01',
      tenantName: '腾讯科技',
      type: 'improvement',
      title: '界面配色建议优化',
      content:
        '当前界面配色在长时间使用后容易产生视觉疲劳，建议提供更多主题选择或支持暗色模式。',
      images: [
        'https://gw.alipayobjects.com/zos/antfincdn/cV16ZqzMjW/photo-1473091540282-9b846e7965e3.webp',
        'https://gw.alipayobjects.com/zos/antfincdn/x43I27A55%26/photo-1438109491414-7198515b166b.webp',
      ],
      status: 'resolved',
      priority: 'low',
      reply: '感谢您的建议！我们已经在新版本中添加了暗色模式，将在下周发布。',
      repliedBy: '产品经理',
      repliedAt: '2024-02-01 11:00:00',
      createdAt: '2024-01-31 16:45:00',
      updatedAt: '2024-02-01 11:00:00',
    },
    {
      id: 4,
      userId: 1,
      username: '系统管理员',
      tenantName: '阿里巴巴集团',
      type: 'bug',
      title: '数据导出格式错误',
      content: '导出的Excel文件打开后部分数据显示为乱码，无法正常使用。',
      status: 'resolved',
      priority: 'urgent',
      reply: '问题已修复，请更新到最新版本。',
      repliedBy: '技术支持',
      repliedAt: '2024-01-31 15:30:00',
      createdAt: '2024-01-31 14:00:00',
      updatedAt: '2024-01-31 15:30:00',
    },
    {
      id: 5,
      userId: 4,
      username: '测试用户',
      tenantName: '腾讯科技',
      type: 'other',
      title: '关于数据安全的咨询',
      content: '想了解一下平台对用户数据的安全保护措施，是否通过了相关认证？',
      status: 'rejected',
      priority: 'low',
      reply: '此类问题请通过官方渠道咨询，感谢理解。',
      repliedBy: '客服',
      repliedAt: '2024-01-30 16:00:00',
      createdAt: '2024-01-30 15:00:00',
      updatedAt: '2024-01-30 16:00:00',
    },
  ];

  // 统计数据
  const stats = {
    total: mockFeedbacks.length,
    pending: mockFeedbacks.filter((f) => f.status === 'pending').length,
    processing: mockFeedbacks.filter((f) => f.status === 'processing').length,
    resolved: mockFeedbacks.filter((f) => f.status === 'resolved').length,
  };

  // 定义表格列
  const columns: ProColumns<Feedback>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 60,
      search: false,
    },
    {
      title: '反馈标题',
      dataIndex: 'title',
      width: 250,
      ellipsis: true,
      render: (_, record) => (
        <a
          onClick={() => {
            setCurrentFeedback(record);
            setDetailDrawerVisible(true);
          }}
        >
          {record.title}
        </a>
      ),
    },
    {
      title: '反馈类型',
      dataIndex: 'type',
      width: 100,
      valueType: 'select',
      valueEnum: {
        bug: { text: 'Bug', status: 'Error' },
        feature: { text: '功能建议', status: 'Processing' },
        improvement: { text: '优化建议', status: 'Success' },
        other: { text: '其他', status: 'Default' },
      },
      render: (_, record) => {
        const typeConfig = {
          bug: { color: 'red', text: 'Bug' },
          feature: { color: 'blue', text: '功能建议' },
          improvement: { color: 'green', text: '优化建议' },
          other: { color: 'default', text: '其他' },
        };
        const config = typeConfig[record.type];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      width: 100,
      valueType: 'select',
      valueEnum: {
        low: { text: '低', status: 'Default' },
        medium: { text: '中', status: 'Processing' },
        high: { text: '高', status: 'Warning' },
        urgent: { text: '紧急', status: 'Error' },
      },
      render: (_, record) => {
        const priorityConfig = {
          low: { color: 'default', text: '低' },
          medium: { color: 'blue', text: '中' },
          high: { color: 'orange', text: '高' },
          urgent: { color: 'red', text: '紧急' },
        };
        const config = priorityConfig[record.priority];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '反馈用户',
      dataIndex: 'username',
      width: 120,
    },
    {
      title: '所属租户',
      dataIndex: 'tenantName',
      width: 150,
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      valueType: 'select',
      valueEnum: {
        pending: { text: '待处理', status: 'Warning' },
        processing: { text: '处理中', status: 'Processing' },
        resolved: { text: '已解决', status: 'Success' },
        rejected: { text: '已拒绝', status: 'Default' },
      },
      render: (_, record) => {
        const statusConfig = {
          pending: { color: 'warning', text: '待处理' },
          processing: { color: 'processing', text: '处理中' },
          resolved: { color: 'success', text: '已解决' },
          rejected: { color: 'default', text: '已拒绝' },
        };
        const config = statusConfig[record.status];
        return <Badge status={config.color as any} text={config.text} />;
      },
    },
    {
      title: '反馈时间',
      dataIndex: 'createdAt',
      width: 160,
      valueType: 'dateTime',
      hideInSearch: true,
      sorter: true,
    },
    {
      title: '反馈时间',
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
      title: '更新时间',
      dataIndex: 'updatedAt',
      width: 160,
      valueType: 'dateTime',
      search: false,
    },
    {
      title: '操作',
      width: 180,
      fixed: 'right',
      search: false,
      render: (_, record) => (
        <Space size={0} split={<span style={{ color: '#e8e8e8' }}>|</span>}>
          <a
            onClick={() => {
              setCurrentFeedback(record);
              setDetailDrawerVisible(true);
            }}
          >
            <EyeOutlined /> 查看
          </a>
          {record.status === 'pending' || record.status === 'processing' ? (
            <>
              <a
                onClick={() => {
                  setCurrentFeedback(record);
                  setReplyModalVisible(true);
                }}
                style={{ color: '#52c41a' }}
              >
                <CheckCircleOutlined /> 处理
              </a>
              <a
                onClick={() => {
                  setCurrentFeedback(record);
                  // 直接拒绝
                  message.success('已拒绝该反馈');
                  actionRef.current?.reload();
                }}
                style={{ color: '#ff4d4f' }}
              >
                <CloseCircleOutlined /> 拒绝
              </a>
            </>
          ) : (
            <span style={{ color: '#999' }}>已处理</span>
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
            <Statistic title="反馈总数" value={stats.total} suffix="条" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待处理"
              value={stats.pending}
              suffix="条"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="处理中"
              value={stats.processing}
              suffix="条"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已解决"
              value={stats.resolved}
              suffix="条"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 反馈列表 */}
      <ProTable<Feedback>
        columns={columns}
        actionRef={actionRef}
        request={async (params) => {
          // 模拟API请求
          await new Promise((resolve) => setTimeout(resolve, 500));

          let data = [...mockFeedbacks];

          // 搜索过滤
          if (params.title) {
            data = data.filter((item) =>
              item.title.includes(params.title as string),
            );
          }
          if (params.type) {
            data = data.filter((item) => item.type === params.type);
          }
          if (params.priority) {
            data = data.filter((item) => item.priority === params.priority);
          }
          if (params.status) {
            data = data.filter((item) => item.status === params.status);
          }
          if (params.username) {
            data = data.filter((item) =>
              item.username.includes(params.username as string),
            );
          }
          if (params.tenantName) {
            data = data.filter((item) =>
              item.tenantName.includes(params.tenantName as string),
            );
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
        scroll={{ x: 1600 }}
      />

      {/* 反馈详情抽屉 */}
      <Drawer
        title="反馈详情"
        width={720}
        open={detailDrawerVisible}
        onClose={() => {
          setDetailDrawerVisible(false);
          setCurrentFeedback(null);
        }}
      >
        {currentFeedback && (
          <div>
            <Card title="基本信息" size="small" style={{ marginBottom: 16 }}>
              <p>
                <strong>反馈ID：</strong>
                {currentFeedback.id}
              </p>
              <p>
                <strong>反馈标题：</strong>
                {currentFeedback.title}
              </p>
              <p>
                <strong>反馈类型：</strong>
                <Tag
                  color={
                    currentFeedback.type === 'bug'
                      ? 'red'
                      : currentFeedback.type === 'feature'
                        ? 'blue'
                        : currentFeedback.type === 'improvement'
                          ? 'green'
                          : 'default'
                  }
                >
                  {currentFeedback.type === 'bug'
                    ? 'Bug'
                    : currentFeedback.type === 'feature'
                      ? '功能建议'
                      : currentFeedback.type === 'improvement'
                        ? '优化建议'
                        : '其他'}
                </Tag>
              </p>
              <p>
                <strong>优先级：</strong>
                <Tag
                  color={
                    currentFeedback.priority === 'urgent'
                      ? 'red'
                      : currentFeedback.priority === 'high'
                        ? 'orange'
                        : currentFeedback.priority === 'medium'
                          ? 'blue'
                          : 'default'
                  }
                >
                  {currentFeedback.priority === 'urgent'
                    ? '紧急'
                    : currentFeedback.priority === 'high'
                      ? '高'
                      : currentFeedback.priority === 'medium'
                        ? '中'
                        : '低'}
                </Tag>
              </p>
              <p>
                <strong>状态：</strong>
                <Badge
                  status={
                    currentFeedback.status === 'pending'
                      ? 'warning'
                      : currentFeedback.status === 'processing'
                        ? 'processing'
                        : currentFeedback.status === 'resolved'
                          ? 'success'
                          : 'default'
                  }
                  text={
                    currentFeedback.status === 'pending'
                      ? '待处理'
                      : currentFeedback.status === 'processing'
                        ? '处理中'
                        : currentFeedback.status === 'resolved'
                          ? '已解决'
                          : '已拒绝'
                  }
                />
              </p>
              <p>
                <strong>反馈用户：</strong>
                {currentFeedback.username}
              </p>
              <p>
                <strong>所属租户：</strong>
                {currentFeedback.tenantName}
              </p>
              <p>
                <strong>反馈时间：</strong>
                {currentFeedback.createdAt}
              </p>
            </Card>

            <Card title="反馈内容" size="small" style={{ marginBottom: 16 }}>
              <p style={{ whiteSpace: 'pre-wrap' }}>
                {currentFeedback.content}
              </p>
              {currentFeedback.images && currentFeedback.images.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <p>
                    <strong>附件图片：</strong>
                  </p>
                  <Image.PreviewGroup>
                    <Space>
                      {currentFeedback.images.map((img) => (
                        <Image
                          key={img}
                          width={100}
                          height={100}
                          src={img}
                          style={{ objectFit: 'cover' }}
                        />
                      ))}
                    </Space>
                  </Image.PreviewGroup>
                </div>
              )}
            </Card>

            {currentFeedback.reply && (
              <Card title="处理回复" size="small">
                <p style={{ whiteSpace: 'pre-wrap' }}>
                  {currentFeedback.reply}
                </p>
                <p style={{ color: '#999', marginTop: 8 }}>
                  回复人：{currentFeedback.repliedBy} | 回复时间：
                  {currentFeedback.repliedAt}
                </p>
              </Card>
            )}

            {(currentFeedback.status === 'pending' ||
              currentFeedback.status === 'processing') && (
              <div style={{ marginTop: 16, textAlign: 'center' }}>
                <Space>
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    onClick={() => {
                      setDetailDrawerVisible(false);
                      setReplyModalVisible(true);
                    }}
                  >
                    处理反馈
                  </Button>
                  <Button
                    danger
                    icon={<CloseCircleOutlined />}
                    onClick={() => {
                      message.success('已拒绝该反馈');
                      setDetailDrawerVisible(false);
                      actionRef.current?.reload();
                    }}
                  >
                    拒绝反馈
                  </Button>
                </Space>
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* 处理反馈弹窗 */}
      <ModalForm
        title="处理反馈"
        open={replyModalVisible}
        onOpenChange={setReplyModalVisible}
        onFinish={async (values) => {
          console.log('处理反馈:', values);
          message.success('处理成功');
          setReplyModalVisible(false);
          setCurrentFeedback(null);
          actionRef.current?.reload();
          return true;
        }}
        width={600}
      >
        <ProFormSelect
          name="action"
          label="处理方式"
          placeholder="请选择处理方式"
          rules={[{ required: true, message: '请选择处理方式' }]}
          options={[
            { label: '标记为处理中', value: 'processing' },
            { label: '标记为已解决', value: 'resolved' },
            { label: '拒绝反馈', value: 'rejected' },
          ]}
        />
        <ProFormTextArea
          name="reply"
          label="回复内容"
          placeholder="请输入回复内容"
          fieldProps={{ rows: 6 }}
          rules={[{ required: true, message: '请输入回复内容' }]}
        />
      </ModalForm>
    </PageContainer>
  );
};

export default FeedbackPage;
