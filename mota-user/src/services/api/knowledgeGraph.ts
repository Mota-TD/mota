import request from '../request';

// 知识节点类型定义
export interface KnowledgeNode {
  id: number;
  name: string;
  nodeType: 'concept' | 'entity' | 'document' | 'task' | 'project' | 'person' | 'organization' | 'location' | 'event' | 'merged';
  description?: string;
  relatedId?: number;
  relatedType?: string;
  properties?: Record<string, unknown>;
  embeddingVector?: string;
  referenceCount: number;
  clusterId?: number;
  clusterName?: string;
  createdAt: string;
  updatedAt: string;
}

// 知识边类型定义
export interface KnowledgeEdge {
  id: number;
  sourceNodeId: number;
  targetNodeId: number;
  relationType: string;
  weight: number;
  properties?: Record<string, unknown>;
  createdAt: string;
}

// 图谱可视化数据
export interface GraphVisualizationData {
  nodes: Array<{
    id: number;
    name: string;
    type: string;
    description?: string;
    referenceCount: number;
    clusterId?: number;
    clusterName?: string;
    properties?: Record<string, unknown>;
    x?: number;
    y?: number;
  }>;
  edges: Array<{
    id: number;
    source: number;
    target: number;
    type: string;
    weight: number;
    properties?: Record<string, unknown>;
  }>;
  clusters?: Array<{
    id: number;
    name: string;
    color: string;
    nodeCount: number;
  }>;
}

// 图谱统计信息
export interface GraphStats {
  totalNodes: number;
  totalEdges: number;
  nodeTypeDistribution: Record<string, number>;
  edgeTypeDistribution: Record<string, number>;
  clusterDistribution?: Record<string, number>;
}

// ========== 实体识别相关类型 ==========

// 识别出的实体
export interface ExtractedEntity {
  id?: number;
  text: string;
  type: string;
  startOffset: number;
  endOffset: number;
  confidence: number;
  properties?: Record<string, unknown>;
}

// 实体识别结果
export interface EntityExtractionResult {
  documentId: number;
  entities: ExtractedEntity[];
  processingTime: number;
  modelUsed: string;
}

// ========== 关系抽取相关类型 ==========

// 抽取的关系
export interface ExtractedRelation {
  id?: number;
  sourceEntity: ExtractedEntity;
  targetEntity: ExtractedEntity;
  relationType: string;
  confidence: number;
  context?: string;
  properties?: Record<string, unknown>;
}

// 关系抽取结果
export interface RelationExtractionResult {
  documentId: number;
  relations: ExtractedRelation[];
  processingTime: number;
  modelUsed: string;
}

// ========== 属性提取相关类型 ==========

// 实体属性
export interface EntityAttribute {
  name: string;
  value: string | number | boolean | string[];
  type: 'string' | 'number' | 'boolean' | 'date' | 'list';
  confidence: number;
  source?: string;
}

// 属性提取结果
export interface AttributeExtractionResult {
  entityId: number;
  entityName: string;
  attributes: EntityAttribute[];
  processingTime: number;
}

// ========== 知识融合相关类型 ==========

// 重复实体候选
export interface DuplicateCandidate {
  entity1: KnowledgeNode;
  entity2: KnowledgeNode;
  similarity: number;
  matchedFields: string[];
  suggestedAction: 'merge' | 'keep_both' | 'review';
}

// 融合结果
export interface FusionResult {
  mergedNode: KnowledgeNode;
  sourceNodes: KnowledgeNode[];
  conflictsResolved: Array<{
    field: string;
    values: string[];
    resolvedValue: string;
    strategy: string;
  }>;
}

// ========== 聚类相关类型 ==========

// 聚类结果
export interface ClusterResult {
  id: number;
  name: string;
  description?: string;
  color: string;
  nodeIds: number[];
  nodeCount: number;
  centroid?: { x: number; y: number };
  keywords?: string[];
}

// 聚类配置
export interface ClusterConfig {
  algorithm: 'kmeans' | 'dbscan' | 'hierarchical' | 'louvain';
  numClusters?: number;
  minClusterSize?: number;
  epsilon?: number;
  useEmbeddings?: boolean;
}

// ========== 路径查询相关类型 ==========

// 路径
export interface GraphPath {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  totalWeight: number;
  length: number;
}

// 路径查询配置
export interface PathQueryConfig {
  maxDepth?: number;
  maxPaths?: number;
  relationTypes?: string[];
  excludeNodeTypes?: string[];
  weightThreshold?: number;
}

// ========== 子图相关类型 ==========

// 子图筛选条件
export interface SubgraphFilter {
  nodeTypes?: string[];
  relationTypes?: string[];
  clusterIds?: number[];
  minReferenceCount?: number;
  dateRange?: { start: string; end: string };
  keywords?: string[];
}

// 子图导出格式
export type ExportFormat = 'json' | 'csv' | 'graphml' | 'gexf' | 'neo4j';

// ========== 知识导航相关类型 ==========

// 导航建议
export interface NavigationSuggestion {
  node: KnowledgeNode;
  relation: string;
  relevanceScore: number;
  reason: string;
}

// 导航历史
export interface NavigationHistory {
  nodeId: number;
  nodeName: string;
  timestamp: string;
}

// ========== 关联推荐相关类型 ==========

// 推荐项
export interface RecommendationItem {
  id: number;
  type: 'document' | 'project' | 'person' | 'task' | 'node';
  name: string;
  description?: string;
  relevanceScore: number;
  matchedKeywords?: string[];
  relationPath?: string[];
}

// 推荐结果
export interface RecommendationResult {
  sourceNodeId: number;
  recommendations: RecommendationItem[];
  generatedAt: string;
}

// ========== 节点管理 ==========

export const createNode = (node: Partial<KnowledgeNode>) => {
  return request.post<KnowledgeNode>('/api/knowledge-graph/nodes', node);
};

export const updateNode = (id: number, node: Partial<KnowledgeNode>) => {
  return request.put<KnowledgeNode>(`/api/knowledge-graph/nodes/${id}`, node);
};

export const deleteNode = (id: number) => {
  return request.del<boolean>(`/api/knowledge-graph/nodes/${id}`);
};

export const getNode = (id: number) => {
  return request.get<KnowledgeNode>(`/api/knowledge-graph/nodes/${id}`);
};

export const getNodeWithRelations = (id: number, depth = 2) => {
  return request.get<KnowledgeNode>(`/api/knowledge-graph/nodes/${id}/with-relations?depth=${depth}`);
};

export const getNodesByType = (nodeType: string, page = 1, pageSize = 20) => {
  return request.get<KnowledgeNode[]>(`/api/knowledge-graph/nodes/type/${nodeType}?page=${page}&pageSize=${pageSize}`);
};

export const searchNodes = (keyword: string, nodeType?: string, page = 1, pageSize = 20) => {
  let url = `/api/knowledge-graph/nodes/search?keyword=${encodeURIComponent(keyword)}&page=${page}&pageSize=${pageSize}`;
  if (nodeType) {
    url += `&nodeType=${nodeType}`;
  }
  return request.get<KnowledgeNode[]>(url);
};

export const semanticSearchNodes = (query: string, topK = 10) => {
  return request.get<KnowledgeNode[]>(`/api/knowledge-graph/nodes/semantic-search?query=${encodeURIComponent(query)}&topK=${topK}`);
};

export const getPopularNodes = (limit = 10) => {
  return request.get<KnowledgeNode[]>(`/api/knowledge-graph/nodes/popular?limit=${limit}`);
};

// ========== 关系管理 ==========

export const createEdge = (edge: Partial<KnowledgeEdge>) => {
  return request.post<KnowledgeEdge>('/api/knowledge-graph/edges', edge);
};

export const deleteEdge = (id: number) => {
  return request.del<boolean>(`/api/knowledge-graph/edges/${id}`);
};

export const getOutEdges = (nodeId: number) => {
  return request.get<KnowledgeEdge[]>(`/api/knowledge-graph/nodes/${nodeId}/out-edges`);
};

export const getInEdges = (nodeId: number) => {
  return request.get<KnowledgeEdge[]>(`/api/knowledge-graph/nodes/${nodeId}/in-edges`);
};

export const getEdgesBetween = (sourceNodeId: number, targetNodeId: number) => {
  return request.get<KnowledgeEdge[]>(`/api/knowledge-graph/edges/between?sourceNodeId=${sourceNodeId}&targetNodeId=${targetNodeId}`);
};

export const getEdgesByType = (relationType: string, page = 1, pageSize = 20) => {
  return request.get<KnowledgeEdge[]>(`/api/knowledge-graph/edges/type/${relationType}?page=${page}&pageSize=${pageSize}`);
};

// ========== 图谱构建 ==========

export const extractFromDocument = (documentId: number) => {
  return request.post<KnowledgeNode[]>(`/api/knowledge-graph/extract/document/${documentId}`);
};

export const extractFromTask = (taskId: number) => {
  return request.post<KnowledgeNode>(`/api/knowledge-graph/extract/task/${taskId}`);
};

export const extractFromProject = (projectId: number) => {
  return request.post<KnowledgeNode>(`/api/knowledge-graph/extract/project/${projectId}`);
};

export const discoverRelations = (nodeId: number) => {
  return request.post<KnowledgeEdge[]>(`/api/knowledge-graph/nodes/${nodeId}/discover-relations`);
};

export const mergeNodes = (nodeIds: number[], mergedName: string) => {
  return request.post<KnowledgeNode>(`/api/knowledge-graph/nodes/merge?mergedName=${encodeURIComponent(mergedName)}`, nodeIds);
};

// ========== 图谱查询 ==========

export const getNeighbors = (nodeId: number, depth = 2) => {
  return request.get<KnowledgeNode[]>(`/api/knowledge-graph/nodes/${nodeId}/neighbors?depth=${depth}`);
};

export const findPaths = (sourceNodeId: number, targetNodeId: number, maxDepth = 5) => {
  return request.get<KnowledgeNode[][]>(`/api/knowledge-graph/paths?sourceNodeId=${sourceNodeId}&targetNodeId=${targetNodeId}&maxDepth=${maxDepth}`);
};

export const getRelatedNodes = (nodeId: number, limit = 10) => {
  return request.get<KnowledgeNode[]>(`/api/knowledge-graph/nodes/${nodeId}/related?limit=${limit}`);
};

// ========== 图谱可视化 ==========

export const getGraphVisualizationData = (centerNodeId: number, depth = 2) => {
  return request.get<GraphVisualizationData>(`/api/knowledge-graph/visualization/${centerNodeId}?depth=${depth}`);
};

export const getProjectKnowledgeGraph = (projectId: number) => {
  return request.get<GraphVisualizationData>(`/api/knowledge-graph/project/${projectId}/graph`);
};

export const getGlobalGraphOverview = () => {
  return request.get<GraphVisualizationData>('/api/knowledge-graph/overview');
};

// ========== 向量嵌入 ==========

export const updateNodeEmbedding = (nodeId: number) => {
  return request.post<void>(`/api/knowledge-graph/nodes/${nodeId}/update-embedding`);
};

export const batchUpdateEmbeddings = (nodeIds: number[]) => {
  return request.post<void>('/api/knowledge-graph/nodes/batch-update-embeddings', nodeIds);
};

// ========== 统计分析 ==========

export const getGraphStats = () => {
  return request.get<GraphStats>('/api/knowledge-graph/stats');
};

export const getNodeTypeDistribution = () => {
  return request.get<Record<string, number>>('/api/knowledge-graph/stats/node-types');
};

export const getEdgeTypeDistribution = () => {
  return request.get<Record<string, number>>('/api/knowledge-graph/stats/edge-types');
};

// ========== KG-001: 实体识别 ==========

export const extractEntitiesFromDocument = async (documentId: number): Promise<EntityExtractionResult> => {
  return await request.post<EntityExtractionResult>(`/api/knowledge-graph/extract/entities/${documentId}`);
};

export const extractEntitiesFromText = async (text: string): Promise<ExtractedEntity[]> => {
  return await request.post<ExtractedEntity[]>('/api/knowledge-graph/extract/entities/text', { text });
};

// ========== KG-002: 关系抽取 ==========

export const extractRelationsFromDocument = async (documentId: number): Promise<RelationExtractionResult> => {
  return await request.post<RelationExtractionResult>(`/api/knowledge-graph/extract/relations/${documentId}`);
};

export const extractRelationsFromEntities = async (entities: ExtractedEntity[]): Promise<ExtractedRelation[]> => {
  return await request.post<ExtractedRelation[]>('/api/knowledge-graph/extract/relations/entities', { entities });
};

// ========== KG-003: 属性提取 ==========

export const extractAttributesFromEntity = async (entityId: number): Promise<AttributeExtractionResult> => {
  return await request.post<AttributeExtractionResult>(`/api/knowledge-graph/extract/attributes/${entityId}`);
};

export const batchExtractAttributes = async (entityIds: number[]): Promise<AttributeExtractionResult[]> => {
  return await request.post<AttributeExtractionResult[]>('/api/knowledge-graph/extract/attributes/batch', { entityIds });
};

// ========== KG-004: 知识融合 ==========

export const findDuplicates = async (threshold = 0.8): Promise<DuplicateCandidate[]> => {
  return await request.get<DuplicateCandidate[]>(`/api/knowledge-graph/fusion/duplicates?threshold=${threshold}`);
};

export const mergeEntities = async (entity1Id: number, entity2Id: number, mergedName: string, conflictResolution?: Record<string, string>): Promise<FusionResult> => {
  return await request.post<FusionResult>('/api/knowledge-graph/fusion/merge', {
    entity1Id,
    entity2Id,
    mergedName,
    conflictResolution
  });
};

export const autoMergeDuplicates = async (threshold = 0.9): Promise<FusionResult[]> => {
  return await request.post<FusionResult[]>(`/api/knowledge-graph/fusion/auto-merge?threshold=${threshold}`);
};

// ========== KG-005: 图谱可视化 (已有基础实现，增强) ==========

export const getClusteredVisualizationData = async (config?: ClusterConfig): Promise<GraphVisualizationData> => {
  return await request.post<GraphVisualizationData>('/api/knowledge-graph/visualization/clustered', config || {});
};

export const getInteractiveGraphData = async (centerNodeId?: number, options?: {
  depth?: number;
  nodeTypes?: string[];
  relationTypes?: string[];
  minWeight?: number;
}): Promise<GraphVisualizationData> => {
  const params = new URLSearchParams();
  if (centerNodeId) params.append('centerNodeId', String(centerNodeId));
  if (options?.depth) params.append('depth', String(options.depth));
  if (options?.nodeTypes) params.append('nodeTypes', options.nodeTypes.join(','));
  if (options?.relationTypes) params.append('relationTypes', options.relationTypes.join(','));
  if (options?.minWeight) params.append('minWeight', String(options.minWeight));
  return await request.get<GraphVisualizationData>(`/api/knowledge-graph/visualization/interactive?${params}`);
};

// ========== KG-006: 节点聚类 ==========

export const clusterNodes = async (config: ClusterConfig): Promise<ClusterResult[]> => {
  return await request.post<ClusterResult[]>('/api/knowledge-graph/cluster', config);
};

export const getClusterDetails = async (clusterId: number): Promise<ClusterResult & { nodes: KnowledgeNode[] }> => {
  return await request.get<ClusterResult & { nodes: KnowledgeNode[] }>(`/api/knowledge-graph/cluster/${clusterId}`);
};

export const updateClusterLayout = async (clusterId: number, layout: 'force' | 'circular' | 'hierarchical' | 'grid'): Promise<GraphVisualizationData> => {
  return await request.post<GraphVisualizationData>(`/api/knowledge-graph/cluster/${clusterId}/layout`, { layout });
};

// ========== KG-007: 路径查询 ==========

export const findShortestPath = async (sourceNodeId: number, targetNodeId: number, config?: PathQueryConfig): Promise<GraphPath | null> => {
  const params = new URLSearchParams();
  params.append('sourceNodeId', String(sourceNodeId));
  params.append('targetNodeId', String(targetNodeId));
  if (config?.maxDepth) params.append('maxDepth', String(config.maxDepth));
  if (config?.relationTypes) params.append('relationTypes', config.relationTypes.join(','));
  return await request.get<GraphPath>(`/api/knowledge-graph/paths/shortest?${params}`);
};

export const findAllPaths = async (sourceNodeId: number, targetNodeId: number, config?: PathQueryConfig): Promise<GraphPath[]> => {
  const params = new URLSearchParams();
  params.append('sourceNodeId', String(sourceNodeId));
  params.append('targetNodeId', String(targetNodeId));
  if (config?.maxDepth) params.append('maxDepth', String(config.maxDepth));
  if (config?.maxPaths) params.append('maxPaths', String(config.maxPaths));
  return await request.get<GraphPath[]>(`/api/knowledge-graph/paths/all?${params}`);
};

export const findPathsByRelationType = async (sourceNodeId: number, relationType: string, maxDepth = 3): Promise<GraphPath[]> => {
  return await request.get<GraphPath[]>(`/api/knowledge-graph/paths/by-relation?sourceNodeId=${sourceNodeId}&relationType=${relationType}&maxDepth=${maxDepth}`);
};

// ========== KG-008: 子图筛选 ==========

export const filterSubgraph = async (filter: SubgraphFilter): Promise<GraphVisualizationData> => {
  return await request.post<GraphVisualizationData>('/api/knowledge-graph/subgraph/filter', filter);
};

export const exportSubgraph = async (filter: SubgraphFilter, format: ExportFormat): Promise<Blob> => {
  const response = await fetch('/api/knowledge-graph/subgraph/export', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filter, format })
  });
  return await response.blob();
};

export const saveSubgraphAsView = async (filter: SubgraphFilter, viewName: string): Promise<{ id: number; name: string }> => {
  return await request.post<{ id: number; name: string }>('/api/knowledge-graph/subgraph/save-view', { filter, viewName });
};

export const getSavedViews = async (): Promise<Array<{ id: number; name: string; filter: SubgraphFilter; createdAt: string }>> => {
  return await request.get<Array<{ id: number; name: string; filter: SubgraphFilter; createdAt: string }>>('/api/knowledge-graph/subgraph/views');
};

// ========== KG-009: 知识导航 ==========

export const getNavigationSuggestions = async (nodeId: number, limit = 10): Promise<NavigationSuggestion[]> => {
  return await request.get<NavigationSuggestion[]>(`/api/knowledge-graph/navigation/${nodeId}/suggestions?limit=${limit}`);
};

export const getNavigationHistory = async (limit = 20): Promise<NavigationHistory[]> => {
  return await request.get<NavigationHistory[]>(`/api/knowledge-graph/navigation/history?limit=${limit}`);
};

export const recordNavigation = async (nodeId: number): Promise<void> => {
  await request.post<void>(`/api/knowledge-graph/navigation/record/${nodeId}`);
};

export const getRelatedKnowledge = async (nodeId: number, options?: {
  types?: string[];
  limit?: number;
  minRelevance?: number;
}): Promise<NavigationSuggestion[]> => {
  const params = new URLSearchParams();
  if (options?.types) params.append('types', options.types.join(','));
  if (options?.limit) params.append('limit', String(options.limit));
  if (options?.minRelevance) params.append('minRelevance', String(options.minRelevance));
  return await request.get<NavigationSuggestion[]>(`/api/knowledge-graph/navigation/${nodeId}/related?${params}`);
};

// ========== KG-010: 关联推荐 ==========

export const getRecommendations = async (nodeId: number, types?: string[]): Promise<RecommendationResult> => {
  const params = new URLSearchParams();
  if (types) params.append('types', types.join(','));
  return await request.get<RecommendationResult>(`/api/knowledge-graph/recommendations/${nodeId}?${params}`);
};

export const getDocumentRecommendations = async (nodeId: number, limit = 10): Promise<RecommendationItem[]> => {
  return await request.get<RecommendationItem[]>(`/api/knowledge-graph/recommendations/${nodeId}/documents?limit=${limit}`);
};

export const getProjectRecommendations = async (nodeId: number, limit = 10): Promise<RecommendationItem[]> => {
  return await request.get<RecommendationItem[]>(`/api/knowledge-graph/recommendations/${nodeId}/projects?limit=${limit}`);
};

export const getPersonRecommendations = async (nodeId: number, limit = 10): Promise<RecommendationItem[]> => {
  return await request.get<RecommendationItem[]>(`/api/knowledge-graph/recommendations/${nodeId}/persons?limit=${limit}`);
};

export const getSimilarNodes = async (nodeId: number, limit = 10): Promise<Array<KnowledgeNode & { similarity: number }>> => {
  return await request.get<Array<KnowledgeNode & { similarity: number }>>(`/api/knowledge-graph/recommendations/${nodeId}/similar?limit=${limit}`);
};

// ========== 工具函数 ==========

// 节点类型颜色映射
export const nodeTypeColors: Record<string, string> = {
  concept: '#1890ff',
  entity: '#52c41a',
  document: '#722ed1',
  task: '#fa8c16',
  project: '#eb2f96',
  person: '#13c2c2',
  organization: '#2f54eb',
  location: '#faad14',
  event: '#a0d911',
  merged: '#8c8c8c'
};

// 关系类型颜色映射
export const relationTypeColors: Record<string, string> = {
  related_to: '#1890ff',
  belongs_to: '#52c41a',
  contains: '#722ed1',
  describes: '#fa8c16',
  managed_by: '#eb2f96',
  assigned_to: '#13c2c2',
  used_in: '#2f54eb',
  leads_to: '#faad14',
  depends_on: '#a0d911'
};

// 格式化节点类型
export const formatNodeType = (type: string): string => {
  const typeMap: Record<string, string> = {
    concept: '概念',
    entity: '实体',
    document: '文档',
    task: '任务',
    project: '项目',
    person: '人员',
    organization: '组织',
    location: '地点',
    event: '事件',
    merged: '合并'
  };
  return typeMap[type] || type;
};

// 格式化关系类型
export const formatRelationType = (type: string): string => {
  const typeMap: Record<string, string> = {
    related_to: '相关',
    belongs_to: '属于',
    contains: '包含',
    describes: '描述',
    managed_by: '管理',
    assigned_to: '分配给',
    used_in: '用于',
    leads_to: '导向',
    depends_on: '依赖'
  };
  return typeMap[type] || type;
};