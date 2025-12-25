/**
 * 模板库页面
 * 集成模板库管理功能
 */

import { useState } from 'react'
import { Typography, Breadcrumb, message } from 'antd'
import { HomeOutlined, AppstoreOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import TemplateLibrary from '@/components/TemplateLibrary'
import styles from './index.module.css'

const { Title, Text } = Typography

const TemplatesPage = () => {
  const navigate = useNavigate()

  // 处理从模板创建
  const handleCreateFromTemplate = (type: string, itemId: number) => {
    switch (type) {
      case 'document':
        message.success('文档创建成功，正在跳转...')
        navigate(`/documents/${itemId}`)
        break
      case 'task':
        message.success('任务创建成功，正在跳转...')
        navigate(`/tasks/${itemId}`)
        break
      case 'project':
        message.success('项目创建成功，正在跳转...')
        navigate(`/projects/${itemId}`)
        break
      default:
        break
    }
  }

  return (
    <div className={styles.container}>
      {/* 面包屑导航 */}
      <Breadcrumb className={styles.breadcrumb}>
        <Breadcrumb.Item>
          <Link to="/"><HomeOutlined /> 首页</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <AppstoreOutlined /> 模板库
        </Breadcrumb.Item>
      </Breadcrumb>

      {/* 页面标题 */}
      <div className={styles.header}>
        <div className={styles.headerIcon}>
          <AppstoreOutlined />
        </div>
        <div>
          <Title level={3} style={{ margin: 0 }}>模板库</Title>
          <Text type="secondary" className={styles.description}>
            浏览和管理文档、任务、项目模板，快速创建标准化内容
          </Text>
        </div>
      </div>

      {/* 模板库组件 */}
      <TemplateLibrary
        showStats={true}
        onCreateFromTemplate={handleCreateFromTemplate}
      />
    </div>
  )
}

export default TemplatesPage