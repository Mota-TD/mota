import { api } from '@/lib/api-client';

// 报表类型定义
export interface ReportSummary {
  projectStats: ProjectReportStats;
  taskStats: TaskReportStats;
  memberStats: MemberReportStats;
  trendData: TrendData[];
}

export interface ProjectReportStats {
  total: number;
  active: number;
  completed: number;
  overdue: number;
  onTrack: number;
  atRisk: number;
  avgProgress: number;
  avgDuration: number;
}

export interface TaskReportStats {
  total: number;
  completed: number;
  inProgress: number;
  todo: number;
  overdue: number;
  completionRate: number;
  avgCompletionTime: number;
  byPriority: { priority: string; count: number; completed: number }[];
}

export interface MemberReportStats {
  total: number;
  active: number;
  avgTasksPerMember: number;
  topPerformers: { userId: string; username: string; completedTasks: number }[];
  workloadDistribution: { userId: string; username: string; taskCount: number }[];
}

export interface TrendData {
  date: string;
  tasksCreated: number;
  tasksCompleted: number;
  projectsCreated: number;
  projectsCompleted: number;
}

// 项目报表
export interface ProjectReport {
  project: {
    id: string;
    name: string;
    status: string;
    progress: number;
    startDate: string;
    endDate: string;
  };
  taskStats: {
    total: number;
    completed: number;
    inProgress: number;
    todo: number;
    overdue: number;
  };
  milestones: {
    id: string;
    name: string;
    dueDate: string;
    status: string;
    progress: number;
  }[];
  memberContributions: {
    userId: string;
    username: string;
    tasksAssigned: number;
    tasksCompleted: number;
    hoursLogged: number;
  }[];
  timeline: {
    date: string;
    event: string;
    type: string;
  }[];
}

// 成员报表
export interface MemberReport {
  member: {
    id: string;
    username: string;
    nickname: string;
    avatar?: string;
    department?: string;
  };
  taskStats: {
    total: number;
    completed: number;
    inProgress: number;
    overdue: number;
    completionRate: number;
  };
  projectInvolvement: {
    projectId: string;
    projectName: string;
    role: string;
    tasksAssigned: number;
    tasksCompleted: number;
  }[];
  activityTrend: {
    date: string;
    tasksCompleted: number;
    hoursLogged: number;
  }[];
  performance: {
    avgCompletionTime: number;
    onTimeRate: number;
    qualityScore: number;
  };
}

// 时间报表
export interface TimeReport {
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
  byProject: {
    projectId: string;
    projectName: string;
    hours: number;
    percentage: number;
  }[];
  byMember: {
    userId: string;
    username: string;
    hours: number;
    percentage: number;
  }[];
  byDate: {
    date: string;
    hours: number;
  }[];
}

// 报表参数
export interface ReportParams {
  startDate?: string;
  endDate?: string;
  projectId?: string;
  memberId?: string;
  departmentId?: string;
  groupBy?: 'day' | 'week' | 'month';
}

// 导出参数
export interface ExportParams extends ReportParams {
  format: 'pdf' | 'excel' | 'csv';
  sections?: string[];
}

// 报表服务
export const reportService = {
  // 获取报表概览
  getReportSummary: async (params?: ReportParams): Promise<ReportSummary> => {
    const response = await api.get<ReportSummary>('/api/v1/reports/summary', { params });
    return response.data;
  },

  // 获取项目报表
  getProjectReport: async (projectId: string, params?: ReportParams): Promise<ProjectReport> => {
    const response = await api.get<ProjectReport>(`/api/v1/reports/projects/${projectId}`, { params });
    return response.data;
  },

  // 获取成员报表
  getMemberReport: async (memberId: string, params?: ReportParams): Promise<MemberReport> => {
    const response = await api.get<MemberReport>(`/api/v1/reports/members/${memberId}`, { params });
    return response.data;
  },

  // 获取时间报表
  getTimeReport: async (params?: ReportParams): Promise<TimeReport> => {
    const response = await api.get<TimeReport>('/api/v1/reports/time', { params });
    return response.data;
  },

  // 获取任务完成趋势
  getTaskCompletionTrend: async (params?: ReportParams): Promise<TrendData[]> => {
    const response = await api.get<TrendData[]>('/api/v1/reports/trends/task-completion', { params });
    return response.data;
  },

  // 获取项目进度趋势
  getProjectProgressTrend: async (params?: ReportParams): Promise<{ date: string; avgProgress: number }[]> => {
    const response = await api.get<{ date: string; avgProgress: number }[]>('/api/v1/reports/trends/project-progress', { params });
    return response.data;
  },

  // 获取工作量分布
  getWorkloadDistribution: async (params?: ReportParams): Promise<{ userId: string; username: string; taskCount: number; hours: number }[]> => {
    const response = await api.get<{ userId: string; username: string; taskCount: number; hours: number }[]>('/api/v1/reports/workload', { params });
    return response.data;
  },

  // 导出报表
  exportReport: async (type: 'summary' | 'project' | 'member' | 'time', params: ExportParams): Promise<Blob> => {
    const response = await api.get<Blob>(`/api/v1/reports/${type}/export`, {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  // 获取自定义报表
  getCustomReport: async (config: {
    metrics: string[];
    dimensions: string[];
    filters: Record<string, unknown>;
    groupBy?: string;
  }): Promise<{ data: Record<string, unknown>[]; columns: { key: string; title: string; type: string }[] }> => {
    const response = await api.post<{ data: Record<string, unknown>[]; columns: { key: string; title: string; type: string }[] }>(
      '/api/v1/reports/custom',
      config
    );
    return response.data;
  },

  // 保存报表模板
  saveReportTemplate: async (template: {
    name: string;
    description?: string;
    config: Record<string, unknown>;
  }): Promise<{ id: string }> => {
    const response = await api.post<{ id: string }>('/api/v1/reports/templates', template);
    return response.data;
  },

  // 获取报表模板列表
  getReportTemplates: async (): Promise<{ id: string; name: string; description?: string; createdAt: string }[]> => {
    const response = await api.get<{ id: string; name: string; description?: string; createdAt: string }[]>('/api/v1/reports/templates');
    return response.data;
  },

  // 删除报表模板
  deleteReportTemplate: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/reports/templates/${id}`);
  },

  // 定时报表
  scheduleReport: async (schedule: {
    templateId: string;
    frequency: 'daily' | 'weekly' | 'monthly';
    recipients: string[];
    format: 'pdf' | 'excel';
  }): Promise<{ id: string }> => {
    const response = await api.post<{ id: string }>('/api/v1/reports/schedules', schedule);
    return response.data;
  },

  // 获取定时报表列表
  getScheduledReports: async (): Promise<{ id: string; templateId: string; templateName: string; frequency: string; nextRun: string }[]> => {
    const response = await api.get<{ id: string; templateId: string; templateName: string; frequency: string; nextRun: string }[]>('/api/v1/reports/schedules');
    return response.data;
  },

  // 删除定时报表
  deleteScheduledReport: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/reports/schedules/${id}`);
  },
};

export default reportService;