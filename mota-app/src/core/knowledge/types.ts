/**
 * 知识图谱类型定义
 */

/**
 * 节点类型
 */
export enum NodeType {
  /** 项目 */
  PROJECT = 'project',
  /** 任务 */
  TASK = 'task',
  /** 文档 */
  DOCUMENT = 'document',
  /** 人员 */
  PERSON = 'person',
  /** 技能 */
  SKILL = 'skill',
  /** 概念 */
  CONCEPT = 'concept',
  /** 事件 */
  EVENT = 'event'
}

/**
 * 关系类型
 */
export enum RelationType {
  /** 包含 */
  CONTAINS = 'contains',
  /** 依赖 */
  DEPENDS_ON = 'depends_on',
  /** 关联 */
  RELATES_TO = 'relates_to',
  /** 创建 */
  CREATED_BY = 'created_by',
  /** 负责 */
  OWNED_BY = 'owned_by',
  /** 参与 */
  PARTICIPATES_IN = 'participates_in',
  /** 引用 */
  REFERENCES = 'references',
  /** 前置 */
  PRECEDES = 'precedes',
  /** 后续 */
  FOLLOWS = 'follows'
}

/**
 * 知识节点
 */
export interface KnowledgeNode {
  /** 节点ID */
  id: string;
  /** 节点类型 */
  type: NodeType;
  /** 节点名称 */
  name: string;
  /** 节点描述 */
  description?: string;
  /** 节点属性 */
  properties?: Record<string, any>;
  /** 创建时间 */
  createTime?: string;
  /** 更新时间 */
  updateTime?: string;
  /** 标签 */
  tags?: string[];
  /** 重要度 0-1 */
  importance?: number;
}

/**
 * 知识关系
 */
export interface KnowledgeEdge {
  /** 关系ID */
  id: string;
  /** 源节点ID */
  source: string;
  /** 目标节点ID */
  target: string;
  /** 关系类型 */
  type: RelationType;
  /** 关系名称 */
  name?: string;
  /** 关系权重 0-1 */
  weight?: number;
  /** 关系属性 */
  properties?: Record<string, any>;
  /** 创建时间 */
  createTime?: string;
}

/**
 * 知识图谱
 */
export interface KnowledgeGraph {
  /** 图谱ID */
  id: string;
  /** 图谱名称 */
  name: string;
  /** 图谱描述 */
  description?: string;
  /** 节点列表 */
  nodes: KnowledgeNode[];
  /** 关系列表 */
  edges: KnowledgeEdge[];
  /** 创建时间 */
  createTime: string;
  /** 更新时间 */
  updateTime: string;
}

/**
 * 图谱查询请求
 */
export interface GraphQueryRequest {
  /** 中心节点ID */
  centerId?: string;
  /** 节点类型过滤 */
  nodeTypes?: NodeType[];
  /** 关系类型过滤 */
  edgeTypes?: RelationType[];
  /** 深度限制 */
  depth?: number;
  /** 最大节点数 */
  maxNodes?: number;
  /** 关键词搜索 */
  keyword?: string;
}

/**
 * 图谱统计信息
 */
export interface GraphStatistics {
  /** 节点总数 */
  nodeCount: number;
  /** 关系总数 */
  edgeCount: number;
  /** 各类型节点数量 */
  nodeTypeCount: Record<NodeType, number>;
  /** 各类型关系数量 */
  edgeTypeCount: Record<RelationType, number>;
  /** 平均连接度 */
  avgDegree: number;
  /** 最大连接度 */
  maxDegree: number;
  /** 图谱密度 */
  density: number;
}

/**
 * 路径查询请求
 */
export interface PathQueryRequest {
  /** 起始节点ID */
  startId: string;
  /** 目标节点ID */
  endId: string;
  /** 最大深度 */
  maxDepth?: number;
  /** 关系类型过滤 */
  edgeTypes?: RelationType[];
}

/**
 * 路径结果
 */
export interface PathResult {
  /** 路径节点ID列表 */
  nodeIds: string[];
  /** 路径关系ID列表 */
  edgeIds: string[];
  /** 路径长度 */
  length: number;
  /** 路径权重 */
  weight: number;
}

/**
 * 社区检测结果
 */
export interface Community {
  /** 社区ID */
  id: string;
  /** 社区名称 */
  name: string;
  /** 节点ID列表 */
  nodeIds: string[];
  /** 社区大小 */
  size: number;
  /** 社区密度 */
  density: number;
}

/**
 * 中心性分析结果
 */
export interface CentralityResult {
  /** 节点ID */
  nodeId: string;
  /** 度中心性 */
  degreeCentrality: number;
  /** 接近中心性 */
  closenessCentrality: number;
  /** 中介中心性 */
  betweennessCentrality: number;
  /** PageRank值 */
  pageRank: number;
}

/**
 * 图谱布局配置
 */
export interface LayoutConfig {
  /** 布局类型 */
  type: 'force' | 'circular' | 'grid' | 'radial' | 'dagre';
  /** 节点间距 */
  nodeSpacing?: number;
  /** 层级间距 */
  rankSpacing?: number;
  /** 是否启用动画 */
  animate?: boolean;
  /** 动画时长 */
  animationDuration?: number;
}

/**
 * 图谱样式配置
 */
export interface GraphStyle {
  /** 节点样式 */
  node?: {
    size?: number;
    color?: string;
    labelSize?: number;
    labelColor?: string;
  };
  /** 关系样式 */
  edge?: {
    width?: number;
    color?: string;
    labelSize?: number;
    labelColor?: string;
  };
  /** 高亮样式 */
  highlight?: {
    nodeColor?: string;
    edgeColor?: string;
  };
}

/**
 * 知识推荐
 */
export interface KnowledgeRecommendation {
  /** 推荐节点 */
  node: KnowledgeNode;
  /** 推荐分数 */
  score: number;
  /** 推荐原因 */
  reason: string;
  /** 相关节点 */
  relatedNodes?: KnowledgeNode[];
}

/**
 * 知识缺口
 */
export interface KnowledgeGap {
  /** 缺口ID */
  id: string;
  /** 缺口描述 */
  description: string;
  /** 相关节点 */
  relatedNodes: string[];
  /** 重要度 */
  importance: number;
  /** 建议补充内容 */
  suggestions: string[];
}

/**
 * 图谱导出格式
 */
export enum ExportFormat {
  /** JSON格式 */
  JSON = 'json',
  /** GraphML格式 */
  GRAPHML = 'graphml',
  /** CSV格式 */
  CSV = 'csv',
  /** 图片格式 */
  IMAGE = 'image'
}

/**
 * 图谱导出请求
 */
export interface GraphExportRequest {
  /** 图谱ID */
  graphId: string;
  /** 导出格式 */
  format: ExportFormat;
  /** 是否包含样式 */
  includeStyle?: boolean;
}