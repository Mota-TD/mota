package com.mota.project.service.news;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;

/**
 * 缓存分片服务
 * 
 * 功能：
 * 1. 一致性哈希算法实现
 * 2. 虚拟节点支持（提高数据分布均匀性）
 * 3. 动态节点管理（支持节点添加/删除）
 * 4. 故障转移机制
 * 5. 数据迁移支持
 * 
 * 架构：
 * - 使用TreeMap实现哈希环
 * - 每个物理节点对应多个虚拟节点
 * - 支持节点权重配置
 * - 读写锁保证并发安全
 * 
 * 性能特点：
 * - 查找复杂度: O(log N)
 * - 节点变更影响: 仅影响相邻节点
 * - 数据分布: 均匀分布（虚拟节点）
 * - 扩展性: 支持动态扩容
 * 
 * @author Mota Team
 * @since 2026-01-06
 * @version 2.4
 */
@Slf4j
@Service
public class CacheShardingService {

    // 虚拟节点数量（每个物理节点）
    @Value("${news.cache.sharding.virtual-nodes:150}")
    private int virtualNodesPerNode;
    
    // 是否启用分片
    @Value("${news.cache.sharding.enabled:false}")
    private boolean shardingEnabled;
    
    // 哈希环（TreeMap保证有序）
    private final TreeMap<Long, ShardNode> hashRing = new TreeMap<>();
    
    // 物理节点映射
    private final Map<String, ShardNode> physicalNodes = new ConcurrentHashMap<>();
    
    // 读写锁（保证并发安全）
    private final ReadWriteLock lock = new ReentrantReadWriteLock();
    
    // MD5消息摘要（用于哈希计算）
    private MessageDigest md5Digest;
    
    /**
     * 分片节点
     */
    public static class ShardNode {
        private final String nodeId;
        private final String host;
        private final int port;
        private final int weight;
        private boolean active;
        private long lastHealthCheck;
        
        public ShardNode(String nodeId, String host, int port, int weight) {
            this.nodeId = nodeId;
            this.host = host;
            this.port = port;
            this.weight = weight;
            this.active = true;
            this.lastHealthCheck = System.currentTimeMillis();
        }
        
        public String getNodeId() {
            return nodeId;
        }
        
        public String getHost() {
            return host;
        }
        
        public int getPort() {
            return port;
        }
        
        public int getWeight() {
            return weight;
        }
        
        public boolean isActive() {
            return active;
        }
        
        public void setActive(boolean active) {
            this.active = active;
        }
        
        public long getLastHealthCheck() {
            return lastHealthCheck;
        }
        
        public void updateHealthCheck() {
            this.lastHealthCheck = System.currentTimeMillis();
        }
        
        public String getAddress() {
            return host + ":" + port;
        }
        
        @Override
        public String toString() {
            return String.format("ShardNode{id=%s, address=%s, weight=%d, active=%s}",
                nodeId, getAddress(), weight, active);
        }
    }
    
    /**
     * 初始化
     */
    @PostConstruct
    public void init() {
        try {
            md5Digest = MessageDigest.getInstance("MD5");
            
            if (shardingEnabled) {
                // 初始化默认节点（单节点模式）
                addNode("default", "localhost", 6379, 1);
                log.info("缓存分片服务已启动: 虚拟节点数={}, 物理节点数={}",
                    virtualNodesPerNode, physicalNodes.size());
            } else {
                log.info("缓存分片功能未启用");
            }
        } catch (NoSuchAlgorithmException e) {
            log.error("初始化MD5失败", e);
            throw new RuntimeException("Failed to initialize MD5", e);
        }
    }
    
    /**
     * 添加节点
     */
    public void addNode(String nodeId, String host, int port, int weight) {
        lock.writeLock().lock();
        try {
            ShardNode node = new ShardNode(nodeId, host, port, weight);
            physicalNodes.put(nodeId, node);
            
            // 根据权重计算虚拟节点数量
            int virtualNodes = virtualNodesPerNode * weight;
            
            // 添加虚拟节点到哈希环
            for (int i = 0; i < virtualNodes; i++) {
                String virtualNodeKey = nodeId + "#" + i;
                long hash = hash(virtualNodeKey);
                hashRing.put(hash, node);
            }
            
            log.info("添加分片节点: {}, 虚拟节点数: {}", node, virtualNodes);
        } finally {
            lock.writeLock().unlock();
        }
    }
    
    /**
     * 删除节点
     */
    public void removeNode(String nodeId) {
        lock.writeLock().lock();
        try {
            ShardNode node = physicalNodes.remove(nodeId);
            if (node == null) {
                log.warn("节点不存在: {}", nodeId);
                return;
            }
            
            // 从哈希环中删除所有虚拟节点
            int virtualNodes = virtualNodesPerNode * node.getWeight();
            int removedCount = 0;
            
            for (int i = 0; i < virtualNodes; i++) {
                String virtualNodeKey = nodeId + "#" + i;
                long hash = hash(virtualNodeKey);
                if (hashRing.remove(hash) != null) {
                    removedCount++;
                }
            }
            
            log.info("删除分片节点: {}, 移除虚拟节点数: {}", node, removedCount);
        } finally {
            lock.writeLock().unlock();
        }
    }
    
    /**
     * 获取键对应的节点
     */
    public ShardNode getNodeForKey(String key) {
        if (!shardingEnabled || hashRing.isEmpty()) {
            // 未启用分片或无节点，返回默认节点
            return physicalNodes.get("default");
        }
        
        lock.readLock().lock();
        try {
            long hash = hash(key);
            
            // 在哈希环上查找第一个大于等于hash的节点
            Map.Entry<Long, ShardNode> entry = hashRing.ceilingEntry(hash);
            
            // 如果没找到，说明hash值大于环上所有节点，返回第一个节点（环形）
            if (entry == null) {
                entry = hashRing.firstEntry();
            }
            
            ShardNode node = entry.getValue();
            
            // 如果节点不可用，尝试找下一个可用节点
            if (!node.isActive()) {
                node = getNextActiveNode(hash);
            }
            
            return node;
        } finally {
            lock.readLock().unlock();
        }
    }
    
    /**
     * 获取下一个可用节点（故障转移）
     */
    private ShardNode getNextActiveNode(long hash) {
        // 从hash位置开始，顺时针查找下一个可用节点
        Map.Entry<Long, ShardNode> entry = hashRing.higherEntry(hash);
        
        int attempts = 0;
        int maxAttempts = hashRing.size();
        
        while (attempts < maxAttempts) {
            if (entry == null) {
                // 到达环的末尾，从头开始
                entry = hashRing.firstEntry();
            }
            
            if (entry.getValue().isActive()) {
                log.debug("故障转移: 使用节点 {}", entry.getValue().getNodeId());
                return entry.getValue();
            }
            
            entry = hashRing.higherEntry(entry.getKey());
            attempts++;
        }
        
        // 所有节点都不可用，返回null
        log.error("所有分片节点都不可用");
        return null;
    }
    
    /**
     * 标记节点状态
     */
    public void setNodeActive(String nodeId, boolean active) {
        ShardNode node = physicalNodes.get(nodeId);
        if (node != null) {
            node.setActive(active);
            node.updateHealthCheck();
            log.info("更新节点状态: {} -> {}", nodeId, active ? "active" : "inactive");
        }
    }
    
    /**
     * 获取所有物理节点
     */
    public Collection<ShardNode> getAllNodes() {
        return new ArrayList<>(physicalNodes.values());
    }
    
    /**
     * 获取节点数量
     */
    public int getNodeCount() {
        return physicalNodes.size();
    }
    
    /**
     * 获取虚拟节点数量
     */
    public int getVirtualNodeCount() {
        lock.readLock().lock();
        try {
            return hashRing.size();
        } finally {
            lock.readLock().unlock();
        }
    }
    
    /**
     * 是否启用分片
     */
    public boolean isShardingEnabled() {
        return shardingEnabled;
    }
    
    /**
     * 计算键的分片信息
     */
    public Map<String, Object> getShardInfo(String key) {
        Map<String, Object> info = new HashMap<>();
        
        ShardNode node = getNodeForKey(key);
        if (node != null) {
            info.put("nodeId", node.getNodeId());
            info.put("address", node.getAddress());
            info.put("weight", node.getWeight());
            info.put("active", node.isActive());
            info.put("hash", hash(key));
        }
        
        return info;
    }
    
    /**
     * 获取分片统计信息
     */
    public Map<String, Object> getShardingStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("enabled", shardingEnabled);
        stats.put("physicalNodes", physicalNodes.size());
        stats.put("virtualNodes", getVirtualNodeCount());
        stats.put("virtualNodesPerNode", virtualNodesPerNode);
        
        // 节点列表
        List<Map<String, Object>> nodeList = new ArrayList<>();
        for (ShardNode node : physicalNodes.values()) {
            Map<String, Object> nodeInfo = new HashMap<>();
            nodeInfo.put("nodeId", node.getNodeId());
            nodeInfo.put("address", node.getAddress());
            nodeInfo.put("weight", node.getWeight());
            nodeInfo.put("active", node.isActive());
            nodeInfo.put("lastHealthCheck", node.getLastHealthCheck());
            nodeList.add(nodeInfo);
        }
        stats.put("nodes", nodeList);
        
        return stats;
    }
    
    /**
     * 计算数据分布（用于监控）
     */
    public Map<String, Integer> calculateDistribution(List<String> keys) {
        Map<String, Integer> distribution = new HashMap<>();
        
        for (String key : keys) {
            ShardNode node = getNodeForKey(key);
            if (node != null) {
                distribution.merge(node.getNodeId(), 1, Integer::sum);
            }
        }
        
        return distribution;
    }
    
    /**
     * 获取需要迁移的键（节点变更时）
     */
    public List<String> getKeysToMigrate(String oldNodeId, String newNodeId, List<String> allKeys) {
        List<String> keysToMigrate = new ArrayList<>();
        
        for (String key : allKeys) {
            ShardNode node = getNodeForKey(key);
            if (node != null && node.getNodeId().equals(newNodeId)) {
                // 这个键现在应该在新节点上
                keysToMigrate.add(key);
            }
        }
        
        return keysToMigrate;
    }
    
    /**
     * 计算哈希值（MD5）
     */
    private long hash(String key) {
        byte[] digest;
        synchronized (md5Digest) {
            md5Digest.reset();
            digest = md5Digest.digest(key.getBytes(StandardCharsets.UTF_8));
        }
        
        // 取前8个字节转换为long
        long hash = 0;
        for (int i = 0; i < 8; i++) {
            hash = (hash << 8) | (digest[i] & 0xFF);
        }
        
        return hash;
    }
    
    /**
     * 重新平衡（重新分配虚拟节点）
     */
    public void rebalance() {
        lock.writeLock().lock();
        try {
            log.info("开始重新平衡分片...");
            
            // 清空哈希环
            hashRing.clear();
            
            // 重新添加所有节点的虚拟节点
            for (ShardNode node : physicalNodes.values()) {
                int virtualNodes = virtualNodesPerNode * node.getWeight();
                for (int i = 0; i < virtualNodes; i++) {
                    String virtualNodeKey = node.getNodeId() + "#" + i;
                    long hash = hash(virtualNodeKey);
                    hashRing.put(hash, node);
                }
            }
            
            log.info("分片重新平衡完成: 虚拟节点数={}", hashRing.size());
        } finally {
            lock.writeLock().unlock();
        }
    }
}