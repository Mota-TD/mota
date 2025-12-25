import { get, post, put, del } from '../request';

// 任务依赖类型
export interface TaskDependency {
  id?: number;
  predecessorId: number;
  successorId: number;
  dependencyType: 'FS' | 'SS' | 'FF' | 'SF';
  lagDays?: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 依赖类型说明
export const DependencyTypeLabels = {
  FS: '完成后开始 (Finish-to-Start)',
  SS: '同时开始 (Start-to-Start)',
  FF: '同时完成 (Finish-to-Finish)',
  SF: '开始后完成 (Start-to-Finish)',
};

// 依赖类型简短说明
export const DependencyTypeShortLabels = {
  FS: '完成-开始',
  SS: '开始-开始',
  FF: '完成-完成',
  SF: '开始-完成',
};

// 依赖类型颜色
export const DependencyTypeColors = {
  FS: '#1890ff', // 蓝色
  SS: '#52c41a', // 绿色
  FF: '#faad14', // 橙色
  SF: '#722ed1', // 紫色
};

// 依赖冲突类型
export interface DependencyConflict {
  hasConflict: boolean;
  conflictType?: 'CIRCULAR' | 'DATE_CONFLICT' | 'STATUS_CONFLICT' | 'LAG_CONFLICT';
  description?: string;
  taskId?: number;
  taskName?: string;
  predecessorId?: number;
  predecessorName?: string;
  dependencyType?: string;
  suggestedStartDate?: string;
  suggestedEndDate?: string;
}

// 关键路径任务信息
export interface CriticalTaskInfo {
  taskId: number;
  taskName: string;
  earliestStart: number;
  earliestFinish: number;
  latestStart: number;
  latestFinish: number;
  slack: number;
  duration: number;
  startDate?: string;
  endDate?: string;
  isCritical: boolean;
}

// 关键路径详情
export interface CriticalPathDetail {
  criticalTaskIds: number[];
  criticalTasks: CriticalTaskInfo[];
  projectDuration: number;
  projectStartDate?: string;
  projectEndDate?: string;
}

// 依赖详情
export interface DependencyDetail {
  id: number;
  predecessorId: number;
  predecessorName: string;
  predecessorStartDate?: string;
  predecessorEndDate?: string;
  predecessorStatus: string;
  successorId: number;
  successorName: string;
  successorStartDate?: string;
  successorEndDate?: string;
  successorStatus: string;
  dependencyType: 'FS' | 'SS' | 'FF' | 'SF';
  lagDays?: number;
  description?: string;
  hasConflict: boolean;
  conflictDescription?: string;
}

// 创建任务依赖
export const createTaskDependency = (data: TaskDependency) => {
  return post<TaskDependency>('/api/v1/task-dependencies', data);
};

// 批量创建任务依赖
export const batchCreateTaskDependencies = (data: TaskDependency[]) => {
  return post<boolean>('/api/v1/task-dependencies/batch', data);
};

// 更新任务依赖
export const updateTaskDependency = (id: number, data: Partial<TaskDependency>) => {
  return put<TaskDependency>(`/api/v1/task-dependencies/${id}`, data);
};

// 删除任务依赖
export const deleteTaskDependency = (id: number) => {
  return del<boolean>(`/api/v1/task-dependencies/${id}`);
};

// 删除任务的所有依赖
export const deleteTaskDependenciesByTaskId = (taskId: number) => {
  return del<boolean>(`/api/v1/task-dependencies/task/${taskId}`);
};

// 获取依赖详情
export const getTaskDependency = (id: number) => {
  return get<TaskDependency>(`/api/v1/task-dependencies/${id}`);
};

// 获取任务的前置依赖
export const getTaskPredecessors = (successorId: number) => {
  return get<TaskDependency[]>(`/api/v1/task-dependencies/predecessors/${successorId}`);
};

// 获取任务的后继依赖
export const getTaskSuccessors = (predecessorId: number) => {
  return get<TaskDependency[]>(`/api/v1/task-dependencies/successors/${predecessorId}`);
};

// 获取任务的所有依赖
export const getTaskDependencies = (taskId: number) => {
  return get<TaskDependency[]>(`/api/v1/task-dependencies/task/${taskId}`);
};

// 获取项目的所有依赖
export const getProjectDependencies = (projectId: number) => {
  return get<TaskDependency[]>(`/api/v1/task-dependencies/project/${projectId}`);
};

// 检查依赖是否存在
export const checkDependencyExists = (predecessorId: number, successorId: number) => {
  return get<boolean>('/api/v1/task-dependencies/exists', { predecessorId, successorId });
};

// 检查是否会形成循环依赖
export const checkWouldCreateCycle = (predecessorId: number, successorId: number) => {
  return get<boolean>('/api/v1/task-dependencies/would-create-cycle', { predecessorId, successorId });
};

// 计算项目关键路径
export const calculateCriticalPath = (projectId: number) => {
  return get<number[]>(`/api/v1/task-dependencies/critical-path/${projectId}`);
};

// 检查任务是否可以开始
export const checkCanTaskStart = (taskId: number) => {
  return get<boolean>(`/api/v1/task-dependencies/can-start/${taskId}`);
};

// 获取阻塞任务的前置任务
export const getBlockingPredecessors = (taskId: number) => {
  return get<number[]>(`/api/v1/task-dependencies/blocking-predecessors/${taskId}`);
};

// 获取所有前置任务ID（递归）
export const getAllPredecessorIds = (taskId: number) => {
  return get<number[]>(`/api/v1/task-dependencies/all-predecessors/${taskId}`);
};

// 获取所有后继任务ID（递归）
export const getAllSuccessorIds = (taskId: number) => {
  return get<number[]>(`/api/v1/task-dependencies/all-successors/${taskId}`);
};

// ==================== 新增API ====================

// 检测任务的依赖冲突
export const detectTaskConflicts = (taskId: number) => {
  return get<DependencyConflict[]>(`/api/v1/task-dependencies/conflicts/task/${taskId}`);
};

// 检测项目的所有依赖冲突
export const detectProjectConflicts = (projectId: number) => {
  return get<DependencyConflict[]>(`/api/v1/task-dependencies/conflicts/project/${projectId}`);
};

// 验证依赖关系
export const validateDependency = (data: TaskDependency) => {
  return post<DependencyConflict>('/api/v1/task-dependencies/validate', data);
};

// 计算项目的详细关键路径信息
export const calculateCriticalPathDetail = (projectId: number) => {
  return get<CriticalPathDetail>(`/api/v1/task-dependencies/critical-path-detail/${projectId}`);
};

// 计算任务的建议开始日期
export const calculateSuggestedStartDate = (taskId: number) => {
  return get<string>(`/api/v1/task-dependencies/suggested-start-date/${taskId}`);
};

// 检查任务是否可以完成
export const checkCanTaskComplete = (taskId: number) => {
  return get<boolean>(`/api/v1/task-dependencies/can-complete/${taskId}`);
};

// 获取阻塞任务完成的前置任务
export const getBlockingForCompletion = (taskId: number) => {
  return get<number[]>(`/api/v1/task-dependencies/blocking-for-completion/${taskId}`);
};

// 获取项目依赖关系详情
export const getProjectDependencyDetails = (projectId: number) => {
  return get<DependencyDetail[]>(`/api/v1/task-dependencies/details/project/${projectId}`);
};