package com.mota.common.redis.service;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;

/**
 * Redis服务类
 */
@Service
@RequiredArgsConstructor
@ConditionalOnBean(RedisTemplate.class)
public class RedisService {

    private final RedisTemplate<String, Object> redisTemplate;

    // ========== Binary 操作 (用于Protobuf) ==========

    /**
     * 设置二进制数据（用于Protobuf序列化）
     */
    public void setBytes(String key, byte[] value) {
        redisTemplate.execute((org.springframework.data.redis.core.RedisCallback<Void>) connection -> {
            connection.set(key.getBytes(), value);
            return null;
        });
    }

    /**
     * 设置二进制数据（带过期时间，秒）
     */
    public void setBytes(String key, byte[] value, long seconds) {
        redisTemplate.execute((org.springframework.data.redis.core.RedisCallback<Void>) connection -> {
            connection.setEx(key.getBytes(), seconds, value);
            return null;
        });
    }

    /**
     * 获取二进制数据
     */
    public byte[] getBytes(String key) {
        return redisTemplate.execute((org.springframework.data.redis.core.RedisCallback<byte[]>) connection -> {
            return connection.get(key.getBytes());
        });
    }

    // ========== String 操作 ==========

    /**
     * 设置缓存
     */
    public void set(String key, Object value) {
        redisTemplate.opsForValue().set(key, value);
    }

    /**
     * 设置缓存（带过期时间）
     */
    public void set(String key, Object value, long timeout, TimeUnit unit) {
        redisTemplate.opsForValue().set(key, value, timeout, unit);
    }

    /**
     * 设置缓存（秒）
     */
    public void setEx(String key, Object value, long seconds) {
        redisTemplate.opsForValue().set(key, value, seconds, TimeUnit.SECONDS);
    }

    /**
     * 获取缓存
     */
    @SuppressWarnings("unchecked")
    public <T> T get(String key) {
        return (T) redisTemplate.opsForValue().get(key);
    }

    /**
     * 删除缓存
     */
    public Boolean delete(String key) {
        return redisTemplate.delete(key);
    }

    /**
     * 批量删除缓存
     */
    public Long delete(Collection<String> keys) {
        return redisTemplate.delete(keys);
    }

    /**
     * 设置过期时间
     */
    public Boolean expire(String key, long timeout, TimeUnit unit) {
        return redisTemplate.expire(key, timeout, unit);
    }

    /**
     * 获取过期时间
     */
    public Long getExpire(String key) {
        return redisTemplate.getExpire(key);
    }

    /**
     * 判断key是否存在
     */
    public Boolean hasKey(String key) {
        return redisTemplate.hasKey(key);
    }

    /**
     * 递增
     */
    public Long increment(String key) {
        return redisTemplate.opsForValue().increment(key);
    }

    /**
     * 递增指定值
     */
    public Long increment(String key, long delta) {
        return redisTemplate.opsForValue().increment(key, delta);
    }

    /**
     * 递减
     */
    public Long decrement(String key) {
        return redisTemplate.opsForValue().decrement(key);
    }

    /**
     * 递减指定值
     */
    public Long decrement(String key, long delta) {
        return redisTemplate.opsForValue().decrement(key, delta);
    }

    // ========== Hash 操作 ==========

    /**
     * 设置Hash值
     */
    public void hSet(String key, String hashKey, Object value) {
        redisTemplate.opsForHash().put(key, hashKey, value);
    }

    /**
     * 获取Hash值
     */
    @SuppressWarnings("unchecked")
    public <T> T hGet(String key, String hashKey) {
        return (T) redisTemplate.opsForHash().get(key, hashKey);
    }

    /**
     * 获取所有Hash值
     */
    public Map<Object, Object> hGetAll(String key) {
        return redisTemplate.opsForHash().entries(key);
    }

    /**
     * 批量设置Hash值
     */
    public void hSetAll(String key, Map<String, Object> map) {
        redisTemplate.opsForHash().putAll(key, map);
    }

    /**
     * 删除Hash值
     */
    public Long hDelete(String key, Object... hashKeys) {
        return redisTemplate.opsForHash().delete(key, hashKeys);
    }

    /**
     * 判断Hash是否存在
     */
    public Boolean hHasKey(String key, String hashKey) {
        return redisTemplate.opsForHash().hasKey(key, hashKey);
    }

    // ========== List 操作 ==========

    /**
     * 左侧入队
     */
    public Long lLeftPush(String key, Object value) {
        return redisTemplate.opsForList().leftPush(key, value);
    }

    /**
     * 右侧入队
     */
    public Long lRightPush(String key, Object value) {
        return redisTemplate.opsForList().rightPush(key, value);
    }

    /**
     * 左侧出队
     */
    @SuppressWarnings("unchecked")
    public <T> T lLeftPop(String key) {
        return (T) redisTemplate.opsForList().leftPop(key);
    }

    /**
     * 右侧出队
     */
    @SuppressWarnings("unchecked")
    public <T> T lRightPop(String key) {
        return (T) redisTemplate.opsForList().rightPop(key);
    }

    /**
     * 获取列表范围
     */
    public List<Object> lRange(String key, long start, long end) {
        return redisTemplate.opsForList().range(key, start, end);
    }

    /**
     * 获取列表长度
     */
    public Long lSize(String key) {
        return redisTemplate.opsForList().size(key);
    }

    // ========== Set 操作 ==========

    /**
     * 添加Set元素
     */
    public Long sAdd(String key, Object... values) {
        return redisTemplate.opsForSet().add(key, values);
    }

    /**
     * 获取Set所有元素
     */
    public Set<Object> sMembers(String key) {
        return redisTemplate.opsForSet().members(key);
    }

    /**
     * 判断是否是Set成员
     */
    public Boolean sIsMember(String key, Object value) {
        return redisTemplate.opsForSet().isMember(key, value);
    }

    /**
     * 删除Set元素
     */
    public Long sRemove(String key, Object... values) {
        return redisTemplate.opsForSet().remove(key, values);
    }

    /**
     * 获取Set大小
     */
    public Long sSize(String key) {
        return redisTemplate.opsForSet().size(key);
    }

    // ========== ZSet 操作 ==========

    /**
     * 添加ZSet元素
     */
    public Boolean zAdd(String key, Object value, double score) {
        return redisTemplate.opsForZSet().add(key, value, score);
    }

    /**
     * 获取ZSet范围
     */
    public Set<Object> zRange(String key, long start, long end) {
        return redisTemplate.opsForZSet().range(key, start, end);
    }

    /**
     * 获取ZSet分数
     */
    public Double zScore(String key, Object value) {
        return redisTemplate.opsForZSet().score(key, value);
    }

    /**
     * 删除ZSet元素
     */
    public Long zRemove(String key, Object... values) {
        return redisTemplate.opsForZSet().remove(key, values);
    }

    /**
     * 获取ZSet大小
     */
    public Long zSize(String key) {
        return redisTemplate.opsForZSet().size(key);
    }

    // ========== Key 操作 ==========

    /**
     * SCAN命令 - 迭代查找匹配的键
     *
     * @param cursor 游标位置，初始为"0"
     * @param pattern 匹配模式，如 "news:*"
     * @param count 每次迭代返回的键数量建议值
     * @return Map包含新游标和匹配的键列表
     */
    public Map<String, Object> scan(String cursor, String pattern, int count) {
        return redisTemplate.execute((org.springframework.data.redis.core.RedisCallback<Map<String, Object>>) connection -> {
            Map<String, Object> result = new java.util.HashMap<>();
            
            // 构建SCAN选项
            org.springframework.data.redis.core.ScanOptions options = org.springframework.data.redis.core.ScanOptions
                .scanOptions()
                .match(pattern)
                .count(count)
                .build();
            
            // 执行SCAN命令
            org.springframework.data.redis.core.Cursor<byte[]> scanCursor = connection.scan(options);
            
            // 收集匹配的键
            java.util.List<String> keys = new java.util.ArrayList<>();
            while (scanCursor.hasNext()) {
                keys.add(new String(scanCursor.next()));
            }
            
            // 返回结果
            result.put("cursor", "0"); // Spring Data Redis的Cursor会自动迭代到结束
            result.put("keys", keys);
            
            try {
                scanCursor.close();
            } catch (Exception e) {
                // 忽略关闭异常
            }
            
            return result;
        });
    }

    /**
     * 批量删除缓存（使用数组）
     */
    public Long delete(String... keys) {
        if (keys == null || keys.length == 0) {
            return 0L;
        }
        return redisTemplate.delete(java.util.Arrays.asList(keys));
    }

    /**
     * 设置过期时间（秒）
     */
    public Boolean expire(String key, long seconds) {
        return redisTemplate.expire(key, seconds, TimeUnit.SECONDS);
    }
}