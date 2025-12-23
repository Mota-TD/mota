import { useState } from 'react'
import { Card, Row, Col, Statistic, Progress, Table, Select, DatePicker, Space, Typography, Tag, Tabs, Empty } from 'antd'
import {
  ProjectOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  RiseOutlined,
  FallOutlined,
  BugOutlined,
  CalendarOutlined
} from '@ant-design/icons'
import styles from './index.module.css'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

/**
 * 项目分析页面
 * 提供项目和任务的数据分析功能
 */
const Analytics = () => {
  const [selectedProject, setSelectedProject] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('overview')

  // 模拟项目列表
  const projectOptions = [
    { value: 'all', label: '全部项目' },
    { value: '1', label: '摩塔项目管理系统' },
    { value: '2', label: '企业官网重构' },
    { value: '3', label: '移动端App开发' },
  ]

  // 项目概览统计数据
  const overviewStats = {
    totalProjects: 12,
    activeProjects: 8,
    totalTasks: 256,
    completedTasks: 189,
    inProgressTasks: 45,
    pendingTasks: 22,
    totalMembers: 24,
    avgCompletionRate: 73.8,
  }

  // 任务完成趋势数据
  const taskTrendData = [
    { week: '第1周', completed: 23, created: 28 },
    { week: '第2周', completed: 31, created: 25 },
    { week: '第3周', completed: 28, created: 32 },
    { week: '第4周', completed: 35, created: 30 },
  ]

  // 项目进度数据
  const projectProgressData = [
    { key: '1', name: '摩塔项目管理系统', progress: 75, status: 'active', tasks: 45, completed: 34 },
    { key: '2', name: '企业官网重构', progress: 92, status: 'active', tasks: 28, completed: 26 },
    { key: '3', name: '移动端App开发', progress: 45, status: 'active', tasks: 62, completed: 28 },
    { key: '4', name: '数据分析平台', progress: 100, status: 'completed', tasks: 38, completed: 38 },
    { key: '5', name: 'API网关升级', progress: 60, status: 'active', tasks: 20, completed: 12 },
  ]

  // 成员工作量数据
  const memberWorkloadData = [
    { key: '1', name: '张三', assigned: 12, completed: 10, inProgress: 2, efficiency: 95 },
    { key: '2', name: '李四', assigned: 15, completed: 12, inProgress: 3, efficiency: 88 },
    { key: '3', name: '王五', assigned: 8, completed: 7, inProgress: 1, efficiency: 92 },
    { key: '4', name: '赵六', assigned: 10, completed: 6, inProgress: 4, efficiency: 75 },
    { key: '5', name: '钱七', assigned: 18, completed: 15, inProgress: 3, efficiency: 90 },
  ]

  // 任务类型分布
  const taskTypeDistribution = [
    { type: '需求', count: 85, color: '#2b7de9' },
    { type: '缺陷', count: 42, color: '#ff4d4f' },
    { type: '任务', count: 98, color: '#52c41a' },
    { type: '优化', count: 31, color: '#faad14' },
  ]

  // 项目进度表格列
  const projectColumns = [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Space>
          <ProjectOutlined style={{ color: '#2b7de9' }} />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => (
        <Progress 
          percent={progress} 
          size="small" 
          status={progress === 100 ? 'success' : 'active'}
          strokeColor={progress === 100 ? '#52c41a' : '#2b7de9'}
        />
      ),
    },
    {
      title: '任务数',
      dataIndex: 'tasks',
      key: 'tasks',
      render: (tasks: number, record: any) => (
        <Text>{record.completed}/{tasks}</Text>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'completed' ? 'success' : 'processing'}>
          {status === 'completed' ? '已完成' : '进行中'}
        </Tag>
      ),
    },
  ]

  // 成员工作量表格列
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
                  title="项目总数"
                  value={overviewStats.totalProjects}
                  prefix={<ProjectOutlined style={{ color: '#2b7de9' }} />}
                  suffix={<Text type="secondary" style={{ fontSize: 14 }}>个</Text>}
                />
                <div className={styles.statExtra}>
                  <Text type="secondary">活跃项目: {overviewStats.activeProjects}</Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className={styles.statCard}>
                <Statistic
                  title="任务总数"
                  value={overviewStats.totalTasks}
                  prefix={<BugOutlined style={{ color: '#52c41a' }} />}
                  suffix={<Text type="secondary" style={{ fontSize: 14 }}>个</Text>}
                />
                <div className={styles.statExtra}>
                  <Text type="secondary">已完成: {overviewStats.completedTasks}</Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className={styles.statCard}>
                <Statistic
                  title="团队成员"
                  value={overviewStats.totalMembers}
                  prefix={<TeamOutlined style={{ color: '#722ed1' }} />}
                  suffix={<Text type="secondary" style={{ fontSize: 14 }}>人</Text>}
                />
                <div className={styles.statExtra}>
                  <Text type="secondary">本周活跃: 22</Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className={styles.statCard}>
                <Statistic
                  title="平均完成率"
                  value={overviewStats.avgCompletionRate}
                  prefix={<CheckCircleOutlined style={{ color: '#13c2c2' }} />}
                  suffix={<Text type="secondary" style={{ fontSize: 14 }}>%</Text>}
                  precision={1}
                />
                <div className={styles.statExtra}>
                  <RiseOutlined style={{ color: '#52c41a' }} />
                  <Text type="secondary"> 较上周 +5.2%</Text>
                </div>
              </Card>
            </Col>
          </Row>

          {/* 任务状态分布 */}
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
        </div>
      ),
    },
    {
      key: 'projects',
      label: '项目进度',
      children: (
        <div className={styles.tabContent}>
          <Card title="项目进度详情" className={styles.tableCard}>
            <Table
              columns={projectColumns}
              dataSource={projectProgressData}
              pagination={false}
            />
          </Card>
        </div>
      ),
    },
    {
      key: 'members',
      label: '成员分析',
      children: (
        <div className={styles.tabContent}>
          <Card title="成员工作量分析" className={styles.tableCard}>
            <Table
              columns={memberColumns}
              dataSource={memberWorkloadData}
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
          <Card title="任务完成趋势" className={styles.chartCard}>
            <div className={styles.trendChart}>
              <Row gutter={16}>
                {taskTrendData.map((item) => (
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
          <Title level={4} style={{ margin: 0 }}>项目分析</Title>
          <Text type="secondary">查看项目和任务的数据分析报告</Text>
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

export default Analytics