/**
 * 知识图谱服务实现
 */

import http from '../http/request';
import {
  NodeType,
  RelationType,
  type KnowledgeNode,
  type KnowledgeEdge,
  type KnowledgeGraph,
  type GraphQueryRequest,
  type GraphStatistics,
  type PathQueryRequest,
  type PathResult,
  type Community,
  type CentralityResult,
  type KnowledgeRecommendation,
  type KnowledgeGap,
  type GraphExportRequest
} from './types';

/**
 * 知识图谱服务类
 */
class KnowledgeService {
  private readonly baseUrl = '/api/knowledge';

  /**
   * 获取知识图谱
   */
  async getGraph(projectId?: string): Promise<KnowledgeGraph> {
    return await http.get<KnowledgeGraph>(`${this.baseUrl}/graph`, {
      projectId
    });
  }

  /**
   * 查询图谱
   */
  async queryGraph(request: GraphQueryRequest): Promise<KnowledgeGraph> {
    return await http.post<KnowledgeGraph>(`${this.baseUrl}/query`, request);
  }

  /**
   * 获取节点详情
   */
  async getNode(nodeId: string): Promise<KnowledgeNode> {
    return await http.get<KnowledgeNode>(`${this.baseUrl}/nodes/${nodeId}`);
  }

  /**
   * 创建节点
   */
  async createNode(node: Omit<KnowledgeNode, 'id'>): Promise<KnowledgeNode> {
    return await http.post<KnowledgeNode>(`${this.baseUrl}/nodes`, node);
  }

  /**
   * 更新节点
   */
  async updateNode(nodeId: string, node: Partial<KnowledgeNode>): Promise<KnowledgeNode> {
    return await http.put<KnowledgeNode>(`${this.baseUrl}/nodes/${nodeId}`, node);
  }

  /**
   * 删除节点
   */
  async deleteNode(nodeId: string): Promise<void> {
    await http.del(`${this.baseUrl}/nodes/${nodeId}`);
  }

  /**
   * 获取关系详情
   */
  async getEdge(edgeId: string): Promise<KnowledgeEdge> {
    return await http.get<KnowledgeEdge>(`${this.baseUrl}/edges/${edgeId}`);
  }

  /**
   * 创建关系
   */
  async createEdge(edge: Omit<KnowledgeEdge, 'id'>): Promise<KnowledgeEdge> {
    return await http.post<KnowledgeEdge>(`${this.baseUrl}/edges`, edge);
  }

  /**
   * 更新关系
   */
  async updateEdge(edgeId: string, edge: Partial<KnowledgeEdge>): Promise<KnowledgeEdge> {
    return await http.put<KnowledgeEdge>(`${this.baseUrl}/edges/${edgeId}`, edge);
  }

  /**
   * 删除关系
   */
  async deleteEdge(edgeId: string): Promise<void> {
    await http.del(`${this.baseUrl}/edges/${edgeId}`);
  }

  /**
   * 获取节点的邻居
   */
  async getNeighbors(nodeId: string, depth: number = 1): Promise<KnowledgeGraph> {
    return await http.get<KnowledgeGraph>(`${this.baseUrl}/nodes/${nodeId}/neighbors`, {
      depth
    });
  }

  /**
   * 查找路径
   */
  async findPath(request: PathQueryRequest): Promise<PathResult[]> {
    return await http.post<PathResult[]>(`${this.baseUrl}/path`, request);
  }

  /**
   * 获取图谱统计
   */
  async getStatistics(projectId?: string): Promise<GraphStatistics> {
    return await http.get<GraphStatistics>(`${this.baseUrl}/statistics`, {
      projectId
    });
  }

  /**
   * 社区检测
   */
  async detectCommunities(projectId?: string): Promise<Community[]> {
    return await http.get<Community[]>(`${this.baseUrl}/communities`, {
      projectId
    });
  }

  /**
   * 中心性分析
   */
  async analyzeCentrality(projectId?: string): Promise<CentralityResult[]> {
    return await http.get<CentralityResult[]>(`${this.baseUrl}/centrality`, {
      projectId
    });
  }

  /**
   * 获取知识推荐
   */
  async getRecommendations(nodeId: string, limit: number = 10): Promise<KnowledgeRecommendation[]> {
    return await http.get<KnowledgeRecommendation[]>(
      `${this.baseUrl}/nodes/${nodeId}/recommendations`,
      { limit }
    );
  }

  /**
   * 识别知识缺口
   */
  async identifyGaps(projectId?: string): Promise<KnowledgeGap[]> {
    return await http.get<KnowledgeGap[]>(`${this.baseUrl}/gaps`, {
      projectId
    });
  }

  /**
   * 搜索节点
   */
  async searchNodes(keyword: string, types?: NodeType[]): Promise<KnowledgeNode[]> {
    return await http.get<KnowledgeNode[]>(`${this.baseUrl}/search`, {
      keyword,
      types: types?.join(',')
    });
  }

  /**
   * 导出图谱
   */
  async exportGraph(request: GraphExportRequest): Promise<string> {
    const response = await http.post<{ url: string }>(`${this.baseUrl}/export`, request);
    return response.url;
  }

  /**
   * 导入图谱
   */
  async importGraph(file: string): Promise<KnowledgeGraph> {
    return await http.post<KnowledgeGraph>(`${this.baseUrl}/import`, {
      file
    });
  }

  /**
   * AI自动构建图谱
   */
  async buildGraphByAI(projectId: string): Promise<KnowledgeGraph> {
    return await http.post<KnowledgeGraph>(`${this.baseUrl}/build`, {
      projectId
    });
  }

  /**
   * AI推理关系
   */
  async inferRelations(nodeId: string): Promise<KnowledgeEdge[]> {
    return await http.post<KnowledgeEdge[]>(`${this.baseUrl}/infer`, {
      nodeId
    });
  }

  /**
   * 获取节点类型列表
   */
  getNodeTypes(): Array<{ value: NodeType; label: string; icon: string }> {
    return [
      { value: NodeType.PROJECT, label: '项目', icon: '📁' },
      { value: NodeType.TASK, label: '任务', icon: '✅' },
      { value: NodeType.DOCUMENT, label: '文档', icon: '📄' },
      { value: NodeType.PERSON, label: '人员', icon: '👤' },
      { value: NodeType.SKILL, label: '技能', icon: '🎯' },
      { value: NodeType.CONCEPT, label: '概念', icon: '💡' },
      { value: NodeType.EVENT, label: '事件', icon: '📅' }
    ];
  }

  /**
   * 获取关系类型列表
   */
  getRelationTypes(): Array<{ value: RelationType; label: string }> {
    return [
      { value: RelationType.CONTAINS, label: '包含' },
      { value: RelationType.DEPENDS_ON, label: '依赖' },
      { value: RelationType.RELATES_TO, label: '关联' },
      { value: RelationType.CREATED_BY, label: '创建' },
      { value: RelationType.OWNED_BY, label: '负责' },
      { value: RelationType.PARTICIPATES_IN, label: '参与' },
      { value: RelationType.REFERENCES, label: '引用' },
      { value: RelationType.PRECEDES, label: '前置' },
      { value: RelationType.FOLLOWS, label: '后续' }
    ];
  }

  /**
   * 获取节点颜色
   */
  getNodeColor(type: NodeType): string {
    const colorMap: Record<NodeType, string> = {
      [NodeType.PROJECT]: '#3B82F6',
      [NodeType.TASK]: '#10B981',
      [NodeType.DOCUMENT]: '#F59E0B',
      [NodeType.PERSON]: '#8B5CF6',
      [NodeType.SKILL]: '#EC4899',
      [NodeType.CONCEPT]: '#06B6D4',
      [NodeType.EVENT]: '#EF4444'
    };
    return colorMap[type] || '#6B7280';
  }

  /**
   * 计算节点大小
   */
  calculateNodeSize(node: KnowledgeNode, degree: number): number {
    const baseSize = 20;
    const importanceWeight = (node.importance || 0.5) * 20;
    const degreeWeight = Math.min(degree * 2, 40);
    return baseSize + importanceWeight + degreeWeight;
  }
}

// 导出单例
export const knowledgeService = new KnowledgeService();