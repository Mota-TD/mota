'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Typography,
  Input,
  Button,
  Space,
  Row,
  Col,
  Empty,
  Tag,
  Avatar,
  List,
  Tabs,
  Modal,
  message,
  Dropdown,
  DatePicker,
  Select,
  Spin,
} from 'antd';
import {
  HistoryOutlined,
  SearchOutlined,
  DeleteOutlined,
  EyeOutlined,
  MoreOutlined,
  RobotOutlined,
  FilePptOutlined,
  BulbOutlined,
  FileTextOutlined,
  CalendarOutlined,
  StarOutlined,
  StarFilled,
  ExportOutlined,
  CopyOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { aiService, type AIHistory } from '@/services';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

// 统一主题色 - 薄荷绿
const THEME_COLOR = '#10B981';

export default function AIHistoryPage() {
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | undefined>();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState<AIHistory[]>([]);

  // 获取历史记录
  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await aiService.getAIHistory();
      setHistoryData(data);
    } catch (error) {
      console.error('Failed to fetch AI history:', error);
      setHistoryData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const getTypeConfig = (type: string) => {
    const configs: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
      proposal: { icon: <BulbOutlined />, color: '#10B981', label: '方案生成' },
      ppt: { icon: <FilePptOutlined />, color: '#3B82F6', label: 'PPT生成' },
      chat: { icon: <RobotOutlined />, color: '#8B5CF6', label: 'AI对话' },
      knowledge: { icon: <FileTextOutlined />, color: '#F59E0B', label: '知识库查询' },
    };
    return configs[type] || { icon: <HistoryOutlined />, color: '#64748B', label: '其他' };
  };

  const handleToggleStar = async (id: string) => {
    try {
      await aiService.toggleHistoryStar(id);
      message.success('收藏状态已更新');
      fetchHistory();
    } catch (error) {
      console.error('Failed to toggle star:', error);
      message.error('操作失败');
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条历史记录吗？此操作不可恢复。',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await aiService.deleteHistory(id);
          message.success('已删除');
          fetchHistory();
        } catch (error) {
          console.error('Failed to delete history:', error);
          message.error('删除失败');
        }
      },
    });
  };

  const handleBatchDelete = () => {
    if (selectedItems.length === 0) {
      message.warning('请先选择要删除的记录');
      return;
    }
    Modal.confirm({
      title: '批量删除',
      content: `确定要删除选中的 ${selectedItems.length} 条记录吗？`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await Promise.all(selectedItems.map(id => aiService.deleteHistory(id)));
          message.success(`已删除 ${selectedItems.length} 条记录`);
          setSelectedItems([]);
          fetchHistory();
        } catch (error) {
          console.error('Failed to batch delete:', error);
          message.error('批量删除失败');
        }
      },
    });
  };

  const filteredHistory = historyData.filter((item) => {
    if (searchText && !item.title.includes(searchText) && !item.content.includes(searchText)) {
      return false;
    }
    if (typeFilter && item.type !== typeFilter) {
      return false;
    }
    return true;
  });

  const starredHistory = filteredHistory.filter((item) => item.starred);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
      </div>
    );
  }

  return (
    <div>
      {/* 页面头部 */}
      <div style={{
        background: `linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)`,
        borderRadius: 16,
        padding: '20px 24px',
        marginBottom: 24,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <HistoryOutlined style={{ fontSize: 24, color: '#fff' }} />
          </div>
          <div>
            <Title level={4} style={{ color: '#fff', margin: 0 }}>历史记录</Title>
            <Text style={{ color: 'rgba(255,255,255,0.8)' }}>查看和管理您的 AI 使用历史</Text>
          </div>
        </div>
        <Space>
          <Button
            icon={<ExportOutlined />}
            style={{ background: 'rgba(255,255,255,0.1)', borderColor: 'transparent', color: '#fff' }}
          >
            导出
          </Button>
          {selectedItems.length > 0 && (
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleBatchDelete}
            >
              删除选中 ({selectedItems.length})
            </Button>
          )}
        </Space>
      </div>

      {/* 筛选栏 */}
      <Card style={{ borderRadius: 12, marginBottom: 24 }}>
        <Space wrap>
          <Input
            placeholder="搜索历史记录"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 240 }}
            allowClear
          />
          <Select
            placeholder="类型筛选"
            value={typeFilter}
            onChange={setTypeFilter}
            style={{ width: 150 }}
            allowClear
            options={[
              { value: 'proposal', label: '方案生成' },
              { value: 'ppt', label: 'PPT生成' },
              { value: 'chat', label: 'AI对话' },
              { value: 'knowledge', label: '知识库查询' },
            ]}
          />
          <RangePicker placeholder={['开始日期', '结束日期']} />
        </Space>
      </Card>

      <Tabs
        defaultActiveKey="all"
        items={[
          {
            key: 'all',
            label: (
              <span>
                <HistoryOutlined /> 全部记录 ({filteredHistory.length})
              </span>
            ),
            children: (
              <Card style={{ borderRadius: 12 }}>
                {filteredHistory.length === 0 ? (
                  <Empty description="暂无历史记录" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                ) : (
                  <List
                    dataSource={filteredHistory}
                    renderItem={(item) => {
                      const typeConfig = getTypeConfig(item.type);
                      return (
                        <List.Item
                          actions={[
                            <Button
                              key="star"
                              type="text"
                              icon={item.starred ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
                              onClick={() => handleToggleStar(item.id)}
                            />,
                            <Button key="view" type="link" icon={<EyeOutlined />}>
                              查看
                            </Button>,
                            <Button key="copy" type="link" icon={<CopyOutlined />}>
                              复制
                            </Button>,
                            <Dropdown
                              key="more"
                              menu={{
                                items: [
                                  { key: 'export', label: '导出', icon: <ExportOutlined /> },
                                  { type: 'divider' },
                                  { key: 'delete', label: '删除', icon: <DeleteOutlined />, danger: true, onClick: () => handleDelete(item.id) },
                                ],
                              }}
                            >
                              <Button type="text" icon={<MoreOutlined />} />
                            </Dropdown>,
                          ]}
                        >
                          <List.Item.Meta
                            avatar={
                              <Avatar
                                size={48}
                                style={{ backgroundColor: typeConfig.color, borderRadius: 12 }}
                                icon={typeConfig.icon}
                              />
                            }
                            title={
                              <Space>
                                <Text strong>{item.title}</Text>
                                <Tag color={typeConfig.color}>{typeConfig.label}</Tag>
                              </Space>
                            }
                            description={
                              <div>
                                <Paragraph
                                  type="secondary"
                                  ellipsis={{ rows: 2 }}
                                  style={{ marginBottom: 8 }}
                                >
                                  {item.content}
                                </Paragraph>
                                <Space>
                                  <Text type="secondary" style={{ fontSize: 12 }}>
                                    <CalendarOutlined /> {item.createdAt}
                                  </Text>
                                  {item.tags?.map((tag) => (
                                    <Tag key={tag}>{tag}</Tag>
                                  ))}
                                </Space>
                              </div>
                            }
                          />
                        </List.Item>
                      );
                    }}
                  />
                )}
              </Card>
            ),
          },
          {
            key: 'starred',
            label: (
              <span>
                <StarOutlined /> 已收藏 ({starredHistory.length})
              </span>
            ),
            children: (
              <Card style={{ borderRadius: 12 }}>
                {starredHistory.length === 0 ? (
                  <Empty description="暂无收藏记录" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                ) : (
                  <List
                    dataSource={starredHistory}
                    renderItem={(item) => {
                      const typeConfig = getTypeConfig(item.type);
                      return (
                        <List.Item
                          actions={[
                            <Button
                              key="star"
                              type="text"
                              icon={<StarFilled style={{ color: '#faad14' }} />}
                              onClick={() => handleToggleStar(item.id)}
                            />,
                            <Button key="view" type="link" icon={<EyeOutlined />}>
                              查看
                            </Button>,
                          ]}
                        >
                          <List.Item.Meta
                            avatar={
                              <Avatar
                                size={48}
                                style={{ backgroundColor: typeConfig.color, borderRadius: 12 }}
                                icon={typeConfig.icon}
                              />
                            }
                            title={
                              <Space>
                                <Text strong>{item.title}</Text>
                                <Tag color={typeConfig.color}>{typeConfig.label}</Tag>
                              </Space>
                            }
                            description={
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                <CalendarOutlined /> {item.createdAt}
                              </Text>
                            }
                          />
                        </List.Item>
                      );
                    }}
                  />
                )}
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
}