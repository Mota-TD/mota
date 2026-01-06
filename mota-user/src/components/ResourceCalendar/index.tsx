/**
 * 资源日历组件
 * RM-004: 资源日历视图
 */

import React, { useEffect, useState } from 'react'
import { Card, Avatar, Tooltip, Spin, Empty, Tag } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import type { ResourceCalendarData, DayAllocation } from '@/services/api/resourceManagement'
import { getResourceCalendar } from '@/services/api/resourceManagement'
import styles from './index.module.css'

interface ResourceCalendarProps {
  teamId?: string | number
  startDate: string
  endDate: string
}

const ResourceCalendar: React.FC<ResourceCalendarProps> = ({
  teamId,
  startDate,
  endDate
}) => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ResourceCalendarData | null>(null)

  useEffect(() => {
    fetchData()
  }, [teamId, startDate, endDate])

  const fetchData = async () => {
    setLoading(true)
    try {
      const result = await getResourceCalendar({ teamId, startDate, endDate })
      setData(result)
    } catch (error) {
      console.error('获取资源日历失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return '#52c41a'
      case 'PARTIAL': return '#1890ff'
      case 'FULL': return '#faad14'
      case 'OVERLOAD': return '#ff4d4f'
      case 'OFF': return '#d9d9d9'
      default: return '#d9d9d9'
    }
  }

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return '#f6ffed'
      case 'PARTIAL': return '#e6f7ff'
      case 'FULL': return '#fffbe6'
      case 'OVERLOAD': return '#fff2f0'
      case 'OFF': return '#fafafa'
      default: return '#fafafa'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return '可用'
      case 'PARTIAL': return '部分占用'
      case 'FULL': return '满载'
      case 'OVERLOAD': return '过载'
      case 'OFF': return '休息'
      default: return '未知'
    }
  }

  const renderAllocationCell = (allocation: DayAllocation) => {
    const { status, allocatedHours, availableHours, utilizationPercentage, tasks } = allocation
    
    return (
      <Tooltip
        title={
          <div className={styles.tooltipContent}>
            <div><strong>状态:</strong> {getStatusText(status)}</div>
            <div><strong>已分配:</strong> {Number(allocatedHours || 0).toFixed(1)}h / {Number(availableHours) || 0}h</div>
            <div><strong>利用率:</strong> {Number(utilizationPercentage || 0).toFixed(1)}%</div>
            {tasks && tasks.length > 0 && (
              <div className={styles.tooltipTasks}>
                <strong>任务:</strong>
                <ul>
                  {tasks.map(t => (
                    <li key={t.taskId}>{t.taskName} ({Number(t.hours || 0).toFixed(1)}h)</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        }
      >
        <div
          className={styles.allocationCell}
          style={{
            backgroundColor: getStatusBgColor(status),
            borderColor: getStatusColor(status)
          }}
        >
          {status !== 'OFF' && (
            <>
              <div className={styles.cellHours}>{Number(allocatedHours || 0).toFixed(1)}h</div>
              <div
                className={styles.cellBar}
                style={{
                  width: `${Math.min(Number(utilizationPercentage) || 0, 100)}%`,
                  backgroundColor: getStatusColor(status)
                }}
              />
            </>
          )}
        </div>
      </Tooltip>
    )
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <Spin size="large" />
      </div>
    )
  }

  if (!data || !data.resources || data.resources.length === 0) {
    return <Empty description="暂无资源日历数据" />
  }

  return (
    <div className={styles.container}>
      {/* 图例 */}
      <div className={styles.legend}>
        <span className={styles.legendTitle}>图例:</span>
        <Tag color="#52c41a">可用</Tag>
        <Tag color="#1890ff">部分占用</Tag>
        <Tag color="#faad14">满载</Tag>
        <Tag color="#ff4d4f">过载</Tag>
        <Tag color="#d9d9d9">休息</Tag>
      </div>

      {/* 日历表格 */}
      <Card className={styles.calendarCard}>
        <div className={styles.calendarWrapper}>
          <table className={styles.calendarTable}>
            <thead>
              <tr>
                <th className={styles.resourceHeader}>资源</th>
                {data.dates?.map(date => (
                  <th 
                    key={date.date} 
                    className={`${styles.dateHeader} ${!date.isWorkday ? styles.weekend : ''}`}
                  >
                    <div className={styles.dateDay}>{date.date.slice(8)}</div>
                    <div className={styles.dateWeek}>{date.dayOfWeek}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.resources.map(resource => (
                <tr key={resource.userId}>
                  <td className={styles.resourceCell}>
                    <div className={styles.resourceInfo}>
                      <Avatar 
                        size="small" 
                        src={resource.avatar} 
                        icon={<UserOutlined />}
                      />
                      <div className={styles.resourceDetails}>
                        <div className={styles.resourceName}>{resource.userName}</div>
                        <div className={styles.resourceDept}>{resource.department}</div>
                      </div>
                    </div>
                  </td>
                  {resource.allocations?.map((allocation, index) => (
                    <td 
                      key={index} 
                      className={`${styles.allocationTd} ${!data.dates?.[index]?.isWorkday ? styles.weekend : ''}`}
                    >
                      {renderAllocationCell(allocation)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

export default ResourceCalendar