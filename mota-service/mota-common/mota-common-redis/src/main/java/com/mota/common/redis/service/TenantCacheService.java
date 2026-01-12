package com.mota.common.redis.service;

import com.mota.common.core.context.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * 多租户缓存服务
 * 自动为缓存key添加租户前缀，实现租户数据隔离
 * 
 * @author Mota
 * @since 1.0.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
@ConditionalOnBean(RedisTemplate.class)
public class TenantCacheService {

    private final RedisTemplate<String, Object> redisTemplate;

    /**
     * 租户缓存前缀
     */
    private static final String TENANT_PREFIX = "mota:tenant:";

    /**
     * 获取带租户前缀的key
     *
     * @param key 原始key
     * @return 带租户前缀的key
     */
    public String getTenantKey(String key) {
        Long tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            log.warn("租户ID为空，使用原始key: {}", key);
            return key;
        }
        return TENANT_PREFIX + tenantId + ":" + key;
    }

    /**
     * 获取指定租户的key
     *
     * @param tenantId 租户ID
     * @param key      原始key
     * @return 带租户前缀的key
     */
    public String getTenantKey(Long tenantId, String key) {
        if (tenantId == null) {
            return key;
        }
        return TENANT_PREFIX + tenantId + ":" + key;
    }

    // ========== String 操作 ==========

    /**
     * 设置缓存
     *
     * @param key   缓存key
     * @param value 缓存值
     */
    public void set(String key, Object value) {
        redisTemplate.opsForValue().set(getTenantKey(key), value);
    }

    /**
     * 设置缓存（带过期时间）
     *
     * @param key     缓存key
     * @param value   缓存值
     * @param timeout 过期时间
     * @param unit    时间单位
     */
    public void set(String key, Object value, long timeout, TimeUnit unit) {
        redisTemplate.opsForValue().set(getTenantKey(key), value, timeout, unit);
    }

    /**
     * 设置缓存（秒）
     *
     * @param key     缓存key
     * @param value   缓存值
     * @param seconds 过期秒数
     */
    public void setEx(String key, Object value, long seconds) {
        redisTemplate.opsForValue().set(getTenantKey(key), value, seconds, TimeUnit.SECONDS);
    }

    /**
     * 获取缓存
     *
     * @param key 缓存key
     * @param <T> 返回类型
     * @return 缓存值
     */
    @SuppressWarnings("unchecked")
    public <T> T get(String key) {
        return (T) redisTemplate.opsForValue().get(getTenantKey(key));
    }

    /**
     * 删除缓存
     *
     * @param key 缓存key
     * @return 是否删除成功
     */
    public Boolean delete(String key) {
        return redisTemplate.delete(getTenantKey(key));
    }

    /**
     * 批量删除缓存
     *
     * @param keys 缓存key集合
     * @return 删除数量
     */
    public Long delete(Collection<String> keys) {
        Set<String> tenantKeys = keys.stream()
                .map(this::getTenantKey)
                .collect(Collectors.toSet());
        return redisTemplate.delete(tenantKeys);
    }

    /**
     * 设置过期时间
     *
     * @param key     缓存key
     * @param timeout 过期时间
     * @param unit    时间单位
     * @return 是否设置成功
     */
    public Boolean expire(String key, long timeout, TimeUnit unit) {
        return redisTemplate.expire(getTenantKey(key), timeout, unit);
    }

    /**
     * 获取过期时间
     *
     * @param key 缓存key
     * @return 过期时间（秒）
     */
    public Long getExpire(String key) {
        return redisTemplate.getExpire(getTenantKey(key));
    }

    /**
     * 判断key是否存在
     *
     * @param key 缓存key
     * @return 是否存在
     */
    public Boolean hasKey(String key) {
        return redisTemplate.hasKey(getTenantKey(key));
    }

    /**
     * 递增
     *
     * @param key 缓存key
     * @return 递增后的值
     */
    public Long increment(String key) {
        return redisTemplate.opsForValue().increment(getTenantKey(key));
    }

    /**
     * 递增指定值
     *
     * @param key   缓存key
     * @param delta 增量
     * @return 递增后的值
     */
    public Long increment(String key, long delta) {
        return redisTemplate.opsForValue().increment(getTenantKey(key), delta);
    }

    // ========== Hash 操作 ==========

    /**
     * 设置Hash值
     *
     * @param key     缓存key
     * @param hashKey hash字段
     * @param value   值
     */
    public void hSet(String key, String hashKey, Object value) {
        redisTemplate.opsForHash().put(getTenantKey(key), hashKey, value);
    }

    /**
     * 获取Hash值
     *
     * @param key     缓存key
     * @param hashKey hash字段
     * @param <T>     返回类型
     * @return 值
     */
    @SuppressWarnings("unchecked")
    public <T> T hGet(String key, String hashKey) {
        return (T) redisTemplate.opsForHash().get(getTenantKey(key), hashKey);
    }

    /**
     * 删除Hash值
     *
     * @param key      缓存key
     * @param hashKeys hash字段
     * @return 删除数量
     */
    public Long hDelete(String key, Object... hashKeys) {
        return redisTemplate.opsForHash().delete(getTenantKey(key), hashKeys);
    }

    /**
     * 判断Hash是否存在
     *
     * @param key     缓存key
     * @param hashKey hash字段
     * @return 是否存在
     */
    public Boolean hHasKey(String key, String hashKey) {
        return redisTemplate.opsForHash().hasKey(getTenantKey(key), hashKey);
    }

    // ========== Set 操作 ==========

    /**
     * 添加Set元素
     *
     * @param key    缓存key
     * @param values 值
     * @return 添加数量
     */
    public Long sAdd(String key, Object... values) {
        return redisTemplate.opsForSet().add(getTenantKey(key), values);
    }

    /**
     * 获取Set所有元素
     *
     * @param key 缓存key
     * @return 元素集合
     */
    public Set<Object> sMembers(String key) {
        return redisTemplate.opsForSet().members(getTenantKey(key));
    }

    /**
     * 判断是否是Set成员
     *
     * @param key   缓存key
     * @param value 值
     * @return 是否是成员
     */
    public Boolean sIsMember(String key, Object value) {
        return redisTemplate.opsForSet().isMember(getTenantKey(key), value);
    }

    /**
     * 删除Set元素
     *
     * @param key    缓存key
     * @param values 值
     * @return 删除数量
     */
    public Long sRemove(String key, Object... values) {
        return redisTemplate.opsForSet().remove(getTenantKey(key), values);
    }

    // ========== 租户管理 ==========

    /**
     * 删除指定租户的所有缓存
     *
     * @param tenantId 租户ID
     * @return 删除数量
     */
    public Long deleteAllByTenant(Long tenantId) {
        String pattern = TENANT_PREFIX + tenantId + ":*";
        Set<String> keys = redisTemplate.keys(pattern);
        if (keys != null && !keys.isEmpty()) {
            return redisTemplate.delete(keys);
        }
        return 0L;
    }

    /**
     * 获取当前租户的所有缓存key
     *
     * @return key集合
     */
    public Set<String> getCurrentTenantKeys() {
        Long tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            return Set.of();
        }
        String pattern = TENANT_PREFIX + tenantId + ":*";
        return redisTemplate.keys(pattern);
    }

    /**
     * 获取指定租户的所有缓存key
     *
     * @param tenantId 租户ID
     * @return key集合
     */
    public Set<String> getTenantKeys(Long tenantId) {
        String pattern = TENANT_PREFIX + tenantId + ":*";
        return redisTemplate.keys(pattern);
    }
}