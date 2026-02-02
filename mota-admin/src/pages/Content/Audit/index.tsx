import { CheckCircleOutlined, EyeOutlined } from '@ant-design/icons';
import type { ActionType } from '@ant-design/pro-components';
import {
  ModalForm,
  PageContainer,
  type ProColumns,
  ProFormRadio,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import {
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
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
 * 审核内容数据类型
 */
interface AuditContent {
  id: number;
  type: 'news' | 'comment' | 'feedback' | 'template';
  title: string;
  content: string;
  images?: string[];
  submitter: string;
  submitterTenant: string;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string; // 审核意见
  reviewer?: string; // 审核人
  reviewedAt?: string; // 审核时间
  submittedAt: string;
  updatedAt: string;
}

/**
 * 内容审核页面
 * 待审核列表、审核操作、审核记录等功能
 */
const AuditPage: React.FC = () => {
  const actionRef = useRef<ActionType>(null);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [auditModalVisible, setAuditModalVisible] = useState(false);
  const [currentContent, setCurrentContent] = useState<AuditContent | null>(
    null,
  );

  // 模拟审核内容数据
  const mockAuditContents: AuditContent[] = [
    {
      id: 1,
      type: 'news',
      title: '企业AI应用实践分享',
      content:
        '本文介绍了我们公司在AI应用方面的实践经验，包括技术选型、实施过程和效果评估等内容...',
      images: [
        'https://gw.alipayobjects.com/zos/antfincdn/LlvErxo8H9/photo-1503185912284-5271ff81b9a8.webp',
      ],
      submitter: '张三',
      submitterTenant: '阿里巴巴集团',
      status: 'pending',
      submittedAt: '2024-02-01 10:30:00',
      updatedAt: '2024-02-01 10:30:00',
    },
    {
      id: 2,
      type: 'comment',
      title: '用户评论：关于新功能的建议',
      content:
        '新版本的AI对话功能体验很好，但建议增加历史记录搜索功能，方便查找之前的对话内容。',
      submitter: '李四',
      submitterTenant: '腾讯科技',
      status: 'pending',
      submittedAt: '2024-02-01 09:15:00',
      updatedAt: '2024-02-01 09:15:00',
    },
    {
      id: 3,
      type: 'template',
      title: '销售话术模板',
      content:
        '尊敬的{{customer_name}}，感谢您对我们产品的关注。{{product_name}}能够帮助您{{benefit}}...',
      submitter: '王五',
      submitterTenant: '字节跳动',
      status: 'approved',
      reason: '内容规范，符合审核标准，已通过审核。',
      reviewer: '审核员A',
      reviewedAt: '2024-02-01 11:00:00',
      submittedAt: '2024-02-01 08:30:00',
      updatedAt: '2024-02-01 11:00:00',
    },
    {
      id: 4,
      type: 'feedback',
      title: '产品功能改进建议',
      content:
        '希望能够支持批量导入数据，目前只能单条添加，效率较低。另外建议增加数据导出模板功能。',
      submitter: '赵六',
      submitterTenant: '百度公司',
      status: 'approved',
      reason: '建议合理，已转交产品团队评估。',
      reviewer: '审核员B',
      reviewedAt: '2024-01-31 16:30:00',
      submittedAt: '2024-01-31 14:00:00',
      updatedAt: '2024-01-31 16:30:00',
    },
    {
      id: 5,
      type: 'news',
      title: '不当内容标题',
      content: '包含不当信息的内容...',
      submitter: '匿名用户',
      submitterTenant: '测试租户',
      status: 'rejected',
      reason: '内容违反平台规范，包含不当信息，不予通过。',
      reviewer: '审核员C',
      reviewedAt: '2024-01-31 10:00:00',
      submittedAt: '2024-01-31 09:00:00',
      updatedAt: '2024-01-31 10:00:00',
    },
    {
      id: 6,
      type: 'comment',
      title: '用户评论：产品体验反馈',
      content:
        '整体使用体验不错，AI响应速度快，回答准确。期待后续更新更多功能。',
      submitter: '孙七',
      submitterTenant: '美团',
      status: 'pending',
      submittedAt: '2024-02-01 15:00:00',
      updatedAt: '2024-02-01 15:00:00',
    },
  ];

  // 统计数据
  const stats = {
    total: mockAuditContents.length,
    pending: mockAuditContents.filter((c) => c.status === 'pending').length,
    approved: mockAuditContents.filter((c) => c.status === 'approved').length,
    rejected: mockAuditContents.filter((c) => c.status === 'rejected').length,
  };

  // 定义表格列
  const columns: ProColumns<AuditContent>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 60,
      search: false,
    },
    {
      title: '内容类型',
      dataIndex: 'type',
      width: 100,
      valueType: 'select',
      valueEnum: {
        news: { text: '新闻', status: 'Processing' },
        comment: { text: '评论', status: 'Default' },
        feedback: { text: '反馈', status: 'Warning' },
        template: { text: '模板', status: 'Success' },
      },
      render: (_, record) => {
        const typeConfig = {
          news: { color: 'blue', text: '新闻' },
          comment: { color: 'default', text: '评论' },
          feedback: { color: 'orange', text: '反馈' },
          template: { color: 'green', text: '模板' },
        };
        const config = typeConfig[record.type];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '标题',
      dataIndex: 'title',
      width: 250,
      ellipsis: true,
      render: (_, record) => (
        <a
          onClick={() => {
            setCurrentContent(record);
            setDetailDrawerVisible(true);
          }}
        >
          {record.title}
        </a>
      ),
    },
    {
      title: '内容摘要',
      dataIndex: 'content',
      width: 300,
      search: false,
      ellipsis: true,
    },
    {
      title: '提交人',
      dataIndex: 'submitter',
      width: 100,
    },
    {
      title: '所属租户',
      dataIndex: 'submitterTenant',
      width: 150,
      ellipsis: true,
    },
    {
      title: '审核状态',
      dataIndex: 'status',
      width: 110,
      valueType: 'select',
      valueEnum: {
        pending: { text: '待审核', status: 'Warning' },
        approved: { text: '已通过', status: 'Success' },
        rejected: { text: '已拒绝', status: 'Error' },
      },
      render: (_, record) => {
        const statusConfig = {
          pending: { color: 'warning', text: '待审核' },
          approved: { color: 'success', text: '已通过' },
          rejected: { color: 'error', text: '已拒绝' },
        };
        const config = statusConfig[record.status];
        return <Badge status={config.color as any} text={config.text} />;
      },
    },
    {
      title: '审核人',
      dataIndex: 'reviewer',
      width: 100,
      search: false,
      render: (_, record) => record.reviewer || '-',
    },
    {
      title: '审核时间',
      dataIndex: 'reviewedAt',
      width: 160,
      valueType: 'dateTime',
      search: false,
      render: (_, record) => record.reviewedAt || '-',
    },
    {
      title: '提交时间',
      dataIndex: 'submittedAt',
      width: 160,
      valueType: 'dateTime',
      hideInSearch: true,
      sorter: true,
    },
    {
      title: '提交时间',
      dataIndex: 'submittedAt',
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
      width: 200,
      fixed: 'right',
      search: false,
      render: (_, record) => (
        <Space size={0} split={<span style={{ color: '#e8e8e8' }}>|</span>}>
          <a
            onClick={() => {
              setCurrentContent(record);
              setDetailDrawerVisible(true);
            }}
          >
            <EyeOutlined /> 查看
          </a>
          {record.status === 'pending' ? (
            <a
              onClick={() => {
                setCurrentContent(record);
                setAuditModalVisible(true);
              }}
              style={{ color: '#52c41a' }}
            >
              <CheckCircleOutlined /> 审核
            </a>
          ) : (
            <span style={{ color: '#999' }}>已审核</span>
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
            <Statistic
              title="待审核"
              value={stats.pending}
              suffix="条"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已通过"
              value={stats.approved}
              suffix="条"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已拒绝"
              value={stats.rejected}
              suffix="条"
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="总数" value={stats.total} suffix="条" />
          </Card>
        </Col>
      </Row>

      {/* 审核列表 */}
      <ProTable<AuditContent>
        columns={columns}
        actionRef={actionRef}
        request={async (params) => {
          // 模拟API请求
          await new Promise((resolve) => setTimeout(resolve, 500));

          let data = [...mockAuditContents];

          // 搜索过滤
          if (params.title) {
            data = data.filter((item) =>
              item.title.includes(params.title as string),
            );
          }
          if (params.type) {
            data = data.filter((item) => item.type === params.type);
          }
          if (params.status) {
            data = data.filter((item) => item.status === params.status);
          }
          if (params.submitter) {
            data = data.filter((item) =>
              item.submitter.includes(params.submitter as string),
            );
          }
          if (params.submitterTenant) {
            data = data.filter((item) =>
              item.submitterTenant.includes(params.submitterTenant as string),
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

      {/* 内容详情抽屉 */}
      <Drawer
        title="审核内容详情"
        width={720}
        open={detailDrawerVisible}
        onClose={() => {
          setDetailDrawerVisible(false);
          setCurrentContent(null);
        }}
        extra={
          currentContent?.status === 'pending' && (
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => {
                setDetailDrawerVisible(false);
                setAuditModalVisible(true);
              }}
            >
              开始审核
            </Button>
          )
        }
      >
        {currentContent && (
          <div>
            <Card title="基本信息" size="small" style={{ marginBottom: 16 }}>
              <Descriptions column={2} size="small">
                <Descriptions.Item label="内容ID">
                  {currentContent.id}
                </Descriptions.Item>
                <Descriptions.Item label="内容类型">
                  <Tag
                    color={
                      currentContent.type === 'news'
                        ? 'blue'
                        : currentContent.type === 'comment'
                          ? 'default'
                          : currentContent.type === 'feedback'
                            ? 'orange'
                            : 'green'
                    }
                  >
                    {currentContent.type === 'news'
                      ? '新闻'
                      : currentContent.type === 'comment'
                        ? '评论'
                        : currentContent.type === 'feedback'
                          ? '反馈'
                          : '模板'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="提交人">
                  {currentContent.submitter}
                </Descriptions.Item>
                <Descriptions.Item label="所属租户">
                  {currentContent.submitterTenant}
                </Descriptions.Item>
                <Descriptions.Item label="提交时间">
                  {currentContent.submittedAt}
                </Descriptions.Item>
                <Descriptions.Item label="审核状态">
                  <Badge
                    status={
                      currentContent.status === 'pending'
                        ? 'warning'
                        : currentContent.status === 'approved'
                          ? 'success'
                          : 'error'
                    }
                    text={
                      currentContent.status === 'pending'
                        ? '待审核'
                        : currentContent.status === 'approved'
                          ? '已通过'
                          : '已拒绝'
                    }
                  />
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="内容详情" size="small" style={{ marginBottom: 16 }}>
              <p>
                <strong>标题：</strong>
                {currentContent.title}
              </p>
              <p>
                <strong>内容：</strong>
              </p>
              <div
                style={{
                  padding: 12,
                  background: '#f5f5f5',
                  borderRadius: 4,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {currentContent.content}
              </div>
              {currentContent.images && currentContent.images.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <p>
                    <strong>附件图片：</strong>
                  </p>
                  <Image.PreviewGroup>
                    <Space>
                      {currentContent.images.map((img) => (
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

            {currentContent.status !== 'pending' && (
              <Card title="审核结果" size="small">
                <p>
                  <strong>审核人：</strong>
                  {currentContent.reviewer}
                </p>
                <p>
                  <strong>审核时间：</strong>
                  {currentContent.reviewedAt}
                </p>
                <p>
                  <strong>审核意见：</strong>
                </p>
                <div
                  style={{
                    padding: 12,
                    background: '#f5f5f5',
                    borderRadius: 4,
                  }}
                >
                  {currentContent.reason}
                </div>
              </Card>
            )}
          </div>
        )}
      </Drawer>

      {/* 审核弹窗 */}
      <ModalForm
        title="内容审核"
        open={auditModalVisible}
        onOpenChange={setAuditModalVisible}
        onFinish={async (values) => {
          console.log('审核结果:', values);
          message.success(
            values.result === 'approved' ? '审核通过' : '审核拒绝',
          );
          setAuditModalVisible(false);
          setCurrentContent(null);
          actionRef.current?.reload();
          return true;
        }}
        width={600}
      >
        {currentContent && (
          <>
            <div
              style={{
                marginBottom: 16,
                padding: 12,
                background: '#f5f5f5',
                borderRadius: 4,
              }}
            >
              <p>
                <strong>标题：</strong>
                {currentContent.title}
              </p>
              <p>
                <strong>内容：</strong>
                {currentContent.content.substring(0, 100)}...
              </p>
            </div>
            <ProFormRadio.Group
              name="result"
              label="审核结果"
              rules={[{ required: true, message: '请选择审核结果' }]}
              options={[
                { label: '通过', value: 'approved' },
                { label: '拒绝', value: 'rejected' },
              ]}
            />
            <ProFormTextArea
              name="reason"
              label="审核意见"
              placeholder="请输入审核意见"
              fieldProps={{ rows: 4 }}
              rules={[{ required: true, message: '请输入审核意见' }]}
            />
          </>
        )}
      </ModalForm>
    </PageContainer>
  );
};

export default AuditPage;
