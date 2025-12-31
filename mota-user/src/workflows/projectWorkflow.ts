/**
 * 项目协同端到端业务流程管理
 * 统一管理从项目创建到完成的完整业务流程
 * 默认使用豆包AI模型
 */

import { message } from 'antd'
import { doubaoClient } from '@/services/doubao/doubaoClient'
import { useProjectStore } from '@/modules/project/store/projectStore'
import { useTaskStore } from '@/modules/task/store/taskStore'
import { useAIStore } from '@/modules/ai/store/aiStore'
import { syncManager } from '@/store/syncManager'
import type { Project } from '@/services/api/project'
import type { DepartmentTask } from '@/services/api/departmentTask'
import type { Task } from '@/services/api/task'
import type { TaskDecomposeFormData } from '@/modules/ai/types'

/**
 * 项目创建工作流
 */
export class ProjectCreationWorkflow {
  private projectStore = useProjectStore.getState()
  private taskStore = useTaskStore.getState()
  private aiStore = useAIStore.getState()

  /**
   * 完整的项目创建流程
   * 1. 创建项目
   * 2. AI任务分解
   * 3. 创建里程碑
   * 4. 分配部门任务
   * 5. 建立数据同步
   */
  async executeProjectCreation(params: {
    projectData: {
      name: string
      description: string
      departments: string[]
      startDate?: string
      endDate?: string
    }
    enableAI: boolean
    autoCreateTasks: boolean
  }): Promise<{
    success: boolean
    project?: Project
    departmentTasks?: DepartmentTask[]
    error?: string
  }> {
    try {
      console.log('🚀 开始项目创建工作流...')

      // 步骤1: 创建项目
      const project = await this.projectStore.createProject({
        name: params.projectData.name,
        description: params.projectData.description,
        startDate: params.projectData.startDate,
        endDate: params.projectData.endDate,
      })

      if (!project) {
        throw new Error('项目创建失败')
      }

      console.log('✅ 项目创建成功:', project.name)

      // 步骤2: AI任务分解（如果启用）
      let departmentTasks: DepartmentTask[] = []
      if (params.enableAI && params.autoCreateTasks) {
        console.log('🤖 开始AI任务分解...')
        
        const aiDecomposeResult = await this.performAITaskDecomposition({
          projectName: params.projectData.name,
          projectDescription: params.projectData.description,
          departments: params.projectData.departments,
          startDate: params.projectData.startDate,
          endDate: params.projectData.endDate,
        })

        if (aiDecomposeResult.success) {
          console.log('✅ AI任务分解完成，生成', aiDecomposeResult.suggestions?.length || 0, '个任务建议')

          // 步骤3: 根据AI建议创建部门任务
          departmentTasks = await this.createDepartmentTasksFromAI(
            project.id,
            aiDecomposeResult.suggestions || []
          )
          
          console.log('✅ 部门任务创建完成，共', departmentTasks.length, '个任务')
        } else {
          console.warn('⚠️ AI任务分解失败，使用默认任务创建')
        }
      }

      // 步骤4: 建立数据同步
      this.setupProjectDataSync(project.id)
      console.log('✅ 数据同步机制已建立')

      // 步骤5: 触发同步事件
      syncManager.emit({
        type: 'project_updated',
        source: 'project',
        payload: {
          projectId: project.id,
          projectName: project.name,
          departmentTasksCount: departmentTasks.length
        }
      })

      message.success(`项目 "${project.name}" 创建成功！${departmentTasks.length > 0 ? `自动生成了 ${departmentTasks.length} 个部门任务` : ''}`)

      return {
        success: true,
        project,
        departmentTasks
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '项目创建失败'
      console.error('❌ 项目创建工作流失败:', errorMessage)
      message.error(errorMessage)
      
      return {
        success: false,
        error: errorMessage
      }
    }
  }

  /**
   * 执行AI任务分解
   */
  private async performAITaskDecomposition(data: TaskDecomposeFormData): Promise<{
    success: boolean
    suggestions?: Array<{
      id: string
      name: string
      description: string
      suggestedDepartment?: string
      suggestedPriority: string
      estimatedDays: number
      dependencies?: string[]
    }>
    error?: string
  }> {
    try {
      // 使用AI Store的任务分解功能
      await this.aiStore.generateTaskDecomposition(data)
      
      const aiState = useAIStore.getState()
      if (aiState.decomposeStatus === 'success' && aiState.decomposeResult) {
        return {
          success: true,
          suggestions: aiState.decomposeResult.suggestions
        }
      } else {
        return {
          success: false,
          error: aiState.decomposeError || 'AI任务分解失败'
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'AI任务分解异常'
      }
    }
  }

  /**
   * 根据AI建议创建部门任务
   */
  private async createDepartmentTasksFromAI(
    projectId: string,
    suggestions: Array<{
      id: string
      name: string
      description: string
      suggestedDepartment?: string
      suggestedPriority: string
      estimatedDays: number
    }>
  ): Promise<DepartmentTask[]> {
    const createdTasks: DepartmentTask[] = []
    
    try {
      for (const suggestion of suggestions) {
        const deptTask = await this.taskStore.createDepartmentTask({
          projectId,
          name: suggestion.name,
          description: suggestion.description,
          departmentId: suggestion.suggestedDepartment || '1', // 默认部门
          managerId: '1', // 默认负责人，实际应该通过UI选择
          priority: this.mapAIPriorityToSystem(suggestion.suggestedPriority),
          estimatedDays: suggestion.estimatedDays
        })
        
        if (deptTask) {
          createdTasks.push(deptTask)
        }
      }
    } catch (error) {
      console.error('创建部门任务失败:', error)
      throw error
    }
    
    return createdTasks
  }

  /**
   * 映射AI优先级到系统优先级
   */
  private mapAIPriorityToSystem(aiPriority: string): string {
    const priorityMap: Record<string, string> = {
      'low': 'low',
      'medium': 'medium', 
      'high': 'high',
      'urgent': 'urgent',
      'critical': 'urgent'
    }
    return priorityMap[aiPriority.toLowerCase()] || 'medium'
  }

  /**
   * 建立项目数据同步
   */
  private setupProjectDataSync(projectId: string): void {
    // 订阅项目相关的同步事件
    syncManager.on('department_task_updated', (event) => {
      if (event.payload.projectId === projectId) {
        console.log('🔄 部门任务已创建，触发项目数据同步')
        this.projectStore.fetchProjects()
      }
    })

    syncManager.on('task_status_changed', (event) => {
      if (event.payload.projectId === projectId) {
        console.log('🔄 任务状态已更新，触发级联更新')
        this.taskStore.updateCascadingProgress(event.payload.taskId)
      }
    })
  }
}

/**
 * 任务执行工作流
 */
export class TaskExecutionWorkflow {
  private taskStore = useTaskStore.getState()
  private aiStore = useAIStore.getState()

  /**
   * 智能任务分配流程
   * 1. 分析任务特征
   * 2. 获取AI推荐
   * 3. 执行分配
   * 4. 更新状态
   */
  async executeSmartAssignment(params: {
    taskId: number
    taskName: string
    taskDescription: string
    teamMembers: Array<{
      id: string
      name: string
      department: string
      currentWorkload: number
      skills: string[]
    }>
  }): Promise<{
    success: boolean
    assignedTo?: string
    reason?: string
    error?: string
  }> {
    try {
      console.log('🧠 开始智能任务分配（使用豆包AI）...')

      // 获取AI推荐（使用豆包模型）
      const recommendations = await doubaoClient.suggestTaskAssignment({
        taskId: params.taskId,
        taskName: params.taskName,
        taskDescription: params.taskDescription,
        teamMembers: params.teamMembers
      })

      if (recommendations.suggestedAssignees.length === 0) {
        throw new Error('未找到合适的分配人员')
      }

      // 选择最佳匹配
      const bestMatch = recommendations.suggestedAssignees[0]
      
      // 执行分配
      await this.taskStore.updateTask(params.taskId, {
        assigneeId: bestMatch.userId.toString()
      })

      console.log('✅ 智能分配完成:', bestMatch.userName)

      // 触发同步事件
      syncManager.emit({
        type: 'ai_recommendation_applied',
        source: 'ai',
        payload: {
          type: 'task_assignment',
          targetId: params.taskId.toString(),
          userId: bestMatch.userId.toString(),
          assigneeName: bestMatch.userName,
          reason: bestMatch.reason
        }
      })

      return {
        success: true,
        assignedTo: bestMatch.userName,
        reason: bestMatch.reason
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '智能分配失败'
      console.error('❌ 智能任务分配失败:', errorMessage)
      
      return {
        success: false,
        error: errorMessage
      }
    }
  }

  /**
   * 任务状态更新流程
   * 包含级联更新和进度同步
   */
  async updateTaskStatus(taskId: number, newStatus: string): Promise<{
    success: boolean
    cascadeUpdated?: boolean
    error?: string
  }> {
    try {
      console.log('📊 开始任务状态更新...')

      // 更新任务状态
      await this.taskStore.updateTaskStatus(taskId, newStatus)
      
      // 执行级联更新
      const cascadeResult = await this.taskStore.updateCascadingProgress(taskId)
      
      console.log('✅ 任务状态更新完成，级联更新:', cascadeResult)

      // 触发同步事件
      syncManager.emit({
        type: 'task_status_changed',
        source: 'task',
        payload: {
          taskId: taskId.toString(),
          newStatus,
          cascadeUpdated: cascadeResult
        }
      })

      return {
        success: true,
        cascadeUpdated: cascadeResult
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '状态更新失败'
      console.error('❌ 任务状态更新失败:', errorMessage)
      
      return {
        success: false,
        error: errorMessage
      }
    }
  }
}

/**
 * 项目监控工作流
 */
export class ProjectMonitoringWorkflow {
  private aiStore = useAIStore.getState()

  /**
   * 项目风险预警流程
   */
  async generateRiskWarnings(projectId: string): Promise<{
    success: boolean
    warnings?: Array<{
      id: string
      type: string
      severity: string
      title: string
      description: string
    }>
    error?: string
  }> {
    try {
      console.log('⚠️ 开始风险预警分析...')

      await this.aiStore.fetchRiskWarnings(projectId)
      
      const aiState = useAIStore.getState()
      const warnings = aiState.riskWarnings

      console.log('✅ 风险预警分析完成，发现', warnings.length, '个风险点')

      return {
        success: true,
        warnings
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '风险分析失败'
      console.error('❌ 风险预警失败:', errorMessage)
      
      return {
        success: false,
        error: errorMessage
      }
    }
  }
}

// 导出工作流实例
export const projectCreationWorkflow = new ProjectCreationWorkflow()
export const taskExecutionWorkflow = new TaskExecutionWorkflow()
export const projectMonitoringWorkflow = new ProjectMonitoringWorkflow()

/**
 * 统一的业务流程管理器
 */
export const businessWorkflowManager = {
  // 项目创建
  createProject: projectCreationWorkflow.executeProjectCreation.bind(projectCreationWorkflow),
  
  // 任务分配
  assignTask: taskExecutionWorkflow.executeSmartAssignment.bind(taskExecutionWorkflow),
  
  // 状态更新
  updateTaskStatus: taskExecutionWorkflow.updateTaskStatus.bind(taskExecutionWorkflow),
  
  // 风险预警
  analyzeRisks: projectMonitoringWorkflow.generateRiskWarnings.bind(projectMonitoringWorkflow),
  
  /**
   * 完整的端到端流程验证
   */
  async validateEndToEndWorkflow(projectId: string): Promise<{
    success: boolean
    details: {
      projectExists: boolean
      tasksCreated: boolean
      aiIntegrated: boolean
      syncEnabled: boolean
    }
    error?: string
  }> {
    try {
      console.log('🔍 开始端到端流程验证...')

      const projectStore = useProjectStore.getState()
      const taskStore = useTaskStore.getState()
      
      // 检查项目存在
      const projects = await projectStore.fetchProjects()
      const projectExists = projects.some(p => p.id === projectId)
      
      // 检查任务创建
      const departmentTasks = await taskStore.fetchDepartmentTasks()
      const tasksCreated = departmentTasks.some(t => t.projectId === projectId)
      
      // 检查AI集成
      const aiState = useAIStore.getState()
      const aiIntegrated = aiState.config.enableAutoSuggestions
      
      // 检查同步启用
      const syncStatus = syncManager.getSyncStatus()
      const syncEnabled = syncStatus.listenersCount > 0

      const allValid = projectExists && tasksCreated && aiIntegrated && syncEnabled

      console.log('✅ 端到端流程验证完成:', {
        projectExists,
        tasksCreated, 
        aiIntegrated,
        syncEnabled,
        overall: allValid ? '通过' : '失败'
      })

      return {
        success: allValid,
        details: {
          projectExists,
          tasksCreated,
          aiIntegrated,
          syncEnabled
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '流程验证失败'
      console.error('❌ 端到端流程验证失败:', errorMessage)
      
      return {
        success: false,
        details: {
          projectExists: false,
          tasksCreated: false,
          aiIntegrated: false,
          syncEnabled: false
        },
        error: errorMessage
      }
    }
  }
}