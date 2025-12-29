/**
 * 任务分解向导组件
 * 支持基于AI的智能任务分解和手动分解
 */

import React, { useState, useEffect } from 'react'
import {
  Steps,
  Card,
  Form,
  Input,
  Select,
  Button,
  List,
  Tag,
  Progress,
  Alert,
  Spin,
  Modal,
  Space,
  Divider,
  Tooltip,
  Switch,
} from 'antd'
import {
  RobotOutlined,
  BulbOutlined,
  TeamOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ExperimentOutlined,
} from '@ant-design/icons'
import { useTaskDecompose } from '@/modules/ai/hooks/useTaskDecompose'
import { claudeClient } from '@/services/claude/claudeClient'
import { useMilestoneStore } from '@/modules/milestone/store/milestoneStore'
import { useProjectStore } from '@/modules/project/store/projectStore'
import { useTaskStore } from '@/modules/task/store/taskStore'
import { Priority } from '@/services/api/task'
import type { Milestone } from '@/modules/milestone/types'
import styles from './index.module.css'

interface TaskDecomposeWizardProps {
  milestoneId: string
  milestone?: Milestone
  visible: boolean
  onClose: () => void
  onSuccess: () => void
}

interface DecomposedTask {
  id: string
  name: string
  description: string
  suggestedDepartment?: string
  suggestedPriority: 'low' | 'medium' | 'high' | 'urgent'
  estimatedDays: number
  dependencies?: string[]
  aiGenerated?: boolean
}

interface DecomposeResult {
  suggestions: DecomposedTask[]
  totalEstimatedDays: number
  riskAssessment: string
}

const { Step } = Steps
const { TextArea } = Input

const TaskDecomposeWizard: React.FC<TaskDecomposeWizardProps> = ({
  milestoneId,
  milestone,
  visible,
  onClose,
  onSuccess,
}) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [form] = Form.useForm()
  
  // 状态管理
  const [loading, setLoading] = useState(false)
  const [aiEnabled, setAiEnabled] = useState(true)
  const [decomposeResult, setDecomposeResult] = useState<DecomposeResult | null>(null)
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [editingTask, setEditingTask] = useState<string | null>(null)
  
  // Store hooks
  const { createTask } = useTaskStore()
  const { currentProject } = useProjectStore()
  const { currentMilestone } = useMilestoneStore()
  
  // AI分解 Hook - 提供默认选项
  const {
    generateDecomposition,
    status,
    error: aiError,
  } = useTaskDecompose({
    projectId: currentProject?.id || '',
  })
  
  const aiLoading = status === 'loading'

  // 表单初始值
  useEffect(() => {
    if (milestone && currentProject) {
      form.setFieldsValue({
        milestoneId: milestone.id,
        milestoneName: milestone.name,
        projectName: currentProject.name,
        projectDescription: currentProject.description,
        departments: [],
        startDate: milestone?.targetDate,
        endDate: milestone.targetDate,
      })
    }
  }, [milestone, currentProject, form])

  // 步骤1：配置分解参数
  const renderStepConfig = () => (
    <Card title="任务分解配置" className={styles.stepCard}>
      <Form form={form} layout="vertical">
        <Alert
          message="任务分解向导"
          description="将里程碑智能分解为可执行的部门任务和执行任务。支持AI智能分解和手动配置。"
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />
        
        <div className={styles.aiToggle}>
          <Space>
            <RobotOutlined />
            <span>启用AI智能分解</span>
            <Switch
              checked={aiEnabled}
              onChange={setAiEnabled}
              checkedChildren="AI"
              unCheckedChildren="手动"
            />
          </Space>
          {aiEnabled && (
            <Alert
              message="AI分解将基于里程碑描述和项目背景生成智能任务建议"
              type="success"
              style={{ marginTop: 8 }}
            />
          )}
        </div>

        <Divider />

        <Form.Item
          label="里程碑信息"
          help="基于此信息进行任务分解"
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Input disabled value={milestone?.name} prefix="名称：" />
            <TextArea
              disabled
              value={milestone?.description}
              placeholder="里程碑描述"
              rows={3}
            />
          </Space>
        </Form.Item>

        <Form.Item
          name="departments"
          label="参与部门"
          rules={[{ required: true, message: '请选择参与部门' }]}
        >
          <Select
            mode="multiple"
            placeholder="选择将参与此里程碑的部门"
            options={[
              { label: '技术部', value: '技术部' },
              { label: '产品部', value: '产品部' },
              { label: '运营部', value: '运营部' },
              { label: '设计部', value: '设计部' },
            ]}
          />
        </Form.Item>

        <Form.Item
          name="focusAreas"
          label="重点关注领域"
          help="帮助AI更好地分解任务"
        >
          <Select
            mode="tags"
            placeholder="输入或选择重点关注的工作领域"
            options={[
              { label: '需求分析', value: '需求分析' },
              { label: '系统设计', value: '系统设计' },
              { label: '功能开发', value: '功能开发' },
              { label: '测试验证', value: '测试验证' },
              { label: '部署上线', value: '部署上线' },
              { label: '项目管理', value: '项目管理' },
              { label: '质量保证', value: '质量保证' },
              { label: '用户培训', value: '用户培训' },
            ]}
          />
        </Form.Item>

        <Form.Item
          name="constraints"
          label="约束条件"
          help="时间、资源、技术等约束条件"
        >
          <TextArea
            placeholder="描述项目约束条件，如时间紧张、资源有限、技术难点等"
            rows={3}
          />
        </Form.Item>

        <div className={styles.stepActions}>
          <Button onClick={onClose}>取消</Button>
          <Button
            type="primary"
            loading={aiLoading}
            disabled={!aiEnabled && !milestone}
            onClick={() => handleDecompose()}
            icon={aiEnabled ? <RobotOutlined /> : <BulbOutlined />}
          >
            {aiEnabled ? 'AI智能分解' : '开始分解'}
          </Button>
        </div>
      </Form>
    </Card>
  )

  // 步骤2：分解结果
  const renderStepResult = () => (
    <Card title="分解结果" className={styles.stepCard}>
      {loading && (
        <div className={styles.loading}>
          <Spin size="large" tip="AI正在智能分解任务..." />
          <p style={{ textAlign: 'center', marginTop: 16, color: '#666' }}>
            正在基于里程碑信息和项目背景生成任务建议...
          </p>
        </div>
      )}

      {decomposeResult && (
        <>
          {/* 分解概览 */}
          <div className={styles.resultOverview}>
            <div className={styles.overviewItem}>
              <span className={styles.overviewLabel}>建议任务数</span>
              <span className={styles.overviewValue}>{decomposeResult.suggestions.length}</span>
            </div>
            <div className={styles.overviewItem}>
              <span className={styles.overviewLabel}>预计总工期</span>
              <span className={styles.overviewValue}>{decomposeResult.totalEstimatedDays} 天</span>
            </div>
            <div className={styles.overviewItem}>
              <span className={styles.overviewLabel}>已选择任务</span>
              <span className={styles.overviewValue}>{selectedTasks.length}</span>
            </div>
          </div>

          {/* AI风险评估 */}
          {decomposeResult.riskAssessment && (
            <Alert
              message="AI风险评估"
              description={decomposeResult.riskAssessment}
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          {/* 任务列表 */}
          <div className={styles.taskList}>
            <div className={styles.taskListHeader}>
              <Space>
                <span>任务列表</span>
                <Button
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => handleAddCustomTask()}
                >
                  添加自定义任务
                </Button>
              </Space>
              <Space>
                <Button
                  size="small"
                  onClick={() => setSelectedTasks(decomposeResult.suggestions.map(t => t.id))}
                >
                  全选
                </Button>
                <Button
                  size="small"
                  onClick={() => setSelectedTasks([])}
                >
                  清空
                </Button>
              </Space>
            </div>

            <List
              dataSource={decomposeResult.suggestions}
              renderItem={(task) => (
                <List.Item
                  key={task.id}
                  className={`${styles.taskItem} ${selectedTasks.includes(task.id) ? styles.selected : ''}`}
                  onClick={() => handleTaskToggle(task.id)}
                  actions={[
                    <Tooltip title="编辑任务">
                      <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingTask(task.id)
                        }}
                      />
                    </Tooltip>,
                    <Tooltip title="删除任务">
                      <Button
                        type="text"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleTaskDelete(task.id)
                        }}
                      />
                    </Tooltip>,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <div className={styles.taskTitle}>
                        <span>{task.name}</span>
                        {task.aiGenerated && (
                          <Tag color="blue">
                            <ExperimentOutlined /> AI生成
                          </Tag>
                        )}
                        <Tag color="orange">
                          {task.suggestedPriority}
                        </Tag>
                      </div>
                    }
                    description={
                      <div className={styles.taskMeta}>
                        <p>{task.description}</p>
                        <Space>
                          {task.suggestedDepartment && (
                            <span>
                              <TeamOutlined /> {task.suggestedDepartment}
                            </span>
                          )}
                          <span>
                            <CalendarOutlined /> {task.estimatedDays} 天
                          </span>
                          {task.dependencies && task.dependencies.length > 0 && (
                            <span>
                              依赖: {task.dependencies.length} 个任务
                            </span>
                          )}
                        </Space>
                      </div>
                    }
                  />
                  {selectedTasks.includes(task.id) && (
                    <CheckCircleOutlined className={styles.selectedIcon} />
                  )}
                </List.Item>
              )}
            />
          </div>

          <div className={styles.stepActions}>
            <Button onClick={() => setCurrentStep(0)}>上一步</Button>
            <Button
              type="primary"
              disabled={selectedTasks.length === 0}
              onClick={() => setCurrentStep(2)}
            >
              确认选择 ({selectedTasks.length} 个任务)
            </Button>
          </div>
        </>
      )}
    </Card>
  )

  // 步骤3：确认创建
  const renderStepConfirm = () => (
    <Card title="确认创建" className={styles.stepCard}>
      <Alert
        message="即将创建任务"
        description={`将为里程碑"${milestone?.name}"创建 ${selectedTasks.length} 个任务`}
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <div className={styles.confirmList}>
        {decomposeResult?.suggestions
          .filter(task => selectedTasks.includes(task.id))
          .map((task, index) => (
            <div key={task.id} className={styles.confirmItem}>
              <div className={styles.confirmIndex}>{index + 1}</div>
              <div className={styles.confirmContent}>
                <h4>{task.name}</h4>
                <p>{task.description}</p>
                <div className={styles.confirmMeta}>
                  <Tag>{task.suggestedDepartment}</Tag>
                  <Tag color="orange">{task.suggestedPriority}</Tag>
                  <span>{task.estimatedDays} 天</span>
                </div>
              </div>
            </div>
          ))
        }
      </div>

      <div className={styles.stepActions}>
        <Button onClick={() => setCurrentStep(1)}>上一步</Button>
        <Button
          type="primary"
          loading={loading}
          onClick={handleCreateTasks}
          icon={<CheckCircleOutlined />}
        >
          创建任务
        </Button>
      </div>
    </Card>
  )

  // 执行AI分解
  const handleDecompose = async () => {
    if (!aiEnabled) {
      // 手动模式：跳转到结果页面，显示空列表供用户手动添加
      setDecomposeResult({
        suggestions: [],
        totalEstimatedDays: 0,
        riskAssessment: '手动模式：请添加自定义任务'
      })
      setCurrentStep(1)
      return
    }

    try {
      setLoading(true)
      const formData = await form.validateFields()
      
      if (!milestone || !currentProject) {
        throw new Error('里程碑或项目信息不完整')
      }

      // 调用AI分解
      const result = await claudeClient.generateTaskDecomposition({
        projectName: currentProject.name,
        projectDescription: `${currentProject.description}\n\n里程碑：${milestone.name}\n${milestone.description}`,
        departments: formData.departments,
        startDate: formData.startDate,
        endDate: formData.endDate,
      })

      // 转换格式并添加AI标记
      const suggestions: DecomposedTask[] = result.suggestions.map(task => {
        // 确保优先级是有效的值
        const validPriorities = ['low', 'medium', 'high', 'urgent'] as const;
        const priority = validPriorities.includes(task.suggestedPriority as any)
          ? task.suggestedPriority as 'low' | 'medium' | 'high' | 'urgent'
          : 'medium';

        return {
          ...task,
          aiGenerated: true,
          id: task.id || `ai_task_${Date.now()}_${Math.random()}`,
          suggestedPriority: priority,
        };
      })

      setDecomposeResult({
        suggestions,
        totalEstimatedDays: result.totalEstimatedDays,
        riskAssessment: result.riskAssessment,
      })

      // 默认选中所有任务
      setSelectedTasks(suggestions.map(t => t.id))
      setCurrentStep(1)

    } catch (error) {
      console.error('AI分解失败:', error)
      // 提供备用方案
      setDecomposeResult({
        suggestions: generateFallbackTasks(),
        totalEstimatedDays: 20,
        riskAssessment: 'AI分解失败，已提供基础任务建议，请根据实际需求调整。'
      })
      setCurrentStep(1)
    } finally {
      setLoading(false)
    }
  }

  // 生成备用任务
  const generateFallbackTasks = (): DecomposedTask[] => {
    const formData = form.getFieldsValue()
    const departments = formData.departments || []
    
    return [
      {
        id: 'fallback_1',
        name: '需求分析与规划',
        description: `分析${milestone?.name}的具体需求和实施方案`,
        suggestedDepartment: departments[0],
        suggestedPriority: 'high',
        estimatedDays: 5,
        aiGenerated: false,
      },
      {
        id: 'fallback_2',
        name: '详细设计',
        description: '制定详细的实施设计方案',
        suggestedDepartment: departments[0],
        suggestedPriority: 'high',
        estimatedDays: 8,
        dependencies: ['fallback_1'],
        aiGenerated: false,
      },
      {
        id: 'fallback_3',
        name: '实施执行',
        description: '按照设计方案进行具体实施',
        suggestedDepartment: departments[1] || departments[0],
        suggestedPriority: 'medium',
        estimatedDays: 12,
        dependencies: ['fallback_2'],
        aiGenerated: false,
      },
    ]
  }

  // 任务选择切换
  const handleTaskToggle = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    )
  }

  // 删除任务
  const handleTaskDelete = (taskId: string) => {
    if (!decomposeResult) return
    
    setDecomposeResult({
      ...decomposeResult,
      suggestions: decomposeResult.suggestions.filter(t => t.id !== taskId)
    })
    setSelectedTasks(prev => prev.filter(id => id !== taskId))
  }

  // 添加自定义任务
  const handleAddCustomTask = () => {
    // TODO: 打开添加任务对话框
    const newTask: DecomposedTask = {
      id: `custom_${Date.now()}`,
      name: '自定义任务',
      description: '请编辑任务详情',
      suggestedPriority: 'medium',
      estimatedDays: 5,
      aiGenerated: false,
    }
    
    if (decomposeResult) {
      setDecomposeResult({
        ...decomposeResult,
        suggestions: [...decomposeResult.suggestions, newTask]
      })
      setEditingTask(newTask.id)
    }
  }

  // 创建任务
  const handleCreateTasks = async () => {
    if (!decomposeResult || !milestone) return

    try {
      setLoading(true)
      const tasksToCreate = decomposeResult.suggestions.filter(task => 
        selectedTasks.includes(task.id)
      )

      // 创建执行任务 (需要先创建部门任务)
      for (const task of tasksToCreate) {
        await createTask({
          departmentTaskId: milestone.id, // 临时使用milestone id
          projectId: currentProject?.id || '',
          name: task.name,
          description: task.description,
          priority: task.suggestedPriority === 'urgent' ? Priority.URGENT :
                   task.suggestedPriority === 'high' ? Priority.HIGH :
                   task.suggestedPriority === 'low' ? Priority.LOW : Priority.MEDIUM,
        })
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error('创建任务失败:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      title="任务分解向导"
      className={styles.wizard}
      destroyOnClose
    >
      <div className={styles.wizardContent}>
        <Steps current={currentStep} className={styles.steps}>
          <Step title="配置参数" description="设置分解参数" />
          <Step title="分解结果" description="查看分解建议" />
          <Step title="确认创建" description="确认并创建任务" />
        </Steps>

        <div className={styles.stepContent}>
          {currentStep === 0 && renderStepConfig()}
          {currentStep === 1 && renderStepResult()}
          {currentStep === 2 && renderStepConfirm()}
        </div>
      </div>
    </Modal>
  )
}

export default TaskDecomposeWizard