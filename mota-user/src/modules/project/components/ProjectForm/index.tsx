/**
 * 项目表单组件 - 支持创建和编辑
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Space,
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
import { useProjectForm } from './useProjectForm'
import { PROJECT_COLORS } from './types'
import type { ProjectFormProps, DepartmentTaskItem } from './types'
import styles from './index.module.css'

const { TextArea } = Input
const { RangePicker } = DatePicker

const ProjectForm: React.FC<ProjectFormProps> = ({
  mode = 'create',
  initialData,
  onSubmit,
  onCancel
}) => {
  const navigate = useNavigate()
  
  const {
    form,
    loading,
    loadingData,
    loadingKey,
    currentStep,
    selectedColor,
    projectKey,
    formData,
    departments,
    users,
    selectedDepartments,
    selectedMembers,
    milestones,
    newMilestone,
    setSelectedColor,
    setNewMilestone,
    handleNext,
    handlePrev,
    handleStepClick,
    handleDepartmentToggle,
    handleMemberToggle,
    handleSelectAllDeptMembers,
    handleAddMilestone,
    handleDeleteMilestone,
    handleUpdateMilestoneTasks,
    handleAIGenerateMilestones,
    handleQuickAssignAllDepartments,
    handleSubmit
  } = useProjectForm({ mode, initialData, onSubmit })

  // 部门任务分配弹窗状态
  const [assignModalVisible, setAssignModalVisible] = React.useState(false)
  const [currentMilestoneId, setCurrentMilestoneId] = React.useState<string | null>(null)
  const [tempDepartmentTasks, setTempDepartmentTasks] = React.useState<DepartmentTaskItem[]>([])

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      navigate('/projects')
    }
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
  const handleUpdateDepartmentTask = (deptId: string | number, field: string, value: unknown) => {
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
      handleUpdateMilestoneTasks(currentMilestoneId, tempDepartmentTasks)
    }
    setAssignModalVisible(false)
    setCurrentMilestoneId(null)
    setTempDepartmentTasks([])
  }

  // 渲染步骤内容
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderBasicInfoStep()
      case 1:
        return renderDepartmentStep()
      case 2:
        return renderMemberStep()
      case 3:
        return renderMilestoneStep()
      default:
        return null
    }
  }

  // 基本信息步骤
  const renderBasicInfoStep = () => (
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
            <Input size="large" placeholder="请输入项目名称" />
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

      <Form.Item label="项目描述" name="description">
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
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无员工">
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
                  <Select.Option key={String(user.id)} value={user.id}>
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
          {PROJECT_COLORS.map(color => (
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

  // 选择部门步骤
  const renderDepartmentStep = () => (
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
              key={String(dept.id)}
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

  // 添加成员步骤
  const renderMemberStep = () => (
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
              <div key={String(deptId)} className={styles.memberGroup}>
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
                        key={String(member.id)}
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

  // 设置里程碑步骤
  const renderMilestoneStep = () => (
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
          <Button icon={<RobotOutlined />} onClick={handleAIGenerateMilestones}>
            AI智能生成里程碑建议
          </Button>
          {milestones.length > 0 && selectedDepartments.length > 0 && (
            <Button icon={<ApartmentOutlined />} onClick={handleQuickAssignAllDepartments}>
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
                              <Select.Option key={String(user.id)} value={user.id}>
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
    </div>
  )

  // 渲染预览卡片
  const renderPreviewCard = () => (
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
                  <Tooltip key={String(memberId)} title={memberName}>
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
  )

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={handleCancel}
          className={styles.backBtn}
        >
          返回项目列表
        </Button>
        <h1 className={styles.title}>
          {mode === 'create' ? '创建新项目' : '编辑项目'}
        </h1>
        <p className={styles.subtitle}>
          {mode === 'create' ? '填写项目信息，开始您的项目管理之旅' : '修改项目信息'}
        </p>
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
                  <Button onClick={handlePrev}>上一步</Button>
                )}
              </div>
              <Space>
                <Button onClick={handleCancel}>取消</Button>
                {currentStep < 3 ? (
                  <Button type="primary" onClick={handleNext}>下一步</Button>
                ) : (
                  <Button type="primary" loading={loading} onClick={handleSubmit}>
                    {mode === 'create' ? '完成创建' : '保存修改'}
                  </Button>
                )}
              </Space>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          {renderPreviewCard()}

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

export default ProjectForm