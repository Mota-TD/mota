import { useState } from 'react'
import { Card, Input, Collapse, Typography, Space, Tag, Button, Row, Col } from 'antd'
import {
  SearchOutlined,
  QuestionCircleOutlined,
  BookOutlined,
  VideoCameraOutlined,
  MessageOutlined,
  RocketOutlined,
  SettingOutlined,
  TeamOutlined,
  FileTextOutlined,
  BulbOutlined,
  RightOutlined,
  PlayCircleOutlined,
  CustomerServiceOutlined
} from '@ant-design/icons'
import styles from './index.module.css'

const { Title, Text, Paragraph } = Typography

/**
 * 帮助中心页面
 */
const Help = () => {
  const [searchValue, setSearchValue] = useState('')

  // 快速入门指南
  const quickStartGuides = [
    {
      icon: <RocketOutlined />,
      title: '快速开始',
      description: '5分钟了解摩塔的核心功能',
      link: '#'
    },
    {
      icon: <TeamOutlined />,
      title: '团队协作',
      description: '学习如何与团队成员高效协作',
      link: '#'
    },
    {
      icon: <SettingOutlined />,
      title: '项目设置',
      description: '配置项目以满足团队需求',
      link: '#'
    },
    {
      icon: <BulbOutlined />,
      title: 'AI 助手',
      description: '使用 AI 提升工作效率',
      link: '#'
    }
  ]

  // 常见问题
  const faqs = [
    {
      question: '如何创建新项目？',
      answer: '点击顶部导航栏的"新建"按钮，选择"新建项目"，填写项目名称、描述等信息后即可创建。您也可以选择项目模板快速开始。'
    },
    {
      question: '如何邀请团队成员？',
      answer: '进入项目设置页面，点击"成员管理"，输入成员邮箱或从组织中选择成员，设置相应权限后发送邀请。'
    },
    {
      question: '如何使用看板视图？',
      answer: '在项目中点击"看板"标签，您可以通过拖拽任务卡片来更改任务状态。支持自定义列和WIP限制。'
    },
    {
      question: '如何使用 AI 方案生成？',
      answer: '进入"AI助理"模块，选择"方案生成"，输入您的需求描述，AI 将自动生成技术方案、架构设计等内容。'
    },
    {
      question: '如何导出项目数据？',
      answer: '在项目列表或任务列表页面，选择需要导出的数据，点击"导出"按钮，支持 Excel、CSV、JSON 等格式。'
    },
    {
      question: '如何设置通知提醒？',
      answer: '进入个人设置页面，在"通知设置"中可以配置邮件通知、站内通知等提醒方式和触发条件。'
    }
  ]

  // 视频教程
  const videoTutorials = [
    {
      title: '摩塔入门教程',
      duration: '5:30',
      icon: <RocketOutlined />
    },
    {
      title: '项目管理最佳实践',
      duration: '8:45',
      icon: <SettingOutlined />
    },
    {
      title: 'AI 功能详解',
      duration: '6:20',
      icon: <BulbOutlined />
    },
    {
      title: '团队协作技巧',
      duration: '7:15',
      icon: <TeamOutlined />
    }
  ]

  // 帮助分类
  const helpCategories = [
    { icon: <BookOutlined />, title: '使用指南', count: 24 },
    { icon: <QuestionCircleOutlined />, title: '常见问题', count: 36 },
    { icon: <VideoCameraOutlined />, title: '视频教程', count: 12 },
    { icon: <FileTextOutlined />, title: 'API 文档', count: 48 },
    { icon: <MessageOutlined />, title: '更新日志', count: 18 },
    { icon: <CustomerServiceOutlined />, title: '联系支持', count: 0 }
  ]

  return (
    <div className={styles.container}>
      {/* 页面头部 */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <Title level={2} className={styles.headerTitle}>
            帮助中心
          </Title>
          <Paragraph className={styles.headerDesc}>
            查找文档、教程和常见问题解答，快速解决您的问题
          </Paragraph>
          <Input
            size="large"
            placeholder="搜索帮助文档..."
            prefix={<SearchOutlined />}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* 快速入门 */}
      <div className={styles.section}>
        <Title level={4} className={styles.sectionTitle}>
          <RocketOutlined /> 快速入门
        </Title>
        <Row gutter={[16, 16]}>
          {quickStartGuides.map((guide, index) => (
            <Col xs={24} sm={12} md={6} key={index}>
              <Card className={styles.guideCard} hoverable>
                <div className={styles.guideIcon}>{guide.icon}</div>
                <Title level={5} className={styles.guideTitle}>{guide.title}</Title>
                <Text type="secondary">{guide.description}</Text>
                <Button type="link" className={styles.guideLink}>
                  了解更多 <RightOutlined />
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* 帮助分类 */}
      <div className={styles.section}>
        <Title level={4} className={styles.sectionTitle}>
          <BookOutlined /> 帮助分类
        </Title>
        <Row gutter={[16, 16]}>
          {helpCategories.map((category, index) => (
            <Col xs={12} sm={8} md={4} key={index}>
              <Card className={styles.categoryCard} hoverable>
                <div className={styles.categoryIcon}>{category.icon}</div>
                <div className={styles.categoryTitle}>{category.title}</div>
                {category.count > 0 && (
                  <Tag color="default" className={styles.categoryCount}>
                    {category.count} 篇
                  </Tag>
                )}
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* 常见问题 */}
      <div className={styles.section}>
        <Title level={4} className={styles.sectionTitle}>
          <QuestionCircleOutlined /> 常见问题
        </Title>
        <Card className={styles.faqCard}>
          <Collapse
            bordered={false}
            expandIconPosition="end"
            className={styles.faqCollapse}
            items={faqs.map((faq, index) => ({
              key: index.toString(),
              label: <span className={styles.faqQuestion}>{faq.question}</span>,
              children: <Paragraph className={styles.faqAnswer}>{faq.answer}</Paragraph>
            }))}
          />
        </Card>
      </div>

      {/* 视频教程 */}
      <div className={styles.section}>
        <Title level={4} className={styles.sectionTitle}>
          <VideoCameraOutlined /> 视频教程
        </Title>
        <Row gutter={[16, 16]}>
          {videoTutorials.map((video, index) => (
            <Col xs={24} sm={12} md={6} key={index}>
              <Card className={styles.videoCard} hoverable>
                <div className={styles.videoThumbnail}>
                  <div className={styles.videoPlaceholder}>
                    {video.icon}
                  </div>
                  <div className={styles.playButton}>
                    <PlayCircleOutlined />
                  </div>
                  <span className={styles.videoDuration}>{video.duration}</span>
                </div>
                <div className={styles.videoTitle}>{video.title}</div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* 联系支持 */}
      <div className={styles.section}>
        <Card className={styles.supportCard}>
          <Row align="middle" gutter={24}>
            <Col xs={24} md={16}>
              <Title level={4} style={{ marginBottom: 8 }}>
                还没找到答案？
              </Title>
              <Text type="secondary">
                我们的支持团队随时为您提供帮助，工作日 9:00-18:00 在线
              </Text>
            </Col>
            <Col xs={24} md={8} className={styles.supportActions}>
              <Space>
                <Button icon={<MessageOutlined />}>在线咨询</Button>
                <Button type="primary" icon={<CustomerServiceOutlined />}>
                  提交工单
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  )
}

export default Help