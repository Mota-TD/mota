package com.mota.project.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mota.common.core.exception.BusinessException;
import com.mota.project.entity.WorkPlan;
import com.mota.project.entity.WorkPlanAttachment;
import com.mota.project.mapper.WorkPlanAttachmentMapper;
import com.mota.project.mapper.WorkPlanMapper;
import com.mota.project.service.WorkPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 工作计划服务实现
 */
@Service
@RequiredArgsConstructor
public class WorkPlanServiceImpl extends ServiceImpl<WorkPlanMapper, WorkPlan> implements WorkPlanService {

    private final WorkPlanAttachmentMapper attachmentMapper;

    @Override
    public IPage<WorkPlan> pageWorkPlans(Page<WorkPlan> page, Long departmentTaskId, Long projectId,
                                          String status, Long submittedBy) {
        LambdaQueryWrapper<WorkPlan> wrapper = new LambdaQueryWrapper<>();
        
        if (departmentTaskId != null) {
            wrapper.eq(WorkPlan::getDepartmentTaskId, departmentTaskId);
        }
        if (StringUtils.hasText(status)) {
            wrapper.eq(WorkPlan::getStatus, status);
        }
        if (submittedBy != null) {
            wrapper.eq(WorkPlan::getSubmittedBy, submittedBy);
        }
        
        wrapper.orderByDesc(WorkPlan::getCreatedAt);
        
        return page(page, wrapper);
    }

    @Override
    public WorkPlan getByDepartmentTaskId(Long departmentTaskId) {
        return baseMapper.selectLatestByDepartmentTaskId(departmentTaskId);
    }

    @Override
    public WorkPlan getDetailById(Long id) {
        WorkPlan workPlan = getById(id);
        if (workPlan == null) {
            throw new BusinessException("工作计划不存在");
        }
        return workPlan;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public WorkPlan createWorkPlan(WorkPlan workPlan) {
        // 设置默认值
        if (!StringUtils.hasText(workPlan.getStatus())) {
            workPlan.setStatus(WorkPlan.Status.DRAFT);
        }
        if (workPlan.getVersion() == null) {
            workPlan.setVersion(1);
        }
        
        save(workPlan);
        return workPlan;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public WorkPlan updateWorkPlan(WorkPlan workPlan) {
        WorkPlan existing = getById(workPlan.getId());
        if (existing == null) {
            throw new BusinessException("工作计划不存在");
        }
        
        // 只有草稿状态可以修改
        if (!WorkPlan.Status.DRAFT.equals(existing.getStatus()) && 
            !WorkPlan.Status.REJECTED.equals(existing.getStatus())) {
            throw new BusinessException("只有草稿或已驳回状态的工作计划可以修改");
        }
        
        if (StringUtils.hasText(workPlan.getSummary())) {
            existing.setSummary(workPlan.getSummary());
        }
        if (workPlan.getResourceRequirement() != null) {
            existing.setResourceRequirement(workPlan.getResourceRequirement());
        }
        
        updateById(existing);
        return existing;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteWorkPlan(Long id) {
        WorkPlan existing = getById(id);
        if (existing == null) {
            throw new BusinessException("工作计划不存在");
        }
        
        // 只有草稿状态可以删除
        if (!WorkPlan.Status.DRAFT.equals(existing.getStatus())) {
            throw new BusinessException("只有草稿状态的工作计划可以删除");
        }
        
        // 删除附件
        LambdaQueryWrapper<WorkPlanAttachment> attachmentWrapper = new LambdaQueryWrapper<>();
        attachmentWrapper.eq(WorkPlanAttachment::getWorkPlanId, id);
        attachmentMapper.delete(attachmentWrapper);
        
        return removeById(id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public WorkPlan submitWorkPlan(Long id, String summary, String resourceRequirement) {
        WorkPlan existing = getById(id);
        if (existing == null) {
            throw new BusinessException("工作计划不存在");
        }
        
        // 只有草稿或已驳回状态可以提交
        if (!WorkPlan.Status.DRAFT.equals(existing.getStatus()) && 
            !WorkPlan.Status.REJECTED.equals(existing.getStatus())) {
            throw new BusinessException("只有草稿或已驳回状态的工作计划可以提交");
        }
        
        // 更新内容
        if (StringUtils.hasText(summary)) {
            existing.setSummary(summary);
        }
        if (resourceRequirement != null) {
            existing.setResourceRequirement(resourceRequirement);
        }
        
        // 更新状态
        existing.setStatus(WorkPlan.Status.SUBMITTED);
        existing.setSubmittedAt(LocalDateTime.now());
        // TODO: 从当前登录用户获取
        existing.setSubmittedBy(1L);
        
        updateById(existing);
        return existing;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public WorkPlan approveWorkPlan(Long id, boolean approved, String comment) {
        WorkPlan existing = getById(id);
        if (existing == null) {
            throw new BusinessException("工作计划不存在");
        }
        
        // 只有已提交状态可以审批
        if (!WorkPlan.Status.SUBMITTED.equals(existing.getStatus())) {
            throw new BusinessException("只有已提交状态的工作计划可以审批");
        }
        
        existing.setStatus(approved ? WorkPlan.Status.APPROVED : WorkPlan.Status.REJECTED);
        existing.setReviewedAt(LocalDateTime.now());
        existing.setReviewComment(comment);
        // TODO: 从当前登录用户获取
        existing.setReviewedBy(1L);
        
        updateById(existing);
        return existing;
    }

    @Override
    public List<WorkPlanAttachment> getAttachments(Long workPlanId) {
        LambdaQueryWrapper<WorkPlanAttachment> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(WorkPlanAttachment::getWorkPlanId, workPlanId);
        wrapper.orderByDesc(WorkPlanAttachment::getCreatedAt);
        return attachmentMapper.selectList(wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public WorkPlanAttachment addAttachment(Long workPlanId, String fileName, String fileUrl,
                                             Long fileSize, String fileType) {
        WorkPlan workPlan = getById(workPlanId);
        if (workPlan == null) {
            throw new BusinessException("工作计划不存在");
        }
        
        WorkPlanAttachment attachment = new WorkPlanAttachment();
        attachment.setWorkPlanId(workPlanId);
        attachment.setFileName(fileName);
        attachment.setFileUrl(fileUrl);
        attachment.setFileSize(fileSize);
        attachment.setFileType(fileType);
        // TODO: 从当前登录用户获取
        attachment.setUploadedBy(1L);
        attachment.setCreatedAt(LocalDateTime.now());
        
        attachmentMapper.insert(attachment);
        return attachment;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteAttachment(Long workPlanId, Long attachmentId) {
        WorkPlanAttachment attachment = attachmentMapper.selectById(attachmentId);
        if (attachment == null) {
            throw new BusinessException("附件不存在");
        }
        if (!attachment.getWorkPlanId().equals(workPlanId)) {
            throw new BusinessException("附件不属于该工作计划");
        }
        
        return attachmentMapper.deleteById(attachmentId) > 0;
    }
}