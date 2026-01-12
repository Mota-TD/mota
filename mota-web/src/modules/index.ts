/**
 * 模块统一导出入口
 * 提供所有重构后模块的统一访问点
 * 
 * 使用命名空间导出避免命名冲突
 */

// 项目模块
import * as ProjectModule from './project';
export { ProjectModule };

// 任务模块
import * as TaskModule from './task';
export { TaskModule };

// 里程碑模块
import * as MilestoneModule from './milestone';
export { MilestoneModule };

// AI 模块
import * as AIModule from './ai';
export { AIModule };

// 常用导出（无冲突的）
export { useProjectStore } from './project';
export { useTaskStore } from './task';
export { useMilestoneStore } from './milestone';
export { useAIStore } from './ai';

// 组件导出
export { 
  ProjectCard, 
  ProjectFilters, 
  ProjectForm, 
  ProjectList, 
  ProjectDetail, 
  ProjectSettings 
} from './project';

export { 
  TaskTree, 
  TaskKanban, 
  TaskDetail, 
  TaskForm 
} from './task';

export { 
  TaskDecompose, 
  AISuggestionPanel 
} from './ai';