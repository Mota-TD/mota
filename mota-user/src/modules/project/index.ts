/**
 * 项目模块统一导出
 */

// 类型导出
export * from './types'

// Store 导出
export {
  useProjectStore,
  useFilteredProjects,
  useArchivedProjects,
  useActiveProjects,
  useStarredProjects
} from './store/projectStore'

// 组件导出
export { default as ProjectCard } from './components/ProjectCard'
export type { ProjectCardProps } from './components/ProjectCard'

export { default as ProjectFilters } from './components/ProjectFilters'
export type { ProjectFiltersProps, ViewMode } from './components/ProjectFilters'

export { default as ProjectForm } from './components/ProjectForm'
export type { ProjectFormProps } from './components/ProjectForm/types'
export type {
  ProjectFormData,
  ProjectSubmitData,
  MilestoneItem,
  DepartmentTaskItem,
  FormMode
} from './components/ProjectForm/types'

export { default as ProjectSettings } from './components/ProjectSettings'
export type { ProjectSettingsProps } from './components/ProjectSettings'

export { default as ProjectList } from './components/ProjectList'
export type { ProjectListProps } from './components/ProjectList'

export { default as ProjectDetail } from './components/ProjectDetail'
export type { ProjectDetailProps } from './components/ProjectDetail/types'

// Hooks 导出
export { useProjectForm } from './components/ProjectForm/useProjectForm'
export { useProjectDetail } from './components/ProjectDetail/useProjectDetail'