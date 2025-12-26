import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Space,
  message,
  DatePicker,
  Avatar,
  Divider,
  Row,
  Col,
  Steps,
  Checkbox,
  List,
  Tag,
  Empty,
  Tooltip,
  Spin,
  Modal
} from 'antd'
import {
  ArrowLeftOutlined,
  PlusOutlined,
  UserAddOutlined,
  ProjectOutlined,
  TeamOutlined,
  ApartmentOutlined,
  FlagOutlined,
  DeleteOutlined,
  UserOutlined,
  CalendarOutlined,
  RobotOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import * as projectApi from '@/services/api/project'
import { departmentApi } from '@/services/api'
import { getUsers } from '@/services/api/user'
import type { Department } from '@/services/api/department'
import styles from './index.module.css'

const { TextArea } = Input
const { RangePicker } = DatePicker

// 项目颜色
const projectColors = [
  '#2b7de9', '#52c41a', '#722ed1', '#fa8c16', 
  '#13c2c2', '#eb2f96', '#f5222d', '#faad14'
]

// 里程碑接口
interface MilestoneItem {
  id: string
  name: string
  targetDate: string
  description?: string
}

/**
 * 创建项目页面 - V2.0
 * 支持步骤式创建：基本信息 -> 选择部门 -> 添加成员 -> 设置里程碑
 */
const CreateProject = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedColor, setSelectedColor] = useState(projectColors[0])
  
  // 部门和成员数据
  const [departments, setDepartments] = useState<Department[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(false)
  
  // 选中的部门和成员
  const [selectedDepartments, setSelectedDepartments] = useState<(string | number)[]>([])
  const [selectedMembers, setSelectedMembers] = useState<(string | number)[]>([])
  
  // 里程碑
  const [milestones, setMilestones] = useState<MilestoneItem[]>([])
  const [newMilestone, setNewMilestone] = useState({ name: '', targetDate: '', description: '' })
  
  // 表单数据
  const [formData, setFormData] = useState<any>({})
  
  // 项目标识（系统自动生成）
  const [projectKey, setProjectKey] = useState<string>('')
  const [loadingKey, setLoadingKey] = useState(false)


  useEffect(() => {
    loadData()
    loadNextProjectKey()
  }, [])

  const loadData = async () => {
    setLoadingData(true)
    try {
      const [deptsRes, usersRes] = await Promise.all([
        departmentApi.getDepartmentsByOrgId(1),
        getUsers()
      ])
      
      if (deptsRes && Array.isArray(deptsRes)) {
        setDepartments(deptsRes)
      } else {
        setDepartments([])
      }
      
      if (usersRes && (usersRes as any).list) {
        setUsers((usersRes as any).list)
      } else {
        setUsers([])
      }
    } catch (error) {
      console.error('Failed to load data:', error)
      message.error('加载数据失败')
      setDepartments([])
      setUsers([])
    } finally {
      setLoadingData(false)
    }
  }

  // 加载下一个项目标识
  const loadNextProjectKey = async () => {
    setLoadingKey(true)
    try {
      const nextKey = await projectApi.getNextProjectKey()
      setProjectKey(nextKey)
    } catch (error) {
      console.error('Failed to load next project key:', error)
      setProjectKey('AF-0001') // 默认值
    } finally {
      setLoadingKey(false)
    }
  }

  // 下一步
  const handleNext = async () => {
    if (currentStep === 0) {
      try {
        const values = await form.validateFields()
        setFormData({ ...formData, ...values })
        setCurrentStep(1)
      } catch {
        // 验证失败
      }
    } else if (currentStep === 1) {
      if (selectedDepartments.length === 0) {
        message.warning('请至少选择一个参与部门')
        return
      }
      setCurrentStep(2)
    } else if (currentStep === 2) {
      setCurrentStep(3)
    }
  }

  // 上一步
  const handlePrev = () => {
    setCurrentStep(currentStep - 1)
  }

  // 点击步骤导航
  const handleStepClick = async (step: number) => {
    // 只允许点击已完成的步骤或当前步骤
    if (step > currentStep) {
      // 如果点击的是后面的步骤，需要先验证当前步骤
      if (currentStep === 0) {
        try {
          const values = await form.validateFields()
          setFormData({ ...formData, ...values })
        } catch {
          message.warning('请先完成当前步骤的必填项')
          return
        }
      } else if (currentStep === 1 && selectedDepartments.length === 0) {
        message.warning('请至少选择一个参与部门')
        return
      }
    }
    
    // 如果是第一步，保存表单数据
    if (currentStep === 0 && step !== 0) {
      try {
        const values = await form.validateFields()
        setFormData({ ...formData, ...values })
      } catch {
        message.warning('请先完成基本信息')
        return
      }
    }
    
    setCurrentStep(step)
  }

  // 提交表单
  const handleSubmit = async () => {
    setLoading(true)
    try {
      const dateRange = formData.dateRange
      // 项目标识由系统自动生成，无需前端传递
      await projectApi.createProject({
        name: formData.name,
        description: formData.description,
        color: selectedColor,
        startDate: dateRange?.[0]?.format('YYYY-MM-DD'),
        endDate: dateRange?.[1]?.format('YYYY-MM-DD'),
        ownerId: formData.ownerId,
        departmentIds: selectedDepartments.map(id => String(id)),
        memberIds: selectedMembers.map(id => String(id)),
        milestones: milestones.map(m => ({
          name: m.name,
          targetDate: m.targetDate,
          description: m.description
        }))
      })
      
      message.success('项目创建成功')
      navigate('/projects')
    } catch (error: unknown) {
      console.error('Create project error:', error)
      const errorMessage = error instanceof Error ? error.message : '创建失败，请重试'
      message.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // 切换部门选择
  const handleDepartmentToggle = (deptId: string | number) => {
    if (selectedDepartments.includes(deptId)) {
      setSelectedDepartments(selectedDepartments.filter(id => id !== deptId))
      // 同时移除该部门的成员
      const deptMembers = users.filter(u => String(u.departmentId) === String(deptId)).map(u => u.id)
      setSelectedMembers(selectedMembers.filter(id => !deptMembers.includes(id)))
    } else {
      setSelectedDepartments([...selectedDepartments, deptId])
    }
  }

  // 切换成员选择
  const handleMemberToggle = (memberId: string | number) => {
    if (selectedMembers.includes(memberId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== memberId))
    } else {
      setSelectedMembers([...selectedMembers, memberId])
    }
  }

  // 全选部门成员
  const handleSelectAllDeptMembers = (deptId: string | number) => {
    const deptMembers = users.filter(u => String(u.departmentId) === String(deptId)).map(u => u.id)
    const allSelected = deptMembers.every(id => selectedMembers.includes(id))
    
    if (allSelected) {
      setSelectedMembers(selectedMembers.filter(id => !deptMembers.includes(id)))
    } else {
      const newMembers = [...selectedMembers]
      deptMembers.forEach(id => {
        if (!newMembers.includes(id)) {
          newMembers.push(id)
        }
      })
      setSelectedMembers(newMembers)
    }
  }

  // 添加里程碑
  const handleAddMilestone = () => {
    if (!newMilestone.name || !newMilestone.targetDate) {
      message.warning('请填写里程碑名称和目标日期')
      return
    }
    
    setMilestones([
      ...milestones,
      {
        id: Date.now().toString(),
        name: newMilestone.name,
        targetDate: newMilestone.targetDate,
        description: newMilestone.description
      }
    ])
    setNewMilestone({ name: '', targetDate: '', description: '' })
  }

  // 删除里程碑
  const handleDeleteMilestone = (id: string) => {
    setMilestones(milestones.filter(m => m.id !== id))
  }

  // AI生成里程碑建议
  const handleAIGenerateMilestones = () => {
    const dateRange = formData.dateRange
    if (!dateRange || !dateRange[0] || !dateRange[1]) {
      message.warning('请先设置项目周期')
      return
    }
    
    const startDate = dateRange[0]
    const endDate = dateRange[1]
    const duration = endDate.diff(startDate, 'day')
    
    // 根据项目周期生成建议里程碑
    const suggestedMilestones: MilestoneItem[] = []
    
    if (duration >= 30) {
      suggestedMilestones.push({
        id: Date.now().toString() + '_1',
        name: '需求确认',
        targetDate: startDate.add(Math.floor(duration * 0.15), 'day').format('YYYY-MM-DD'),
        description: '完成需求分析和确认'
      })
    }
    
    if (duration >= 60) {
      suggestedMilestones.push({
        id: Date.now().toString() + '_2',
        name: '方案设计完成',
        targetDate: startDate.add(Math.floor(duration * 0.3), 'day').format('YYYY-MM-DD'),
        description: '完成整体方案设计'
      })
    }
    
    suggestedMilestones.push({
      id: Date.now().toString() + '_3',
      name: '中期检查',
      targetDate: startDate.add(Math.floor(duration * 0.5), 'day').format('YYYY-MM-DD'),
      description: '项目中期进度检查'
    })
    
    if (duration >= 45) {
      suggestedMilestones.push({
        id: Date.now().toString() + '_4',
        name: '测试验收',
        targetDate: startDate.add(Math.floor(duration * 0.85), 'day').format('YYYY-MM-DD'),
        description: '完成测试和验收'
      })
    }
    
    suggestedMilestones.push({
      id: Date.now().toString() + '_5',
      name: '项目完成',
      targetDate: endDate.format('YYYY-MM-DD'),
      description: '项目交付和总结'
    })
    
    setMilestones(suggestedMilestones)
    message.success('已生成里程碑建议')
  }

  // 步骤内容
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              visibility: 'private',
              ...formData
            }}
          >
            <div className={styles.sectionTitle}>基本信息</div>
            
            <Row gutter={16}>
              <Col span={16}>
                <Form.Item
                  label="项目名称"
                  name="name"
                  rules={[{ required: true, message: '请输入项目名称' }]}
                >
                  <Input
                    size="large"
                    placeholder="请输入项目名称"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="项目标识"
                  tooltip="项目标识由系统自动生成，创建后不可修改"
                >
                  <Input
                    size="large"
                    value={loadingKey ? '加载中...' : projectKey}
                    disabled
                    style={{ backgroundColor: '#f5f5f5', color: '#1a1a1a', fontWeight: 500 }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item 
              label="项目描述" 
              name="description"
            >
              <TextArea 
                rows={4} 
                placeholder="请输入项目描述，帮助团队成员了解项目目标和范围"
                maxLength={500}
                showCount
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item 
                  label="项目周期" 
                  name="dateRange"
                  rules={[{ required: true, message: '请选择项目周期' }]}
                >
                  <RangePicker 
                    size="large" 
                    style={{ width: '100%' }}
                    placeholder={['开始日期', '结束日期']}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="项目负责人"
                  name="ownerId"
                  rules={[{ required: true, message: '请选择项目负责人' }]}
                >
                  <Select
                    size="large"
                    placeholder="请选择项目负责人"
                    notFoundContent={
                      <div style={{ padding: '16px', textAlign: 'center' }}>
                        <Empty
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description="暂无员工"
                        >
                          <Button
                            type="primary"
                            icon={<UserAddOutlined />}
                            onClick={() => navigate('/members?action=add')}
                          >
                            添加员工
                          </Button>
                        </Empty>
                      </div>
                    }
                    dropdownRender={(menu) => (
                      <>
                        {menu}
                        <Divider style={{ margin: '8px 0' }} />
                        <div style={{ padding: '0 8px 8px' }}>
                          <Button
                            type="link"
                            icon={<UserAddOutlined />}
                            onClick={() => navigate('/members?action=add')}
                            style={{ width: '100%' }}
                          >
                            添加新员工
                          </Button>
                        </div>
                      </>
                    )}
                  >
                    {users.map(user => {
                      const displayName = user.nickname || user.username || '未知用户'
                      return (
                        <Select.Option key={user.id} value={user.id}>
                          <Space>
                            <Avatar size="small" src={user.avatar}>{displayName.charAt(0)}</Avatar>
                            {displayName}
                          </Space>
                        </Select.Option>
                      )
                    })}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="项目颜色">
              <div className={styles.colorPicker}>
                {projectColors.map(color => (
                  <div
                    key={color}
                    className={`${styles.colorItem} ${selectedColor === color ? styles.colorItemActive : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            </Form.Item>
          </Form>
        )
      
      case 1:
        return (
          <div>
            <div className={styles.sectionTitle}>
              <ApartmentOutlined style={{ marginRight: 8 }} />
              选择参与部门
            </div>
            <p style={{ color: '#666', marginBottom: 16 }}>
              选择需要参与此项目的部门，后续可以为每个部门分配任务
            </p>
            
            {loadingData ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                <Spin tip="加载部门数据中..." />
              </div>
            ) : departments.length === 0 ? (
              <Empty description="暂无可选部门" />
            ) : (
              <div className={styles.departmentList}>
                {departments.map(dept => (
                  <div
                    key={dept.id}
                    className={`${styles.departmentItem} ${selectedDepartments.some(id => String(id) === String(dept.id)) ? styles.departmentItemSelected : ''}`}
                    onClick={() => handleDepartmentToggle(dept.id)}
                  >
                    <Checkbox checked={selectedDepartments.some(id => String(id) === String(dept.id))} />
                    <div className={styles.departmentInfo}>
                      <div className={styles.departmentName}>{dept.name}</div>
                      <div className={styles.departmentMeta}>
                        <span><UserOutlined /> {dept.memberCount || 0} 人</span>
                        {dept.managerName && <span>负责人: {dept.managerName}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div style={{ marginTop: 16, color: '#666' }}>
              已选择 <strong>{selectedDepartments.length}</strong> 个部门
            </div>
          </div>
        )
      
      case 2:
        return (
          <div>
            <div className={styles.sectionTitle}>
              <TeamOutlined style={{ marginRight: 8 }} />
              添加项目成员
            </div>
            <p style={{ color: '#666', marginBottom: 16 }}>
              从已选部门中选择参与项目的成员
            </p>
            
            {selectedDepartments.length === 0 ? (
              <Empty description="请先选择参与部门" />
            ) : (
              <div className={styles.memberSelection}>
                {selectedDepartments.map(deptId => {
                  const dept = departments.find(d => String(d.id) === String(deptId))
                  const deptMembers = users.filter(u => String(u.departmentId) === String(deptId))
                  const selectedCount = deptMembers.filter(m => selectedMembers.some(id => String(id) === String(m.id))).length
                  const allSelected = deptMembers.length > 0 && deptMembers.every(m => selectedMembers.some(id => String(id) === String(m.id)))
                  
                  return (
                    <div key={deptId} className={styles.memberGroup}>
                      <div className={styles.memberGroupHeader}>
                        <Checkbox 
                          checked={allSelected}
                          indeterminate={selectedCount > 0 && !allSelected}
                          onChange={() => handleSelectAllDeptMembers(deptId)}
                        >
                          <strong>{dept?.name}</strong>
                        </Checkbox>
                        <span className={styles.memberCount}>
                          已选 {selectedCount}/{deptMembers.length} 人
                        </span>
                      </div>
                      <div className={styles.memberList}>
                        {deptMembers.map(member => {
                          const memberDisplayName = member.nickname || member.username || '未知用户'
                          return (
                            <div
                              key={member.id}
                              className={`${styles.memberItem} ${selectedMembers.some(id => String(id) === String(member.id)) ? styles.memberItemSelected : ''}`}
                              onClick={() => handleMemberToggle(member.id)}
                            >
                              <Checkbox checked={selectedMembers.some(id => String(id) === String(member.id))} />
                              <Avatar size="small" src={member.avatar}>{memberDisplayName.charAt(0)}</Avatar>
                              <div className={styles.memberInfo}>
                                <div className={styles.memberName}>{memberDisplayName}</div>
                                <div className={styles.memberRole}>{member.role}</div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            
            <div style={{ marginTop: 16, color: '#666' }}>
              已选择 <strong>{selectedMembers.length}</strong> 名成员
            </div>
          </div>
        )
      
      case 3:
        return (
          <div>
            <div className={styles.sectionTitle}>
              <FlagOutlined style={{ marginRight: 8 }} />
              设置项目里程碑
              <span style={{ fontSize: 12, color: '#999', marginLeft: 8 }}>(可选)</span>
            </div>
            <p style={{ color: '#666', marginBottom: 16 }}>
              设置项目的关键节点，帮助跟踪项目进度
            </p>
            
            <div className={styles.milestoneForm}>
              <Row gutter={12}>
                <Col span={8}>
                  <Input
                    placeholder="里程碑名称"
                    value={newMilestone.name}
                    onChange={(e) => setNewMilestone({ ...newMilestone, name: e.target.value })}
                  />
                </Col>
                <Col span={6}>
                  <DatePicker
                    placeholder="目标日期"
                    style={{ width: '100%' }}
                    value={newMilestone.targetDate ? dayjs(newMilestone.targetDate) : null}
                    onChange={(date) => setNewMilestone({ ...newMilestone, targetDate: date?.format('YYYY-MM-DD') || '' })}
                  />
                </Col>
                <Col span={7}>
                  <Input
                    placeholder="描述（可选）"
                    value={newMilestone.description}
                    onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                  />
                </Col>
                <Col span={3}>
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleAddMilestone}>
                    添加
                  </Button>
                </Col>
              </Row>
            </div>
            
            <div style={{ marginTop: 16, marginBottom: 16 }}>
              <Button 
                icon={<RobotOutlined />} 
                onClick={handleAIGenerateMilestones}
              >
                AI智能生成里程碑建议
              </Button>
            </div>
            
            {milestones.length === 0 ? (
              <Empty description="暂未设置里程碑" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <List
                className={styles.milestoneList}
                dataSource={milestones.sort((a, b) => dayjs(a.targetDate).diff(dayjs(b.targetDate)))}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Button 
                        type="text" 
                        danger 
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteMilestone(item.id)}
                      />
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <div className={styles.milestoneIndex}>
                          <FlagOutlined />
                        </div>
                      }
                      title={item.name}
                      description={
                        <Space>
                          <CalendarOutlined />
                          {item.targetDate}
                          {item.description && <span>· {item.description}</span>}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/projects')}
          className={styles.backBtn}
        >
          返回项目列表
        </Button>
        <h1 className={styles.title}>创建新项目</h1>
        <p className={styles.subtitle}>填写项目信息，开始您的项目管理之旅</p>
      </div>

      <Row gutter={24}>
        <Col xs={24} lg={16}>
          <Card className={styles.formCard}>
            <Steps
              current={currentStep}
              items={[
                { title: '基本信息', icon: <ProjectOutlined /> },
                { title: '选择部门', icon: <ApartmentOutlined /> },
                { title: '添加成员', icon: <TeamOutlined /> },
                { title: '设置里程碑', icon: <FlagOutlined /> },
              ]}
              style={{ marginBottom: 32 }}
              onChange={(step) => handleStepClick(step)}
              className={styles.clickableSteps}
            />
            
            {renderStepContent()}
            
            <Divider />
            
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                {currentStep > 0 && (
                  <Button onClick={handlePrev}>
                    上一步
                  </Button>
                )}
              </div>
              <Space>
                <Button onClick={() => navigate('/projects')}>
                  取消
                </Button>
                {currentStep < 3 ? (
                  <Button type="primary" onClick={handleNext}>
                    下一步
                  </Button>
                ) : (
                  <Button type="primary" loading={loading} onClick={handleSubmit}>
                    完成创建
                  </Button>
                )}
              </Space>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          {/* 预览卡片 */}
          <Card className={styles.previewCard} title="项目预览">
            <div className={styles.previewContent}>
              <Avatar 
                size={64} 
                style={{ backgroundColor: selectedColor }}
                icon={<ProjectOutlined />}
              />
              <h3 className={styles.previewName}>
                {formData.name || form.getFieldValue('name') || '项目名称'}
              </h3>
              <p className={styles.previewKey}>
                {loadingKey ? '加载中...' : projectKey || '系统自动生成'}
              </p>
              <p className={styles.previewDesc}>
                {formData.description || form.getFieldValue('description') || '项目描述将显示在这里'}
              </p>
              
              {selectedDepartments.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ color: '#666', fontSize: 12, marginBottom: 8 }}>参与部门</div>
                  <Space wrap>
                    {selectedDepartments.map(deptId => {
                      const dept = departments.find(d => String(d.id) === String(deptId))
                      return <Tag key={String(deptId)}>{dept?.name}</Tag>
                    })}
                  </Space>
                </div>
              )}
              
              {selectedMembers.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ color: '#666', fontSize: 12, marginBottom: 8 }}>项目成员</div>
                  <Avatar.Group maxCount={5}>
                    {selectedMembers.map(memberId => {
                      const member = users.find(u => u.id === memberId)
                      const memberName = member?.nickname || member?.username || '未知用户'
                      return (
                        <Tooltip key={memberId} title={memberName}>
                          <Avatar src={member?.avatar}>{memberName.charAt(0)}</Avatar>
                        </Tooltip>
                      )
                    })}
                  </Avatar.Group>
                </div>
              )}
              
              {milestones.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ color: '#666', fontSize: 12, marginBottom: 8 }}>里程碑</div>
                  <div style={{ fontSize: 14, color: '#1a1a1a' }}>{milestones.length} 个</div>
                </div>
              )}
            </div>
          </Card>

          {/* 提示信息 */}
          <Card className={styles.tipsCard} title="创建提示">
            <ul className={styles.tipsList}>
              <li>项目标识由系统自动生成（格式：AF-0000），创建后不可修改</li>
              <li>选择参与部门后可以为每个部门分配任务</li>
              <li>里程碑可以帮助跟踪项目关键节点</li>
              <li>创建后可以在设置中修改其他信息</li>
            </ul>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default CreateProject