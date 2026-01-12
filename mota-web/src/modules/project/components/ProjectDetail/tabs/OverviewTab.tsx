/**
 * 项目概览标签页
 */

import React from 'react'
import { Row, Col, Card, Progress, Statistic, Timeline, Empty, Tag, Avatar, Tooltip } from 'antd'
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  TeamOutlined,
  FlagOutlined,
  ApartmentOutlined,
  UserOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import type { Project, ProjectMember, Milestone } from '../../../types'
import type { DeptTaskStats, ProjectActivity } from '../types'
import styles from '../index.module.css'

export interface OverviewTabProps {
  project: Project
  members: ProjectMember[]
  milestones: Milestone[]
  deptTaskStats: DeptTaskStats
  activities: ProjectActivity[]
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  project,
  members,
  milestones,
  deptTaskStats,
  activities
}) => {
  // 计算项目进度
  const calculateProgress = () => {
    if (deptTaskStats.total === 0) return 0
    return Math.round((deptTaskStats.completed / deptTaskStats.total) * 100)
  }

  // 计算剩余天数
  const calculateRemainingDays = () => {
    if (!project.endDate) return null
    const end = dayjs(project.endDate)
    const now = dayjs()
    const diff = end.diff(now, 'day')
    return diff
  }

  const progress = calculateProgress()
  const remainingDays = calculateRemainingDays()

  // 获取活动图标
  const getActivityIcon = (type: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      task_created: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      task_completed: <CheckCircleOutlined style={{ color: '#1890ff' }} />,
      task_updated: <ClockCircleOutlined style={{ color: '#faad14' }} />,
      member_added: <TeamOutlined style={{ color: '#722ed1' }} />,
      milestone_created: <FlagOutlined style={{ color: '#eb2f96' }} />,
      milestone_completed: <FlagOutlined style={{ color: '#52c41a' }} />
    }
    return iconMap[type] || <ClockCircleOutlined />
  }

  // 获取里程碑状态颜色
  const getMilestoneStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      pending: 'default',
      in_progress: 'processing',
      completed: 'success',
      delayed: 'error'
    }
    return colorMap[status] || 'default'
  }

  return (
    <div className={styles.overviewTab}>
      {/* 统计卡片 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card className={styles.statCard}>
            <Statistic
              title="项目进度"
              value={progress}
              suffix="%"
              prefix={<Progress type="circle" percent={progress} size={40} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className={styles.statCard}>
            <Statistic
              title="部门任务"
              value={deptTaskStats.total}
              prefix={<ApartmentOutlined />}
              suffix={
                <span style={{ fontSize: 14, color: '#999' }}>
                  已完成 {deptTaskStats.completed}
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className={styles.statCard}>
            <Statistic
              title="团队成员"
              value={members.length}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className={styles.statCard}>
            <Statistic
              title={remainingDays !== null && remainingDays < 0 ? '已逾期' : '剩余天数'}
              value={remainingDays !== null ? Math.abs(remainingDays) : '-'}
              prefix={<ClockCircleOutlined />}
              valueStyle={{
                color: remainingDays !== null && remainingDays < 0 ? '#ff4d4f' : undefined
              }}
              suffix="天"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* 任务状态分布 */}
        <Col xs={24} md={12}>
          <Card title="任务状态分布" className={styles.chartCard}>
            <div className={styles.taskStatusGrid}>
              <div className={styles.taskStatusItem}>
                <div className={styles.taskStatusValue} style={{ color: '#1890ff' }}>
                  {deptTaskStats.inProgress}
                </div>
                <div className={styles.taskStatusLabel}>进行中</div>
              </div>
              <div className={styles.taskStatusItem}>
                <div className={styles.taskStatusValue} style={{ color: '#52c41a' }}>
                  {deptTaskStats.completed}
                </div>
                <div className={styles.taskStatusLabel}>已完成</div>
              </div>
              <div className={styles.taskStatusItem}>
                <div className={styles.taskStatusValue} style={{ color: '#faad14' }}>
                  {deptTaskStats.pending}
                </div>
                <div className={styles.taskStatusLabel}>待处理</div>
              </div>
              <div className={styles.taskStatusItem}>
                <div className={styles.taskStatusValue} style={{ color: '#ff4d4f' }}>
                  {deptTaskStats.overdue}
                </div>
                <div className={styles.taskStatusLabel}>已逾期</div>
              </div>
            </div>
            <Progress
              percent={progress}
              success={{ percent: Math.round((deptTaskStats.completed / Math.max(deptTaskStats.total, 1)) * 100) }}
              strokeColor="#1890ff"
              trailColor="#f0f0f0"
            />
          </Card>
        </Col>

        {/* 里程碑进度 */}
        <Col xs={24} md={12}>
          <Card title="里程碑进度" className={styles.chartCard}>
            {milestones.length === 0 ? (
              <Empty description="暂无里程碑" />
            ) : (
              <Timeline
                items={milestones.slice(0, 5).map(milestone => ({
                  color: getMilestoneStatusColor(milestone.status),
                  dot: milestone.status === 'completed' ? <CheckCircleOutlined /> : undefined,
                  children: (
                    <div className={styles.milestoneItem}>
                      <div className={styles.milestoneName}>
                        {milestone.name}
                        <Tag color={getMilestoneStatusColor(milestone.status)} style={{ marginLeft: 8 }}>
                          {milestone.status === 'completed' ? '已完成' :
                           milestone.status === 'in_progress' ? '进行中' :
                           milestone.status === 'overdue' ? '已逾期' : '待开始'}
                        </Tag>
                      </div>
                      <div className={styles.milestoneDate}>
                        截止日期: {dayjs(milestone.targetDate).format('YYYY-MM-DD')}
                      </div>
                    </div>
                  )
                }))}
              />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* 团队成员 */}
        <Col xs={24} md={12}>
          <Card title="团队成员" className={styles.chartCard}>
            {members.length === 0 ? (
              <Empty description="暂无成员" />
            ) : (
              <div className={styles.memberList}>
                {members.slice(0, 8).map(member => (
                  <Tooltip key={member.id} title={`${member.userName} - ${member.role}`}>
                    <div className={styles.memberItem}>
                      <Avatar
                        size={40}
                        src={member.userAvatar}
                        icon={<UserOutlined />}
                        style={{ backgroundColor: '#1890ff' }}
                      >
                        {member.userName?.charAt(0)}
                      </Avatar>
                      <div className={styles.memberInfo}>
                        <div className={styles.memberName}>{member.userName}</div>
                        <div className={styles.memberRole}>{member.role}</div>
                      </div>
                    </div>
                  </Tooltip>
                ))}
                {members.length > 8 && (
                  <div className={styles.memberMore}>
                    +{members.length - 8} 更多
                  </div>
                )}
              </div>
            )}
          </Card>
        </Col>

        {/* 最近活动 */}
        <Col xs={24} md={12}>
          <Card title="最近活动" className={styles.chartCard}>
            {activities.length === 0 ? (
              <Empty description="暂无活动记录" />
            ) : (
              <Timeline
                items={activities.slice(0, 5).map(activity => ({
                  dot: getActivityIcon(activity.type),
                  children: (
                    <div className={styles.activityItem}>
                      <div className={styles.activityContent}>
                        <span className={styles.activityUser}>{activity.userName}</span>
                        <span className={styles.activityAction}>{activity.content}</span>
                      </div>
                      <div className={styles.activityTime}>
                        {dayjs(activity.createdAt).format('MM-DD HH:mm')}
                      </div>
                    </div>
                  )
                }))}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* 项目描述 */}
      {project.description && (
        <Card title="项目描述" style={{ marginTop: 16 }}>
          <p style={{ whiteSpace: 'pre-wrap' }}>{project.description}</p>
        </Card>
      )}
    </div>
  )
}

export default OverviewTab