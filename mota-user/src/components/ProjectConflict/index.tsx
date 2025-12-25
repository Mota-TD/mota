/**
 * 跨项目资源冲突组件
 * RM-006: 跨项目资源冲突检测
 */

import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, Avatar, Tag, List, Button, Spin, Empty, Modal, Input, message, Timeline, Tooltip } from 'antd'
import { 
  WarningOutlined, 
  UserOutlined, 
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ProjectOutlined
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import type { ProjectConflictData, Conflict } from '@/services/api/resourceManagement'
import { getProjectConflicts, resolveConflict } from '@/services/api/resourceManagement'
import styles from './index.module.css'

interface ProjectConflictProps {
  teamId?: number
  userId?: number
  startDate: string
  endDate: string
}

const ProjectConflict: React.FC<ProjectConflictProps> = ({
  teamId,
  userId,
  startDate,
  endDate
}) => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ProjectConflictData | null>(null)
  const [resolveModalVisible, setResolveModalVisible] = useState(false)
  const [selectedConflict, setSelectedConflict] = useState<Conflict | null>(null)
  const [resolution, setResolution] = useState('')

  useEffect(() => {
    fetchData()
  }, [teamId, userId, startDate, endDate])

  const fetchData = async () => {
    setLoading(true)
    try {
      const result = await getProjectConflicts({ teamId, userId, startDate, endDate })
      setData(result)
    } catch (error) {
      console.error('获取跨项目冲突失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleResolve = (conflict: Conflict) => {
    setSelectedConflict(conflict)
    setResolution('')
    setResolveModalVisible(true)
  }

  const handleConfirmResolve = async () => {
    if (!selectedConflict || !resolution.trim()) {
      message.warning('请输入解决方案')
      return
    }
    
    try {
      await resolveConflict(selectedConflict.conflictId, resolution)
      message.success('冲突已解决')
      setResolveModalVisible(false)
      fetchData()
    } catch (error) {
      message.error('解决失败')
    }
  }

  const getConflictTypeIcon = (type: string) => {
    switch (type) {
      case 'TIME_OVERLAP': return <ClockCircleOutlined style={{ color: '#faad14' }} />
      case 'RESOURCE_OVERLOAD': return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
      case 'SKILL_MISMATCH': return <WarningOutlined style={{ color: '#fa8c16' }} />
      case 'DEADLINE_CONFLICT': return <ClockCircleOutlined style={{ color: '#ff4d4f' }} />
      default: return <WarningOutlined />
    }
  }

  const getConflictTypeText = (type: string) => {
    switch (type) {
      case 'TIME_OVERLAP': return '时间重叠'
      case 'RESOURCE_OVERLOAD': return '资源过载'
      case 'SKILL_MISMATCH': return '技能不匹配'
      case 'DEADLINE_CONFLICT': return '截止日期冲突'
      default: return '未知'
    }
  }

  const getConflictTypeColor = (type: string) => {
    switch (type) {
      case 'TIME_OVERLAP': return '#faad14'
      case 'RESOURCE_OVERLOAD': return '#ff4d4f'
      case 'SKILL_MISMATCH': return '#fa8c16'
      case 'DEADLINE_CONFLICT': return '#ff4d4f'
      default: return '#1890ff'
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'HIGH': return 'red'
      case 'MEDIUM': return 'orange'
      case 'LOW': return 'blue'
      default: return 'default'
    }
  }

  const getLevelText = (level: string) => {
    switch (level) {
      case 'HIGH': return '高'
      case 'MEDIUM': return '中'
      case 'LOW': return '低'
      default: return '未知'
    }
  }

  const getSuggestionTypeText = (type: string) => {
    switch (type) {
      case 'REASSIGN': return '重新分配'
      case 'RESCHEDULE': return '重新排期'
      case 'SPLIT': return '拆分任务'
      case 'PRIORITIZE': return '调整优先级'
      default: return '其他'
    }
  }

  // 冲突类型分布图
  const getTypePieOption = () => {
    if (!data) return {}
    
    const typeCount: Record<string, number> = {}
    data.conflicts?.forEach(c => {
      typeCount[c.conflictType] = (typeCount[c.conflictType] || 0) + 1
    })
    
    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      series: [
        {
          type: 'pie',
          radius: ['50%', '70%'],
          avoidLabelOverlap: false,
          label: {
            show: true,
            position: 'outside',
            formatter: '{b}: {c}'
          },
          data: Object.entries(typeCount).map(([type, count]) => ({
            name: getConflictTypeText(type),
            value: count,
            itemStyle: { color: getConflictTypeColor(type) }
          }))
        }
      ]
    }
  }

  // 受影响用户图
  const getAffectedUsersOption = () => {
    if (!data?.affectedUsers) return {}
    
    const users = data.affectedUsers.slice(0, 10)
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: users.map(u => u.userName),
        axisLabel: { rotate: 30, fontSize: 11 }
      },
      yAxis: {
        type: 'value',
        name: '冲突数'
      },
      series: [
        {
          type: 'bar',
          data: users.map(u => ({
            value: u.conflictCount,
            itemStyle: { color: u.conflictCount > 2 ? '#ff4d4f' : '#faad14' }
          }))
        }
      ]
    }
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <Spin size="large" />
      </div>
    )
  }

  if (!data) {
    return <Empty description="暂无冲突数据" />
  }

  return (
    <div className={styles.container}>
      {/* 冲突统计 */}
      <Row gutter={16} className={styles.statsRow}>
        <Col span={4}>
          <Card className={styles.statCard}>
            <Statistic 
              title="冲突总数" 
              value={data.totalConflicts}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card className={styles.statCard}>
            <Statistic 
              title="高优先级" 
              value={data.highPriorityConflicts}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card className={styles.statCard}>
            <Statistic 
              title="中优先级" 
              value={data.mediumPriorityConflicts}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card className={styles.statCard}>
            <Statistic 
              title="低优先级" 
              value={data.lowPriorityConflicts}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card className={styles.statCard}>
            <Statistic 
              title="已解决" 
              value={data.resolvedConflicts}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card className={styles.statCard}>
            <Statistic 
              title="待处理" 
              value={data.totalConflicts - data.resolvedConflicts}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={16} className={styles.chartRow}>
        <Col span={12}>
          <Card title="冲突类型分布" className={styles.chartCard}>
            <ReactECharts 
              option={getTypePieOption()} 
              style={{ height: 250 }}
              opts={{ renderer: 'svg' }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="受影响用户" className={styles.chartCard}>
            <ReactECharts 
              option={getAffectedUsersOption()} 
              style={{ height: 250 }}
              opts={{ renderer: 'svg' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 冲突列表 */}
      <Card title="冲突详情" className={styles.conflictListCard}>
        <List
          dataSource={data.conflicts}
          renderItem={(conflict) => (
            <List.Item
              className={styles.conflictItem}
              actions={[
                <Button 
                  key="resolve"
                  type="primary" 
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleResolve(conflict)}
                  disabled={conflict.resolved}
                >
                  {conflict.resolved ? '已解决' : '解决'}
                </Button>
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Avatar 
                    size={48} 
                    src={conflict.user?.avatar} 
                    icon={<UserOutlined />}
                  />
                }
                title={
                  <div className={styles.conflictTitle}>
                    <span className={styles.conflictUser}>{conflict.user?.userName}</span>
                    <Tag color={getLevelColor(conflict.conflictLevel)}>
                      {getLevelText(conflict.conflictLevel)}
                    </Tag>
                    <Tag color={getConflictTypeColor(conflict.conflictType)}>
                      {getConflictTypeIcon(conflict.conflictType)} {getConflictTypeText(conflict.conflictType)}
                    </Tag>
                    {conflict.resolved && <Tag color="green">已解决</Tag>}
                  </div>
                }
                description={
                  <div className={styles.conflictDesc}>
                    <p>{conflict.description}</p>
                    
                    {/* 涉及项目 */}
                    <div className={styles.conflictProjects}>
                      <strong>涉及项目:</strong>
                      {conflict.projects?.map(p => (
                        <Tag key={p.projectId} icon={<ProjectOutlined />}>
                          {p.projectName} ({p.allocatedHours?.toFixed(1)}h)
                        </Tag>
                      ))}
                    </div>

                    {/* 冲突详情 */}
                    <div className={styles.conflictMeta}>
                      <span>冲突时段: {conflict.conflictStartDate} ~ {conflict.conflictEndDate}</span>
                      <span>冲突工时: <strong style={{ color: '#ff4d4f' }}>{conflict.conflictHours?.toFixed(1)}h</strong></span>
                      <span>可用工时: {conflict.availableHours}h</span>
                      <span>超出: <strong style={{ color: '#ff4d4f' }}>{conflict.excessHours?.toFixed(1)}h</strong></span>
                    </div>

                    {/* 解决建议 */}
                    {conflict.suggestions && conflict.suggestions.length > 0 && (
                      <div className={styles.suggestions}>
                        <strong>解决建议:</strong>
                        <Timeline className={styles.suggestionTimeline}>
                          {conflict.suggestions.map((s, i) => (
                            <Timeline.Item 
                              key={i}
                              color={s.recommendationScore >= 4 ? 'green' : s.recommendationScore >= 3 ? 'blue' : 'gray'}
                            >
                              <div className={styles.suggestionItem}>
                                <Tag>{getSuggestionTypeText(s.suggestionType)}</Tag>
                                <span>{s.description}</span>
                                <Tooltip title={s.impactAssessment}>
                                  <span className={styles.suggestionScore}>推荐指数: {'★'.repeat(s.recommendationScore)}</span>
                                </Tooltip>
                              </div>
                            </Timeline.Item>
                          ))}
                        </Timeline>
                      </div>
                    )}
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      {/* 解决冲突弹窗 */}
      <Modal
        title="解决冲突"
        open={resolveModalVisible}
        onOk={handleConfirmResolve}
        onCancel={() => setResolveModalVisible(false)}
        okText="确认解决"
        cancelText="取消"
      >
        <div className={styles.resolveModal}>
          <p><strong>冲突:</strong> {selectedConflict?.description}</p>
          <p><strong>涉及用户:</strong> {selectedConflict?.user?.userName}</p>
          <Input.TextArea
            placeholder="请输入解决方案..."
            value={resolution}
            onChange={e => setResolution(e.target.value)}
            rows={4}
          />
        </div>
      </Modal>
    </div>
  )
}

export default ProjectConflict