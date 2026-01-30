<template>
  <view class="knowledge-page">
    <!-- 顶部工具栏 -->
    <view class="toolbar">
      <view class="search-box">
        <input
          v-model="searchKeyword"
          placeholder="搜索节点..."
          @confirm="handleSearch"
        />
        <text class="search-icon" @click="handleSearch">🔍</text>
      </view>
      <view class="toolbar-actions">
        <text class="action-btn" @click="showFilterModal = true">筛选</text>
        <text class="action-btn" @click="loadGraph">刷新</text>
      </view>
    </view>

    <!-- 统计信息 -->
    <view v-if="statistics" class="statistics">
      <view class="stat-item">
        <text class="stat-value">{{ statistics.nodeCount }}</text>
        <text class="stat-label">节点</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ statistics.edgeCount }}</text>
        <text class="stat-label">关系</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ statistics.avgDegree.toFixed(1) }}</text>
        <text class="stat-label">平均连接</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ (statistics.density * 100).toFixed(1) }}%</text>
        <text class="stat-label">密度</text>
      </view>
    </view>

    <!-- 视图切换 -->
    <view class="view-tabs">
      <view
        v-for="tab in viewTabs"
        :key="tab.value"
        class="tab-item"
        :class="{ active: currentView === tab.value }"
        @click="currentView = tab.value"
      >
        <text class="tab-icon">{{ tab.icon }}</text>
        <text class="tab-label">{{ tab.label }}</text>
      </view>
    </view>

    <!-- 节点列表视图 -->
    <view v-if="currentView === 'nodes'" class="nodes-view">
      <view class="type-filter">
        <scroll-view scroll-x class="type-scroll">
          <view
            v-for="type in nodeTypes"
            :key="type.value"
            class="type-chip"
            :class="{ active: selectedTypes.includes(type.value) }"
            @click="toggleType(type.value)"
          >
            <text class="type-icon">{{ type.icon }}</text>
            <text class="type-label">{{ type.label }}</text>
          </view>
        </scroll-view>
      </view>

      <view class="node-list">
        <view
          v-for="node in filteredNodes"
          :key="node.id"
          class="node-item"
          @click="selectNode(node)"
        >
          <view class="node-header">
            <text class="node-icon">{{ getNodeIcon(node.type) }}</text>
            <view class="node-info">
              <text class="node-name">{{ node.name }}</text>
              <text v-if="node.description" class="node-desc">{{ node.description }}</text>
            </view>
            <text class="node-arrow">›</text>
          </view>
          <view v-if="node.tags && node.tags.length > 0" class="node-tags">
            <text v-for="tag in node.tags" :key="tag" class="tag">{{ tag }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 关系视图 -->
    <view v-else-if="currentView === 'relations'" class="relations-view">
      <view class="relation-list">
        <view
          v-for="edge in graph?.edges || []"
          :key="edge.id"
          class="relation-item"
        >
          <view class="relation-nodes">
            <view class="source-node">
              <text class="node-icon">{{ getNodeIcon(getNodeType(edge.source)) }}</text>
              <text class="node-name">{{ getNodeName(edge.source) }}</text>
            </view>
            <view class="relation-type">
              <text class="relation-arrow">→</text>
              <text class="relation-label">{{ getRelationLabel(edge.type) }}</text>
            </view>
            <view class="target-node">
              <text class="node-icon">{{ getNodeIcon(getNodeType(edge.target)) }}</text>
              <text class="node-name">{{ getNodeName(edge.target) }}</text>
            </view>
          </view>
          <view v-if="edge.weight" class="relation-weight">
            <text>权重: {{ (edge.weight * 100).toFixed(0) }}%</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 社区视图 -->
    <view v-else-if="currentView === 'communities'" class="communities-view">
      <view class="community-list">
        <view
          v-for="community in communities"
          :key="community.id"
          class="community-item"
        >
          <view class="community-header">
            <text class="community-name">{{ community.name }}</text>
            <text class="community-size">{{ community.size }}个节点</text>
          </view>
          <view class="community-nodes">
            <text
              v-for="nodeId in community.nodeIds.slice(0, 5)"
              :key="nodeId"
              class="node-chip"
            >
              {{ getNodeName(nodeId) }}
            </text>
            <text v-if="community.nodeIds.length > 5" class="more-nodes">
              +{{ community.nodeIds.length - 5 }}
            </text>
          </view>
          <view class="community-stats">
            <text>密度: {{ (community.density * 100).toFixed(1) }}%</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 分析视图 -->
    <view v-else-if="currentView === 'analysis'" class="analysis-view">
      <view class="analysis-section">
        <view class="section-title">中心性分析</view>
        <view class="centrality-list">
          <view
            v-for="item in centralityResults.slice(0, 10)"
            :key="item.nodeId"
            class="centrality-item"
          >
            <text class="node-name">{{ getNodeName(item.nodeId) }}</text>
            <view class="centrality-bars">
              <view class="bar-item">
                <text class="bar-label">度中心性</text>
                <view class="bar-bg">
                  <view
                    class="bar-fill"
                    :style="{ width: (item.degreeCentrality * 100) + '%' }"
                  />
                </view>
              </view>
              <view class="bar-item">
                <text class="bar-label">PageRank</text>
                <view class="bar-bg">
                  <view
                    class="bar-fill"
                    :style="{ width: (item.pageRank * 100) + '%' }"
                  />
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="analysis-section">
        <view class="section-title">知识缺口</view>
        <view class="gap-list">
          <view v-for="gap in knowledgeGaps" :key="gap.id" class="gap-item">
            <view class="gap-header">
              <text class="gap-desc">{{ gap.description }}</text>
              <text class="gap-importance">{{ (gap.importance * 100).toFixed(0) }}%</text>
            </view>
            <view class="gap-suggestions">
              <text
                v-for="(suggestion, index) in gap.suggestions"
                :key="index"
                class="suggestion"
              >
                • {{ suggestion }}
              </text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 节点详情弹窗 -->
    <view v-if="selectedNode" class="node-modal" @click="selectedNode = null">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ selectedNode.name }}</text>
          <text class="modal-close" @click="selectedNode = null">✕</text>
        </view>
        <view class="modal-body">
          <view class="detail-item">
            <text class="detail-label">类型</text>
            <text class="detail-value">{{ getNodeTypeName(selectedNode.type) }}</text>
          </view>
          <view v-if="selectedNode.description" class="detail-item">
            <text class="detail-label">描述</text>
            <text class="detail-value">{{ selectedNode.description }}</text>
          </view>
          <view v-if="selectedNode.importance" class="detail-item">
            <text class="detail-label">重要度</text>
            <text class="detail-value">{{ (selectedNode.importance * 100).toFixed(0) }}%</text>
          </view>
          <view class="detail-item">
            <text class="detail-label">创建时间</text>
            <text class="detail-value">{{ formatTime(selectedNode.createTime) }}</text>
          </view>
        </view>
        <view class="modal-actions">
          <button class="action-btn" @click="viewNeighbors(selectedNode.id)">
            查看关联
          </button>
          <button class="action-btn" @click="getRecommendations(selectedNode.id)">
            智能推荐
          </button>
        </view>
      </view>
    </view>

    <!-- 筛选弹窗 -->
    <view v-if="showFilterModal" class="filter-modal" @click="showFilterModal = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">筛选条件</text>
          <text class="modal-close" @click="showFilterModal = false">✕</text>
        </view>
        <view class="modal-body">
          <view class="filter-section">
            <text class="filter-label">节点类型</text>
            <view class="filter-options">
              <view
                v-for="type in nodeTypes"
                :key="type.value"
                class="filter-option"
                :class="{ active: selectedTypes.includes(type.value) }"
                @click="toggleType(type.value)"
              >
                <text>{{ type.icon }} {{ type.label }}</text>
              </view>
            </view>
          </view>
          <view class="filter-section">
            <text class="filter-label">深度限制: {{ filterDepth }}</text>
            <slider
              :value="filterDepth"
              @change="filterDepth = $event.detail.value"
              :min="1"
              :max="5"
              :step="1"
              show-value
            />
          </view>
        </view>
        <view class="modal-actions">
          <button class="action-btn secondary" @click="resetFilter">重置</button>
          <button class="action-btn primary" @click="applyFilter">应用</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  knowledgeService,
  NodeType,
  type KnowledgeNode,
  type KnowledgeGraph,
  type GraphStatistics,
  type Community,
  type CentralityResult,
  type KnowledgeGap
} from '@/core/knowledge';

// 视图标签
const viewTabs = [
  { value: 'nodes', label: '节点', icon: '🔵' },
  { value: 'relations', label: '关系', icon: '🔗' },
  { value: 'communities', label: '社区', icon: '👥' },
  { value: 'analysis', label: '分析', icon: '📊' }
];

// 当前视图
const currentView = ref('nodes');

// 搜索关键词
const searchKeyword = ref('');

// 图谱数据
const graph = ref<KnowledgeGraph | null>(null);

// 统计信息
const statistics = ref<GraphStatistics | null>(null);

// 社区列表
const communities = ref<Community[]>([]);

// 中心性分析结果
const centralityResults = ref<CentralityResult[]>([]);

// 知识缺口
const knowledgeGaps = ref<KnowledgeGap[]>([]);

// 选中的节点
const selectedNode = ref<KnowledgeNode | null>(null);

// 节点类型
const nodeTypes = knowledgeService.getNodeTypes();

// 选中的类型
const selectedTypes = ref<NodeType[]>([]);

// 筛选深度
const filterDepth = ref(2);

// 显示筛选弹窗
const showFilterModal = ref(false);

// 过滤后的节点
const filteredNodes = computed(() => {
  if (!graph.value) return [];
  
  let nodes = graph.value.nodes;
  
  // 类型筛选
  if (selectedTypes.value.length > 0) {
    nodes = nodes.filter(node => selectedTypes.value.includes(node.type));
  }
  
  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    nodes = nodes.filter(node =>
      node.name.toLowerCase().includes(keyword) ||
      node.description?.toLowerCase().includes(keyword)
    );
  }
  
  return nodes;
});

/**
 * 加载图谱
 */
async function loadGraph() {
  try {
    uni.showLoading({ title: '加载中...' });
    
    const [graphData, stats, comms, centrality, gaps] = await Promise.all([
      knowledgeService.getGraph(),
      knowledgeService.getStatistics(),
      knowledgeService.detectCommunities(),
      knowledgeService.analyzeCentrality(),
      knowledgeService.identifyGaps()
    ]);
    
    graph.value = graphData;
    statistics.value = stats;
    communities.value = comms;
    centralityResults.value = centrality;
    knowledgeGaps.value = gaps;
    
    uni.hideLoading();
  } catch (error: any) {
    uni.hideLoading();
    uni.showToast({ title: error.message || '加载失败', icon: 'none' });
  }
}

/**
 * 搜索处理
 */
async function handleSearch() {
  if (!searchKeyword.value.trim()) {
    await loadGraph();
    return;
  }
  
  try {
    const nodes = await knowledgeService.searchNodes(searchKeyword.value);
    if (graph.value) {
      graph.value.nodes = nodes;
    }
  } catch (error: any) {
    uni.showToast({ title: error.message || '搜索失败', icon: 'none' });
  }
}

/**
 * 切换类型
 */
function toggleType(type: NodeType) {
  const index = selectedTypes.value.indexOf(type);
  if (index > -1) {
    selectedTypes.value.splice(index, 1);
  } else {
    selectedTypes.value.push(type);
  }
}

/**
 * 选择节点
 */
function selectNode(node: KnowledgeNode) {
  selectedNode.value = node;
}

/**
 * 查看邻居节点
 */
async function viewNeighbors(nodeId: string) {
  try {
    uni.showLoading({ title: '加载中...' });
    const neighborGraph = await knowledgeService.getNeighbors(nodeId, 2);
    graph.value = neighborGraph;
    selectedNode.value = null;
    uni.hideLoading();
  } catch (error: any) {
    uni.hideLoading();
    uni.showToast({ title: error.message || '加载失败', icon: 'none' });
  }
}

/**
 * 获取推荐
 */
async function getRecommendations(nodeId: string) {
  try {
    uni.showLoading({ title: '分析中...' });
    const recommendations = await knowledgeService.getRecommendations(nodeId);
    selectedNode.value = null;
    uni.hideLoading();
    
    // TODO: 显示推荐结果
    uni.showToast({ title: `找到${recommendations.length}个推荐`, icon: 'success' });
  } catch (error: any) {
    uni.hideLoading();
    uni.showToast({ title: error.message || '获取推荐失败', icon: 'none' });
  }
}

/**
 * 应用筛选
 */
function applyFilter() {
  showFilterModal.value = false;
  // 筛选逻辑已在computed中实现
}

/**
 * 重置筛选
 */
function resetFilter() {
  selectedTypes.value = [];
  filterDepth.value = 2;
  searchKeyword.value = '';
}

/**
 * 获取节点图标
 */
function getNodeIcon(type: NodeType): string {
  const typeInfo = nodeTypes.find(t => t.value === type);
  return typeInfo?.icon || '⚪';
}

/**
 * 获取节点类型名称
 */
function getNodeTypeName(type: NodeType): string {
  const typeInfo = nodeTypes.find(t => t.value === type);
  return typeInfo?.label || '未知';
}

/**
 * 获取节点名称
 */
function getNodeName(nodeId: string): string {
  const node = graph.value?.nodes.find(n => n.id === nodeId);
  return node?.name || nodeId;
}

/**
 * 获取节点类型
 */
function getNodeType(nodeId: string): NodeType {
  const node = graph.value?.nodes.find(n => n.id === nodeId);
  return node?.type || NodeType.CONCEPT;
}

/**
 * 获取关系标签
 */
function getRelationLabel(type: string): string {
  const relationTypes = knowledgeService.getRelationTypes();
  const relationType = relationTypes.find(r => r.value === type);
  return relationType?.label || type;
}

/**
 * 格式化时间
 */
function formatTime(time?: string): string {
  if (!time) return '-';
  const date = new Date(time);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// 页面加载时获取图谱
onMounted(() => {
  loadGraph();
});
</script>

<style scoped lang="scss">
.knowledge-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.toolbar {
  background: #fff;
  padding: 20rpx;
  
  .search-box {
    display: flex;
    align-items: center;
    background: #f5f5f5;
    border-radius: 50rpx;
    padding: 0 30rpx;
    margin-bottom: 20rpx;
    
    input {
      flex: 1;
      height: 70rpx;
      font-size: 28rpx;
    }
    
    .search-icon {
      font-size: 32rpx;
      margin-left: 20rpx;
    }
  }
  
  .toolbar-actions {
    display: flex;
    gap: 20rpx;
    
    .action-btn {
      flex: 1;
      padding: 15rpx;
      background: #f5f5f5;
      border-radius: 10rpx;
      text-align: center;
      font-size: 26rpx;
      color: #666;
    }
  }
}

.statistics {
  display: flex;
  background: #fff;
  padding: 30rpx 20rpx;
  margin-bottom: 20rpx;
  
  .stat-item {
    flex: 1;
    text-align: center;
    
    .stat-value {
      display: block;
      font-size: 40rpx;
      font-weight: bold;
      color: #3B82F6;
      margin-bottom: 10rpx;
    }
    
    .stat-label {
      display: block;
      font-size: 24rpx;
      color: #999;
    }
  }
}

.view-tabs {
  display: flex;
  background: #fff;
  padding: 20rpx;
  margin-bottom: 20rpx;
  
  .tab-item {
    flex: 1;
    text-align: center;
    padding: 20rpx 0;
    
    &.active {
      .tab-icon,
      .tab-label {
        color: #3B82F6;
      }
    }
    
    .tab-icon {
      display: block;
      font-size: 36rpx;
      margin-bottom: 10rpx;
    }
    
    .tab-label {
      display: block;
      font-size: 24rpx;
      color: #666;
    }
  }
}

.nodes-view,
.relations-view,
.communities-view,
.analysis-view {
  padding: 20rpx;
}

.type-filter {
  margin-bottom: 20rpx;
  
  .type-scroll {
    white-space: nowrap;
    
    .type-chip {
      display: inline-block;
      padding: 15rpx 30rpx;
      margin-right: 20rpx;
      background: #fff;
      border-radius: 50rpx;
      border: 2rpx solid #e0e0e0;
      
      &.active {
        background: #3B82F6;
        border-color: #3B82F6;
        
        .type-icon,
        .type-label {
          color: #fff;
        }
      }
      
      .type-icon {
        font-size: 28rpx;
        margin-right: 10rpx;
      }
      
      .type-label {
        font-size: 26rpx;
        color: #666;
      }
    }
  }
}

.node-list {
  .node-item {
    background: #fff;
    border-radius: 15rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
    
    .node-header {
      display: flex;
      align-items: center;
      
      .node-icon {
        font-size: 40rpx;
        margin-right: 20rpx;
      }
      
      .node-info {
        flex: 1;
        
        .node-name {
          display: block;
          font-size: 30rpx;
          font-weight: bold;
          color: #333;
          margin-bottom: 10rpx;
        }
        
        .node-desc {
          display: block;
          font-size: 24rpx;
          color: #999;
        }
      }
      
      .node-arrow {
        font-size: 40rpx;
        color: #ccc;
      }
    }
    
    .node-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 10rpx;
      margin-top: 20rpx;
      
      .tag {
        padding: 8rpx 20rpx;
        background: #f0f0f0;
        border-radius: 20rpx;
        font-size: 22rpx;
        color: #666;
      }
    }
  }
}

.relation-list {
  .relation-item {
    background: #fff;
    border-radius: 15rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
    
    .relation-nodes {
      .source-node,
      .target-node {
        display: flex;
        align-items: center;
        margin-bottom: 15rpx;
        
        .node-icon {
          font-size: 32rpx;
          margin-right: 15rpx;
        }
        
        .node-name {
          font-size: 26rpx;
          color: #333;
        }
      }
      
      .relation-type {
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 15rpx 0;
        
        .relation-arrow {
          font-size: 32rpx;
          color: #3B82F6;
          margin-right: 15rpx;
        }
        
        .relation-label {
          font-size: 24rpx;
          color: #666;
        }
      }
    }
    
    .relation-weight {
      margin-top: 15rpx;
      padding-top: 15rpx;
      border-top: 1rpx solid #f0f0f0;
      font-size: 22rpx;
      color: #999;
      text-align: center;
    }
  }
}

.community-list {
  .community-item {
    background: #fff;
    border-radius: 15rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
    
    .community-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20rpx;
      
      .community-name {
        font-size: 30rpx;
        font-weight: bold;
        color: #333;
      }
      
      .community-size {
        font-size: 24rpx;
        color: #999;
      }
    }
    
    .community-nodes {
      display: flex;
      flex-wrap: wrap;
      gap: 10rpx;
      margin-bottom: 20rpx;
      
      .node-chip {
        padding: 10rpx 20rpx;
        background: #f0f0f0;
        border-radius: 20rpx;
        font-size: 22rpx;
        color: #666;
      }
      
      .more-nodes {
        padding: 10rpx 20rpx;
        background: #3B82F6;
        border-radius: 20rpx;
        font-size: 22rpx;
        color: #fff;
      }
    }
    
    .community-stats {
      font-size: 22rpx;
      color: #999;
    }
  }
}

.analysis-section {
  background: #fff;
  border-radius: 15rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  
  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
  }
  
  .centrality-list {
    .centrality-item {
      margin-bottom: 30rpx;
      
      .node-name {
        display: block;
        font-size: 26rpx;
        color: #333;
        margin-bottom: 15rpx;
      }
      
      .centrality-bars {
        .bar-item {
          margin-bottom: 15rpx;
          
          .bar-label {
            display: block;
            font-size: 22rpx;
            color: #999;
            margin-bottom: 10rpx;
          }
          
          .bar-bg {
            height: 20rpx;
            background: #f0f0f0;
            border-radius: 10rpx;
            overflow: hidden;
            
            .bar-fill {
              height: 100%;
              background: linear-gradient(90deg, #3B82F6, #10B981);
              border-radius: 10rpx;
            }
          }
        }
      }
    }
  }
  
  .gap-list {
    .gap-item {
      padding: 20rpx;
      background: #f9f9f9;
      border-radius: 10rpx;
      margin-bottom: 20rpx;
      
      .gap-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15rpx;
        
        .gap-desc {
          flex: 1;
          font-size: 26rpx;
          color: #333;
        }
        
        .gap-importance {
          font-size: 24rpx;
          color: #EF4444;
          font-weight: bold;
        }
      }
      
      .gap-suggestions {
        .suggestion {
          display: block;
          font-size: 24rpx;
          color: #666;
          line-height: 1.6;
          margin-bottom: 10rpx;
        }
      }
    }
  }
}

.node-modal,
.filter-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  
  .modal-content {
    width: 90%;
    max-height: 80vh;
    background: #fff;
    border-radius: 20rpx;
    overflow: hidden;
    
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 30rpx;
      border-bottom: 1rpx solid #f0f0f0;
      
      .modal-title {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
      }
      
      .modal-close {
        font-size: 40rpx;
        color: #999;
      }
    }
    
    .modal-body {
      padding: 30rpx;
      max-height: 60vh;
      overflow-y: auto;
      
      .detail-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 20rpx;
        
        .detail-label {
          font-size: 26rpx;
          color: #999;
        }
        
        .detail-value {
          font-size: 26rpx;
          color: #333;
        }
      }
    }
    
    .modal-actions {
      display: flex;
      gap: 20rpx;
      padding: 30rpx;
      border-top: 1rpx solid #f0f0f0;
      
      .action-btn {
        flex: 1;
        padding: 20rpx;
        background: #3B82F6;
        color: #fff;
        border-radius: 10rpx;
        text-align: center;
        font-size: 28rpx;
        border: none;
        
        &.secondary {
          background: #f0f0f0;
          color: #666;
        }
        
        &.primary {
          background: #3B82F6;
          color: #fff;
        }
      }
    }
  }
}

.filter-section {
  margin-bottom: 30rpx;
  
  .filter-label {
    display: block;
    font-size: 28rpx;
    color: #333;
    margin-bottom: 20rpx;
  }
  
  .filter-options {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
    
    .filter-option {
      padding: 15rpx 30rpx;
      background: #f0f0f0;
      border-radius: 10rpx;
      font-size: 26rpx;
      color: #666;
      
      &.active {
        background: #3B82F6;
        color: #fff;
      }
    }
  }
}
</style>