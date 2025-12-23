package com.mota.issue.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.mota.issue.entity.Sprint;

import java.util.List;

/**
 * 迭代服务接口
 */
public interface SprintService extends IService<Sprint> {

    /**
     * 获取迭代列表
     */
    List<Sprint> getSprintList(Long projectId, String status);

    /**
     * 获取迭代详情
     */
    Sprint getSprintDetail(Long id);

    /**
     * 创建迭代
     */
    Sprint createSprint(Sprint sprint);

    /**
     * 更新迭代
     */
    Sprint updateSprint(Long id, Sprint sprint);

    /**
     * 删除迭代
     */
    void deleteSprint(Long id);

    /**
     * 开始迭代
     */
    void startSprint(Long id);

    /**
     * 完成迭代
     */
    void completeSprint(Long id);
}