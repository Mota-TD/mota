/**
 * TaskForm 数据处理 Hook
 */

import { useState, useCallback, useMemo, useEffect } from 'react'
import { Form, message } from 'antd'
import type { Task, CreateTaskRequest, UpdateTaskRequest } from '../../types'
import { TaskPriority } from '../../types'
import type { TaskFormData } from './types'
import { DEFAULT_FORM_VALUES } from './types'
import { useTaskStore } from '../../store/taskStore'

interface UseTaskFormOptions {
  task?: Task
  projectId?: string
  departmentTaskId?: string
  onSuccess?: (task: Task) => void
  onError?: (error: Error) => void
}

interface UseTaskFormReturn {
  /** Ant Design Form 实例 */
  form: ReturnType<typeof Form.useForm<TaskFormData>>[0]
  /** 表单数据 */
  formData: TaskFormData
  /** 是否编辑模式 */
  isEditMode: boolean
  /** 是否正在提交 */
  submitting: boolean
  /** 提交表单 */
  handleSubmit: () => Promise<void>
  /** 重置表单 */
  handleReset: () => void
  /** 更新表单字段 */
  updateField: <K extends keyof TaskFormData>(field: K, value: TaskFormData[K]) => void
  /** 验证表单 */
  validateForm: () => Promise<boolean>
}

/**
 * TaskForm 数据处理 Hook
 */
export function useTaskForm(options: UseTaskFormOptions): UseTaskFormReturn {
  const { task, projectId, departmentTaskId, onSuccess, onError } = options

  const [form] = Form.useForm<TaskFormData>()
  const [submitting, setSubmitting] = useState(false)

  // 从 store 获取操作方法
  const createTask = useTaskStore((state) => state.createTask)
  const updateTask = useTaskStore((state) => state.updateTask)

  // 是否编辑模式
  const isEditMode = !!task

  // 初始表单值
  const initialValues = useMemo<TaskFormData>(() => {
    if (task) {
      return {
        name: task.name,
        description: task.description || '',
        departmentTaskId: task.departmentTaskId,
        projectId: task.projectId,
        assigneeId: task.assigneeId,
        priority: task.priority as TaskPriority,
        startDate: task.startDate,
        endDate: task.endDate,
      }
    }
    return {
      ...DEFAULT_FORM_VALUES,
      projectId: projectId || '',
      departmentTaskId: departmentTaskId || '',
    }
  }, [task, projectId, departmentTaskId])

  // 初始化表单
  useEffect(() => {
    form.setFieldsValue(initialValues)
  }, [form, initialValues])

  // 获取当前表单数据
  const formData = useMemo(() => {
    const values = form.getFieldsValue()
    return {
      ...DEFAULT_FORM_VALUES,
      ...values,
    }
  }, [form])

  // 更新表单字段
  const updateField = useCallback(
    <K extends keyof TaskFormData>(field: K, value: TaskFormData[K]) => {
      form.setFieldValue(field, value)
    },
    [form]
  )

  // 验证表单
  const validateForm = useCallback(async (): Promise<boolean> => {
    try {
      await form.validateFields()
      return true
    } catch {
      return false
    }
  }, [form])

  // 提交表单
  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)

      if (isEditMode && task) {
        // 更新任务
        const updateData: UpdateTaskRequest = {
          name: values.name,
          description: values.description,
          assigneeId: values.assigneeId,
          priority: values.priority,
          startDate: values.startDate,
          endDate: values.endDate,
        }
        await updateTask(task.id, updateData)
        message.success('任务更新成功')
        onSuccess?.(task)
      } else {
        // 创建任务
        const createData: CreateTaskRequest = {
          name: values.name,
          description: values.description,
          departmentTaskId: values.departmentTaskId,
          projectId: values.projectId,
          assigneeId: values.assigneeId,
          priority: values.priority,
          startDate: values.startDate,
          endDate: values.endDate,
        }
        const newTask = await createTask(createData)
        message.success('任务创建成功')
        onSuccess?.(newTask)
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error('操作失败')
      message.error(err.message)
      onError?.(err)
    } finally {
      setSubmitting(false)
    }
  }, [form, isEditMode, task, createTask, updateTask, onSuccess, onError])

  // 重置表单
  const handleReset = useCallback(() => {
    form.setFieldsValue(initialValues)
  }, [form, initialValues])

  return {
    form,
    formData,
    isEditMode,
    submitting,
    handleSubmit,
    handleReset,
    updateField,
    validateForm,
  }
}

/**
 * 获取成员列表 Hook（用于负责人选择）
 */
export function useAssigneeOptions(projectId?: string) {
  const [options, setOptions] = useState<{ label: string; value: string }[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!projectId) {
      setOptions([])
      return
    }

    // TODO: 从 API 获取项目成员列表
    // 这里暂时使用模拟数据
    setLoading(true)
    setTimeout(() => {
      setOptions([
        { label: '张三', value: 'user-1' },
        { label: '李四', value: 'user-2' },
        { label: '王五', value: 'user-3' },
      ])
      setLoading(false)
    }, 500)
  }, [projectId])

  return { options, loading }
}

/**
 * 获取部门任务列表 Hook
 */
export function useDepartmentTaskOptions(projectId?: string) {
  const departmentTasks = useTaskStore((state) => state.departmentTasks)
  const fetchDepartmentTasks = useTaskStore((state) => state.fetchDepartmentTasks)
  const loading = useTaskStore((state) => state.loading)

  useEffect(() => {
    if (projectId) {
      fetchDepartmentTasks(projectId)
    }
  }, [projectId, fetchDepartmentTasks])

  const options = useMemo(() => {
    return departmentTasks.map((dt) => ({
      label: dt.name,
      value: dt.id,
    }))
  }, [departmentTasks])

  return { options, loading }
}