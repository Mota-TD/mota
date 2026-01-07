package com.mota.project.controller.news;

import com.mota.common.core.result.Result;
import com.mota.project.service.news.CacheShardingService;
import com.mota.project.service.news.CacheShardingService.ShardNode;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;
import java.util.List;
import java.util.Map;

/**
 * 缓存分片管理控制器
 * 
 * 提供分片管理API：
 * 1. 节点管理（添加/删除/查询）
 * 2. 分片信息查询
 * 3. 数据分布统计
 * 4. 健康检查
 * 5. 重新平衡
 * 
 * @author Mota Team
 * @since 2026-01-06
 * @version 2.4
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/news/cache/sharding")
@RequiredArgsConstructor
@Tag(name = "缓存分片管理", description = "缓存分片管理相关接口")
public class CacheShardingController {

    private final CacheShardingService shardingService;

    /**
     * 获取分片统计信息
     */
    @GetMapping("/statistics")
    @Operation(summary = "获取分片统计信息", description = "获取缓存分片的统计信息，包括节点数量、虚拟节点数量等")
    public Result<Map<String, Object>> getStatistics() {
        try {
            Map<String, Object> stats = shardingService.getShardingStatistics();
            return Result.success(stats);
        } catch (Exception e) {
            log.error("获取分片统计信息失败", e);
            return Result.fail("获取分片统计信息失败: " + e.getMessage());
        }
    }

    /**
     * 获取所有节点
     */
    @GetMapping("/nodes")
    @Operation(summary = "获取所有节点", description = "获取所有分片节点的信息")
    public Result<Collection<ShardNode>> getAllNodes() {
        try {
            Collection<ShardNode> nodes = shardingService.getAllNodes();
            return Result.success(nodes);
        } catch (Exception e) {
            log.error("获取节点列表失败", e);
            return Result.fail("获取节点列表失败: " + e.getMessage());
        }
    }

    /**
     * 添加节点
     */
    @PostMapping("/nodes")
    @Operation(summary = "添加节点", description = "添加新的分片节点")
    public Result<String> addNode(
            @Parameter(description = "节点ID") @RequestParam String nodeId,
            @Parameter(description = "主机地址") @RequestParam String host,
            @Parameter(description = "端口") @RequestParam int port,
            @Parameter(description = "权重") @RequestParam(defaultValue = "1") int weight) {
        try {
            shardingService.addNode(nodeId, host, port, weight);
            return Result.success("节点添加成功");
        } catch (Exception e) {
            log.error("添加节点失败", e);
            return Result.fail("添加节点失败: " + e.getMessage());
        }
    }

    /**
     * 删除节点
     */
    @DeleteMapping("/nodes/{nodeId}")
    @Operation(summary = "删除节点", description = "删除指定的分片节点")
    public Result<String> removeNode(
            @Parameter(description = "节点ID") @PathVariable String nodeId) {
        try {
            shardingService.removeNode(nodeId);
            return Result.success("节点删除成功");
        } catch (Exception e) {
            log.error("删除节点失败", e);
            return Result.fail("删除节点失败: " + e.getMessage());
        }
    }

    /**
     * 设置节点状态
     */
    @PutMapping("/nodes/{nodeId}/status")
    @Operation(summary = "设置节点状态", description = "设置节点的激活状态")
    public Result<String> setNodeStatus(
            @Parameter(description = "节点ID") @PathVariable String nodeId,
            @Parameter(description = "是否激活") @RequestParam boolean active) {
        try {
            shardingService.setNodeActive(nodeId, active);
            return Result.success("节点状态更新成功");
        } catch (Exception e) {
            log.error("更新节点状态失败", e);
            return Result.fail("更新节点状态失败: " + e.getMessage());
        }
    }

    /**
     * 获取键的分片信息
     */
    @GetMapping("/shard-info")
    @Operation(summary = "获取键的分片信息", description = "查询指定键所在的分片节点")
    public Result<Map<String, Object>> getShardInfo(
            @Parameter(description = "缓存键") @RequestParam String key) {
        try {
            Map<String, Object> info = shardingService.getShardInfo(key);
            return Result.success(info);
        } catch (Exception e) {
            log.error("获取分片信息失败", e);
            return Result.fail("获取分片信息失败: " + e.getMessage());
        }
    }

    /**
     * 计算数据分布
     */
    @PostMapping("/distribution")
    @Operation(summary = "计算数据分布", description = "计算给定键列表在各节点的分布情况")
    public Result<Map<String, Integer>> calculateDistribution(
            @Parameter(description = "键列表") @RequestBody List<String> keys) {
        try {
            Map<String, Integer> distribution = shardingService.calculateDistribution(keys);
            return Result.success(distribution);
        } catch (Exception e) {
            log.error("计算数据分布失败", e);
            return Result.fail("计算数据分布失败: " + e.getMessage());
        }
    }

    /**
     * 重新平衡
     */
    @PostMapping("/rebalance")
    @Operation(summary = "重新平衡", description = "重新分配虚拟节点，优化数据分布")
    public Result<String> rebalance() {
        try {
            shardingService.rebalance();
            return Result.success("重新平衡成功");
        } catch (Exception e) {
            log.error("重新平衡失败", e);
            return Result.fail("重新平衡失败: " + e.getMessage());
        }
    }

    /**
     * 检查分片是否启用
     */
    @GetMapping("/enabled")
    @Operation(summary = "检查分片是否启用", description = "检查缓存分片功能是否启用")
    public Result<Boolean> isEnabled() {
        try {
            boolean enabled = shardingService.isShardingEnabled();
            return Result.success(enabled);
        } catch (Exception e) {
            log.error("检查分片状态失败", e);
            return Result.fail("检查分片状态失败: " + e.getMessage());
        }
    }
}