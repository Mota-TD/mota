package com.mota.common.redis.lock;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;

/**
 * 分布式锁服务
 * 基于Redisson实现的分布式锁
 * 
 * @author Mota
 * @since 1.0.0
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DistributedLock {

    private final RedissonClient redissonClient;

    /**
     * 锁前缀
     */
    private static final String LOCK_PREFIX = "mota:lock:";

    /**
     * 默认等待时间（秒）
     */
    private static final long DEFAULT_WAIT_TIME = 10;

    /**
     * 默认锁持有时间（秒）
     */
    private static final long DEFAULT_LEASE_TIME = 30;

    /**
     * 获取锁
     *
     * @param lockKey 锁的key
     * @return 锁对象
     */
    public RLock getLock(String lockKey) {
        return redissonClient.getLock(LOCK_PREFIX + lockKey);
    }

    /**
     * 尝试获取锁（使用默认等待时间和持有时间）
     *
     * @param lockKey 锁的key
     * @return 是否获取成功
     */
    public boolean tryLock(String lockKey) {
        return tryLock(lockKey, DEFAULT_WAIT_TIME, DEFAULT_LEASE_TIME, TimeUnit.SECONDS);
    }

    /**
     * 尝试获取锁
     *
     * @param lockKey   锁的key
     * @param waitTime  等待时间
     * @param leaseTime 持有时间
     * @param unit      时间单位
     * @return 是否获取成功
     */
    public boolean tryLock(String lockKey, long waitTime, long leaseTime, TimeUnit unit) {
        RLock lock = getLock(lockKey);
        try {
            boolean acquired = lock.tryLock(waitTime, leaseTime, unit);
            if (acquired) {
                log.debug("获取分布式锁成功: key={}", lockKey);
            } else {
                log.debug("获取分布式锁失败: key={}", lockKey);
            }
            return acquired;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("获取分布式锁被中断: key={}", lockKey, e);
            return false;
        }
    }

    /**
     * 释放锁
     *
     * @param lockKey 锁的key
     */
    public void unlock(String lockKey) {
        RLock lock = getLock(lockKey);
        if (lock.isHeldByCurrentThread()) {
            lock.unlock();
            log.debug("释放分布式锁: key={}", lockKey);
        }
    }

    /**
     * 强制释放锁
     *
     * @param lockKey 锁的key
     */
    public void forceUnlock(String lockKey) {
        RLock lock = getLock(lockKey);
        lock.forceUnlock();
        log.debug("强制释放分布式锁: key={}", lockKey);
    }

    /**
     * 判断锁是否被持有
     *
     * @param lockKey 锁的key
     * @return 是否被持有
     */
    public boolean isLocked(String lockKey) {
        return getLock(lockKey).isLocked();
    }

    /**
     * 判断锁是否被当前线程持有
     *
     * @param lockKey 锁的key
     * @return 是否被当前线程持有
     */
    public boolean isHeldByCurrentThread(String lockKey) {
        return getLock(lockKey).isHeldByCurrentThread();
    }

    /**
     * 在锁内执行操作（无返回值）
     *
     * @param lockKey  锁的key
     * @param runnable 要执行的操作
     * @return 是否执行成功
     */
    public boolean executeWithLock(String lockKey, Runnable runnable) {
        return executeWithLock(lockKey, DEFAULT_WAIT_TIME, DEFAULT_LEASE_TIME, TimeUnit.SECONDS, runnable);
    }

    /**
     * 在锁内执行操作（无返回值）
     *
     * @param lockKey   锁的key
     * @param waitTime  等待时间
     * @param leaseTime 持有时间
     * @param unit      时间单位
     * @param runnable  要执行的操作
     * @return 是否执行成功
     */
    public boolean executeWithLock(String lockKey, long waitTime, long leaseTime, TimeUnit unit, Runnable runnable) {
        if (tryLock(lockKey, waitTime, leaseTime, unit)) {
            try {
                runnable.run();
                return true;
            } finally {
                unlock(lockKey);
            }
        }
        return false;
    }

    /**
     * 在锁内执行操作（有返回值）
     *
     * @param lockKey  锁的key
     * @param supplier 要执行的操作
     * @param <T>      返回值类型
     * @return 执行结果，获取锁失败返回null
     */
    public <T> T executeWithLock(String lockKey, Supplier<T> supplier) {
        return executeWithLock(lockKey, DEFAULT_WAIT_TIME, DEFAULT_LEASE_TIME, TimeUnit.SECONDS, supplier);
    }

    /**
     * 在锁内执行操作（有返回值）
     *
     * @param lockKey   锁的key
     * @param waitTime  等待时间
     * @param leaseTime 持有时间
     * @param unit      时间单位
     * @param supplier  要执行的操作
     * @param <T>       返回值类型
     * @return 执行结果，获取锁失败返回null
     */
    public <T> T executeWithLock(String lockKey, long waitTime, long leaseTime, TimeUnit unit, Supplier<T> supplier) {
        if (tryLock(lockKey, waitTime, leaseTime, unit)) {
            try {
                return supplier.get();
            } finally {
                unlock(lockKey);
            }
        }
        return null;
    }

    /**
     * 在锁内执行操作（有返回值，获取锁失败抛出异常）
     *
     * @param lockKey  锁的key
     * @param supplier 要执行的操作
     * @param <T>      返回值类型
     * @return 执行结果
     * @throws LockAcquireException 获取锁失败时抛出
     */
    public <T> T executeWithLockOrThrow(String lockKey, Supplier<T> supplier) {
        return executeWithLockOrThrow(lockKey, DEFAULT_WAIT_TIME, DEFAULT_LEASE_TIME, TimeUnit.SECONDS, supplier);
    }

    /**
     * 在锁内执行操作（有返回值，获取锁失败抛出异常）
     *
     * @param lockKey   锁的key
     * @param waitTime  等待时间
     * @param leaseTime 持有时间
     * @param unit      时间单位
     * @param supplier  要执行的操作
     * @param <T>       返回值类型
     * @return 执行结果
     * @throws LockAcquireException 获取锁失败时抛出
     */
    public <T> T executeWithLockOrThrow(String lockKey, long waitTime, long leaseTime, TimeUnit unit, Supplier<T> supplier) {
        if (tryLock(lockKey, waitTime, leaseTime, unit)) {
            try {
                return supplier.get();
            } finally {
                unlock(lockKey);
            }
        }
        throw new LockAcquireException("获取分布式锁失败: " + lockKey);
    }

    /**
     * 获取锁失败异常
     */
    public static class LockAcquireException extends RuntimeException {
        public LockAcquireException(String message) {
            super(message);
        }
    }
}