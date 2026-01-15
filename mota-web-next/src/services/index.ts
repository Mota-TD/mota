// 统一导出所有服务
export { dashboardService } from './dashboard';
export type { DashboardData, TaskItem, ProjectItem, EventItem, AISuggestion, NewsItem } from './dashboard';

export { projectService } from './project';
export type { 
  Project, 
  ProjectDetail, 
  ProjectMember, 
  ProjectTask, 
  ProjectMilestone, 
  ProjectListParams, 
  ProjectListResponse, 
  CreateProjectRequest, 
  UpdateProjectRequest, 
  ProjectStats 
} from './project';

export { taskService } from './task';
export type { 
  Task, 
  TaskDetail, 
  Checklist, 
  ChecklistItem, 
  TaskComment, 
  TaskAttachment, 
  TaskActivity, 
  TaskListParams, 
  TaskListResponse, 
  CreateTaskRequest, 
  UpdateTaskRequest, 
  TaskStats 
} from './task';

export { memberService } from './member';
export type { 
  Member, 
  MemberDetail, 
  MemberProject, 
  MemberTask, 
  MemberStatistics, 
  MemberListParams, 
  MemberListResponse, 
  InviteMemberRequest, 
  UpdateMemberRequest, 
  MemberStats 
} from './member';

export { departmentService } from './department';
export type { 
  Department, 
  DepartmentTree, 
  DepartmentDetail, 
  DepartmentMember, 
  DepartmentStatistics, 
  DepartmentListParams, 
  DepartmentListResponse, 
  CreateDepartmentRequest, 
  UpdateDepartmentRequest, 
  DepartmentStats 
} from './department';

export { aiService } from './ai';
export type {
  ChatMessage,
  ChatSession,
  ChatRequest,
  ChatResponse,
  IntentResult,
  KnowledgeBase,
  KnowledgeDocument,
  KnowledgeSearchResult,
  PPTGenerateRequest,
  PPTGenerateResponse,
  PPTHistory,
  AIWorkSuggestion,
  AITranslation,
  DocumentSummaryResult,
  AIDataAnalysis,
  AIScheduleSuggestion,
  AIWorkReport,
  AIAssistantConfig,
  TrainingStats,
  TrainingHistory,
  TrainingDocument,
  TrainingSettings,
  BusinessConfig
} from './ai';
export type { AISuggestion as AIServiceSuggestion } from './ai';

export { notificationService } from './notification';
export type { 
  Notification, 
  NotificationListParams, 
  NotificationListResponse, 
  NotificationStats, 
  NotificationSettings 
} from './notification';

export { calendarService } from './calendar';
export type { 
  CalendarEvent, 
  EventRecurrence, 
  EventReminder, 
  EventAttendee, 
  CalendarEventListParams, 
  CreateEventRequest, 
  UpdateEventRequest, 
  CalendarViewData, 
  CalendarTask, 
  CalendarHoliday, 
  CalendarStats 
} from './calendar';

export { reportService } from './report';
export type {
  ReportSummary,
  ProjectReportStats,
  TaskReportStats,
  MemberReportStats,
  TrendData,
  ProjectReport,
  MemberReport,
  TimeReport,
  ReportParams,
  ExportParams
} from './report';

export { systemService } from './system';
export type {
  SystemStatus,
  ServiceStatus,
  OperationLog,
  SystemSettings,
  SecuritySettings
} from './system';

export { favoriteService } from './favorite';
export type {
  FavoriteItem,
  FavoriteListParams,
  FavoriteListResponse
} from './favorite';

export { knowledgeService } from './knowledge';
export type {
  KnowledgeOverviewStats,
  CategoryStats,
  HotDocument,
  Contributor,
  MonthlyTrend
} from './knowledge';

export { resourceService } from './resource';
export type {
  TeamMember,
  ResourceAllocation,
  ResourceStats
} from './resource';

export { progressService } from './progress';
export type {
  ProjectProgress,
  Milestone,
  Activity,
  ProgressStats
} from './progress';

export { helpService } from './help';
export type {
  HelpCategory,
  FAQ,
  VideoTutorial,
  PopularArticle
} from './help';

export { searchService } from './search';
export type {
  SearchResult,
  SearchSuggestion,
  SearchResponse,
  SearchResultItem,
  SearchIntent,
  SmartSearchResult,
  SearchHotWord,
  SearchRelatedQuery,
  SearchLog,
  UserSearchPreference,
  DocumentVector,
  CorrectionResult
} from './search';

export { newsService, formatPublishTime, transformNewsArticle } from './news';
export type {
  NewsArticle,
  NewsCategory,
  NewsItem as SmartNewsItem,
  NewsStatistics,
  NewsPushConfig,
  PolicyMonitor,
  EnterpriseIndustry,
  BusinessDomain,
  HotTopic as NewsHotTopic,
  NewsFavorite
} from './news';

export { documentService } from './document';
export type {
  Document,
  DocumentListResponse,
  BreadcrumbItem
} from './document';

export { roleService, DATA_SCOPE_OPTIONS } from './role';
export type {
  Role,
  RoleListParams,
  RoleListResponse,
  CreateRoleRequest,
  UpdateRoleRequest
} from './role';