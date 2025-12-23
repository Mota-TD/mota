import { useState } from 'react'
import { Card, Row, Col, Statistic, Progress, Table, Select, DatePicker, Space, Typography, Tag, Tabs } from 'antd'
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  RiseOutlined,
  FallOutlined,
  BugOutlined,
  ExclamationCircleOutlined,
  FireOutlined
} from '@ant-design/icons'
import styles from './index.module.css'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

/**
 * 任务分析页面
 * 提供任务的数据分析功能
 */
const TaskAnalytics = () => {
  const [selectedProject, setSelectedProject] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('overview')

  // 模拟项目列表
  const projectOptions = [
    { value: 'all', label: '全部项目' },
    { value: '1', label: '摩塔项目管理系统' },
    { value: '2', label: '企业官网重构' },
    { value: '3', label: '移动端App开发' },
  ]

  // 任务概览统计数据
  const overviewStats = {
    totalTasks: 256,
    completedTasks: 189,
    inProgressTasks: 45,
    pendingTasks: 22,
    overdueTask: 8,
    avgCompletionTime: 3.5,
    completionRate: 73.8,
    onTimeRate: 85.2,
  }

  // 任务类型分布
  const taskTypeDistribution = [
    { type: '需求', count: 85, color: '#2b7de9' },
    { type: '缺陷', count: 42, color: '#ff4d4f' },
    { type: '任务', count: 98, color: '#52c41a' },
    { type: '优化', count: 31, color: '#faad14' },
  ]

  // 任务优先级分布
  const priorityDistribution = [
    { priority: '最高', count: 15, color: '#ff4d4f' },
    { priority: '高', count: 45, color: '#fa8c16' },
    { priority: '中', count: 120, color: '#faad14' },
    { priority: '低', count: 56, color: '#52c41a' },
    { priority: '最低', count: 20, color: '#8c8c8c' },
  ]

  // 成员任务完成情况
  const memberTaskData = [
    { key: '1', name: '张三', assigned: 12, completed: 10, inProgress: 2, overdue: 0, efficiency: 95 },
    { key: '2', name: '李四', assigned: 15, completed: 12, inProgress: 2, overdue: 1, efficiency: 88 },
    { key: '3', name: '王五', assigned: 8, completed: 7, inProgress: 1, overdue: 0, efficiency: 92 },
    { key: '4', name: '赵六', assigned: 10, completed: 6, inProgress: 2, overdue: 2, efficiency: 75 },
    { key: '5', name: '钱七', assigned: 18, completed: 15, inProgress: 3, overdue: 0, efficiency: 90 },
  ]

  // 每周任务趋势
  const weeklyTrend = [
    { week: '第1周', created: 28, completed: 23, overdue: 2 },
    { week: '第2周', created: 25, completed: 31, overdue: 1 },
    { week: '第3周', created: 32, completed: 28, overdue: 3 },
    { week: '第4周', created: 30, completed: 35, overdue: 1 },
  ]

  // 成员任务表格列
  const memberColumns = [
    {
      title: '成员',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Space>
          <TeamOutlined style={{ color: '#2b7de9' }} />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: '分配任务',
      dataIndex: 'assigned',
      key: 'assigned',
    },
    {
      title: '已完成',
      dataIndex: 'completed',
      key: 'completed',
      render: (completed: number) => (
        <Text style={{ color: '#52c41a' }}>{completed}</Text>
      ),
    },
    {
      title: '进行中',
      dataIndex: 'inProgress',
      key: 'inProgress',
      render: (inProgress: number) => (
        <Text style={{ color: '#faad14' }}>{inProgress}</Text>
      ),
    },
    {
      title: '已逾期',
      dataIndex: 'overdue',
      key: 'overdue',
      render: (overdue: number) => (
        <Text style={{ color: overdue > 0 ? '#ff4d4f' : '#8c8c8c' }}>{overdue}</Text>
      ),
    },
    {
      title: '效率',
      dataIndex: 'efficiency',
      key: 'efficiency',
      render: (efficiency: number) => (
        <Space>
          <Progress 
            type="circle" 
            percent={efficiency} 
            size={36}
            strokeColor={efficiency >= 90 ? '#52c41a' : efficiency >= 75 ? '#faad14' : '#ff4d4f'}
          />
          {efficiency >= 90 ? (
            <RiseOutlined style={{ color: '#52c41a' }} />
          ) : efficiency < 75 ? (
            <FallOutlined style={{ color: '#ff4d4f' }} />
          ) : null}
        </Space>
      ),
    },
  ]

  const tabItems = [
    {
      key: 'overview',
      label: '概览',
      children: (
        <div className={styles.tabContent}>
          {/* 统计卡片 */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Card className={styles.statCard}>
                <Statistic
                  title="任务总数"
                  value={overviewStats.totalTasks}
                  prefix={<BugOutlined style={{ color: '#2b7de9' }} />}
                  suffix={<Text type="secondary" style={{ fontSize: 14 }}>个</Text>}
                />
                <div className={styles.statExtra}>
                  <Text type="secondary">本周新增: 30</Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className={styles.statCard}>
                <Statistic
                  title="完成率"
                  value={overviewStats.completionRate}
                  prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                  suffix={<Text type="secondary" style={{ fontSize: 14 }}>%</Text>}
                  precision={1}
                />
                <div className={styles.statExtra}>
                  <RiseOutlined style={{ color: '#52c41a' }} />
                  <Text type="secondary"> 较上周 +5.2%</Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className={styles.statCard}>
                <Statistic
                  title="按时完成率"
                  value={overviewStats.onTimeRate}
                  prefix={<ClockCircleOutlined style={{ color: '#722ed1' }} />}
                  suffix={<Text type="secondary" style={{ fontSize: 14 }}>%</Text>}
                  precision={1}
                />
                <div className={styles.statExtra}>
                  <Text type="secondary">逾期任务: {overviewStats.overdueTask}</Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className={styles.statCard}>
                <Statistic
                  title="平均完成时间"
                  value={overviewStats.avgCompletionTime}
                  prefix={<FireOutlined style={{ color: '#fa8c16' }} />}
                  suffix={<Text type="secondary" style={{ fontSize: 14 }}>天</Text>}
                  precision={1}
                />
                <div className={styles.statExtra}>
                  <FallOutlined style={{ color: '#52c41a' }} />
                  <Text type="secondary"> 较上周 -0.5天</Text>
                </div>
              </Card>
            </Col>
          </Row>

          {/* 任务状态和类型分布 */}
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24} lg={12}>
              <Card title="任务状态分布" className={styles.chartCard}>
                <Row gutter={16}>
                  <Col span={8}>
                    <div className={styles.statusItem}>
                      <Progress
                        type="circle"
                        percent={Math.round((overviewStats.completedTasks / overviewStats.totalTasks) * 100)}
                        strokeColor="#52c41a"
                        size={80}
                      />
                      <div className={styles.statusLabel}>
                        <Text strong>{overviewStats.completedTasks}</Text>
                        <Text type="secondary">已完成</Text>
                      </div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div className={styles.statusItem}>
                      <Progress
                        type="circle"
                        percent={Math.round((overviewStats.inProgressTasks / overviewStats.totalTasks) * 100)}
                        strokeColor="#2b7de9"
                        size={80}
                      />
                      <div className={styles.statusLabel}>
                        <Text strong>{overviewStats.inProgressTasks}</Text>
                        <Text type="secondary">进行中</Text>
                      </div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div className={styles.statusItem}>
                      <Progress
                        type="circle"
                        percent={Math.round((overviewStats.pendingTasks / overviewStats.totalTasks) * 100)}
                        strokeColor="#faad14"
                        size={80}
                      />
                      <div className={styles.statusLabel}>
                        <Text strong>{overviewStats.pendingTasks}</Text>
                        <Text type="secondary">待处理</Text>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="任务类型分布" className={styles.chartCard}>
                <div className={styles.typeDistribution}>
                  {taskTypeDistribution.map((item) => (
                    <div key={item.type} className={styles.typeItem}>
                      <div className={styles.typeHeader}>
                        <Tag color={item.color}>{item.type}</Tag>
                        <Text strong>{item.count}</Text>
                      </div>
                      <Progress
                        percent={Math.round((item.count / overviewStats.totalTasks) * 100)}
                        strokeColor={item.color}
                        showInfo={false}
                        size="small"
                      />
                    </div>
                  ))}
                </div>
              </Card>
            </Col>
          </Row>

          {/* 优先级分布 */}
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24}>
              <Card title="任务优先级分布" className={styles.chartCard}>
                <div className={styles.priorityDistribution}>
                  {priorityDistribution.map((item) => (
                    <div key={item.priority} className={styles.priorityItem}>
                      <div className={styles.priorityHeader}>
                        <span className={styles.priorityDot} style={{ backgroundColor: item.color }} />
                        <Text>{item.priority}</Text>
                        <Text strong style={{ marginLeft: 'auto' }}>{item.count}</Text>
                      </div>
                      <Progress
                        percent={Math.round((item.count / overviewStats.totalTasks) * 100)}
                        strokeColor={item.color}
                        showInfo={false}
                        size="small"
                      />
                    </div>
                  ))}
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      ),
    },
    {
      key: 'members',
      label: '成员分析',
      children: (
        <div className={styles.tabContent}>
          <Card title="成员任务完成情况" className={styles.tableCard}>
            <Table
              columns={memberColumns}
              dataSource={memberTaskData}
              pagination={false}
            />
          </Card>
        </div>
      ),
    },
    {
      key: 'trends',
      label: '趋势分析',
      children: (
        <div className={styles.tabContent}>
          <Card title="每周任务趋势" className={styles.chartCard}>
            <div className={styles.trendChart}>
              <Row gutter={16}>
                {weeklyTrend.map((item) => (
                  <Col key={item.week} span={6}>
                    <div className={styles.trendItem}>
                      <Text strong>{item.week}</Text>
                      <div className={styles.trendBars}>
                        <div className={styles.trendBar}>
                          <div 
                            className={styles.barFill} 
                            style={{ 
                              height: `${(item.completed / 40) * 100}%`,
                              backgroundColor: '#52c41a'
                            }}
                          />
                          <Text type="secondary" style={{ fontSize: 12 }}>完成 {item.completed}</Text>
                        </div>
                        <div className={styles.trendBar}>
                          <div 
                            className={styles.barFill} 
                            style={{ 
                              height: `${(item.created / 40) * 100}%`,
                              backgroundColor: '#2b7de9'
                            }}
                          />
                          <Text type="secondary" style={{ fontSize: 12 }}>新建 {item.created}</Text>
                        </div>
                        <div className={styles.trendBar}>
                          <div 
                            className={styles.barFill} 
                            style={{ 
                              height: `${(item.overdue / 10) * 100}%`,
                              backgroundColor: '#ff4d4f'
                            }}
                          />
                          <Text type="secondary" style={{ fontSize: 12 }}>逾期 {item.overdue}</Text>
                        </div>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </div>
          </Card>
        </div>
      ),
    },
  ]

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Title level={4} style={{ margin: 0 }}>任务分析</Title>
          <Text type="secondary">查看任务的数据分析报告</Text>
        </div>
        <div className={styles.headerRight}>
          <Space>
            <Select
              value={selectedProject}
              onChange={setSelectedProject}
              options={projectOptions}
              style={{ width: 180 }}
              placeholder="选择项目"
            />
            <RangePicker placeholder={['开始日期', '结束日期']} />
          </Space>
        </div>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        className={styles.tabs}
      />
    </div>
  )
}

export default TaskAnalytics