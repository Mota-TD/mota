package com.mota.project.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.mota.project.entity.Deliverable;

import java.util.List;

/**
 * 交付物服务接口
 */
public interface DeliverableService extends IService<Deliverable> {

    /**
     * 分页查询交付物
     */
    IPage<Deliverable> pageDeliverables(Page<Deliverable> page, Long taskId, Long uploadedBy);

    /**
     * 根据任务ID获取交付物列表
     */
    List<Deliverable> getByTaskId(Long taskId);

    /**
     * 根据用户ID获取交付物列表
     */
    List<Deliverable> getByUserId(Long userId);

    /**
     * 获取交付物详情
     */
    Deliverable getDetailById(Long id);

    /**
     * 创建交付物
     */
    Deliverable createDeliverable(Deliverable deliverable);

    /**
     * 上传交付物（含文件）
     */
    Deliverable uploadDeliverable(Long taskId, String name, String description, 
                                   String fileName, String fileUrl, Long fileSize, String fileType);

    /**
     * 更新交付物
     */
    Deliverable updateDeliverable(Deliverable deliverable);

    /**
     * 删除交付物
     */
    boolean deleteDeliverable(Long id);

    /**
     * 获取任务的交付物数量
     */
    int countByTaskId(Long taskId);

    /**
     * 获取交付物预览URL
     */
    String getPreviewUrl(Long id);
}