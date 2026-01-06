import { useState, useEffect, useRef } from 'react'
import { Card, Tabs, Row, Col, Statistic, Button, Space, Tag, Table, Switch, Modal, Form, Input, Select, message, Popconfirm, Tree, Avatar, Badge, Progress, Timeline, Alert, Spin } from 'antd'
import {
  UserOutlined,
  TeamOutlined,
  SafetyOutlined,
  SettingOutlined,
  AuditOutlined,
  ApiOutlined,
  KeyOutlined,
  ApartmentOutlined,
  SwapOutlined,
  DatabaseOutlined,
  FileProtectOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SyncOutlined,
  EyeOutlined,
  DownloadOutlined,
  LinkOutlined,
  CloudServerOutlined,
  HistoryOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import styles from './index.module.css'
import { getDepartmentsByOrgId, type Department } from '@/services/api/department'

const { TabPane } = Tabs
const { Option } = Select
const { TextArea } = Input

// 初始化为空数组，数据应从API获取
const mockSSOProviders: any[] = []

const mockPositions: any[] = []

const mockTransfers: any[] = []

const mockDataPermissionRules: any[] = []

const mockNewsSources: any[] = []

const mockIntegrations: any[] = []

const mockDataChangeLogs: any[] = []

const mockAuditReports: any[] = []

const mockComplianceRules: any[] = []

const mockComplianceRecords: any[] = []

// 组织架构树数据 - 初始化为空
const mockOrgTreeData: any[] = []

const SystemManagementPage = () => {
  const [activeTab, setActiveTab] = useState('sso')
  const [ssoModalVisible, setSsoModalVisible] = useState(false)
  const [positionModalVisible, setPositionModalVisible] = useState(false)
  const [transferModalVisible, setTransferModalVisible] = useState(false)
  const [ruleModalVisible, setRuleModalVisible] = useState(false)
  const [newsSourceModalVisible, setNewsSourceModalVisible] = useState(false)
  const [integrationModalVisible, setIntegrationModalVisible] = useState(false)
  const [auditReportModalVisible, setAuditReportModalVisible] = useState(false)
  const [complianceRuleModalVisible, setComplianceRuleModalVisible] = useState(false)
  const [form] = Form.useForm()
  
  // 部门数据状态
  const [departments, setDepartments] = useState<Department[]>([])
  const [loadingDepts, setLoadingDepts] = useState(false)
  
  // 使用 ref 防止重复请求
  const departmentsLoadedRef = useRef(false)
  const loadingRef = useRef(false)

  // 加载部门数据
  useEffect(() => {
    // 防止重复请求
    if (departmentsLoadedRef.current || loadingRef.current) {
      return
    }
    
    const loadDepartments = async () => {
      loadingRef.current = true
      setLoadingDepts(true)
      try {
        const data = await getDepartmentsByOrgId('default')
        setDepartments(data || [])
        departmentsLoadedRef.current = true
      } catch (error) {
        console.error('加载部门列表失败:', error)
        setDepartments([])
      } finally {
        setLoadingDepts(false)
        loadingRef.current = false
      }
    }
    
    loadDepartments()
  }, [])

  // SSO提供商列
  const ssoColumns: ColumnsType<any> = [
    { title: '提供商名称', dataIndex: 'providerName', key: 'providerName' },
    { title: '提供商代码', dataIndex: 'providerCode', key: 'providerCode' },
    { 
      title: '类型', 
      dataIndex: 'providerType', 
      key: 'providerType',
      render: (type: string) => <Tag color="blue">{type}</Tag>
    },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: number, record: any) => (
        <Switch 
          checked={status === 1} 
          onChange={(checked) => message.success(`${record.providerName} 已${checked ? '启用' : '禁用'}`)}
        />
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />}>配置</Button>
          <Button type="link" size="small" icon={<LinkOutlined />}>测试连接</Button>
        </Space>
      )
    }
  ]

  // 岗位列
  const positionColumns: ColumnsType<any> = [
    { title: '岗位编码', dataIndex: 'positionCode', key: 'positionCode' },
    { title: '岗位名称', dataIndex: 'positionName', key: 'positionName' },
    { title: '岗位级别', dataIndex: 'positionLevel', key: 'positionLevel' },
    { 
      title: '岗位类别', 
      dataIndex: 'positionCategory', 
      key: 'positionCategory',
      render: (category: string) => <Tag>{category}</Tag>
    },
    { 
      title: '编制/在岗', 
      key: 'headcount',
      render: (_: any, record: any) => (
        <span>
          {record.currentCount}/{record.headcount}
          {record.currentCount < record.headcount && <Tag color="orange" style={{ marginLeft: 8 }}>缺编</Tag>}
        </span>
      )
    },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: number) => status === 1 ? <Tag color="success">启用</Tag> : <Tag>禁用</Tag>
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />}>编辑</Button>
          <Button type="link" size="small" icon={<UserOutlined />}>人员</Button>
          <Popconfirm title="确定删除？">
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  // 调动记录列
  const transferColumns: ColumnsType<any> = [
    { title: '调动单号', dataIndex: 'transferNo', key: 'transferNo' },
    { title: '员工姓名', dataIndex: 'userName', key: 'userName' },
    { 
      title: '调动类型', 
      dataIndex: 'transferType', 
      key: 'transferType',
      render: (type: string) => {
        const typeMap: Record<string, { text: string; color: string }> = {
          'DEPARTMENT': { text: '部门调动', color: 'blue' },
          'POSITION': { text: '岗位调动', color: 'cyan' },
          'PROMOTION': { text: '晋升', color: 'green' },
          'DEMOTION': { text: '降级', color: 'orange' },
          'TRANSFER': { text: '调岗', color: 'purple' },
        }
        const info = typeMap[type] || { text: type, color: 'default' }
        return <Tag color={info.color}>{info.text}</Tag>
      }
    },
    { 
      title: '调动信息', 
      key: 'transferInfo',
      render: (_: any, record: any) => (
        <span>
          {record.fromPositionName || record.fromDepartmentName} → {record.toPositionName || record.toDepartmentName}
        </span>
      )
    },
    { title: '生效日期', dataIndex: 'effectiveDate', key: 'effectiveDate' },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string) => {
        const statusMap: Record<string, { text: string; color: string }> = {
          'PENDING': { text: '待审批', color: 'processing' },
          'APPROVED': { text: '已批准', color: 'success' },
          'REJECTED': { text: '已拒绝', color: 'error' },
          'EXECUTED': { text: '已执行', color: 'default' },
          'CANCELLED': { text: '已取消', color: 'default' },
        }
        const info = statusMap[status] || { text: status, color: 'default' }
        return <Tag color={info.color}>{info.text}</Tag>
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />}>详情</Button>
          {record.status === 'PENDING' && (
            <>
              <Button type="link" size="small" style={{ color: 'green' }}>批准</Button>
              <Button type="link" size="small" danger>拒绝</Button>
            </>
          )}
        </Space>
      )
    }
  ]

  // 数据权限规则列
  const dataPermissionColumns: ColumnsType<any> = [
    { title: '规则名称', dataIndex: 'ruleName', key: 'ruleName' },
    { title: '规则编码', dataIndex: 'ruleCode', key: 'ruleCode' },
    { 
      title: '资源类型', 
      dataIndex: 'resourceType', 
      key: 'resourceType',
      render: (type: string) => <Tag color="blue">{type}</Tag>
    },
    { 
      title: '范围类型', 
      dataIndex: 'scopeType', 
      key: 'scopeType',
      render: (type: string) => {
        const typeMap: Record<string, string> = {
          'ALL': '全部',
          'SELF': '本人',
          'DEPARTMENT': '本部门',
          'DEPARTMENT_AND_BELOW': '本部门及下级',
          'CUSTOM': '自定义',
        }
        return <Tag>{typeMap[type] || type}</Tag>
      }
    },
    { title: '优先级', dataIndex: 'priority', key: 'priority' },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: number) => status === 1 ? <Tag color="success">启用</Tag> : <Tag>禁用</Tag>
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />}>编辑</Button>
          <Popconfirm title="确定删除？">
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  // 新闻源列
  const newsSourceColumns: ColumnsType<any> = [
    { title: '数据源名称', dataIndex: 'sourceName', key: 'sourceName' },
    { title: '数据源编码', dataIndex: 'sourceCode', key: 'sourceCode' },
    { 
      title: '类型', 
      dataIndex: 'sourceType', 
      key: 'sourceType',
      render: (type: string) => <Tag color="blue">{type}</Tag>
    },
    { title: '最后抓取时间', dataIndex: 'lastFetchTime', key: 'lastFetchTime' },
    { title: '总抓取数', dataIndex: 'totalFetchCount', key: 'totalFetchCount' },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: number, record: any) => (
        <Switch 
          checked={status === 1} 
          onChange={(checked) => message.success(`${record.sourceName} 已${checked ? '启用' : '禁用'}`)}
        />
      )
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />}>编辑</Button>
          <Button type="link" size="small" icon={<SyncOutlined />}>立即抓取</Button>
          <Button type="link" size="small" icon={<HistoryOutlined />}>日志</Button>
        </Space>
      )
    }
  ]

  // 外部集成列
  const integrationColumns: ColumnsType<any> = [
    { title: '集成名称', dataIndex: 'integrationName', key: 'integrationName' },
    { title: '集成编码', dataIndex: 'integrationCode', key: 'integrationCode' },
    { 
      title: '类型', 
      dataIndex: 'integrationType', 
      key: 'integrationType',
      render: (type: string) => <Tag color="purple">{type}</Tag>
    },
    { title: '最后同步时间', dataIndex: 'lastSyncTime', key: 'lastSyncTime', render: (time: string) => time || '-' },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: number, record: any) => (
        <Switch 
          checked={status === 1} 
          onChange={(checked) => message.success(`${record.integrationName} 已${checked ? '启用' : '禁用'}`)}
        />
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />}>配置</Button>
          {record.status === 1 && (
            <>
              <Button type="link" size="small" icon={<SyncOutlined />}>同步</Button>
              <Button type="link" size="small" icon={<LinkOutlined />}>测试</Button>
            </>
          )}
        </Space>
      )
    }
  ]

  // 数据变更日志列
  const dataChangeLogColumns: ColumnsType<any> = [
    { title: '表名', dataIndex: 'tableName', key: 'tableName' },
    { title: '记录ID', dataIndex: 'recordId', key: 'recordId' },
    { 
      title: '操作类型', 
      dataIndex: 'operationType', 
      key: 'operationType',
      render: (type: string) => {
        const colorMap: Record<string, string> = {
          'INSERT': 'green',
          'UPDATE': 'blue',
          'DELETE': 'red',
        }
        return <Tag color={colorMap[type]}>{type}</Tag>
      }
    },
    { title: '变更摘要', dataIndex: 'changeSummary', key: 'changeSummary' },
    { title: '操作人', dataIndex: 'operatorName', key: 'operatorName' },
    { title: '操作时间', dataIndex: 'operationTime', key: 'operationTime' },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Button type="link" size="small" icon={<EyeOutlined />}>详情</Button>
      )
    }
  ]

  // 审计报告列
  const auditReportColumns: ColumnsType<any> = [
    { title: '报告编号', dataIndex: 'reportNo', key: 'reportNo' },
    { title: '报告名称', dataIndex: 'reportName', key: 'reportName' },
    { 
      title: '报告类型', 
      dataIndex: 'reportType', 
      key: 'reportType',
      render: (type: string) => {
        const typeMap: Record<string, { text: string; color: string }> = {
          'OPERATION': { text: '操作审计', color: 'blue' },
          'SECURITY': { text: '安全审计', color: 'orange' },
          'DATA': { text: '数据审计', color: 'cyan' },
          'COMPLIANCE': { text: '合规审计', color: 'purple' },
        }
        const info = typeMap[type] || { text: type, color: 'default' }
        return <Tag color={info.color}>{info.text}</Tag>
      }
    },
    { 
      title: '风险等级', 
      dataIndex: 'riskLevel', 
      key: 'riskLevel',
      render: (level: string) => {
        const levelMap: Record<string, { text: string; color: string }> = {
          'LOW': { text: '低', color: 'success' },
          'MEDIUM': { text: '中', color: 'warning' },
          'HIGH': { text: '高', color: 'error' },
          'CRITICAL': { text: '严重', color: 'error' },
        }
        const info = levelMap[level] || { text: level, color: 'default' }
        return <Tag color={info.color}>{info.text}</Tag>
      }
    },
    { 
      title: '状态', 
      dataIndex: 'reportStatus', 
      key: 'reportStatus',
      render: (status: string) => {
        const statusMap: Record<string, { text: string; color: string }> = {
          'DRAFT': { text: '草稿', color: 'default' },
          'REVIEWING': { text: '审核中', color: 'processing' },
          'PUBLISHED': { text: '已发布', color: 'success' },
          'ARCHIVED': { text: '已归档', color: 'default' },
        }
        const info = statusMap[status] || { text: status, color: 'default' }
        return <Tag color={info.color}>{info.text}</Tag>
      }
    },
    { title: '生成时间', dataIndex: 'generatedAt', key: 'generatedAt' },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />}>查看</Button>
          <Button type="link" size="small" icon={<DownloadOutlined />}>下载</Button>
          {record.reportStatus === 'DRAFT' && (
            <Button type="link" size="small">提交审核</Button>
          )}
        </Space>
      )
    }
  ]

  // 合规规则列
  const complianceRuleColumns: ColumnsType<any> = [
    { title: '规则名称', dataIndex: 'ruleName', key: 'ruleName' },
    { title: '规则编码', dataIndex: 'ruleCode', key: 'ruleCode' },
    { 
      title: '规则类别', 
      dataIndex: 'ruleCategory', 
      key: 'ruleCategory',
      render: (category: string) => <Tag color="blue">{category}</Tag>
    },
    { 
      title: '检查类型', 
      dataIndex: 'checkType', 
      key: 'checkType',
      render: (type: string) => {
        const typeMap: Record<string, string> = {
          'REALTIME': '实时',
          'SCHEDULED': '定时',
          'MANUAL': '手动',
        }
        return <Tag>{typeMap[type] || type}</Tag>
      }
    },
    { 
      title: '严重程度', 
      dataIndex: 'severity', 
      key: 'severity',
      render: (level: string) => {
        const levelMap: Record<string, { text: string; color: string }> = {
          'LOW': { text: '低', color: 'success' },
          'MEDIUM': { text: '中', color: 'warning' },
          'HIGH': { text: '高', color: 'error' },
          'CRITICAL': { text: '严重', color: 'error' },
        }
        const info = levelMap[level] || { text: level, color: 'default' }
        return <Tag color={info.color}>{info.text}</Tag>
      }
    },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: number, record: any) => (
        <Switch 
          checked={status === 1} 
          onChange={(checked) => message.success(`${record.ruleName} 已${checked ? '启用' : '禁用'}`)}
        />
      )
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />}>编辑</Button>
          <Button type="link" size="small" icon={<SyncOutlined />}>立即检查</Button>
        </Space>
      )
    }
  ]

  // 合规检查记录列
  const complianceRecordColumns: ColumnsType<any> = [
    { title: '规则名称', dataIndex: 'ruleName', key: 'ruleName' },
    { title: '检查时间', dataIndex: 'checkTime', key: 'checkTime' },
    { 
      title: '检查结果', 
      dataIndex: 'checkResult', 
      key: 'checkResult',
      render: (result: string) => {
        const resultMap: Record<string, { icon: React.ReactNode; color: string }> = {
          'PASS': { icon: <CheckCircleOutlined />, color: 'success' },
          'FAIL': { icon: <CloseCircleOutlined />, color: 'error' },
          'WARNING': { icon: <ExclamationCircleOutlined />, color: 'warning' },
          'ERROR': { icon: <CloseCircleOutlined />, color: 'error' },
        }
        const info = resultMap[result] || { icon: null, color: 'default' }
        return <Tag icon={info.icon} color={info.color}>{result}</Tag>
      }
    },
    { title: '影响数量', dataIndex: 'affectedCount', key: 'affectedCount' },
    { 
      title: '修复状态', 
      dataIndex: 'remediationStatus', 
      key: 'remediationStatus',
      render: (status: string) => {
        const statusMap: Record<string, { text: string; color: string }> = {
          'PENDING': { text: '待处理', color: 'default' },
          'IN_PROGRESS': { text: '处理中', color: 'processing' },
          'RESOLVED': { text: '已解决', color: 'success' },
          'IGNORED': { text: '已忽略', color: 'default' },
        }
        const info = statusMap[status] || { text: status, color: 'default' }
        return <Tag color={info.color}>{info.text}</Tag>
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />}>详情</Button>
          {record.remediationStatus === 'PENDING' && (
            <Button type="link" size="small">处理</Button>
          )}
        </Space>
      )
    }
  ]

  return (
    <div className={styles.container}>
      <Card>
        <div className={styles.header}>
          <h2>系统管理</h2>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          {/* SSO登录 */}
          <TabPane 
            tab={<span><KeyOutlined />SSO登录</span>} 
            key="sso"
          >
            <div className={styles.tabContent}>
              <Alert
                message="单点登录配置"
                description="配置第三方身份认证提供商，支持OAuth2、SAML、LDAP、CAS等协议"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <div className={styles.toolbar}>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setSsoModalVisible(true)}>
                  添加提供商
                </Button>
              </div>
              <Table 
                columns={ssoColumns} 
                dataSource={mockSSOProviders} 
                rowKey="id"
                pagination={false}
              />
            </div>
          </TabPane>

          {/* 岗位管理 */}
          <TabPane 
            tab={<span><TeamOutlined />岗位管理</span>} 
            key="position"
          >
            <div className={styles.tabContent}>
              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={6}>
                  <Card size="small">
                    <Statistic title="岗位总数" value={mockPositions.length} />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card size="small">
                    <Statistic title="总编制" value={mockPositions.reduce((sum, p) => sum + p.headcount, 0)} />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card size="small">
                    <Statistic title="在岗人数" value={mockPositions.reduce((sum, p) => sum + p.currentCount, 0)} />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card size="small">
                    <Statistic 
                      title="缺编数" 
                      value={mockPositions.reduce((sum, p) => sum + (p.headcount - p.currentCount), 0)} 
                      valueStyle={{ color: '#faad14' }}
                    />
                  </Card>
                </Col>
              </Row>
              <div className={styles.toolbar}>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setPositionModalVisible(true)}>
                  新增岗位
                </Button>
              </div>
              <Table 
                columns={positionColumns} 
                dataSource={mockPositions} 
                rowKey="id"
                pagination={false}
              />
            </div>
          </TabPane>

          {/* 人员调动 */}
          <TabPane 
            tab={<span><SwapOutlined />人员调动</span>} 
            key="transfer"
          >
            <div className={styles.tabContent}>
              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={6}>
                  <Card size="small">
                    <Statistic title="待审批" value={1} valueStyle={{ color: '#1890ff' }} />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card size="small">
                    <Statistic title="已批准" value={1} valueStyle={{ color: '#52c41a' }} />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card size="small">
                    <Statistic title="已执行" value={1} />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card size="small">
                    <Statistic title="本月调动" value={3} />
                  </Card>
                </Col>
              </Row>
              <div className={styles.toolbar}>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setTransferModalVisible(true)}>
                  发起调动
                </Button>
              </div>
              <Table 
                columns={transferColumns} 
                dataSource={mockTransfers} 
                rowKey="id"
                pagination={false}
              />
            </div>
          </TabPane>

          {/* 组织架构图 */}
          <TabPane 
            tab={<span><ApartmentOutlined />组织架构图</span>} 
            key="orgChart"
          >
            <div className={styles.tabContent}>
              <Row gutter={16}>
                <Col span={8}>
                  <Card title="组织架构" size="small">
                    <Tree
                      showIcon
                      defaultExpandAll
                      treeData={mockOrgTreeData}
                    />
                  </Card>
                </Col>
                <Col span={16}>
                  <Card title="架构统计" size="small">
                    <Row gutter={16}>
                      <Col span={8}>
                        <Statistic title="部门数量" value={4} prefix={<ApartmentOutlined />} />
                      </Col>
                      <Col span={8}>
                        <Statistic title="岗位数量" value={9} prefix={<TeamOutlined />} />
                      </Col>
                      <Col span={8}>
                        <Statistic title="员工数量" value={6} prefix={<UserOutlined />} />
                      </Col>
                    </Row>
                    <div style={{ marginTop: 24 }}>
                      <Space>
                        <Button icon={<DownloadOutlined />}>导出架构图</Button>
                        <Button icon={<HistoryOutlined />}>历史快照</Button>
                        <Button type="primary" icon={<PlusOutlined />}>创建快照</Button>
                      </Space>
                    </div>
                  </Card>
                </Col>
              </Row>
            </div>
          </TabPane>

          {/* 数据权限 */}
          <TabPane 
            tab={<span><SafetyOutlined />数据权限</span>} 
            key="dataPermission"
          >
            <div className={styles.tabContent}>
              <Alert
                message="数据权限控制"
                description="配置数据级别的访问控制规则，支持按部门、角色、用户等维度进行权限控制"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <div className={styles.toolbar}>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setRuleModalVisible(true)}>
                  新增规则
                </Button>
              </div>
              <Table 
                columns={dataPermissionColumns} 
                dataSource={mockDataPermissionRules} 
                rowKey="id"
                pagination={false}
              />
            </div>
          </TabPane>

          {/* 新闻源配置 */}
          <TabPane 
            tab={<span><CloudServerOutlined />新闻源配置</span>} 
            key="newsSource"
          >
            <div className={styles.tabContent}>
              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={6}>
                  <Card size="small">
                    <Statistic title="数据源总数" value={mockNewsSources.length} />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card size="small">
                    <Statistic title="已启用" value={mockNewsSources.filter(s => s.status === 1).length} valueStyle={{ color: '#52c41a' }} />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card size="small">
                    <Statistic title="今日抓取" value={156} />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card size="small">
                    <Statistic title="总抓取数" value={mockNewsSources.reduce((sum, s) => sum + s.totalFetchCount, 0)} />
                  </Card>
                </Col>
              </Row>
              <div className={styles.toolbar}>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setNewsSourceModalVisible(true)}>
                  添加数据源
                </Button>
              </div>
              <Table 
                columns={newsSourceColumns} 
                dataSource={mockNewsSources} 
                rowKey="id"
                pagination={false}
              />
            </div>
          </TabPane>

          {/* 外部集成 */}
          <TabPane 
            tab={<span><ApiOutlined />外部集成</span>} 
            key="integration"
          >
            <div className={styles.tabContent}>
              <Alert
                message="第三方服务集成"
                description="配置与企业微信、钉钉、飞书、GitLab、Jira等第三方服务的集成"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <div className={styles.toolbar}>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIntegrationModalVisible(true)}>
                  添加集成
                </Button>
              </div>
              <Table 
                columns={integrationColumns} 
                dataSource={mockIntegrations} 
                rowKey="id"
                pagination={false}
              />
            </div>
          </TabPane>

          {/* 数据变更日志 */}
          <TabPane 
            tab={<span><DatabaseOutlined />数据变更</span>} 
            key="dataChangeLog"
          >
            <div className={styles.tabContent}>
              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={6}>
                  <Card size="small">
                    <Statistic title="今日变更" value={128} />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card size="small">
                    <Statistic title="新增" value={45} valueStyle={{ color: '#52c41a' }} />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card size="small">
                    <Statistic title="更新" value={72} valueStyle={{ color: '#1890ff' }} />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card size="small">
                    <Statistic title="删除" value={11} valueStyle={{ color: '#ff4d4f' }} />
                  </Card>
                </Col>
              </Row>
              <Table 
                columns={dataChangeLogColumns} 
                dataSource={mockDataChangeLogs} 
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            </div>
          </TabPane>

          {/* 审计报告 */}
          <TabPane 
            tab={<span><FileProtectOutlined />审计报告</span>} 
            key="auditReport"
          >
            <div className={styles.tabContent}>
              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={6}>
                  <Card size="small">
                    <Statistic title="报告总数" value={mockAuditReports.length} />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card size="small">
                    <Statistic title="已发布" value={1} valueStyle={{ color: '#52c41a' }} />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card size="small">
                    <Statistic title="审核中" value={1} valueStyle={{ color: '#1890ff' }} />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card size="small">
                    <Statistic title="草稿" value={1} />
                  </Card>
                </Col>
              </Row>
              <div className={styles.toolbar}>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setAuditReportModalVisible(true)}>
                  生成报告
                </Button>
              </div>
              <Table 
                columns={auditReportColumns} 
                dataSource={mockAuditReports} 
                rowKey="id"
                pagination={false}
              />
            </div>
          </TabPane>

          {/* 合规检查 */}
          <TabPane 
            tab={<span><AuditOutlined />合规检查</span>} 
            key="compliance"
          >
            <div className={styles.tabContent}>
              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={6}>
                  <Card size="small">
                    <Statistic 
                      title="合规率" 
                      value={85} 
                      suffix="%" 
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card size="small">
                    <Statistic title="规则总数" value={mockComplianceRules.length} />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card size="small">
                    <Statistic title="待处理问题" value={2} valueStyle={{ color: '#faad14' }} />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card size="small">
                    <Statistic title="今日检查" value={12} />
                  </Card>
                </Col>
              </Row>

              <Card title="合规规则" size="small" style={{ marginBottom: 16 }}>
                <div className={styles.toolbar}>
                  <Space>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setComplianceRuleModalVisible(true)}>
                      新增规则
                    </Button>
                    <Button icon={<SyncOutlined />}>执行全部检查</Button>
                  </Space>
                </div>
                <Table 
                  columns={complianceRuleColumns} 
                  dataSource={mockComplianceRules} 
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              </Card>

              <Card title="检查记录" size="small">
                <Table 
                  columns={complianceRecordColumns} 
                  dataSource={mockComplianceRecords} 
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              </Card>
            </div>
          </TabPane>
        </Tabs>
      </Card>

      {/* SSO提供商配置弹窗 */}
      <Modal
        title="添加SSO提供商"
        open={ssoModalVisible}
        onCancel={() => setSsoModalVisible(false)}
        onOk={() => {
          message.success('SSO提供商已添加')
          setSsoModalVisible(false)
        }}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="providerName" label="提供商名称" rules={[{ required: true }]}>
            <Input placeholder="请输入提供商名称" />
          </Form.Item>
          <Form.Item name="providerCode" label="提供商代码" rules={[{ required: true }]}>
            <Input placeholder="请输入提供商代码" />
          </Form.Item>
          <Form.Item name="providerType" label="提供商类型" rules={[{ required: true }]}>
            <Select placeholder="请选择提供商类型">
              <Option value="OAUTH2">OAuth2</Option>
              <Option value="SAML">SAML</Option>
              <Option value="LDAP">LDAP</Option>
              <Option value="CAS">CAS</Option>
            </Select>
          </Form.Item>
          <Form.Item name="clientId" label="Client ID">
            <Input placeholder="请输入Client ID" />
          </Form.Item>
          <Form.Item name="clientSecret" label="Client Secret">
            <Input.Password placeholder="请输入Client Secret" />
          </Form.Item>
          <Form.Item name="authorizationUrl" label="授权URL">
            <Input placeholder="请输入授权URL" />
          </Form.Item>
          <Form.Item name="tokenUrl" label="Token URL">
            <Input placeholder="请输入Token URL" />
          </Form.Item>
          <Form.Item name="userInfoUrl" label="用户信息URL">
            <Input placeholder="请输入用户信息URL" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 岗位配置弹窗 */}
      <Modal
        title="新增岗位"
        open={positionModalVisible}
        onCancel={() => setPositionModalVisible(false)}
        onOk={() => {
          message.success('岗位已创建')
          setPositionModalVisible(false)
        }}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="positionCode" label="岗位编码" rules={[{ required: true }]}>
                <Input placeholder="请输入岗位编码" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="positionName" label="岗位名称" rules={[{ required: true }]}>
                <Input placeholder="请输入岗位名称" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="positionLevel" label="岗位级别" rules={[{ required: true }]}>
                <Select placeholder="请选择岗位级别">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
                    <Option key={level} value={level}>{level}级</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="positionCategory" label="岗位类别" rules={[{ required: true }]}>
                <Select placeholder="请选择岗位类别">
                  <Option value="管理类">管理类</Option>
                  <Option value="技术类">技术类</Option>
                  <Option value="业务类">业务类</Option>
                  <Option value="设计类">设计类</Option>
                  <Option value="运营类">运营类</Option>
                  <Option value="其他">其他</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="headcount" label="编制人数">
            <Input type="number" placeholder="请输入编制人数" />
          </Form.Item>
          <Form.Item name="description" label="岗位描述">
            <TextArea rows={3} placeholder="请输入岗位描述" />
          </Form.Item>
          <Form.Item name="responsibilities" label="岗位职责">
            <TextArea rows={3} placeholder="请输入岗位职责" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 人员调动弹窗 */}
      <Modal
        title="发起调动"
        open={transferModalVisible}
        onCancel={() => setTransferModalVisible(false)}
        onOk={() => {
          message.success('调动申请已提交')
          setTransferModalVisible(false)
        }}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="userId" label="调动员工" rules={[{ required: true }]}>
            <Select placeholder="请选择员工">
              <Option value={1}>张三</Option>
              <Option value={2}>李四</Option>
              <Option value={3}>王五</Option>
            </Select>
          </Form.Item>
          <Form.Item name="transferType" label="调动类型" rules={[{ required: true }]}>
            <Select placeholder="请选择调动类型">
              <Option value="DEPARTMENT">部门调动</Option>
              <Option value="POSITION">岗位调动</Option>
              <Option value="PROMOTION">晋升</Option>
              <Option value="DEMOTION">降级</Option>
              <Option value="TRANSFER">调岗</Option>
            </Select>
          </Form.Item>
          <Form.Item name="toDepartmentId" label="目标部门">
            <Select
              placeholder="请选择目标部门"
              loading={loadingDepts}
              notFoundContent={loadingDepts ? <Spin size="small" /> : '暂无部门数据'}
            >
              {departments.map(dept => (
                <Option key={dept.id} value={dept.id}>{dept.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="toPositionId" label="目标岗位">
            <Select placeholder="请选择目标岗位">
              <Option value={1}>高级工程师</Option>
              <Option value={2}>技术负责人</Option>
              <Option value={3}>项目经理</Option>
            </Select>
          </Form.Item>
          <Form.Item name="effectiveDate" label="生效日期" rules={[{ required: true }]}>
            <Input type="date" />
          </Form.Item>
          <Form.Item name="transferReason" label="调动原因">
            <TextArea rows={3} placeholder="请输入调动原因" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 数据权限规则弹窗 */}
      <Modal
        title="新增数据权限规则"
        open={ruleModalVisible}
        onCancel={() => setRuleModalVisible(false)}
        onOk={() => {
          message.success('规则已创建')
          setRuleModalVisible(false)
        }}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="ruleName" label="规则名称" rules={[{ required: true }]}>
            <Input placeholder="请输入规则名称" />
          </Form.Item>
          <Form.Item name="ruleCode" label="规则编码" rules={[{ required: true }]}>
            <Input placeholder="请输入规则编码" />
          </Form.Item>
          <Form.Item name="resourceType" label="资源类型" rules={[{ required: true }]}>
            <Select placeholder="请选择资源类型">
              <Option value="PROJECT">项目</Option>
              <Option value="TASK">任务</Option>
              <Option value="DOCUMENT">文档</Option>
              <Option value="REPORT">报表</Option>
              <Option value="USER">用户</Option>
            </Select>
          </Form.Item>
          <Form.Item name="scopeType" label="范围类型" rules={[{ required: true }]}>
            <Select placeholder="请选择范围类型">
              <Option value="ALL">全部</Option>
              <Option value="SELF">本人</Option>
              <Option value="DEPARTMENT">本部门</Option>
              <Option value="DEPARTMENT_AND_BELOW">本部门及下级</Option>
              <Option value="CUSTOM">自定义</Option>
            </Select>
          </Form.Item>
          <Form.Item name="priority" label="优先级">
            <Input type="number" placeholder="请输入优先级（数值越大优先级越高）" />
          </Form.Item>
          <Form.Item name="description" label="规则描述">
            <TextArea rows={3} placeholder="请输入规则描述" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 新闻源配置弹窗 */}
      <Modal
        title="添加新闻数据源"
        open={newsSourceModalVisible}
        onCancel={() => setNewsSourceModalVisible(false)}
        onOk={() => {
          message.success('数据源已添加')
          setNewsSourceModalVisible(false)
        }}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="sourceName" label="数据源名称" rules={[{ required: true }]}>
            <Input placeholder="请输入数据源名称" />
          </Form.Item>
          <Form.Item name="sourceCode" label="数据源编码" rules={[{ required: true }]}>
            <Input placeholder="请输入数据源编码" />
          </Form.Item>
          <Form.Item name="sourceType" label="数据源类型" rules={[{ required: true }]}>
            <Select placeholder="请选择数据源类型">
              <Option value="RSS">RSS</Option>
              <Option value="API">API</Option>
              <Option value="CRAWLER">爬虫</Option>
              <Option value="MANUAL">手动</Option>
            </Select>
          </Form.Item>
          <Form.Item name="sourceUrl" label="数据源URL">
            <Input placeholder="请输入数据源URL" />
          </Form.Item>
          <Form.Item name="fetchInterval" label="抓取间隔（秒）">
            <Input type="number" placeholder="请输入抓取间隔" defaultValue={3600} />
          </Form.Item>
          <Form.Item name="category" label="新闻分类">
            <Select placeholder="请选择新闻分类">
              <Option value="政策">政策</Option>
              <Option value="行业">行业</Option>
              <Option value="科技">科技</Option>
              <Option value="财经">财经</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 外部集成配置弹窗 */}
      <Modal
        title="添加外部集成"
        open={integrationModalVisible}
        onCancel={() => setIntegrationModalVisible(false)}
        onOk={() => {
          message.success('集成已添加')
          setIntegrationModalVisible(false)
        }}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="integrationName" label="集成名称" rules={[{ required: true }]}>
            <Input placeholder="请输入集成名称" />
          </Form.Item>
          <Form.Item name="integrationCode" label="集成编码" rules={[{ required: true }]}>
            <Input placeholder="请输入集成编码" />
          </Form.Item>
          <Form.Item name="integrationType" label="集成类型" rules={[{ required: true }]}>
            <Select placeholder="请选择集成类型">
              <Option value="WECHAT_WORK">企业微信</Option>
              <Option value="DINGTALK">钉钉</Option>
              <Option value="FEISHU">飞书</Option>
              <Option value="GITLAB">GitLab</Option>
              <Option value="JIRA">Jira</Option>
              <Option value="CONFLUENCE">Confluence</Option>
            </Select>
          </Form.Item>
          <Form.Item name="appId" label="App ID">
            <Input placeholder="请输入App ID" />
          </Form.Item>
          <Form.Item name="appSecret" label="App Secret">
            <Input.Password placeholder="请输入App Secret" />
          </Form.Item>
          <Form.Item name="webhookUrl" label="Webhook URL">
            <Input placeholder="请输入Webhook URL" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 生成审计报告弹窗 */}
      <Modal
        title="生成审计报告"
        open={auditReportModalVisible}
        onCancel={() => setAuditReportModalVisible(false)}
        onOk={() => {
          message.success('报告生成中...')
          setAuditReportModalVisible(false)
        }}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="reportName" label="报告名称" rules={[{ required: true }]}>
            <Input placeholder="请输入报告名称" />
          </Form.Item>
          <Form.Item name="reportType" label="报告类型" rules={[{ required: true }]}>
            <Select placeholder="请选择报告类型">
              <Option value="OPERATION">操作审计</Option>
              <Option value="SECURITY">安全审计</Option>
              <Option value="DATA">数据审计</Option>
              <Option value="COMPLIANCE">合规审计</Option>
            </Select>
          </Form.Item>
          <Form.Item name="templateId" label="报告模板" rules={[{ required: true }]}>
            <Select placeholder="请选择报告模板">
              <Option value={1}>操作审计日报模板</Option>
              <Option value={2}>操作审计周报模板</Option>
              <Option value={3}>安全审计报告模板</Option>
            </Select>
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="reportPeriodStart" label="开始日期" rules={[{ required: true }]}>
                <Input type="date" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="reportPeriodEnd" label="结束日期" rules={[{ required: true }]}>
                <Input type="date" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* 合规规则配置弹窗 */}
      <Modal
        title="新增合规规则"
        open={complianceRuleModalVisible}
        onCancel={() => setComplianceRuleModalVisible(false)}
        onOk={() => {
          message.success('规则已创建')
          setComplianceRuleModalVisible(false)
        }}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="ruleName" label="规则名称" rules={[{ required: true }]}>
            <Input placeholder="请输入规则名称" />
          </Form.Item>
          <Form.Item name="ruleCode" label="规则编码" rules={[{ required: true }]}>
            <Input placeholder="请输入规则编码" />
          </Form.Item>
          <Form.Item name="ruleCategory" label="规则类别" rules={[{ required: true }]}>
            <Select placeholder="请选择规则类别">
              <Option value="SECURITY">安全</Option>
              <Option value="PRIVACY">隐私</Option>
              <Option value="DATA_PROTECTION">数据保护</Option>
              <Option value="ACCESS_CONTROL">访问控制</Option>
            </Select>
          </Form.Item>
          <Form.Item name="checkType" label="检查类型" rules={[{ required: true }]}>
            <Select placeholder="请选择检查类型">
              <Option value="REALTIME">实时</Option>
              <Option value="SCHEDULED">定时</Option>
              <Option value="MANUAL">手动</Option>
            </Select>
          </Form.Item>
          <Form.Item name="severity" label="严重程度" rules={[{ required: true }]}>
            <Select placeholder="请选择严重程度">
              <Option value="LOW">低</Option>
              <Option value="MEDIUM">中</Option>
              <Option value="HIGH">高</Option>
              <Option value="CRITICAL">严重</Option>
            </Select>
          </Form.Item>
          <Form.Item name="ruleDescription" label="规则描述">
            <TextArea rows={3} placeholder="请输入规则描述" />
          </Form.Item>
          <Form.Item name="remediationSteps" label="修复步骤">
            <TextArea rows={3} placeholder="请输入修复步骤" />
          </Form.Item>
          <Form.Item name="referenceStandard" label="参考标准">
            <Input placeholder="如：ISO27001、GDPR等" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default SystemManagementPage