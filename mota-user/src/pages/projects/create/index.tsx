import { useState, useEffect, useRef } from 'react'
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
  RobotOutlined,
  CheckOutlined,
  EditOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import * as projectApi from '@/services/api/project'
import { departmentApi } from '@/services/api'
import { getUsers } from '@/services/api/user'
import type { Department } from '@/services/api/department'
import { useTaskDecompose } from '@/modules/ai/hooks/useTaskDecompose'
import type { TaskDecomposeFormData } from '@/modules/ai/types'
import styles from './index.module.css'

const { TextArea } = Input
const { RangePicker } = DatePicker

// 项目颜色
const projectColors = [
  '#2b7de9', '#52c41a', '#722ed1', '#fa8c16', 
  '#13c2c2', '#eb2f96', '#f5222d', '#faad14'
]

// 部门任务分配接口
interface DepartmentTaskItem {
  departmentId: string | number
  managerId?: string | number
  name?: string
  description?: string
  priority?: string
}

// 里程碑接口
interface MilestoneItem {
  id: string
  name: string
  targetDate: string
  description?: string
  departmentTasks?: DepartmentTaskItem[]
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
  
  // 里程碑部门任务分配弹窗
  const [assignModalVisible, setAssignModalVisible] = useState(false)
  const [currentMilestoneId, setCurrentMilestoneId] = useState<string | null>(null)
  const [tempDepartmentTasks, setTempDepartmentTasks] = useState<DepartmentTaskItem[]>([])
  
  // 表单数据
  const [formData, setFormData] = useState<any>({})
  
  // 项目标识（系统自动生成）
  const [projectKey, setProjectKey] = useState<string>('')
  const [loadingKey, setLoadingKey] = useState(false)
  
  // AI任务分解
  const [aiDecomposeModalVisible, setAiDecomposeModalVisible] = useState(false)
  const [aiGeneratingMilestones, setAiGeneratingMilestones] = useState(false)
  
  // 初始化AI任务分解Hook
  const taskDecompose = useTaskDecompose({
    projectId: 'temp', // 临时项目ID，实际项目创建后会替换
    onSuccess: () => {
      message.success('AI里程碑分解完成')
      setAiDecomposeModalVisible(false)
    },
    onError: (error) => {
      message.error(error)
      setAiGeneratingMilestones(false)
    }
  })


  // 防止重复请求的 ref
  const dataLoadedRef = useRef(false)
  const loadingDataRef = useRef(false)

  useEffect(() => {
    if (dataLoadedRef.current || loadingDataRef.current) {
      return
    }
    loadData()
    loadNextProjectKey()
  }, [])

  const loadData = async () => {
    if (loadingDataRef.current) {
      return
    }
    loadingDataRef.current = true
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
      loadingDataRef.current = false
      dataLoadedRef.current = true
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
          description: m.description,
          departmentTasks: m.departmentTasks?.map(dt => ({
            departmentId: String(dt.departmentId),
            managerId: dt.managerId ? String(dt.managerId) : undefined,
            name: dt.name,
            description: dt.description,
            priority: dt.priority || 'medium',
            endDate: m.targetDate
          }))
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

  // 打开部门任务分配弹窗
  const handleOpenAssignModal = (milestoneId: string) => {
    const milestone = milestones.find(m => m.id === milestoneId)
    setCurrentMilestoneId(milestoneId)
    setTempDepartmentTasks(milestone?.departmentTasks || [])
    setAssignModalVisible(true)
  }

  // 切换部门任务分配
  const handleToggleDepartmentTask = (deptId: string | number) => {
    const exists = tempDepartmentTasks.find(dt => String(dt.departmentId) === String(deptId))
    if (exists) {
      setTempDepartmentTasks(tempDepartmentTasks.filter(dt => String(dt.departmentId) !== String(deptId)))
    } else {
      const dept = departments.find(d => String(d.id) === String(deptId))
      setTempDepartmentTasks([...tempDepartmentTasks, {
        departmentId: deptId,
        managerId: dept?.managerId,
        name: undefined,
        priority: 'medium'
      }])
    }
  }

  // 更新部门任务详情
  const handleUpdateDepartmentTask = (deptId: string | number, field: string, value: any) => {
    setTempDepartmentTasks(tempDepartmentTasks.map(dt => {
      if (String(dt.departmentId) === String(deptId)) {
        return { ...dt, [field]: value }
      }
      return dt
    }))
  }

  // 保存部门任务分配
  const handleSaveAssignment = () => {
    if (currentMilestoneId) {
      setMilestones(milestones.map(m => {
        if (m.id === currentMilestoneId) {
          return { ...m, departmentTasks: tempDepartmentTasks }
        }
        return m
      }))
    }
    setAssignModalVisible(false)
    setCurrentMilestoneId(null)
    setTempDepartmentTasks([])
    message.success('部门任务分配已保存')
  }

  // 为所有里程碑快速分配所有已选部门
  const handleQuickAssignAllDepartments = () => {
    if (selectedDepartments.length === 0) {
      message.warning('请先选择参与部门')
      return
    }
    
    const updatedMilestones = milestones.map(m => ({
      ...m,
      departmentTasks: selectedDepartments.map(deptId => {
        const dept = departments.find(d => String(d.id) === String(deptId))
        return {
          departmentId: deptId,
          managerId: dept?.managerId,
          name: undefined,
          priority: 'medium' as string
        }
      })
    }))
    setMilestones(updatedMilestones)
    message.success('已为所有里程碑分配部门任务')
  }

  // AI生成里程碑建议
  const handleAIGenerateMilestones = async () => {
    const projectName = formData.name || form.getFieldValue('name')
    const projectDescription = formData.description || form.getFieldValue('description')
    const dateRange = formData.dateRange || form.getFieldValue('dateRange')
    
    if (!projectName) {
      message.warning('请先输入项目名称')
      return
    }
    
    if (!projectDescription || projectDescription.length < 20) {
      message.warning('请先输入项目描述（至少20个字符），以便AI更好地理解项目需求')
      return
    }
    
    if (selectedDepartments.length === 0) {
      message.warning('请先选择参与部门')
      return
    }
    
    if (!dateRange || !dateRange[0] || !dateRange[1]) {
      message.warning('请先设置项目周期')
      return
    }
    
    setAiGeneratingMilestones(true)
    setAiDecomposeModalVisible(true)
    
    // 准备AI任务分解数据
    const decomposeData: TaskDecomposeFormData = {
      projectName,
      projectDescription,
      departments: selectedDepartments.map(deptId => {
        const dept = departments.find(d => String(d.id) === String(deptId))
        return dept?.name || String(deptId)
      }),
      startDate: dateRange[0].format('YYYY-MM-DD'),
      endDate: dateRange[1].format('YYYY-MM-DD')
    }
    
    try {
      // 调用AI任务分解
      await taskDecompose.generateDecomposition(decomposeData)
    } catch (error) {
      console.error('AI任务分解失败:', error)
      setAiGeneratingMilestones(false)
      setAiDecomposeModalVisible(false)
    }
  }
  
  // 应用AI分解结果为里程碑
  const handleApplyAIDecomposition = () => {
    const selectedSuggestions = taskDecompose.selectedSuggestions
    if (selectedSuggestions.length === 0) {
      message.warning('请至少选择一个任务建议')
      return
    }
    
    const dateRange = formData.dateRange || form.getFieldValue('dateRange')
    const startDate = dateRange[0]
    const duration = dateRange[1].diff(startDate, 'day')
    
    // 将AI建议转换为里程碑格式
    const aiGeneratedMilestones: MilestoneItem[] = selectedSuggestions.map((suggestion, index) => {
      // 根据估算天数和项目周期计算目标日期
      const progressRatio = (suggestion.estimatedDays * (index + 1)) / taskDecompose.totalEstimatedDays
      const targetDate = startDate.add(Math.floor(duration * Math.min(progressRatio, 0.9)), 'day')
      
      return {
        id: Date.now().toString() + '_' + index,
        name: suggestion.name,
        targetDate: targetDate.format('YYYY-MM-DD'),
        description: suggestion.description,
        departmentTasks: suggestion.suggestedDepartment ? [{
          departmentId: selectedDepartments.find(deptId => {
            const dept = departments.find(d => String(d.id) === String(deptId))
            return dept?.name === suggestion.suggestedDepartment
          }) || selectedDepartments[0],
          name: suggestion.name,
          description: suggestion.description,
          priority: suggestion.suggestedPriority
        }] : []
      }
    })
    
    setMilestones(aiGeneratedMilestones)
    setAiDecomposeModalVisible(false)
    setAiGeneratingMilestones(false)
    taskDecompose.clear() // 清理AI分解结果
    message.success(`已应用AI建议，生成${aiGeneratedMilestones.length}个里程碑`)
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
              设置项目的关键节点，并为每个里程碑分配负责部门
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
              <Space>
                <Button
                  icon={<RobotOutlined />}
                  onClick={handleAIGenerateMilestones}
                >
                  AI智能生成里程碑建议
                </Button>
                {milestones.length > 0 && selectedDepartments.length > 0 && (
                  <Button
                    icon={<ApartmentOutlined />}
                    onClick={handleQuickAssignAllDepartments}
                  >
                    快速分配所有部门
                  </Button>
                )}
              </Space>
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
                      <Tooltip title="分配部门任务" key="assign">
                        <Button
                          type="text"
                          icon={<ApartmentOutlined />}
                          onClick={() => handleOpenAssignModal(item.id)}
                          style={{ color: item.departmentTasks && item.departmentTasks.length > 0 ? '#52c41a' : undefined }}
                        />
                      </Tooltip>,
                      <Button
                        key="delete"
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
                      title={
                        <Space>
                          {item.name}
                          {item.departmentTasks && item.departmentTasks.length > 0 && (
                            <Tag color="blue" style={{ marginLeft: 8 }}>
                              {item.departmentTasks.length} 个部门
                            </Tag>
                          )}
                        </Space>
                      }
                      description={
                        <div>
                          <Space>
                            <CalendarOutlined />
                            {item.targetDate}
                            {item.description && <span>· {item.description}</span>}
                          </Space>
                          {item.departmentTasks && item.departmentTasks.length > 0 && (
                            <div style={{ marginTop: 4 }}>
                              <Space size={4} wrap>
                                {item.departmentTasks.map(dt => {
                                  const dept = departments.find(d => String(d.id) === String(dt.departmentId))
                                  return (
                                    <Tag key={String(dt.departmentId)} style={{ margin: 0 }}>
                                      {dept?.name || '未知部门'}
                                    </Tag>
                                  )
                                })}
                              </Space>
                            </div>
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
            
            {/* 部门任务分配弹窗 */}
            <Modal
              title="分配部门任务"
              open={assignModalVisible}
              onOk={handleSaveAssignment}
              onCancel={() => {
                setAssignModalVisible(false)
                setCurrentMilestoneId(null)
                setTempDepartmentTasks([])
              }}
              width={700}
              okText="保存"
              cancelText="取消"
            >
              <div style={{ marginBottom: 16 }}>
                <p style={{ color: '#666' }}>
                  选择需要参与此里程碑的部门，系统将自动为每个部门创建任务
                </p>
              </div>
              
              {selectedDepartments.length === 0 ? (
                <Empty description="请先在第二步选择参与部门" />
              ) : (
                <div className={styles.departmentAssignList}>
                  {selectedDepartments.map(deptId => {
                    const dept = departments.find(d => String(d.id) === String(deptId))
                    const isAssigned = tempDepartmentTasks.some(dt => String(dt.departmentId) === String(deptId))
                    const taskDetail = tempDepartmentTasks.find(dt => String(dt.departmentId) === String(deptId))
                    const deptUsers = users.filter(u => String(u.departmentId) === String(deptId))
                    
                    return (
                      <div key={String(deptId)} className={styles.departmentAssignItem}>
                        <div className={styles.departmentAssignHeader}>
                          <Checkbox
                            checked={isAssigned}
                            onChange={() => handleToggleDepartmentTask(deptId)}
                          >
                            <strong>{dept?.name}</strong>
                          </Checkbox>
                          {dept?.managerName && (
                            <span style={{ color: '#999', fontSize: 12 }}>
                              负责人: {dept.managerName}
                            </span>
                          )}
                        </div>
                        
                        {isAssigned && (
                          <div className={styles.departmentAssignDetail}>
                            <Row gutter={12}>
                              <Col span={12}>
                                <div style={{ marginBottom: 8 }}>
                                  <span style={{ fontSize: 12, color: '#666' }}>任务负责人</span>
                                </div>
                                <Select
                                  size="small"
                                  style={{ width: '100%' }}
                                  placeholder="选择负责人"
                                  value={taskDetail?.managerId}
                                  onChange={(value) => handleUpdateDepartmentTask(deptId, 'managerId', value)}
                                  allowClear
                                >
                                  {deptUsers.map(user => (
                                    <Select.Option key={user.id} value={user.id}>
                                      {user.nickname || user.username}
                                    </Select.Option>
                                  ))}
                                </Select>
                              </Col>
                              <Col span={12}>
                                <div style={{ marginBottom: 8 }}>
                                  <span style={{ fontSize: 12, color: '#666' }}>优先级</span>
                                </div>
                                <Select
                                  size="small"
                                  style={{ width: '100%' }}
                                  value={taskDetail?.priority || 'medium'}
                                  onChange={(value) => handleUpdateDepartmentTask(deptId, 'priority', value)}
                                >
                                  <Select.Option value="low">低</Select.Option>
                                  <Select.Option value="medium">中</Select.Option>
                                  <Select.Option value="high">高</Select.Option>
                                  <Select.Option value="urgent">紧急</Select.Option>
                                </Select>
                              </Col>
                            </Row>
                            <Row gutter={12} style={{ marginTop: 8 }}>
                              <Col span={24}>
                                <div style={{ marginBottom: 8 }}>
                                  <span style={{ fontSize: 12, color: '#666' }}>任务名称（可选，默认使用里程碑名称）</span>
                                </div>
                                <Input
                                  size="small"
                                  placeholder="自定义任务名称"
                                  value={taskDetail?.name}
                                  onChange={(e) => handleUpdateDepartmentTask(deptId, 'name', e.target.value)}
                                />
                              </Col>
                            </Row>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
              </Modal>
              
              {/* AI任务分解结果弹窗 */}
              <Modal
                title={
                  <Space>
                    <RobotOutlined />
                    AI智能任务分解
                  </Space>
                }
                open={aiDecomposeModalVisible}
                onCancel={() => {
                  setAiDecomposeModalVisible(false)
                  setAiGeneratingMilestones(false)
                  taskDecompose.clear()
                }}
                width={800}
                footer={[
                  <Button key="cancel" onClick={() => {
                    setAiDecomposeModalVisible(false)
                    setAiGeneratingMilestones(false)
                    taskDecompose.clear()
                  }}>
                    取消
                  </Button>,
                  <Button
                    key="apply"
                    type="primary"
                    disabled={taskDecompose.status !== 'success' || taskDecompose.selectedSuggestions.length === 0}
                    onClick={handleApplyAIDecomposition}
                  >
                    应用选中的建议（{taskDecompose.selectedSuggestions.length}项）
                  </Button>
                ]}
              >
                {taskDecompose.status === 'loading' || aiGeneratingMilestones ? (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Spin size="large" />
                    <p style={{ marginTop: 16, color: '#666' }}>AI正在分析项目需求，生成任务建议...</p>
                  </div>
                ) : taskDecompose.status === 'error' ? (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Empty
                      description={taskDecompose.error || 'AI任务分解失败'}
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  </div>
                ) : taskDecompose.status === 'success' && taskDecompose.suggestions.length > 0 ? (
                  <div>
                    <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 6 }}>
                      <p style={{ margin: 0, fontSize: 14 }}>
                        <strong>AI分析结果：</strong>预计总工期 <Tag color="blue">{taskDecompose.totalEstimatedDays} 天</Tag>
                      </p>
                      {taskDecompose.riskAssessment && (
                        <p style={{ margin: '8px 0 0', fontSize: 12, color: '#666' }}>
                          风险评估：{taskDecompose.riskAssessment}
                        </p>
                      )}
                    </div>
                    
                    <div style={{ marginBottom: 16 }}>
                      <Space>
                        <Button
                          size="small"
                          onClick={taskDecompose.selectAll}
                          disabled={taskDecompose.suggestions.every(s => s.selected)}
                        >
                          <CheckOutlined /> 全选
                        </Button>
                        <Button
                          size="small"
                          onClick={taskDecompose.deselectAll}
                          disabled={taskDecompose.suggestions.every(s => !s.selected)}
                        >
                          取消全选
                        </Button>
                      </Space>
                    </div>
                    
                    <List
                      dataSource={taskDecompose.suggestions}
                      renderItem={(suggestion) => (
                        <List.Item
                          style={{
                            border: suggestion.selected ? '1px solid #1890ff' : '1px solid #d9d9d9',
                            borderRadius: 6,
                            marginBottom: 8,
                            backgroundColor: suggestion.selected ? '#f6ffed' : '#fff'
                          }}
                          actions={[
                            <Checkbox
                              key="select"
                              checked={suggestion.selected}
                              onChange={() => taskDecompose.toggleSelection(suggestion.id)}
                            >
                              选择
                            </Checkbox>
                          ]}
                        >
                          <List.Item.Meta
                            avatar={
                              <Avatar
                                style={{ backgroundColor: suggestion.selected ? '#52c41a' : '#d9d9d9' }}
                                icon={suggestion.selected ? <CheckOutlined /> : <EditOutlined />}
                              />
                            }
                            title={
                              <Space>
                                {suggestion.name}
                                <Tag color={
                                  suggestion.suggestedPriority === 'high' || suggestion.suggestedPriority === 'urgent' ? 'red' :
                                  suggestion.suggestedPriority === 'medium' ? 'orange' : 'blue'
                                }>
                                  {suggestion.suggestedPriority === 'low' ? '低优先级' :
                                   suggestion.suggestedPriority === 'medium' ? '中优先级' :
                                   suggestion.suggestedPriority === 'high' ? '高优先级' : '紧急'}
                                </Tag>
                                <Tag color="cyan">{suggestion.estimatedDays} 天</Tag>
                                {suggestion.suggestedDepartment && (
                                  <Tag color="geekblue">{suggestion.suggestedDepartment}</Tag>
                                )}
                              </Space>
                            }
                            description={suggestion.description}
                          />
                        </List.Item>
                      )}
                    />
                  </div>
                ) : (
                  <Empty description="暂无AI分解结果" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </Modal>
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