package com.mota.common.core.id;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.net.InetAddress;
import java.net.NetworkInterface;

/**
 * 雪花算法ID生成器
 * 
 * 64位ID结构：
 * - 1位符号位（始终为0）
 * - 41位时间戳（毫秒级，可用69年）
 * - 10位工作机器ID（5位数据中心ID + 5位机器ID，最多1024个节点）
 * - 12位序列号（每毫秒最多4096个ID）
 * 
 * @author Mota
 * @since 1.0.0
 */
@Slf4j
@Component
public class SnowflakeIdGenerator {

    /**
     * 起始时间戳 (2024-01-01 00:00:00)
     */
    private static final long EPOCH = 1704067200000L;

    /**
     * 数据中心ID位数
     */
    private static final long DATACENTER_ID_BITS = 5L;

    /**
     * 机器ID位数
     */
    private static final long WORKER_ID_BITS = 5L;

    /**
     * 序列号位数
     */
    private static final long SEQUENCE_BITS = 12L;

    /**
     * 最大数据中心ID (31)
     */
    private static final long MAX_DATACENTER_ID = ~(-1L << DATACENTER_ID_BITS);

    /**
     * 最大机器ID (31)
     */
    private static final long MAX_WORKER_ID = ~(-1L << WORKER_ID_BITS);

    /**
     * 序列号掩码 (4095)
     */
    private static final long SEQUENCE_MASK = ~(-1L << SEQUENCE_BITS);

    /**
     * 机器ID左移位数 (12)
     */
    private static final long WORKER_ID_SHIFT = SEQUENCE_BITS;

    /**
     * 数据中心ID左移位数 (17)
     */
    private static final long DATACENTER_ID_SHIFT = SEQUENCE_BITS + WORKER_ID_BITS;

    /**
     * 时间戳左移位数 (22)
     */
    private static final long TIMESTAMP_SHIFT = SEQUENCE_BITS + WORKER_ID_BITS + DATACENTER_ID_BITS;

    /**
     * 数据中心ID
     */
    @Value("${mota.snowflake.datacenter-id:0}")
    private long datacenterId;

    /**
     * 机器ID
     */
    @Value("${mota.snowflake.worker-id:-1}")
    private long workerId;

    /**
     * 序列号
     */
    private long sequence = 0L;

    /**
     * 上次生成ID的时间戳
     */
    private long lastTimestamp = -1L;

    /**
     * 初始化
     */
    @PostConstruct
    public void init() {
        // 如果未配置workerId，则根据MAC地址自动生成
        if (workerId < 0) {
            workerId = generateWorkerId();
        }

        // 验证参数
        if (datacenterId > MAX_DATACENTER_ID || datacenterId < 0) {
            throw new IllegalArgumentException(
                    String.format("数据中心ID必须在0到%d之间", MAX_DATACENTER_ID));
        }
        if (workerId > MAX_WORKER_ID || workerId < 0) {
            throw new IllegalArgumentException(
                    String.format("机器ID必须在0到%d之间", MAX_WORKER_ID));
        }

        log.info("雪花算法ID生成器初始化完成: datacenterId={}, workerId={}", datacenterId, workerId);
    }

    /**
     * 生成下一个ID
     *
     * @return 唯一ID
     */
    public synchronized long nextId() {
        long timestamp = currentTimeMillis();

        // 如果当前时间小于上次生成ID的时间戳，说明系统时钟回退
        if (timestamp < lastTimestamp) {
            long offset = lastTimestamp - timestamp;
            if (offset <= 5) {
                // 时钟回退在5ms内，等待
                try {
                    wait(offset << 1);
                    timestamp = currentTimeMillis();
                    if (timestamp < lastTimestamp) {
                        throw new RuntimeException(
                                String.format("时钟回退，拒绝生成ID，回退时间: %d毫秒", lastTimestamp - timestamp));
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException("等待时钟同步时被中断", e);
                }
            } else {
                throw new RuntimeException(
                        String.format("时钟回退，拒绝生成ID，回退时间: %d毫秒", lastTimestamp - timestamp));
            }
        }

        // 如果是同一毫秒内生成的，则递增序列号
        if (timestamp == lastTimestamp) {
            sequence = (sequence + 1) & SEQUENCE_MASK;
            // 序列号溢出，等待下一毫秒
            if (sequence == 0) {
                timestamp = waitNextMillis(lastTimestamp);
            }
        } else {
            // 不同毫秒，序列号重置
            sequence = 0L;
        }

        lastTimestamp = timestamp;

        // 组装ID
        return ((timestamp - EPOCH) << TIMESTAMP_SHIFT)
                | (datacenterId << DATACENTER_ID_SHIFT)
                | (workerId << WORKER_ID_SHIFT)
                | sequence;
    }

    /**
     * 生成下一个ID（字符串格式）
     *
     * @return 唯一ID字符串
     */
    public String nextIdStr() {
        return String.valueOf(nextId());
    }

    /**
     * 解析ID，获取时间戳
     *
     * @param id ID
     * @return 时间戳
     */
    public long parseTimestamp(long id) {
        return (id >> TIMESTAMP_SHIFT) + EPOCH;
    }

    /**
     * 解析ID，获取数据中心ID
     *
     * @param id ID
     * @return 数据中心ID
     */
    public long parseDatacenterId(long id) {
        return (id >> DATACENTER_ID_SHIFT) & MAX_DATACENTER_ID;
    }

    /**
     * 解析ID，获取机器ID
     *
     * @param id ID
     * @return 机器ID
     */
    public long parseWorkerId(long id) {
        return (id >> WORKER_ID_SHIFT) & MAX_WORKER_ID;
    }

    /**
     * 解析ID，获取序列号
     *
     * @param id ID
     * @return 序列号
     */
    public long parseSequence(long id) {
        return id & SEQUENCE_MASK;
    }

    /**
     * 等待下一毫秒
     *
     * @param lastTimestamp 上次时间戳
     * @return 下一毫秒时间戳
     */
    private long waitNextMillis(long lastTimestamp) {
        long timestamp = currentTimeMillis();
        while (timestamp <= lastTimestamp) {
            timestamp = currentTimeMillis();
        }
        return timestamp;
    }

    /**
     * 获取当前时间戳
     *
     * @return 当前时间戳
     */
    private long currentTimeMillis() {
        return System.currentTimeMillis();
    }

    /**
     * 根据MAC地址生成机器ID
     *
     * @return 机器ID
     */
    private long generateWorkerId() {
        try {
            InetAddress ip = InetAddress.getLocalHost();
            NetworkInterface network = NetworkInterface.getByInetAddress(ip);
            if (network == null) {
                return 1L;
            }
            byte[] mac = network.getHardwareAddress();
            if (mac == null) {
                return 1L;
            }
            // 使用MAC地址的后两个字节生成workerId
            long id = ((0x000000FF & (long) mac[mac.length - 2])
                    | (0x0000FF00 & (((long) mac[mac.length - 1]) << 8))) >> 6;
            return id % (MAX_WORKER_ID + 1);
        } catch (Exception e) {
            log.warn("无法获取MAC地址，使用随机workerId", e);
            return (long) (Math.random() * (MAX_WORKER_ID + 1));
        }
    }

    /**
     * 获取数据中心ID
     *
     * @return 数据中心ID
     */
    public long getDatacenterId() {
        return datacenterId;
    }

    /**
     * 获取机器ID
     *
     * @return 机器ID
     */
    public long getWorkerId() {
        return workerId;
    }
}