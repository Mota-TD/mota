package com.mota.project.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 免打扰设置实体
 * 用于管理用户的免打扰时段和规则
 */
@Data
@TableName("notification_dnd_settings")
public class NotificationDndSettings {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 是否启用定时免打扰
     */
    private Boolean enabled;

    /**
     * 免打扰开始时间 HH:mm
     */
    private String startTime;

    /**
     * 免打扰结束时间 HH:mm
     */
    private String endTime;

    /**
     * 生效的星期几，逗号分隔，0=周日
     */
    private String weekdays;

    /**
     * 是否允许紧急通知
     */
    private Boolean allowUrgent;

    /**
     * 是否允许@提及通知
     */
    private Boolean allowMentions;

    /**
     * 是否启用临时免打扰
     */
    private Boolean tempEnabled;

    /**
     * 临时免打扰结束时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime tempEndTime;

    /**
     * 创建时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;

    /**
     * 获取星期几数组
     */
    public int[] getWeekdaysArray() {
        if (weekdays == null || weekdays.isEmpty()) {
            return new int[]{0, 1, 2, 3, 4, 5, 6};
        }
        String[] parts = weekdays.split(",");
        int[] result = new int[parts.length];
        for (int i = 0; i < parts.length; i++) {
            result[i] = Integer.parseInt(parts[i].trim());
        }
        return result;
    }

    /**
     * 设置星期几数组
     */
    public void setWeekdaysArray(int[] days) {
        if (days == null || days.length == 0) {
            this.weekdays = "0,1,2,3,4,5,6";
            return;
        }
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < days.length; i++) {
            if (i > 0) sb.append(",");
            sb.append(days[i]);
        }
        this.weekdays = sb.toString();
    }
}