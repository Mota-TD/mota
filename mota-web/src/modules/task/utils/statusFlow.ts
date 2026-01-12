/**
 * 任务状态流转逻辑
 * 定义任务状态之间的转换规则和验证
 */

import { TaskStatus, DepartmentTaskStatus } from '../types'

/**
 * 任务状态转换规则
 * 定义从一个状态可以转换到哪些状态
 */
export const TASK_STATUS_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  [TaskStatus.PENDING]: [TaskStatus.IN_PROGRESS, TaskStatus.CANCELLED],
  [TaskStatus.IN_PROGRESS]: [TaskStatus.PAUSED, TaskStatus.COMPLETED, TaskStatus.CANCELLED],
  [TaskStatus.PAUSED]: [TaskStatus.IN_PROGRESS, TaskStatus.CANCELLED],
  [TaskStatus.COMPLETED]: [], // 已完成状态不能再转换
  [TaskStatus.CANCELLED]: [TaskStatus.PENDING], // 已取消可以重新开始
}

/**
 * 部门任务状态转换规则
 */
export const DEPARTMENT_TASK_STATUS_TRANSITIONS: Record<DepartmentTaskStatus, DepartmentTaskStatus[]> = {
  [DepartmentTaskStatus.PENDING]: [DepartmentTaskStatus.PLANNING, DepartmentTaskStatus.CANCELLED],
  [DepartmentTaskStatus.PLANNING]: [DepartmentTaskStatus.IN_PROGRESS, DepartmentTaskStatus.CANCELLED],
  [DepartmentTaskStatus.IN_PROGRESS]: [DepartmentTaskStatus.COMPLETED, DepartmentTaskStatus.CANCELLED],
  [DepartmentTaskStatus.COMPLETED]: [],
  [DepartmentTaskStatus.CANCELLED]: [DepartmentTaskStatus.PENDING],
}

/**
 * 状态转换动作
 */
export interface StatusTransitionAction {
  from: TaskStatus
  to: TaskStatus
  label: string
  icon?: string
  color?: string
  confirm?: boolean
  confirmMessage?: string
}

/**
 * 获取任务可用的状态转换动作
 */
export function getAvailableTransitions(currentStatus: TaskStatus): StatusTransitionAction[] {
  const availableStatuses = TASK_STATUS_TRANSITIONS[currentStatus] || []
  
  return availableStatuses.map((status) => {
    const action: StatusTransitionAction = {
      from: currentStatus,
      to: status,
      label: getTransitionLabel(currentStatus, status),
      icon: getTransitionIcon(status),
      color: getTransitionColor(status),
      confirm: shouldConfirmTransition(currentStatus, status),
      confirmMessage: getConfirmMessage(currentStatus, status),
    }
    return action
  })
}

/**
 * 获取状态转换标签
 */
function getTransitionLabel(from: TaskStatus, to: TaskStatus): string {
  const labels: Record<string, string> = {
    [`${TaskStatus.PENDING}_${TaskStatus.IN_PROGRESS}`]: '开始任务',
    [`${TaskStatus.PENDING}_${TaskStatus.CANCELLED}`]: '取消任务',
    [`${TaskStatus.IN_PROGRESS}_${TaskStatus.PAUSED}`]: '暂停任务',
    [`${TaskStatus.IN_PROGRESS}_${TaskStatus.COMPLETED}`]: '完成任务',
    [`${TaskStatus.IN_PROGRESS}_${TaskStatus.CANCELLED}`]: '取消任务',
    [`${TaskStatus.PAUSED}_${TaskStatus.IN_PROGRESS}`]: '继续任务',
    [`${TaskStatus.PAUSED}_${TaskStatus.CANCELLED}`]: '取消任务',
    [`${TaskStatus.CANCELLED}_${TaskStatus.PENDING}`]: '重新开始',
  }
  return labels[`${from}_${to}`] || `转为${getStatusLabel(to)}`
}

/**
 * 获取状态标签
 */
export function getStatusLabel(status: TaskStatus): string {
  const labels: Record<TaskStatus, string> = {
    [TaskStatus.PENDING]: '待开始',
    [TaskStatus.IN_PROGRESS]: '进行中',
    [TaskStatus.PAUSED]: '已暂停',
    [TaskStatus.COMPLETED]: '已完成',
    [TaskStatus.CANCELLED]: '已取消',
  }
  return labels[status] || status
}

/**
 * 获取转换图标
 */
function getTransitionIcon(to: TaskStatus): string {
  const icons: Record<TaskStatus, string> = {
    [TaskStatus.PENDING]: 'clock-circle',
    [TaskStatus.IN_PROGRESS]: 'play-circle',
    [TaskStatus.PAUSED]: 'pause-circle',
    [TaskStatus.COMPLETED]: 'check-circle',
    [TaskStatus.CANCELLED]: 'close-circle',
  }
  return icons[to] || 'right-circle'
}

/**
 * 获取转换颜色
 */
function getTransitionColor(to: TaskStatus): string {
  const colors: Record<TaskStatus, string> = {
    [TaskStatus.PENDING]: 'default',
    [TaskStatus.IN_PROGRESS]: 'processing',
    [TaskStatus.PAUSED]: 'warning',
    [TaskStatus.COMPLETED]: 'success',
    [TaskStatus.CANCELLED]: 'error',
  }
  return colors[to] || 'default'
}

/**
 * 是否需要确认转换
 */
function shouldConfirmTransition(from: TaskStatus, to: TaskStatus): boolean {
  // 取消和完成需要确认
  return to === TaskStatus.CANCELLED || to === TaskStatus.COMPLETED
}

/**
 * 获取确认消息
 */
function getConfirmMessage(from: TaskStatus, to: TaskStatus): string {
  if (to === TaskStatus.CANCELLED) {
    return '确定要取消这个任务吗？取消后可以重新开始。'
  }
  if (to === TaskStatus.COMPLETED) {
    return '确定要将任务标记为已完成吗？'
  }
  return `确定要将任务状态从"${getStatusLabel(from)}"改为"${getStatusLabel(to)}"吗？`
}

/**
 * 验证状态转换是否有效
 */
export function isValidTransition(from: TaskStatus, to: TaskStatus): boolean {
  const allowedTransitions = TASK_STATUS_TRANSITIONS[from] || []
  return allowedTransitions.includes(to)
}

/**
 * 验证部门任务状态转换是否有效
 */
export function isValidDepartmentTaskTransition(
  from: DepartmentTaskStatus,
  to: DepartmentTaskStatus
): boolean {
  const allowedTransitions = DEPARTMENT_TASK_STATUS_TRANSITIONS[from] || []
  return allowedTransitions.includes(to)
}

/**
 * 状态转换错误
 */
export class StatusTransitionError extends Error {
  constructor(
    public from: TaskStatus,
    public to: TaskStatus,
    message?: string
  ) {
    super(message || `无法从"${getStatusLabel(from)}"转换到"${getStatusLabel(to)}"`)
    this.name = 'StatusTransitionError'
  }
}

/**
 * 执行状态转换（带验证）
 */
export function validateAndTransition(
  currentStatus: TaskStatus,
  targetStatus: TaskStatus
): TaskStatus {
  if (!isValidTransition(currentStatus, targetStatus)) {
    throw new StatusTransitionError(currentStatus, targetStatus)
  }
  return targetStatus
}

/**
 * 获取状态流程图数据
 */
export function getStatusFlowData() {
  const nodes = Object.values(TaskStatus).map((status) => ({
    id: status,
    label: getStatusLabel(status),
    color: getTransitionColor(status),
  }))

  const edges: { from: TaskStatus; to: TaskStatus; label: string }[] = []
  Object.entries(TASK_STATUS_TRANSITIONS).forEach(([from, toList]) => {
    toList.forEach((to) => {
      edges.push({
        from: from as TaskStatus,
        to,
        label: getTransitionLabel(from as TaskStatus, to),
      })
    })
  })

  return { nodes, edges }
}

/**
 * 计算任务完成进度
 * 根据状态自动设置进度
 */
export function getProgressByStatus(status: TaskStatus): number {
  const progressMap: Record<TaskStatus, number> = {
    [TaskStatus.PENDING]: 0,
    [TaskStatus.IN_PROGRESS]: 50, // 默认50%，实际应该由用户设置
    [TaskStatus.PAUSED]: 50, // 保持暂停前的进度
    [TaskStatus.COMPLETED]: 100,
    [TaskStatus.CANCELLED]: 0,
  }
  return progressMap[status] ?? 0
}

/**
 * 状态转换时的副作用
 */
export interface StatusTransitionSideEffect {
  updateProgress?: number
  updateCompletedAt?: boolean
  notifyAssignee?: boolean
  notifyManager?: boolean
  logHistory?: boolean
}

/**
 * 获取状态转换的副作用
 */
export function getTransitionSideEffects(
  from: TaskStatus,
  to: TaskStatus
): StatusTransitionSideEffect {
  const effects: StatusTransitionSideEffect = {
    logHistory: true, // 总是记录历史
  }

  if (to === TaskStatus.COMPLETED) {
    effects.updateProgress = 100
    effects.updateCompletedAt = true
    effects.notifyManager = true
  }

  if (to === TaskStatus.IN_PROGRESS && from === TaskStatus.PENDING) {
    effects.notifyAssignee = true
  }

  if (to === TaskStatus.CANCELLED) {
    effects.notifyManager = true
  }

  return effects
}

/**
 * 批量状态转换验证
 */
export function validateBatchTransition(
  tasks: { id: string; status: TaskStatus }[],
  targetStatus: TaskStatus
): { valid: { id: string; status: TaskStatus }[]; invalid: { id: string; status: TaskStatus; reason: string }[] } {
  const valid: { id: string; status: TaskStatus }[] = []
  const invalid: { id: string; status: TaskStatus; reason: string }[] = []

  tasks.forEach((task) => {
    if (isValidTransition(task.status, targetStatus)) {
      valid.push(task)
    } else {
      invalid.push({
        ...task,
        reason: `无法从"${getStatusLabel(task.status)}"转换到"${getStatusLabel(targetStatus)}"`,
      })
    }
  })

  return { valid, invalid }
}