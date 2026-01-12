/**
 * 增强版知识图谱组件
 * 支持实体识别、关系抽取、属性提取、知识融合、聚类、路径查询、子图筛选、知识导航、关联推荐
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Card,
  Tabs,
  Button,
  Space,
  Typography,
  Tag,
  Tooltip,
  Modal,
  message,
  Spin,
  Empty,
  Input,
  Select,
  Table,
  List,
  Drawer,
  Descriptions,
  Progress,
  Badge,
  Divider,
  Row,
  Col,
  Statistic,
  Popconfirm,
  Switch,
  Slider,
  Collapse
} from 'antd';
import {
  NodeIndexOutlined,
  SearchOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  FullscreenOutlined,
  ReloadOutlined,
  FilterOutlined,
  ExportOutlined,
  ApartmentOutlined,
  BranchesOutlined,
  CompassOutlined,
  BulbOutlined,
  MergeCellsOutlined,
  TagsOutlined,
  FileTextOutlined,
  TeamOutlined,
  ProjectOutlined,
  SettingOutlined,
  HistoryOutlined,
  StarOutlined,
  EyeOutlined,
  DownloadOutlined,
  PlusOutlined,
  LinkOutlined
} from '@ant-design/icons';
import * as d3 from 'd3';
import type { ColumnsType } from 'antd/es/table';
import styles from './index.module.css';
import {
  // 类型
  KnowledgeNode,
  GraphVisualizationData,
  ExtractedEntity,
  EntityExtractionResult,
  RelationExtractionResult,
  AttributeExtractionResult,
  DuplicateCandidate,
  ClusterResult,
  ClusterConfig,
  GraphPath,
  PathQueryConfig,
  SubgraphFilter,
  ExportFormat,
  NavigationSuggestion,
  RecommendationItem,
  // API
  getClusteredVisualizationData,
  getInteractiveGraphData,
  extractEntitiesFromDocument,
  extractRelationsFromDocument,
  extractAttributesFromEntity,
  findDuplicates,
  mergeEntities,
  clusterNodes,
  findShortestPath,
  findAllPaths,
  filterSubgraph,
  exportSubgraph,
  saveSubgraphAsView,
  getSavedViews,
  getNavigationSuggestions,
  getNavigationHistory,
  recordNavigation,
  getRecommendations,
  searchNodes,
  // 工具函数
  nodeTypeColors,
  formatNodeType,
  formatRelationType
} from '../../services/api/knowledgeGraph';

const { Text, Title, Paragraph } = Typography;
const { Search } = Input;
const { Panel } = Collapse;

interface KnowledgeGraphEnhancedProps {
  projectId?: number;
  documentId?: number;
  width?: number;
  height?: number;
  onNodeSelect?: (node: GraphNode) => void;
}

interface GraphNode extends d3.SimulationNodeDatum {
  id: number;
  name: string;
  type: string;
  description?: string;
  referenceCount: number;
  clusterId?: number;
  clusterName?: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface SimulationLink extends d3.SimulationLinkDatum<GraphNode> {
  source: GraphNode | number;
  target: GraphNode | number;
  type: string;
  weight: number;
}

const KnowledgeGraphEnhanced: React.FC<KnowledgeGraphEnhancedProps> = ({
  projectId,
  documentId,
  width = 900,
  height = 600,
  onNodeSelect
}) => {
  // 状态
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('graph');
  const [graphData, setGraphData] = useState<GraphVisualizationData | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  
  // 实体识别状态
  const [extractionResult, setExtractionResult] = useState<EntityExtractionResult | null>(null);
  const [relationResult, setRelationResult] = useState<RelationExtractionResult | null>(null);
  const [attributeResult, setAttributeResult] = useState<AttributeExtractionResult | null>(null);
  const [extracting, setExtracting] = useState(false);
  
  // 知识融合状态
  const [duplicates, setDuplicates] = useState<DuplicateCandidate[]>([]);
  const [showFusionModal, setShowFusionModal] = useState(false);
  const [selectedDuplicate, setSelectedDuplicate] = useState<DuplicateCandidate | null>(null);
  
  // 聚类状态
  const [clusters, setClusters] = useState<ClusterResult[]>([]);
  const [clusterConfig, setClusterConfig] = useState<ClusterConfig>({
    algorithm: 'louvain',
    numClusters: 5
  });
  const [showClusterColors, setShowClusterColors] = useState(true);
  
  // 路径查询状态
  const [pathSource, setPathSource] = useState<number | null>(null);
  const [pathTarget, setPathTarget] = useState<number | null>(null);
  const [paths, setPaths] = useState<GraphPath[]>([]);
  const [showPathModal, setShowPathModal] = useState(false);
  
  // 子图筛选状态
  const [subgraphFilter, setSubgraphFilter] = useState<SubgraphFilter>({});
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [savedViews, setSavedViews] = useState<Array<{ id: number; name: string }>>([]);
  
  // 导航状态
  const [navigationSuggestions, setNavigationSuggestions] = useState<NavigationSuggestion[]>([]);
  const [navigationHistory, setNavigationHistory] = useState<Array<{ nodeId: number; nodeName: string }>>([]);
  const [showNavigationDrawer, setShowNavigationDrawer] = useState(false);
  
  // 推荐状态
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [showRecommendationDrawer, setShowRecommendationDrawer] = useState(false);
  
  // 搜索状态
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<KnowledgeNode[]>([]);
  
  // Refs
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 加载图谱数据
  const loadGraphData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getClusteredVisualizationData(clusterConfig);
      setGraphData(data);
      if (data.clusters) {
        setClusters(data.clusters.map(c => ({
          id: c.id,
          name: c.name,
          color: c.color,
          nodeIds: [],
          nodeCount: c.nodeCount
        })));
      }
    } catch (error) {
      message.error('加载知识图谱失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [clusterConfig]);

  useEffect(() => {
    loadGraphData();
    loadSavedViews();
  }, [loadGraphData]);

  // 加载保存的视图
  const loadSavedViews = async () => {
    try {
      const views = await getSavedViews();
      setSavedViews(views);
    } catch (error) {
      console.error('加载保存的视图失败', error);
    }
  };

  // 渲染D3图谱
  useEffect(() => {
    if (!graphData || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { nodes, edges } = graphData;
    if (nodes.length === 0) return;

    // 转换数据
    const simNodes: GraphNode[] = nodes.map(n => ({ ...n }));
    const simLinks: SimulationLink[] = edges.map(e => ({
      source: e.source,
      target: e.target,
      type: e.type,
      weight: e.weight
    }));

    // 创建力导向图
    const simulation = d3.forceSimulation<GraphNode>(simNodes)
      .force('link', d3.forceLink<GraphNode, SimulationLink>(simLinks)
        .id((d) => d.id)
        .distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(40));

    // 缩放
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setZoomLevel(event.transform.k);
      });

    svg.call(zoom);

    const g = svg.append('g');

    // 绘制边
    const link = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(simLinks)
      .enter()
      .append('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', (d) => Math.sqrt(d.weight) * 2);

    // 边标签
    const linkLabel = g.append('g')
      .attr('class', 'link-labels')
      .selectAll('text')
      .data(simLinks)
      .enter()
      .append('text')
      .attr('font-size', 10)
      .attr('fill', '#666')
      .text((d) => formatRelationType(d.type));

    // 绘制节点
    const node = g.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(simNodes)
      .enter()
      .append('g')
      .attr('cursor', 'pointer')
      .call(d3.drag<SVGGElement, GraphNode>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }) as unknown as (selection: d3.Selection<SVGGElement, GraphNode, SVGGElement, unknown>) => void);

    // 节点圆形
    node.append('circle')
      .attr('r', (d) => 10 + Math.sqrt(d.referenceCount) * 2)
      .attr('fill', (d) => {
        if (showClusterColors && d.clusterId) {
          const cluster = clusters.find(c => c.id === d.clusterId);
          return cluster?.color || nodeTypeColors[d.type] || '#999';
        }
        return nodeTypeColors[d.type] || '#999';
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // 节点标签
    node.append('text')
      .attr('dy', 25)
      .attr('text-anchor', 'middle')
      .attr('font-size', 12)
      .attr('fill', '#333')
      .text((d) => d.name.length > 10 ? d.name.substring(0, 10) + '...' : d.name);

    // 节点点击
    node.on('click', async (_event, d) => {
      setSelectedNode(d);
      onNodeSelect?.(d);
      await recordNavigation(d.id);
      loadNavigationSuggestions(d.id);
    });

    // 悬停效果
    node.on('mouseover', function() {
      d3.select(this).select('circle')
        .transition()
        .duration(200)
        .attr('r', (d: unknown) => 15 + Math.sqrt((d as GraphNode).referenceCount) * 2);
    });

    node.on('mouseout', function() {
      d3.select(this).select('circle')
        .transition()
        .duration(200)
        .attr('r', (d: unknown) => 10 + Math.sqrt((d as GraphNode).referenceCount) * 2);
    });

    // 更新位置
    simulation.on('tick', () => {
      link
        .attr('x1', (d) => (d.source as GraphNode).x || 0)
        .attr('y1', (d) => (d.source as GraphNode).y || 0)
        .attr('x2', (d) => (d.target as GraphNode).x || 0)
        .attr('y2', (d) => (d.target as GraphNode).y || 0);

      linkLabel
        .attr('x', (d) => (((d.source as GraphNode).x || 0) + ((d.target as GraphNode).x || 0)) / 2)
        .attr('y', (d) => (((d.source as GraphNode).y || 0) + ((d.target as GraphNode).y || 0)) / 2);

      node.attr('transform', (d) => `translate(${d.x || 0},${d.y || 0})`);
    });

    return () => {
      simulation.stop();
    };
  }, [graphData, width, height, showClusterColors, clusters, onNodeSelect]);

  // 加载导航建议
  const loadNavigationSuggestions = async (nodeId: number) => {
    try {
      const suggestions = await getNavigationSuggestions(nodeId);
      setNavigationSuggestions(suggestions);
    } catch (error) {
      console.error('加载导航建议失败', error);
    }
  };

  // 搜索节点
  const handleSearch = async (value: string) => {
    if (!value.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const results = await searchNodes(value);
      setSearchResults(results);
    } catch (error) {
      console.error('搜索失败', error);
    }
  };

  // 实体识别
  const handleExtractEntities = async () => {
    if (!documentId) {
      message.warning('请先选择文档');
      return;
    }
    setExtracting(true);
    try {
      const result = await extractEntitiesFromDocument(documentId);
      setExtractionResult(result);
      message.success(`识别出 ${result.entities.length} 个实体`);
    } catch (error) {
      message.error('实体识别失败');
    } finally {
      setExtracting(false);
    }
  };

  // 关系抽取
  const handleExtractRelations = async () => {
    if (!documentId) {
      message.warning('请先选择文档');
      return;
    }
    setExtracting(true);
    try {
      const result = await extractRelationsFromDocument(documentId);
      setRelationResult(result);
      message.success(`抽取出 ${result.relations.length} 个关系`);
    } catch (error) {
      message.error('关系抽取失败');
    } finally {
      setExtracting(false);
    }
  };

  // 属性提取
  const handleExtractAttributes = async (entityId: number) => {
    setExtracting(true);
    try {
      const result = await extractAttributesFromEntity(entityId);
      setAttributeResult(result);
      message.success(`提取出 ${result.attributes.length} 个属性`);
    } catch (error) {
      message.error('属性提取失败');
    } finally {
      setExtracting(false);
    }
  };

  // 查找重复实体
  const handleFindDuplicates = async () => {
    setLoading(true);
    try {
      const result = await findDuplicates(0.8);
      setDuplicates(result);
      if (result.length > 0) {
        message.info(`发现 ${result.length} 对可能重复的实体`);
      } else {
        message.success('未发现重复实体');
      }
    } catch (error) {
      message.error('查找重复实体失败');
    } finally {
      setLoading(false);
    }
  };

  // 合并实体
  const handleMergeEntities = async (duplicate: DuplicateCandidate) => {
    try {
      const mergedName = duplicate.entity1.name;
      await mergeEntities(duplicate.entity1.id, duplicate.entity2.id, mergedName);
      message.success('实体合并成功');
      setDuplicates(prev => prev.filter(d => d !== duplicate));
      setShowFusionModal(false);
      loadGraphData();
    } catch (error) {
      message.error('实体合并失败');
    }
  };

  // 执行聚类
  const handleCluster = async () => {
    setLoading(true);
    try {
      const result = await clusterNodes(clusterConfig);
      setClusters(result);
      message.success(`生成 ${result.length} 个聚类`);
      loadGraphData();
    } catch (error) {
      message.error('聚类失败');
    } finally {
      setLoading(false);
    }
  };

  // 路径查询
  const handleFindPath = async () => {
    if (!pathSource || !pathTarget) {
      message.warning('请选择起点和终点');
      return;
    }
    setLoading(true);
    try {
      const result = await findAllPaths(pathSource, pathTarget, { maxDepth: 5, maxPaths: 5 });
      setPaths(result);
      setShowPathModal(true);
      if (result.length === 0) {
        message.info('未找到路径');
      }
    } catch (error) {
      message.error('路径查询失败');
    } finally {
      setLoading(false);
    }
  };

  // 应用筛选
  const handleApplyFilter = async () => {
    setLoading(true);
    try {
      const data = await filterSubgraph(subgraphFilter);
      setGraphData(data);
      setShowFilterDrawer(false);
      message.success('筛选已应用');
    } catch (error) {
      message.error('筛选失败');
    } finally {
      setLoading(false);
    }
  };

  // 导出子图
  const handleExportSubgraph = async (format: ExportFormat) => {
    try {
      const blob = await exportSubgraph(subgraphFilter, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `knowledge-graph.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      message.success('导出成功');
    } catch (error) {
      message.error('导出失败');
    }
  };

  // 保存视图
  const handleSaveView = async () => {
    const viewName = prompt('请输入视图名称');
    if (!viewName) return;
    try {
      const result = await saveSubgraphAsView(subgraphFilter, viewName);
      setSavedViews(prev => [...prev, result]);
      message.success('视图已保存');
    } catch (error) {
      message.error('保存视图失败');
    }
  };

  // 加载推荐
  const handleLoadRecommendations = async (nodeId: number) => {
    try {
      const result = await getRecommendations(nodeId);
      setRecommendations(result.recommendations);
      setShowRecommendationDrawer(true);
    } catch (error) {
      message.error('加载推荐失败');
    }
  };

  // 缩放控制
  const handleZoom = (delta: number) => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const currentTransform = d3.zoomTransform(svgRef.current);
    const newScale = Math.max(0.1, Math.min(4, currentTransform.k + delta));
    const zoom = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.1, 4]);
    svg.transition().duration(300).call(
      zoom.transform,
      d3.zoomIdentity.translate(currentTransform.x, currentTransform.y).scale(newScale)
    );
  };

  // 重置视图
  const handleReset = () => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const zoom = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.1, 4]);
    svg.transition().duration(500).call(zoom.transform, d3.zoomIdentity);
  };

  // 全屏
  const handleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
  };

  // 实体表格列
  const entityColumns: ColumnsType<ExtractedEntity> = [
    { title: '文本', dataIndex: 'text', key: 'text' },
    { 
      title: '类型', 
      dataIndex: 'type', 
      key: 'type',
      render: (type: string) => <Tag color={nodeTypeColors[type]}>{formatNodeType(type)}</Tag>
    },
    { 
      title: '置信度', 
      dataIndex: 'confidence', 
      key: 'confidence',
      render: (val: number) => <Progress percent={Math.round(val * 100)} size="small" />
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: ExtractedEntity) => (
        <Button type="link" size="small" onClick={() => handleExtractAttributes(record.id || 0)}>
          提取属性
        </Button>
      )
    }
  ];

  // 重复实体表格列
  const duplicateColumns: ColumnsType<DuplicateCandidate> = [
    { title: '实体1', dataIndex: ['entity1', 'name'], key: 'entity1' },
    { title: '实体2', dataIndex: ['entity2', 'name'], key: 'entity2' },
    { 
      title: '相似度', 
      dataIndex: 'similarity', 
      key: 'similarity',
      render: (val: number) => <Progress percent={Math.round(val * 100)} size="small" />
    },
    { 
      title: '建议', 
      dataIndex: 'suggestedAction', 
      key: 'suggestedAction',
      render: (action: string) => (
        <Tag color={action === 'merge' ? 'green' : action === 'review' ? 'orange' : 'default'}>
          {action === 'merge' ? '合并' : action === 'review' ? '审核' : '保留'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: DuplicateCandidate) => (
        <Space>
          <Button type="link" size="small" onClick={() => {
            setSelectedDuplicate(record);
            setShowFusionModal(true);
          }}>
            处理
          </Button>
        </Space>
      )
    }
  ];

  // 渲染图谱工具栏
  const renderToolbar = () => (
    <div className={styles.toolbar}>
      <Space>
        <Search
          placeholder="搜索节点"
          allowClear
          onSearch={handleSearch}
          onChange={(e) => setSearchKeyword(e.target.value)}
          style={{ width: 200 }}
          prefix={<SearchOutlined />}
        />
        <Tooltip title="筛选">
          <Button icon={<FilterOutlined />} onClick={() => setShowFilterDrawer(true)} />
        </Tooltip>
        <Tooltip title="聚类">
          <Button icon={<ApartmentOutlined />} onClick={handleCluster} />
        </Tooltip>
        <Tooltip title="路径查询">
          <Button icon={<BranchesOutlined />} onClick={() => setShowPathModal(true)} />
        </Tooltip>
      </Space>
      <Space>
        <Switch
          checkedChildren="聚类颜色"
          unCheckedChildren="类型颜色"
          checked={showClusterColors}
          onChange={setShowClusterColors}
        />
        <Tooltip title="放大">
          <Button icon={<ZoomInOutlined />} onClick={() => handleZoom(0.2)} />
        </Tooltip>
        <Tooltip title="缩小">
          <Button icon={<ZoomOutOutlined />} onClick={() => handleZoom(-0.2)} />
        </Tooltip>
        <Tooltip title="重置">
          <Button icon={<ReloadOutlined />} onClick={handleReset} />
        </Tooltip>
        <Tooltip title="全屏">
          <Button icon={<FullscreenOutlined />} onClick={handleFullscreen} />
        </Tooltip>
      </Space>
    </div>
  );

  // 渲染图例
  const renderLegend = () => (
    <div className={styles.legend}>
      <Text strong style={{ marginRight: 8 }}>节点类型:</Text>
      {Object.entries(nodeTypeColors).slice(0, 6).map(([type, color]) => (
        <Tag key={type} color={color}>{formatNodeType(type)}</Tag>
      ))}
    </div>
  );

  // 渲染节点详情
  const renderNodeDetails = () => {
    if (!selectedNode) return null;
    return (
      <div className={styles.nodeDetails}>
        <div className={styles.nodeDetailsHeader}>
          <Tag color={nodeTypeColors[selectedNode.type]}>{formatNodeType(selectedNode.type)}</Tag>
          <Text strong>{selectedNode.name}</Text>
        </div>
        {selectedNode.description && (
          <Paragraph type="secondary" ellipsis={{ rows: 2 }}>
            {selectedNode.description}
          </Paragraph>
        )}
        <div className={styles.nodeDetailsMeta}>
          <Text type="secondary">引用次数: {selectedNode.referenceCount}</Text>
          {selectedNode.clusterName && (
            <Tag>{selectedNode.clusterName}</Tag>
          )}
        </div>
        <Space className={styles.nodeDetailsActions}>
          <Button size="small" icon={<CompassOutlined />} onClick={() => setShowNavigationDrawer(true)}>
            导航
          </Button>
          <Button size="small" icon={<BulbOutlined />} onClick={() => handleLoadRecommendations(selectedNode.id)}>
            推荐
          </Button>
          <Button size="small" icon={<TagsOutlined />} onClick={() => handleExtractAttributes(selectedNode.id)}>
            属性
          </Button>
        </Space>
      </div>
    );
  };

  // 渲染统计信息
  const renderStats = () => (
    <div className={styles.stats}>
      <Space split={<Divider type="vertical" />}>
        <span>节点: {graphData?.nodes.length || 0}</span>
        <span>关系: {graphData?.edges.length || 0}</span>
        <span>聚类: {clusters.length}</span>
        <span>缩放: {Math.round(zoomLevel * 100)}%</span>
      </Space>
    </div>
  );

  return (
    <div className={styles.container} ref={containerRef}>
      <Card
        title={
          <Space>
            <NodeIndexOutlined />
            <span>知识图谱</span>
            <Badge count={graphData?.nodes.length || 0} style={{ backgroundColor: '#52c41a' }} />
          </Space>
        }
        extra={
          <Space>
            <Button icon={<ExportOutlined />} onClick={() => handleExportSubgraph('json')}>
              导出
            </Button>
            <Button icon={<StarOutlined />} onClick={handleSaveView}>
              保存视图
            </Button>
          </Space>
        }
        className={styles.card}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'graph',
              label: <span><NodeIndexOutlined /> 图谱可视化</span>,
              children: (
                <div className={styles.graphTab}>
                  {renderToolbar()}
                  {renderLegend()}
                  <div className={styles.graphContainer}>
                    {loading ? (
                      <div className={styles.loading}>
                        <Spin size="large" tip="加载中..." />
                      </div>
                    ) : graphData && graphData.nodes.length > 0 ? (
                      <svg ref={svgRef} width={width} height={height} className={styles.svg} />
                    ) : (
                      <Empty description="暂无知识图谱数据" />
                    )}
                  </div>
                  {renderStats()}
                  {renderNodeDetails()}
                </div>
              )
            },
            {
              key: 'extraction',
              label: <span><FileTextOutlined /> 实体识别</span>,
              children: (
                <div className={styles.extractionTab}>
                  <Space style={{ marginBottom: 16 }}>
                    <Button 
                      type="primary" 
                      icon={<SearchOutlined />} 
                      onClick={handleExtractEntities}
                      loading={extracting}
                    >
                      识别实体
                    </Button>
                    <Button 
                      icon={<LinkOutlined />} 
                      onClick={handleExtractRelations}
                      loading={extracting}
                    >
                      抽取关系
                    </Button>
                  </Space>
                  
                  {extractionResult && (
                    <div className={styles.extractionResult}>
                      <Title level={5}>识别结果 ({extractionResult.entities.length} 个实体)</Title>
                      <Text type="secondary">
                        处理时间: {extractionResult.processingTime}ms | 模型: {extractionResult.modelUsed}
                      </Text>
                      <Table
                        columns={entityColumns}
                        dataSource={extractionResult.entities}
                        rowKey={(r, i) => `${r.text}-${i}`}
                        size="small"
                        pagination={{ pageSize: 10 }}
                        style={{ marginTop: 16 }}
                      />
                    </div>
                  )}

                  {relationResult && (
                    <div className={styles.relationResult}>
                      <Title level={5}>关系抽取结果 ({relationResult.relations.length} 个关系)</Title>
                      <List
                        dataSource={relationResult.relations}
                        renderItem={(item, index) => (
                          <List.Item key={index}>
                            <Space>
                              <Tag color="blue">{item.sourceEntity.text}</Tag>
                              <Text type="secondary">→</Text>
                              <Tag color="green">{formatRelationType(item.relationType)}</Tag>
                              <Text type="secondary">→</Text>
                              <Tag color="purple">{item.targetEntity.text}</Tag>
                              <Progress percent={Math.round(item.confidence * 100)} size="small" style={{ width: 80 }} />
                            </Space>
                          </List.Item>
                        )}
                      />
                    </div>
                  )}

                  {attributeResult && (
                    <div className={styles.attributeResult}>
                      <Title level={5}>{attributeResult.entityName} 的属性</Title>
                      <Descriptions bordered size="small" column={2}>
                        {attributeResult.attributes.map((attr, index) => (
                          <Descriptions.Item key={index} label={attr.name}>
                            {Array.isArray(attr.value) ? attr.value.join(', ') : String(attr.value)}
                            <Progress percent={Math.round(attr.confidence * 100)} size="small" style={{ width: 60, marginLeft: 8 }} />
                          </Descriptions.Item>
                        ))}
                      </Descriptions>
                    </div>
                  )}
                </div>
              )
            },
            {
              key: 'fusion',
              label: <span><MergeCellsOutlined /> 知识融合</span>,
              children: (
                <div className={styles.fusionTab}>
                  <Space style={{ marginBottom: 16 }}>
                    <Button 
                      type="primary" 
                      icon={<SearchOutlined />} 
                      onClick={handleFindDuplicates}
                      loading={loading}
                    >
                      查找重复实体
                    </Button>
                  </Space>
                  
                  {duplicates.length > 0 ? (
                    <Table
                      columns={duplicateColumns}
                      dataSource={duplicates}
                      rowKey={(r) => `${r.entity1.id}-${r.entity2.id}`}
                      size="small"
                    />
                  ) : (
                    <Empty description="暂无重复实体" />
                  )}
                </div>
              )
            },
            {
              key: 'cluster',
              label: <span><ApartmentOutlined /> 节点聚类</span>,
              children: (
                <div className={styles.clusterTab}>
                  <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={8}>
                      <Text>聚类算法:</Text>
                      <Select
                        value={clusterConfig.algorithm}
                        onChange={(v) => setClusterConfig(prev => ({ ...prev, algorithm: v }))}
                        style={{ width: '100%', marginTop: 8 }}
                      >
                        <Select.Option value="kmeans">K-Means</Select.Option>
                        <Select.Option value="dbscan">DBSCAN</Select.Option>
                        <Select.Option value="hierarchical">层次聚类</Select.Option>
                        <Select.Option value="louvain">Louvain</Select.Option>
                      </Select>
                    </Col>
                    <Col span={8}>
                      <Text>聚类数量:</Text>
                      <Slider
                        min={2}
                        max={20}
                        value={clusterConfig.numClusters}
                        onChange={(v) => setClusterConfig(prev => ({ ...prev, numClusters: v }))}
                        style={{ marginTop: 8 }}
                      />
                    </Col>
                    <Col span={8}>
                      <Button 
                        type="primary" 
                        icon={<ApartmentOutlined />} 
                        onClick={handleCluster}
                        loading={loading}
                        style={{ marginTop: 24 }}
                      >
                        执行聚类
                      </Button>
                    </Col>
                  </Row>
                  
                  {clusters.length > 0 && (
                    <Row gutter={16}>
                      {clusters.map(cluster => (
                        <Col span={8} key={cluster.id}>
                          <Card size="small" style={{ borderLeft: `4px solid ${cluster.color}` }}>
                            <Statistic
                              title={cluster.name}
                              value={cluster.nodeCount}
                              suffix="个节点"
                            />
                            {cluster.keywords && (
                              <div style={{ marginTop: 8 }}>
                                {cluster.keywords.slice(0, 3).map(kw => (
                                  <Tag key={kw} style={{ fontSize: 12 }}>{kw}</Tag>
                                ))}
                              </div>
                            )}
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  )}
                </div>
              )
            }
          ]}
        />
      </Card>

      {/* 筛选抽屉 */}
      <Drawer
        title="子图筛选"
        open={showFilterDrawer}
        onClose={() => setShowFilterDrawer(false)}
        width={400}
        extra={
          <Space>
            <Button onClick={() => setSubgraphFilter({})}>重置</Button>
            <Button type="primary" onClick={handleApplyFilter}>应用</Button>
          </Space>
        }
      >
        <div className={styles.filterForm}>
          <div className={styles.filterItem}>
            <Text>节点类型:</Text>
            <Select
              mode="multiple"
              placeholder="选择节点类型"
              value={subgraphFilter.nodeTypes}
              onChange={(v) => setSubgraphFilter(prev => ({ ...prev, nodeTypes: v }))}
              style={{ width: '100%', marginTop: 8 }}
            >
              {Object.keys(nodeTypeColors).map(type => (
                <Select.Option key={type} value={type}>{formatNodeType(type)}</Select.Option>
              ))}
            </Select>
          </div>
          <div className={styles.filterItem}>
            <Text>关系类型:</Text>
            <Select
              mode="multiple"
              placeholder="选择关系类型"
              value={subgraphFilter.relationTypes}
              onChange={(v) => setSubgraphFilter(prev => ({ ...prev, relationTypes: v }))}
              style={{ width: '100%', marginTop: 8 }}
            >
              <Select.Option value="related_to">相关</Select.Option>
              <Select.Option value="belongs_to">属于</Select.Option>
              <Select.Option value="contains">包含</Select.Option>
              <Select.Option value="describes">描述</Select.Option>
            </Select>
          </div>
          <div className={styles.filterItem}>
            <Text>最小引用次数:</Text>
            <Slider
              min={0}
              max={50}
              value={subgraphFilter.minReferenceCount || 0}
              onChange={(v) => setSubgraphFilter(prev => ({ ...prev, minReferenceCount: v }))}
              style={{ marginTop: 8 }}
            />
          </div>
          <div className={styles.filterItem}>
            <Text>关键词:</Text>
            <Select
              mode="tags"
              placeholder="输入关键词"
              value={subgraphFilter.keywords}
              onChange={(v) => setSubgraphFilter(prev => ({ ...prev, keywords: v }))}
              style={{ width: '100%', marginTop: 8 }}
            />
          </div>
        </div>
        
        <Divider>已保存的视图</Divider>
        <List
          dataSource={savedViews}
          renderItem={(view) => (
            <List.Item
              actions={[
                <Button key="load" type="link" size="small" onClick={() => {
                  // 加载视图
                }}>
                  加载
                </Button>
              ]}
            >
              {view.name}
            </List.Item>
          )}
        />
      </Drawer>

      {/* 路径查询弹窗 */}
      <Modal
        title="路径查询"
        open={showPathModal}
        onCancel={() => setShowPathModal(false)}
        footer={null}
        width={700}
      >
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={10}>
            <Text>起点:</Text>
            <Select
              placeholder="选择起点"
              value={pathSource}
              onChange={setPathSource}
              style={{ width: '100%', marginTop: 8 }}
              showSearch
              optionFilterProp="children"
            >
              {graphData?.nodes.map(node => (
                <Select.Option key={node.id} value={node.id}>{node.name}</Select.Option>
              ))}
            </Select>
          </Col>
          <Col span={4} style={{ textAlign: 'center', paddingTop: 32 }}>
            <BranchesOutlined style={{ fontSize: 24 }} />
          </Col>
          <Col span={10}>
            <Text>终点:</Text>
            <Select
              placeholder="选择终点"
              value={pathTarget}
              onChange={setPathTarget}
              style={{ width: '100%', marginTop: 8 }}
              showSearch
              optionFilterProp="children"
            >
              {graphData?.nodes.map(node => (
                <Select.Option key={node.id} value={node.id}>{node.name}</Select.Option>
              ))}
            </Select>
          </Col>
        </Row>
        <Button type="primary" onClick={handleFindPath} loading={loading} block>
          查找路径
        </Button>
        
        {paths.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <Title level={5}>找到 {paths.length} 条路径</Title>
            {paths.map((path, index) => (
              <Card key={index} size="small" style={{ marginBottom: 8 }}>
                <Space wrap>
                  {path.nodes.map((node, i) => (
                    <React.Fragment key={node.id}>
                      <Tag color={nodeTypeColors[node.nodeType]}>{node.name}</Tag>
                      {i < path.nodes.length - 1 && (
                        <Text type="secondary">→</Text>
                      )}
                    </React.Fragment>
                  ))}
                </Space>
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary">路径长度: {path.length} | 总权重: {path.totalWeight}</Text>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Modal>

      {/* 融合确认弹窗 */}
      <Modal
        title="确认合并实体"
        open={showFusionModal}
        onCancel={() => setShowFusionModal(false)}
        onOk={() => selectedDuplicate && handleMergeEntities(selectedDuplicate)}
      >
        {selectedDuplicate && (
          <div>
            <Paragraph>
              确定要将以下两个实体合并吗？
            </Paragraph>
            <Row gutter={16}>
              <Col span={12}>
                <Card size="small">
                  <Text strong>{selectedDuplicate.entity1.name}</Text>
                  <br />
                  <Text type="secondary">引用: {selectedDuplicate.entity1.referenceCount}</Text>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small">
                  <Text strong>{selectedDuplicate.entity2.name}</Text>
                  <br />
                  <Text type="secondary">引用: {selectedDuplicate.entity2.referenceCount}</Text>
                </Card>
              </Col>
            </Row>
            <div style={{ marginTop: 16 }}>
              <Text>相似度: </Text>
              <Progress percent={Math.round(selectedDuplicate.similarity * 100)} />
            </div>
          </div>
        )}
      </Modal>

      {/* 导航抽屉 */}
      <Drawer
        title="知识导航"
        open={showNavigationDrawer}
        onClose={() => setShowNavigationDrawer(false)}
        width={400}
      >
        <Title level={5}>相关知识推荐</Title>
        <List
          dataSource={navigationSuggestions}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button key="go" type="link" size="small" icon={<EyeOutlined />}>
                  查看
                </Button>
              ]}
            >
              <List.Item.Meta
                avatar={<Tag color={nodeTypeColors[item.node.nodeType]}>{formatNodeType(item.node.nodeType)}</Tag>}
                title={item.node.name}
                description={
                  <Space>
                    <Text type="secondary">{formatRelationType(item.relation)}</Text>
                    <Progress percent={Math.round(item.relevanceScore * 100)} size="small" style={{ width: 60 }} />
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Drawer>

      {/* 推荐抽屉 */}
      <Drawer
        title="关联推荐"
        open={showRecommendationDrawer}
        onClose={() => setShowRecommendationDrawer(false)}
        width={400}
      >
        <Collapse defaultActiveKey={['documents', 'projects', 'persons']}>
          <Panel header={<><FileTextOutlined /> 相关文档</>} key="documents">
            <List
              dataSource={recommendations.filter(r => r.type === 'document')}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={item.name}
                    description={item.description}
                  />
                  <Progress percent={Math.round(item.relevanceScore * 100)} size="small" style={{ width: 60 }} />
                </List.Item>
              )}
            />
          </Panel>
          <Panel header={<><ProjectOutlined /> 相关项目</>} key="projects">
            <List
              dataSource={recommendations.filter(r => r.type === 'project')}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={item.name}
                    description={item.description}
                  />
                  <Progress percent={Math.round(item.relevanceScore * 100)} size="small" style={{ width: 60 }} />
                </List.Item>
              )}
            />
          </Panel>
          <Panel header={<><TeamOutlined /> 相关人员</>} key="persons">
            <List
              dataSource={recommendations.filter(r => r.type === 'person')}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={item.name}
                    description={item.description}
                  />
                  <Progress percent={Math.round(item.relevanceScore * 100)} size="small" style={{ width: 60 }} />
                </List.Item>
              )}
            />
          </Panel>
        </Collapse>
      </Drawer>
    </div>
  );
};

export default KnowledgeGraphEnhanced;