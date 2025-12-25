import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Card, Input, Button, Spin, Empty, Tooltip, Tag, Space, message } from 'antd';
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  FullscreenOutlined,
  ReloadOutlined,
  NodeIndexOutlined,
  SearchOutlined
} from '@ant-design/icons';
import * as d3 from 'd3';
import styles from './index.module.css';
import {
  getGraphVisualizationData,
  getProjectKnowledgeGraph,
  getGlobalGraphOverview,
  searchNodes,
  GraphVisualizationData,
  KnowledgeNode
} from '../../services/api/knowledgeGraph';

const { Search } = Input;
// const { Option } = Select; // Unused

interface KnowledgeGraphProps {
  projectId?: number;
  centerNodeId?: number;
  depth?: number;
  width?: number;
  height?: number;
  onNodeClick?: (node: GraphNode) => void;
}

interface GraphNode extends d3.SimulationNodeDatum {
  id: number;
  name: string;
  type: string;
  description?: string;
  referenceCount: number;
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

const nodeTypeColors: Record<string, string> = {
  concept: '#1890ff',
  entity: '#52c41a',
  document: '#722ed1',
  task: '#fa8c16',
  project: '#eb2f96',
  merged: '#13c2c2'
};

const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({
  projectId,
  centerNodeId,
  depth = 2,
  width = 800,
  height = 600,
  onNodeClick
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [graphData, setGraphData] = useState<GraphVisualizationData | null>(null);
  const [_searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<KnowledgeNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  // 加载图谱数据
  const loadGraphData = useCallback(async () => {
    setLoading(true);
    try {
      let data: GraphVisualizationData;
      if (centerNodeId) {
        data = await getGraphVisualizationData(centerNodeId, depth);
      } else if (projectId) {
        data = await getProjectKnowledgeGraph(projectId);
      } else {
        data = await getGlobalGraphOverview();
      }
      setGraphData(data);
    } catch (error) {
      message.error('加载知识图谱失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [centerNodeId, projectId, depth]);

  useEffect(() => {
    loadGraphData();
  }, [loadGraphData]);

  // 渲染D3图谱
  useEffect(() => {
    if (!graphData || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { nodes, edges } = graphData;
    if (nodes.length === 0) return;

    // 转换节点和边数据为模拟所需的类型
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

    // 创建缩放行为
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

    // 绘制边标签
    const linkLabel = g.append('g')
      .attr('class', 'link-labels')
      .selectAll('text')
      .data(simLinks)
      .enter()
      .append('text')
      .attr('font-size', 10)
      .attr('fill', '#666')
      .text((d) => d.type);

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
      .attr('fill', (d) => nodeTypeColors[d.type] || '#999')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // 节点标签
    node.append('text')
      .attr('dy', 25)
      .attr('text-anchor', 'middle')
      .attr('font-size', 12)
      .attr('fill', '#333')
      .text((d) => d.name.length > 10 ? d.name.substring(0, 10) + '...' : d.name);

    // 节点点击事件
    node.on('click', (_event, d) => {
      setSelectedNode(d);
      onNodeClick?.(d);
    });

    // 节点悬停效果
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
        .attr('x1', (d) => {
          const source = d.source as GraphNode;
          return source.x || 0;
        })
        .attr('y1', (d) => {
          const source = d.source as GraphNode;
          return source.y || 0;
        })
        .attr('x2', (d) => {
          const target = d.target as GraphNode;
          return target.x || 0;
        })
        .attr('y2', (d) => {
          const target = d.target as GraphNode;
          return target.y || 0;
        });

      linkLabel
        .attr('x', (d) => {
          const source = d.source as GraphNode;
          const target = d.target as GraphNode;
          return ((source.x || 0) + (target.x || 0)) / 2;
        })
        .attr('y', (d) => {
          const source = d.source as GraphNode;
          const target = d.target as GraphNode;
          return ((source.y || 0) + (target.y || 0)) / 2;
        });

      node.attr('transform', (d) => `translate(${d.x || 0},${d.y || 0})`);
    });

    return () => {
      simulation.stop();
    };
  }, [graphData, width, height, onNodeClick]);

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
    svg.transition().duration(500).call(
      zoom.transform,
      d3.zoomIdentity
    );
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

  return (
    <div className={styles.container} ref={containerRef}>
      <Card
        title={
          <Space>
            <NodeIndexOutlined />
            <span>知识图谱</span>
          </Space>
        }
        extra={
          <Space>
            <Search
              placeholder="搜索节点"
              allowClear
              onSearch={handleSearch}
              onChange={(e) => setSearchKeyword(e.target.value)}
              style={{ width: 200 }}
              prefix={<SearchOutlined />}
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
        }
        className={styles.card}
      >
        {/* 图例 */}
        <div className={styles.legend}>
          {Object.entries(nodeTypeColors).map(([type, color]) => (
            <Tag key={type} color={color}>
              {type}
            </Tag>
          ))}
        </div>

        {/* 搜索结果 */}
        {searchResults.length > 0 && (
          <div className={styles.searchResults}>
            <div className={styles.searchResultsTitle}>搜索结果</div>
            {searchResults.slice(0, 5).map((node) => (
              <div
                key={node.id}
                className={styles.searchResultItem}
                onClick={() => {
                  // 跳转到该节点
                  setSearchResults([]);
                  setSearchKeyword('');
                }}
              >
                <Tag color={nodeTypeColors[node.nodeType]}>{node.nodeType}</Tag>
                <span>{node.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* 图谱画布 */}
        <div className={styles.graphContainer}>
          {loading ? (
            <div className={styles.loading}>
              <Spin size="large" tip="加载中..." />
            </div>
          ) : graphData && graphData.nodes.length > 0 ? (
            <svg
              ref={svgRef}
              width={width}
              height={height}
              className={styles.svg}
            />
          ) : (
            <Empty description="暂无知识图谱数据" />
          )}
        </div>

        {/* 缩放级别 */}
        <div className={styles.zoomLevel}>
          缩放: {Math.round(zoomLevel * 100)}%
        </div>

        {/* 选中节点信息 */}
        {selectedNode && (
          <div className={styles.nodeInfo}>
            <div className={styles.nodeInfoTitle}>
              <Tag color={nodeTypeColors[selectedNode.type]}>{selectedNode.type}</Tag>
              {selectedNode.name}
            </div>
            {selectedNode.description && (
              <div className={styles.nodeInfoDesc}>{selectedNode.description}</div>
            )}
            <div className={styles.nodeInfoMeta}>
              引用次数: {selectedNode.referenceCount}
            </div>
          </div>
        )}

        {/* 统计信息 */}
        {graphData && (
          <div className={styles.stats}>
            <span>节点: {graphData.nodes.length}</span>
            <span>关系: {graphData.edges.length}</span>
          </div>
        )}
      </Card>
    </div>
  );
};

export default KnowledgeGraph;