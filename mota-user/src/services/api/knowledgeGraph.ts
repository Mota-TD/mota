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
  try {
    return await request.post<EntityExtractionResult>(`/api/knowledge-graph/extract/entities/${documentId}`);
  } catch {
    // 模拟数据
    return {
      documentId,
      entities: [
        { text: '项目管理', type: 'concept', startOffset: 0, endOffset: 4, confidence: 0.95 },
        { text: '张三', type: 'person', startOffset: 10, endOffset: 12, confidence: 0.92 },
        { text: '技术部', type: 'organization', startOffset: 20, endOffset: 23, confidence: 0.88 },
        { text: '2024年1月', type: 'date', startOffset: 30, endOffset: 37, confidence: 0.96 },
        { text: '北京', type: 'location', startOffset: 45, endOffset: 47, confidence: 0.91 }
      ],
      processingTime: 1250,
      modelUsed: 'bert-ner-chinese'
    };
  }
};

export const extractEntitiesFromText = async (text: string): Promise<ExtractedEntity[]> => {
  try {
    return await request.post<ExtractedEntity[]>('/api/knowledge-graph/extract/entities/text', { text });
  } catch {
    // 模拟数据
    return [
      { text: '知识图谱', type: 'concept', startOffset: 0, endOffset: 4, confidence: 0.94 },
      { text: '人工智能', type: 'concept', startOffset: 10, endOffset: 14, confidence: 0.93 }
    ];
  }
};

// ========== KG-002: 关系抽取 ==========

export const extractRelationsFromDocument = async (documentId: number): Promise<RelationExtractionResult> => {
  try {
    return await request.post<RelationExtractionResult>(`/api/knowledge-graph/extract/relations/${documentId}`);
  } catch {
    // 模拟数据
    return {
      documentId,
      relations: [
        {
          sourceEntity: { text: '张三', type: 'person', startOffset: 0, endOffset: 2, confidence: 0.92 },
          targetEntity: { text: '技术部', type: 'organization', startOffset: 5, endOffset: 8, confidence: 0.88 },
          relationType: 'belongs_to',
          confidence: 0.85,
          context: '张三是技术部的负责人'
        },
        {
          sourceEntity: { text: '项目A', type: 'project', startOffset: 15, endOffset: 18, confidence: 0.90 },
          targetEntity: { text: '张三', type: 'person', startOffset: 20, endOffset: 22, confidence: 0.92 },
          relationType: 'managed_by',
          confidence: 0.87,
          context: '项目A由张三负责管理'
        }
      ],
      processingTime: 2100,
      modelUsed: 'bert-re-chinese'
    };
  }
};

export const extractRelationsFromEntities = async (entities: ExtractedEntity[]): Promise<ExtractedRelation[]> => {
  try {
    return await request.post<ExtractedRelation[]>('/api/knowledge-graph/extract/relations/entities', { entities });
  } catch {
    return [];
  }
};

// ========== KG-003: 属性提取 ==========

export const extractAttributesFromEntity = async (entityId: number): Promise<AttributeExtractionResult> => {
  try {
    return await request.post<AttributeExtractionResult>(`/api/knowledge-graph/extract/attributes/${entityId}`);
  } catch {
    // 模拟数据
    return {
      entityId,
      entityName: '张三',
      attributes: [
        { name: '职位', value: '技术总监', type: 'string', confidence: 0.92, source: '员工档案' },
        { name: '入职日期', value: '2020-03-15', type: 'date', confidence: 0.95, source: 'HR系统' },
        { name: '技能', value: ['Java', 'Python', 'AI'], type: 'list', confidence: 0.88, source: '简历' },
        { name: '项目数', value: 15, type: 'number', confidence: 0.90, source: '项目系统' }
      ],
      processingTime: 800
    };
  }
};

export const batchExtractAttributes = async (entityIds: number[]): Promise<AttributeExtractionResult[]> => {
  try {
    return await request.post<AttributeExtractionResult[]>('/api/knowledge-graph/extract/attributes/batch', { entityIds });
  } catch {
    return [];
  }
};

// ========== KG-004: 知识融合 ==========

export const findDuplicates = async (threshold = 0.8): Promise<DuplicateCandidate[]> => {
  try {
    return await request.get<DuplicateCandidate[]>(`/api/knowledge-graph/fusion/duplicates?threshold=${threshold}`);
  } catch {
    // 模拟数据
    return [
      {
        entity1: { id: 1, name: '张三', nodeType: 'person', referenceCount: 10, createdAt: '', updatedAt: '' },
        entity2: { id: 5, name: '张三（技术部）', nodeType: 'person', referenceCount: 5, createdAt: '', updatedAt: '' },
        similarity: 0.92,
        matchedFields: ['name', 'department'],
        suggestedAction: 'merge'
      },
      {
        entity1: { id: 2, name: '项目管理系统', nodeType: 'concept', referenceCount: 8, createdAt: '', updatedAt: '' },
        entity2: { id: 8, name: 'PMS系统', nodeType: 'concept', referenceCount: 3, createdAt: '', updatedAt: '' },
        similarity: 0.85,
        matchedFields: ['description'],
        suggestedAction: 'review'
      }
    ];
  }
};

export const mergeEntities = async (entity1Id: number, entity2Id: number, mergedName: string, conflictResolution?: Record<string, string>): Promise<FusionResult> => {
  try {
    return await request.post<FusionResult>('/api/knowledge-graph/fusion/merge', {
      entity1Id,
      entity2Id,
      mergedName,
      conflictResolution
    });
  } catch {
    // 模拟数据
    return {
      mergedNode: { id: 100, name: mergedName, nodeType: 'merged', referenceCount: 15, createdAt: '', updatedAt: '' },
      sourceNodes: [],
      conflictsResolved: [
        { field: 'description', values: ['描述1', '描述2'], resolvedValue: '描述1', strategy: 'keep_first' }
      ]
    };
  }
};

export const autoMergeDuplicates = async (threshold = 0.9): Promise<FusionResult[]> => {
  try {
    return await request.post<FusionResult[]>(`/api/knowledge-graph/fusion/auto-merge?threshold=${threshold}`);
  } catch {
    return [];
  }
};

// ========== KG-005: 图谱可视化 (已有基础实现，增强) ==========

export const getClusteredVisualizationData = async (config?: ClusterConfig): Promise<GraphVisualizationData> => {
  try {
    return await request.post<GraphVisualizationData>('/api/knowledge-graph/visualization/clustered', config || {});
  } catch {
    // 模拟数据
    return {
      nodes: [
        { id: 1, name: '项目管理', type: 'concept', referenceCount: 15, clusterId: 1, clusterName: '管理类' },
        { id: 2, name: '张三', type: 'person', referenceCount: 10, clusterId: 2, clusterName: '人员类' },
        { id: 3, name: '技术部', type: 'organization', referenceCount: 8, clusterId: 2, clusterName: '人员类' },
        { id: 4, name: '需求文档', type: 'document', referenceCount: 12, clusterId: 3, clusterName: '文档类' },
        { id: 5, name: '任务A', type: 'task', referenceCount: 5, clusterId: 1, clusterName: '管理类' }
      ],
      edges: [
        { id: 1, source: 1, target: 5, type: 'contains', weight: 1 },
        { id: 2, source: 2, target: 3, type: 'belongs_to', weight: 1 },
        { id: 3, source: 4, target: 1, type: 'describes', weight: 1 },
        { id: 4, source: 2, target: 5, type: 'assigned_to', weight: 1 }
      ],
      clusters: [
        { id: 1, name: '管理类', color: '#1890ff', nodeCount: 2 },
        { id: 2, name: '人员类', color: '#52c41a', nodeCount: 2 },
        { id: 3, name: '文档类', color: '#722ed1', nodeCount: 1 }
      ]
    };
  }
};

export const getInteractiveGraphData = async (centerNodeId?: number, options?: {
  depth?: number;
  nodeTypes?: string[];
  relationTypes?: string[];
  minWeight?: number;
}): Promise<GraphVisualizationData> => {
  try {
    const params = new URLSearchParams();
    if (centerNodeId) params.append('centerNodeId', String(centerNodeId));
    if (options?.depth) params.append('depth', String(options.depth));
    if (options?.nodeTypes) params.append('nodeTypes', options.nodeTypes.join(','));
    if (options?.relationTypes) params.append('relationTypes', options.relationTypes.join(','));
    if (options?.minWeight) params.append('minWeight', String(options.minWeight));
    return await request.get<GraphVisualizationData>(`/api/knowledge-graph/visualization/interactive?${params}`);
  } catch {
    return getClusteredVisualizationData();
  }
};

// ========== KG-006: 节点聚类 ==========

export const clusterNodes = async (config: ClusterConfig): Promise<ClusterResult[]> => {
  try {
    return await request.post<ClusterResult[]>('/api/knowledge-graph/cluster', config);
  } catch {
    // 模拟数据
    return [
      { id: 1, name: '管理概念', color: '#1890ff', nodeIds: [1, 5, 10], nodeCount: 3, keywords: ['项目', '管理', '计划'] },
      { id: 2, name: '人员组织', color: '#52c41a', nodeIds: [2, 3, 6], nodeCount: 3, keywords: ['人员', '部门', '团队'] },
      { id: 3, name: '技术文档', color: '#722ed1', nodeIds: [4, 7, 8, 9], nodeCount: 4, keywords: ['文档', '技术', '规范'] }
    ];
  }
};

export const getClusterDetails = async (clusterId: number): Promise<ClusterResult & { nodes: KnowledgeNode[] }> => {
  try {
    return await request.get<ClusterResult & { nodes: KnowledgeNode[] }>(`/api/knowledge-graph/cluster/${clusterId}`);
  } catch {
    return {
      id: clusterId,
      name: '示例聚类',
      color: '#1890ff',
      nodeIds: [1, 2, 3],
      nodeCount: 3,
      keywords: ['示例'],
      nodes: []
    };
  }
};

export const updateClusterLayout = async (clusterId: number, layout: 'force' | 'circular' | 'hierarchical' | 'grid'): Promise<GraphVisualizationData> => {
  try {
    return await request.post<GraphVisualizationData>(`/api/knowledge-graph/cluster/${clusterId}/layout`, { layout });
  } catch {
    return { nodes: [], edges: [] };
  }
};

// ========== KG-007: 路径查询 ==========

export const findShortestPath = async (sourceNodeId: number, targetNodeId: number, config?: PathQueryConfig): Promise<GraphPath | null> => {
  try {
    const params = new URLSearchParams();
    params.append('sourceNodeId', String(sourceNodeId));
    params.append('targetNodeId', String(targetNodeId));
    if (config?.maxDepth) params.append('maxDepth', String(config.maxDepth));
    if (config?.relationTypes) params.append('relationTypes', config.relationTypes.join(','));
    return await request.get<GraphPath>(`/api/knowledge-graph/paths/shortest?${params}`);
  } catch {
    // 模拟数据
    return {
      nodes: [
        { id: 1, name: '起点', nodeType: 'concept', referenceCount: 5, createdAt: '', updatedAt: '' },
        { id: 2, name: '中间节点', nodeType: 'entity', referenceCount: 3, createdAt: '', updatedAt: '' },
        { id: 3, name: '终点', nodeType: 'concept', referenceCount: 4, createdAt: '', updatedAt: '' }
      ],
      edges: [
        { id: 1, sourceNodeId: 1, targetNodeId: 2, relationType: 'related_to', weight: 1, createdAt: '' },
        { id: 2, sourceNodeId: 2, targetNodeId: 3, relationType: 'leads_to', weight: 1, createdAt: '' }
      ],
      totalWeight: 2,
      length: 2
    };
  }
};

export const findAllPaths = async (sourceNodeId: number, targetNodeId: number, config?: PathQueryConfig): Promise<GraphPath[]> => {
  try {
    const params = new URLSearchParams();
    params.append('sourceNodeId', String(sourceNodeId));
    params.append('targetNodeId', String(targetNodeId));
    if (config?.maxDepth) params.append('maxDepth', String(config.maxDepth));
    if (config?.maxPaths) params.append('maxPaths', String(config.maxPaths));
    return await request.get<GraphPath[]>(`/api/knowledge-graph/paths/all?${params}`);
  } catch {
    const shortestPath = await findShortestPath(sourceNodeId, targetNodeId, config);
    return shortestPath ? [shortestPath] : [];
  }
};

export const findPathsByRelationType = async (sourceNodeId: number, relationType: string, maxDepth = 3): Promise<GraphPath[]> => {
  try {
    return await request.get<GraphPath[]>(`/api/knowledge-graph/paths/by-relation?sourceNodeId=${sourceNodeId}&relationType=${relationType}&maxDepth=${maxDepth}`);
  } catch {
    return [];
  }
};

// ========== KG-008: 子图筛选 ==========

export const filterSubgraph = async (filter: SubgraphFilter): Promise<GraphVisualizationData> => {
  try {
    return await request.post<GraphVisualizationData>('/api/knowledge-graph/subgraph/filter', filter);
  } catch {
    // 返回模拟数据
    return getClusteredVisualizationData();
  }
};

export const exportSubgraph = async (filter: SubgraphFilter, format: ExportFormat): Promise<Blob> => {
  try {
    const response = await fetch('/api/knowledge-graph/subgraph/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filter, format })
    });
    return await response.blob();
  } catch {
    // 返回模拟数据
    const mockData = JSON.stringify({ nodes: [], edges: [] });
    return new Blob([mockData], { type: 'application/json' });
  }
};

export const saveSubgraphAsView = async (filter: SubgraphFilter, viewName: string): Promise<{ id: number; name: string }> => {
  try {
    return await request.post<{ id: number; name: string }>('/api/knowledge-graph/subgraph/save-view', { filter, viewName });
  } catch {
    return { id: Date.now(), name: viewName };
  }
};

export const getSavedViews = async (): Promise<Array<{ id: number; name: string; filter: SubgraphFilter; createdAt: string }>> => {
  try {
    return await request.get<Array<{ id: number; name: string; filter: SubgraphFilter; createdAt: string }>>('/api/knowledge-graph/subgraph/views');
  } catch {
    return [];
  }
};

// ========== KG-009: 知识导航 ==========

export const getNavigationSuggestions = async (nodeId: number, limit = 10): Promise<NavigationSuggestion[]> => {
  try {
    return await request.get<NavigationSuggestion[]>(`/api/knowledge-graph/navigation/${nodeId}/suggestions?limit=${limit}`);
  } catch {
    // 模拟数据
    return [
      {
        node: { id: 2, name: '相关概念A', nodeType: 'concept', referenceCount: 8, createdAt: '', updatedAt: '' },
        relation: 'related_to',
        relevanceScore: 0.92,
        reason: '语义相似度高'
      },
      {
        node: { id: 3, name: '相关文档B', nodeType: 'document', referenceCount: 5, createdAt: '', updatedAt: '' },
        relation: 'described_in',
        relevanceScore: 0.85,
        reason: '包含相关内容'
      },
      {
        node: { id: 4, name: '相关任务C', nodeType: 'task', referenceCount: 3, createdAt: '', updatedAt: '' },
        relation: 'used_in',
        relevanceScore: 0.78,
        reason: '在任务中被引用'
      }
    ];
  }
};

export const getNavigationHistory = async (limit = 20): Promise<NavigationHistory[]> => {
  try {
    return await request.get<NavigationHistory[]>(`/api/knowledge-graph/navigation/history?limit=${limit}`);
  } catch {
    return [];
  }
};

export const recordNavigation = async (nodeId: number): Promise<void> => {
  try {
    await request.post<void>(`/api/knowledge-graph/navigation/record/${nodeId}`);
  } catch {
    // 忽略错误
  }
};

export const getRelatedKnowledge = async (nodeId: number, options?: {
  types?: string[];
  limit?: number;
  minRelevance?: number;
}): Promise<NavigationSuggestion[]> => {
  try {
    const params = new URLSearchParams();
    if (options?.types) params.append('types', options.types.join(','));
    if (options?.limit) params.append('limit', String(options.limit));
    if (options?.minRelevance) params.append('minRelevance', String(options.minRelevance));
    return await request.get<NavigationSuggestion[]>(`/api/knowledge-graph/navigation/${nodeId}/related?${params}`);
  } catch {
    return getNavigationSuggestions(nodeId);
  }
};

// ========== KG-010: 关联推荐 ==========

export const getRecommendations = async (nodeId: number, types?: string[]): Promise<RecommendationResult> => {
  try {
    const params = new URLSearchParams();
    if (types) params.append('types', types.join(','));
    return await request.get<RecommendationResult>(`/api/knowledge-graph/recommendations/${nodeId}?${params}`);
  } catch {
    // 模拟数据
    return {
      sourceNodeId: nodeId,
      recommendations: [
        {
          id: 101,
          type: 'document',
          name: '相关技术文档',
          description: '包含相关技术内容的文档',
          relevanceScore: 0.95,
          matchedKeywords: ['技术', '架构'],
          relationPath: ['概念A', 'related_to', '文档B']
        },
        {
          id: 102,
          type: 'project',
          name: '相关项目',
          description: '使用相同技术的项目',
          relevanceScore: 0.88,
          matchedKeywords: ['项目', '技术'],
          relationPath: ['概念A', 'used_in', '项目C']
        },
        {
          id: 103,
          type: 'person',
          name: '领域专家',
          description: '该领域的专家人员',
          relevanceScore: 0.82,
          matchedKeywords: ['专家', '技术'],
          relationPath: ['概念A', 'expert', '人员D']
        }
      ],
      generatedAt: new Date().toISOString()
    };
  }
};

export const getDocumentRecommendations = async (nodeId: number, limit = 10): Promise<RecommendationItem[]> => {
  try {
    return await request.get<RecommendationItem[]>(`/api/knowledge-graph/recommendations/${nodeId}/documents?limit=${limit}`);
  } catch {
    const result = await getRecommendations(nodeId, ['document']);
    return result.recommendations;
  }
};

export const getProjectRecommendations = async (nodeId: number, limit = 10): Promise<RecommendationItem[]> => {
  try {
    return await request.get<RecommendationItem[]>(`/api/knowledge-graph/recommendations/${nodeId}/projects?limit=${limit}`);
  } catch {
    const result = await getRecommendations(nodeId, ['project']);
    return result.recommendations;
  }
};

export const getPersonRecommendations = async (nodeId: number, limit = 10): Promise<RecommendationItem[]> => {
  try {
    return await request.get<RecommendationItem[]>(`/api/knowledge-graph/recommendations/${nodeId}/persons?limit=${limit}`);
  } catch {
    const result = await getRecommendations(nodeId, ['person']);
    return result.recommendations;
  }
};

export const getSimilarNodes = async (nodeId: number, limit = 10): Promise<Array<KnowledgeNode & { similarity: number }>> => {
  try {
    return await request.get<Array<KnowledgeNode & { similarity: number }>>(`/api/knowledge-graph/recommendations/${nodeId}/similar?limit=${limit}`);
  } catch {
    return [];
  }
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