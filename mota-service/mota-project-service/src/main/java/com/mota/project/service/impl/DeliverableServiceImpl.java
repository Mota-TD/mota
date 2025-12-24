package com.mota.project.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mota.common.core.exception.BusinessException;
import com.mota.project.entity.Deliverable;
import com.mota.project.mapper.DeliverableMapper;
import com.mota.project.service.DeliverableService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 交付物服务实现
 */
@Service
@RequiredArgsConstructor
public class DeliverableServiceImpl extends ServiceImpl<DeliverableMapper, Deliverable> implements DeliverableService {

    @Override
    public IPage<Deliverable> pageDeliverables(Page<Deliverable> page, Long taskId, Long uploadedBy) {
        LambdaQueryWrapper<Deliverable> wrapper = new LambdaQueryWrapper<>();
        
        wrapper.eq(Deliverable::getDeleted, 0);
        
        if (taskId != null) {
            wrapper.eq(Deliverable::getTaskId, taskId);
        }
        if (uploadedBy != null) {
            wrapper.eq(Deliverable::getUploadedBy, uploadedBy);
        }
        
        wrapper.orderByDesc(Deliverable::getCreatedAt);
        
        return page(page, wrapper);
    }

    @Override
    public List<Deliverable> getByTaskId(Long taskId) {
        LambdaQueryWrapper<Deliverable> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Deliverable::getTaskId, taskId);
        wrapper.eq(Deliverable::getDeleted, 0);
        wrapper.orderByDesc(Deliverable::getCreatedAt);
        return list(wrapper);
    }

    @Override
    public List<Deliverable> getByUserId(Long userId) {
        LambdaQueryWrapper<Deliverable> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Deliverable::getUploadedBy, userId);
        wrapper.eq(Deliverable::getDeleted, 0);
        wrapper.orderByDesc(Deliverable::getCreatedAt);
        return list(wrapper);
    }

    @Override
    public Deliverable getDetailById(Long id) {
        Deliverable deliverable = getById(id);
        if (deliverable == null || deliverable.getDeleted() == 1) {
            throw new BusinessException("交付物不存在");
        }
        return deliverable;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Deliverable createDeliverable(Deliverable deliverable) {
        deliverable.setDeleted(0);
        deliverable.setCreatedAt(LocalDateTime.now());
        // TODO: 从当前登录用户获取
        if (deliverable.getUploadedBy() == null) {
            deliverable.setUploadedBy(1L);
        }
        
        save(deliverable);
        return deliverable;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Deliverable uploadDeliverable(Long taskId, String name, String description,
                                          String fileName, String fileUrl, Long fileSize, String fileType) {
        Deliverable deliverable = new Deliverable();
        deliverable.setTaskId(taskId);
        deliverable.setName(StringUtils.hasText(name) ? name : fileName);
        deliverable.setDescription(description);
        deliverable.setFileName(fileName);
        deliverable.setFileUrl(fileUrl);
        deliverable.setFileSize(fileSize);
        deliverable.setFileType(fileType);
        deliverable.setDeleted(0);
        deliverable.setCreatedAt(LocalDateTime.now());
        // TODO: 从当前登录用户获取
        deliverable.setUploadedBy(1L);
        
        save(deliverable);
        return deliverable;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Deliverable updateDeliverable(Deliverable deliverable) {
        Deliverable existing = getById(deliverable.getId());
        if (existing == null || existing.getDeleted() == 1) {
            throw new BusinessException("交付物不存在");
        }
        
        if (StringUtils.hasText(deliverable.getName())) {
            existing.setName(deliverable.getName());
        }
        if (deliverable.getDescription() != null) {
            existing.setDescription(deliverable.getDescription());
        }
        
        updateById(existing);
        return existing;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteDeliverable(Long id) {
        Deliverable existing = getById(id);
        if (existing == null || existing.getDeleted() == 1) {
            throw new BusinessException("交付物不存在");
        }
        
        // 软删除
        existing.setDeleted(1);
        return updateById(existing);
    }

    @Override
    public int countByTaskId(Long taskId) {
        LambdaQueryWrapper<Deliverable> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Deliverable::getTaskId, taskId);
        wrapper.eq(Deliverable::getDeleted, 0);
        return (int) count(wrapper);
    }

    @Override
    public String getPreviewUrl(Long id) {
        Deliverable deliverable = getDetailById(id);
        // TODO: 实现预览URL生成逻辑
        return deliverable.getFileUrl();
    }
}