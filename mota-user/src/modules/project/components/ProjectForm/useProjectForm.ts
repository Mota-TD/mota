/**
 * 项目表单状态管理 Hook
 */

import { useState, useEffect, useCallback } from 'react'
import { Form, message } from 'antd'
import dayjs from 'dayjs'
import * as projectApi from '@/services/api/project'
import { departmentApi } from '@/services/api'
import { getUsers } from '@/services/api/user'
import type {
  ProjectFormData,
  MilestoneItem,
  DepartmentTaskItem,
  DepartmentInfo,
  UserInfo,
  ProjectSubmitData,
  FormMode
} from './types'
import { PROJECT_COLORS } from './types'

export interface UseProjectFormOptions {
  mode?: FormMode
  initialData?: Partial<ProjectSubmitData>
  onSubmit?: (data: ProjectSubmitData) => Promise<void>
}

export function useProjectForm(options: UseProjectFormOptions = {}) {
  const { mode = 'create', initialData, onSubmit } = options
  
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedColor, setSelectedColor] = useState(initialData?.color || PROJECT_COLORS[0])
  
  // 数据加载状态
  const [departments, setDepartments] = useState<DepartmentInfo[]>([])
  const [users, setUsers] = useState<UserInfo[]>([])
  const [loadingData, setLoadingData] = useState(false)
  
  // 选中状态
  const [selectedDepartments, setSelectedDepartments] = useState<(string | number)[]>(
    initialData?.departmentIds?.map(id => id) || []
  )
  const [selectedMembers, setSelectedMembers] = useState<(string | number)[]>(
    initialData?.memberIds?.map(id => id) || []
  )
  
  // 里程碑
  const [milestones, setMilestones] = useState<MilestoneItem[]>([])
  const [newMilestone, setNewMilestone] = useState({ name: '', targetDate: '', description: '' })
  
  // 表单数据
  const [formData, setFormData] = useState<ProjectFormData>({})
  
  // 项目标识
  const [projectKey, setProjectKey] = useState<string>('')
  const [loadingKey, setLoadingKey] = useState(false)

  // 加载数据
  const loadData = useCallback(async () => {
    setLoadingData(true)
    try {
      const [deptsRes, usersRes] = await Promise.all([
        departmentApi.getDepartmentsByOrgId(1),
        getUsers()
      ])
      
      if (deptsRes && Array.isArray(deptsRes)) {
        setDepartments(deptsRes as DepartmentInfo[])
      } else {
        setDepartments([])
      }
      
      if (usersRes && (usersRes as { list?: UserInfo[] }).list) {
        setUsers((usersRes as { list: UserInfo[] }).list)
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
  }, [])

  // 加载下一个项目标识
  const loadNextProjectKey = useCallback(async () => {
    if (mode !== 'create') return
    
    setLoadingKey(true)
    try {
      const nextKey = await projectApi.getNextProjectKey()
      setProjectKey(nextKey)
    } catch (error) {
      console.error('Failed to load next project key:', error)
      setProjectKey('AF-0001')
    } finally {
      setLoadingKey(false)
    }
  }, [mode])

  useEffect(() => {
    loadData()
    loadNextProjectKey()
  }, [loadData, loadNextProjectKey])

  // 步骤导航
  const handleNext = useCallback(async () => {
    if (currentStep === 0) {
      try {
        const values = await form.validateFields()
        setFormData(prev => ({ ...prev, ...values }))
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
  }, [currentStep, form, selectedDepartments.length])

  const handlePrev = useCallback(() => {
    setCurrentStep(prev => prev - 1)
  }, [])

  const handleStepClick = useCallback(async (step: number) => {
    if (step > currentStep) {
      if (currentStep === 0) {
        try {
          const values = await form.validateFields()
          setFormData(prev => ({ ...prev, ...values }))
        } catch {
          message.warning('请先完成当前步骤的必填项')
          return
        }
      } else if (currentStep === 1 && selectedDepartments.length === 0) {
        message.warning('请至少选择一个参与部门')
        return
      }
    }
    
    if (currentStep === 0 && step !== 0) {
      try {
        const values = await form.validateFields()
        setFormData(prev => ({ ...prev, ...values }))
      } catch {
        message.warning('请先完成基本信息')
        return
      }
    }
    
    setCurrentStep(step)
  }, [currentStep, form, selectedDepartments.length])

  // 部门选择
  const handleDepartmentToggle = useCallback((deptId: string | number) => {
    setSelectedDepartments(prev => {
      if (prev.includes(deptId)) {
        // 同时移除该部门的成员
        const deptMembers = users.filter(u => String(u.departmentId) === String(deptId)).map(u => u.id)
        setSelectedMembers(members => members.filter(id => !deptMembers.includes(id)))
        return prev.filter(id => id !== deptId)
      } else {
        return [...prev, deptId]
      }
    })
  }, [users])

  // 成员选择
  const handleMemberToggle = useCallback((memberId: string | number) => {
    setSelectedMembers(prev => {
      if (prev.includes(memberId)) {
        return prev.filter(id => id !== memberId)
      } else {
        return [...prev, memberId]
      }
    })
  }, [])

  const handleSelectAllDeptMembers = useCallback((deptId: string | number) => {
    const deptMembers = users.filter(u => String(u.departmentId) === String(deptId)).map(u => u.id)
    const allSelected = deptMembers.every(id => selectedMembers.includes(id))
    
    if (allSelected) {
      setSelectedMembers(prev => prev.filter(id => !deptMembers.includes(id)))
    } else {
      setSelectedMembers(prev => {
        const newMembers = [...prev]
        deptMembers.forEach(id => {
          if (!newMembers.includes(id)) {
            newMembers.push(id)
          }
        })
        return newMembers
      })
    }
  }, [users, selectedMembers])

  // 里程碑操作
  const handleAddMilestone = useCallback(() => {
    if (!newMilestone.name || !newMilestone.targetDate) {
      message.warning('请填写里程碑名称和目标日期')
      return
    }
    
    setMilestones(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        name: newMilestone.name,
        targetDate: newMilestone.targetDate,
        description: newMilestone.description
      }
    ])
    setNewMilestone({ name: '', targetDate: '', description: '' })
  }, [newMilestone])

  const handleDeleteMilestone = useCallback((id: string) => {
    setMilestones(prev => prev.filter(m => m.id !== id))
  }, [])

  const handleUpdateMilestoneTasks = useCallback((milestoneId: string, tasks: DepartmentTaskItem[]) => {
    setMilestones(prev => prev.map(m => {
      if (m.id === milestoneId) {
        return { ...m, departmentTasks: tasks }
      }
      return m
    }))
  }, [])

  // AI 生成里程碑
  const handleAIGenerateMilestones = useCallback(() => {
    const dateRange = formData.dateRange
    if (!dateRange || !dateRange[0] || !dateRange[1]) {
      message.warning('请先设置项目周期')
      return
    }
    
    const startDate = dateRange[0]
    const endDate = dateRange[1]
    const duration = endDate.diff(startDate, 'day')
    
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
  }, [formData.dateRange])

  // 快速分配所有部门
  const handleQuickAssignAllDepartments = useCallback(() => {
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
          priority: 'medium' as const
        }
      })
    }))
    setMilestones(updatedMilestones)
    message.success('已为所有里程碑分配部门任务')
  }, [selectedDepartments, milestones, departments])

  // 提交表单
  const handleSubmit = useCallback(async () => {
    setLoading(true)
    try {
      const dateRange = formData.dateRange
      const submitData: ProjectSubmitData = {
        name: formData.name || '',
        description: formData.description,
        color: selectedColor,
        startDate: dateRange?.[0]?.format('YYYY-MM-DD'),
        endDate: dateRange?.[1]?.format('YYYY-MM-DD'),
        ownerId: formData.ownerId ? String(formData.ownerId) : undefined,
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
      }
      
      if (onSubmit) {
        await onSubmit(submitData)
      } else {
        await projectApi.createProject(submitData)
        message.success('项目创建成功')
      }
    } catch (error: unknown) {
      console.error('Submit error:', error)
      const errorMessage = error instanceof Error ? error.message : '操作失败，请重试'
      message.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [formData, selectedColor, selectedDepartments, selectedMembers, milestones, onSubmit])

  return {
    // 表单实例
    form,
    
    // 状态
    loading,
    loadingData,
    loadingKey,
    currentStep,
    selectedColor,
    projectKey,
    formData,
    
    // 数据
    departments,
    users,
    selectedDepartments,
    selectedMembers,
    milestones,
    newMilestone,
    
    // 设置器
    setSelectedColor,
    setFormData,
    setNewMilestone,
    
    // 步骤操作
    handleNext,
    handlePrev,
    handleStepClick,
    
    // 部门操作
    handleDepartmentToggle,
    
    // 成员操作
    handleMemberToggle,
    handleSelectAllDeptMembers,
    
    // 里程碑操作
    handleAddMilestone,
    handleDeleteMilestone,
    handleUpdateMilestoneTasks,
    handleAIGenerateMilestones,
    handleQuickAssignAllDepartments,
    
    // 提交
    handleSubmit
  }
}