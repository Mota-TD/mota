'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Card,
  Button,
  Space,
  Select,
  Slider,
  Tooltip,
  Drawer,
  Descriptions,
  Tag,
  Input,
  Spin,
  Empty,
  Segmented,
} from 'antd';
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  ReloadOutlined,
  NodeIndexOutlined,
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  SettingOutlined,
} from '@ant-design/icons';

// 知识图谱节点类型
export interface KnowledgeNode {
  id: string;
  label: string;
  type: 'document' | 'concept' | 'person' | 'organization' | 'location' | 'event' | 'tag';
  properties: Record<string, unknown>;
  x?: number;
  y?: number;
  size?: number;
  color?: string;
}

// 知识图谱边类型
export interface KnowledgeEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  type: string;
  weight?: number;
  properties?: Record<string, unknown>;
}

// 知识图谱数据
export interface KnowledgeGraphData {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
}

interface KnowledgeGraphProps {
  data?: KnowledgeGraphData;
  loading?: boolean;
  onNodeClick?: (node: KnowledgeNode) => void;
  onEdgeClick?: (edge: KnowledgeEdge) => void;
  onNodeDoubleClick?: (node: KnowledgeNode) => void;
  height?: number | string;
}

// 节点类型配置
const nodeTypeConfig: Record<string, { color: string; icon: string }> = {
  document: { color: '#1890ff', icon: '📄' },
  concept: { color: '#52c41a', icon: '💡' },
  person: { color: '#722ed1', icon: '👤' },
  organization: { color: '#fa8c16', icon: '🏢' },
  location: { color: '#eb2f96', icon: '📍' },
  event: { color: '#13c2c2', icon: '📅' },
  tag: { color: '#faad14', icon: '🏷️' },
};

// 模拟力导向图布局
function forceLayout(
  nodes: KnowledgeNode[],
  edges: KnowledgeEdge[],
  width: number,
  height: number,
  iterations: number = 100
): KnowledgeNode[] {
  const nodeMap = new Map<string, KnowledgeNode>();
  
  // 初始化节点位置
  nodes.forEach((node, index) => {
    const angle = (2 * Math.PI * index) / nodes.length;
    const radius = Math.min(width, height) * 0.3;
    nodeMap.set(node.id, {
      ...node,
      x: width / 2 + radius * Math.cos(angle) + (Math.random() - 0.5) * 50,
      y: height / 2 + radius * Math.sin(angle) + (Math.random() - 0.5) * 50,
      size: node.size || 30,
    });
  });

  // 力导向迭代
  for (let i = 0; i < iterations; i++) {
    const alpha = 1 - i / iterations;
    
    // 斥力
    nodes.forEach((node1) => {
      nodes.forEach((node2) => {
        if (node1.id !== node2.id) {
          const n1 = nodeMap.get(node1.id)!;
          const n2 = nodeMap.get(node2.id)!;
          const dx = n2.x! - n1.x!;
          const dy = n2.y! - n1.y!;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = (100 * alpha) / distance;
          n1.x! -= (dx / distance) * force;
          n1.y! -= (dy / distance) * force;
        }
      });
    });

    // 引力（边）
    edges.forEach((edge) => {
      const source = nodeMap.get(edge.source);
      const target = nodeMap.get(edge.target);
      if (source && target) {
        const dx = target.x! - source.x!;
        const dy = target.y! - source.y!;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = distance * 0.01 * alpha;
        source.x! += (dx / distance) * force;
        source.y! -= (dy / distance) * force;
        target.x! -= (dx / distance) * force;
        target.y! += (dy / distance) * force;
      }
    });

    // 中心引力
    nodes.forEach((node) => {
      const n = nodeMap.get(node.id)!;
      n.x! += (width / 2 - n.x!) * 0.01 * alpha;
      n.y! += (height / 2 - n.y!) * 0.01 * alpha;
    });
  }

  return Array.from(nodeMap.values());
}

export default function KnowledgeGraph({
  data,
  loading = false,
  onNodeClick,
  onEdgeClick,
  onNodeDoubleClick,
  height = 600,
}: KnowledgeGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<KnowledgeNode | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [layoutedNodes, setLayoutedNodes] = useState<KnowledgeNode[]>([]);
  const [showLabels, setShowLabels] = useState(true);
  const [nodeSize, setNodeSize] = useState(30);

  // 布局计算
  useEffect(() => {
    if (data && canvasRef.current) {
      const canvas = canvasRef.current;
      const layouted = forceLayout(
        data.nodes,
        data.edges,
        canvas.width,
        canvas.height
      );
      setLayoutedNodes(layouted);
    }
  }, [data]);

  // 绘制图谱
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 应用变换
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(zoom, zoom);

    // 过滤节点
    const filteredNodes = layoutedNodes.filter((node) => {
      if (filterType !== 'all' && node.type !== filterType) return false;
      if (searchText && !node.label.toLowerCase().includes(searchText.toLowerCase())) {
        return false;
      }
      return true;
    });

    const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));

    // 绘制边
    data.edges.forEach((edge) => {
      if (!filteredNodeIds.has(edge.source) || !filteredNodeIds.has(edge.target)) {
        return;
      }

      const source = layoutedNodes.find((n) => n.id === edge.source);
      const target = layoutedNodes.find((n) => n.id === edge.target);

      if (source && target && source.x && source.y && target.x && target.y) {
        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.strokeStyle = '#d9d9d9';
        ctx.lineWidth = (edge.weight || 1) / zoom;
        ctx.stroke();

        // 绘制边标签
        if (showLabels && edge.label) {
          const midX = (source.x + target.x) / 2;
          const midY = (source.y + target.y) / 2;
          ctx.fillStyle = '#8c8c8c';
          ctx.font = `${10 / zoom}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText(edge.label, midX, midY);
        }

        // 绘制箭头
        const angle = Math.atan2(target.y - source.y, target.x - source.x);
        const arrowSize = 8 / zoom;
        const targetRadius = (nodeSize / 2) / zoom;
        const arrowX = target.x - targetRadius * Math.cos(angle);
        const arrowY = target.y - targetRadius * Math.sin(angle);

        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(
          arrowX - arrowSize * Math.cos(angle - Math.PI / 6),
          arrowY - arrowSize * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          arrowX - arrowSize * Math.cos(angle + Math.PI / 6),
          arrowY - arrowSize * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fillStyle = '#d9d9d9';
        ctx.fill();
      }
    });

    // 绘制节点
    filteredNodes.forEach((node) => {
      if (!node.x || !node.y) return;

      const config = nodeTypeConfig[node.type] || nodeTypeConfig.concept;
      const size = nodeSize / zoom;
      const isSelected = selectedNode?.id === node.id;
      const isHovered = hoveredNode?.id === node.id;

      // 节点圆形
      ctx.beginPath();
      ctx.arc(node.x, node.y, size / 2, 0, 2 * Math.PI);
      ctx.fillStyle = isSelected ? '#1890ff' : isHovered ? config.color + 'cc' : config.color;
      ctx.fill();

      // 选中/悬停边框
      if (isSelected || isHovered) {
        ctx.strokeStyle = isSelected ? '#096dd9' : config.color;
        ctx.lineWidth = 3 / zoom;
        ctx.stroke();
      }

      // 节点图标
      ctx.fillStyle = '#fff';
      ctx.font = `${size * 0.5}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(config.icon, node.x, node.y);

      // 节点标签
      if (showLabels) {
        ctx.fillStyle = '#262626';
        ctx.font = `${12 / zoom}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(node.label, node.x, node.y + size / 2 + 12 / zoom);
      }
    });

    ctx.restore();
  }, [data, layoutedNodes, zoom, offset, selectedNode, hoveredNode, filterType, searchText, showLabels, nodeSize]);

  // 重绘
  useEffect(() => {
    draw();
  }, [draw]);

  // 处理鼠标事件
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - offset.x) / zoom;
    const y = (e.clientY - rect.top - offset.y) / zoom;

    // 检查是否点击了节点
    const clickedNode = layoutedNodes.find((node) => {
      if (!node.x || !node.y) return false;
      const dx = x - node.x;
      const dy = y - node.y;
      return Math.sqrt(dx * dx + dy * dy) < nodeSize / 2;
    });

    if (clickedNode) {
      setSelectedNode(clickedNode);
      onNodeClick?.(clickedNode);
    } else {
      setSelectedNode(null);
      setIsDragging(true);
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    } else {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left - offset.x) / zoom;
      const y = (e.clientY - rect.top - offset.y) / zoom;

      const hovered = layoutedNodes.find((node) => {
        if (!node.x || !node.y) return false;
        const dx = x - node.x;
        const dy = y - node.y;
        return Math.sqrt(dx * dx + dy * dy) < nodeSize / 2;
      });

      setHoveredNode(hovered || null);
      canvas.style.cursor = hovered ? 'pointer' : 'grab';
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - offset.x) / zoom;
    const y = (e.clientY - rect.top - offset.y) / zoom;

    const clickedNode = layoutedNodes.find((node) => {
      if (!node.x || !node.y) return false;
      const dx = x - node.x;
      const dy = y - node.y;
      return Math.sqrt(dx * dx + dy * dy) < nodeSize / 2;
    });

    if (clickedNode) {
      onNodeDoubleClick?.(clickedNode);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((prev) => Math.min(Math.max(prev * delta, 0.1), 5));
  };

  // 工具栏操作
  const handleZoomIn = () => setZoom((prev) => Math.min(prev * 1.2, 5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev / 1.2, 0.1));
  const handleReset = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };
  const handleFullscreen = () => {
    if (containerRef.current) {
      if (!isFullscreen) {
        containerRef.current.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  // 导出图片
  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'knowledge-graph.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // 重新布局
  const handleRelayout = () => {
    if (data && canvasRef.current) {
      const canvas = canvasRef.current;
      const layouted = forceLayout(
        data.nodes,
        data.edges,
        canvas.width,
        canvas.height,
        200
      );
      setLayoutedNodes(layouted);
    }
  };

  if (loading) {
    return (
      <Card>
        <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spin size="large" tip="加载知识图谱..." />
        </div>
      </Card>
    );
  }

  if (!data || data.nodes.length === 0) {
    return (
      <Card>
        <Empty description="暂无知识图谱数据" />
      </Card>
    );
  }

  return (
    <div ref={containerRef} className="knowledge-graph-container">
      <Card
        title={
          <Space>
            <NodeIndexOutlined />
            <span>知识图谱</span>
            <Tag color="blue">{data.nodes.length} 节点</Tag>
            <Tag color="green">{data.edges.length} 关系</Tag>
          </Space>
        }
        extra={
          <Space>
            <Input
              placeholder="搜索节点..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
            <Select
              value={filterType}
              onChange={setFilterType}
              style={{ width: 120 }}
              options={[
                { value: 'all', label: '全部类型' },
                { value: 'document', label: '📄 文档' },
                { value: 'concept', label: '💡 概念' },
                { value: 'person', label: '👤 人物' },
                { value: 'organization', label: '🏢 组织' },
                { value: 'location', label: '📍 地点' },
                { value: 'event', label: '📅 事件' },
                { value: 'tag', label: '🏷️ 标签' },
              ]}
            />
            <Tooltip title="设置">
              <Button icon={<SettingOutlined />} onClick={() => setShowSettings(true)} />
            </Tooltip>
          </Space>
        }
        bodyStyle={{ padding: 0, position: 'relative' }}
      >
        {/* 工具栏 */}
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            zIndex: 10,
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: 8,
            padding: 8,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          }}
        >
          <Space direction="vertical" size={4}>
            <Tooltip title="放大" placement="right">
              <Button icon={<ZoomInOutlined />} onClick={handleZoomIn} size="small" />
            </Tooltip>
            <Tooltip title="缩小" placement="right">
              <Button icon={<ZoomOutOutlined />} onClick={handleZoomOut} size="small" />
            </Tooltip>
            <Tooltip title="重置" placement="right">
              <Button icon={<ReloadOutlined />} onClick={handleReset} size="small" />
            </Tooltip>
            <Tooltip title={isFullscreen ? '退出全屏' : '全屏'} placement="right">
              <Button
                icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                onClick={handleFullscreen}
                size="small"
              />
            </Tooltip>
            <Tooltip title="重新布局" placement="right">
              <Button icon={<NodeIndexOutlined />} onClick={handleRelayout} size="small" />
            </Tooltip>
            <Tooltip title="导出图片" placement="right">
              <Button icon={<DownloadOutlined />} onClick={handleExport} size="small" />
            </Tooltip>
          </Space>
        </div>

        {/* 缩放比例 */}
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            zIndex: 10,
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: 4,
            padding: '4px 8px',
            fontSize: 12,
          }}
        >
          {Math.round(zoom * 100)}%
        </div>

        {/* 图例 */}
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            zIndex: 10,
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: 8,
            padding: 12,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 8 }}>图例</div>
          <Space wrap size={[8, 4]}>
            {Object.entries(nodeTypeConfig).map(([type, config]) => (
              <Tag key={type} color={config.color}>
                {config.icon} {type}
              </Tag>
            ))}
          </Space>
        </div>

        {/* 画布 */}
        <canvas
          ref={canvasRef}
          width={typeof height === 'number' ? 1200 : 1200}
          height={typeof height === 'number' ? height : 600}
          style={{
            width: '100%',
            height: typeof height === 'number' ? height : 600,
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDoubleClick={handleDoubleClick}
          onWheel={handleWheel}
        />
      </Card>

      {/* 节点详情抽屉 */}
      <Drawer
        title={
          <Space>
            {selectedNode && nodeTypeConfig[selectedNode.type]?.icon}
            {selectedNode?.label}
          </Space>
        }
        open={!!selectedNode}
        onClose={() => setSelectedNode(null)}
        width={400}
      >
        {selectedNode && (
          <div>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="ID">{selectedNode.id}</Descriptions.Item>
              <Descriptions.Item label="类型">
                <Tag color={nodeTypeConfig[selectedNode.type]?.color}>
                  {nodeTypeConfig[selectedNode.type]?.icon} {selectedNode.type}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="名称">{selectedNode.label}</Descriptions.Item>
            </Descriptions>

            {Object.keys(selectedNode.properties).length > 0 && (
              <>
                <div style={{ marginTop: 16, marginBottom: 8, fontWeight: 500 }}>属性</div>
                <Descriptions column={1} bordered size="small">
                  {Object.entries(selectedNode.properties).map(([key, value]) => (
                    <Descriptions.Item key={key} label={key}>
                      {String(value)}
                    </Descriptions.Item>
                  ))}
                </Descriptions>
              </>
            )}

            {/* 相关关系 */}
            <div style={{ marginTop: 16, marginBottom: 8, fontWeight: 500 }}>相关关系</div>
            <Space direction="vertical" style={{ width: '100%' }}>
              {data.edges
                .filter((e) => e.source === selectedNode.id || e.target === selectedNode.id)
                .map((edge) => {
                  const isSource = edge.source === selectedNode.id;
                  const relatedNodeId = isSource ? edge.target : edge.source;
                  const relatedNode = data.nodes.find((n) => n.id === relatedNodeId);
                  return (
                    <div
                      key={edge.id}
                      style={{
                        padding: 8,
                        background: '#f5f5f5',
                        borderRadius: 4,
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        if (relatedNode) {
                          setSelectedNode(relatedNode);
                        }
                      }}
                    >
                      <Space>
                        {isSource ? '→' : '←'}
                        <Tag>{edge.label}</Tag>
                        {nodeTypeConfig[relatedNode?.type || 'concept']?.icon}
                        {relatedNode?.label}
                      </Space>
                    </div>
                  );
                })}
            </Space>
          </div>
        )}
      </Drawer>

      {/* 设置抽屉 */}
      <Drawer
        title="图谱设置"
        open={showSettings}
        onClose={() => setShowSettings(false)}
        width={300}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <div style={{ marginBottom: 8 }}>显示标签</div>
            <Segmented
              value={showLabels ? 'show' : 'hide'}
              onChange={(v) => setShowLabels(v === 'show')}
              options={[
                { value: 'show', label: '显示' },
                { value: 'hide', label: '隐藏' },
              ]}
              block
            />
          </div>

          <div>
            <div style={{ marginBottom: 8 }}>节点大小: {nodeSize}px</div>
            <Slider
              min={20}
              max={60}
              value={nodeSize}
              onChange={setNodeSize}
            />
          </div>

          <div>
            <div style={{ marginBottom: 8 }}>缩放比例: {Math.round(zoom * 100)}%</div>
            <Slider
              min={10}
              max={500}
              value={zoom * 100}
              onChange={(v) => setZoom(v / 100)}
            />
          </div>
        </Space>
      </Drawer>
    </div>
  );
}