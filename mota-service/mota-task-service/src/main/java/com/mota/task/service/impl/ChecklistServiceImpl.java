package com.mota.task.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mota.common.core.context.UserContext;
import com.mota.common.core.exception.BusinessException;
import com.mota.task.entity.Checklist;
import com.mota.task.entity.ChecklistItem;
import com.mota.task.mapper.ChecklistItemMapper;
import com.mota.task.mapper.ChecklistMapper;
import com.mota.task.service.ChecklistService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 检查清单服务实现类
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ChecklistServiceImpl extends ServiceImpl<ChecklistMapper, Checklist> implements ChecklistService {

    private final ChecklistItemMapper checklistItemMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Checklist createChecklist(Long taskId, String title) {
        // 获取当前最大排序号
        int maxOrder = 0;
        List<Checklist> existing = getChecklistsByTask(taskId);
        if (!existing.isEmpty()) {
            maxOrder = existing.stream()
                    .mapToInt(Checklist::getSortOrder)
                    .max()
                    .orElse(0);
        }
        
        Checklist checklist = new Checklist();
        checklist.setTaskId(taskId);
        checklist.setTitle(title);
        checklist.setSortOrder(maxOrder + 1);
        // createdBy/createdAt 由 MyBatis-Plus 自动填充
        
        save(checklist);
        return checklist;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Checklist updateChecklist(Long checklistId, String title) {
        Checklist checklist = getById(checklistId);
        if (checklist == null) {
            throw new BusinessException("检查清单不存在");
        }
        
        checklist.setTitle(title);
        // updatedBy/updatedAt 由 MyBatis-Plus 自动填充
        
        updateById(checklist);
        return checklist;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteChecklist(Long checklistId) {
        Checklist checklist = getById(checklistId);
        if (checklist == null) {
            throw new BusinessException("检查清单不存在");
        }
        
        // 删除所有检查项
        checklistItemMapper.delete(new LambdaQueryWrapper<ChecklistItem>()
                .eq(ChecklistItem::getChecklistId, checklistId));
        
        // 删除检查清单
        checklist.setDeleted(1);
        // updatedBy/updatedAt 由 MyBatis-Plus 自动填充
        updateById(checklist);
    }

    @Override
    public List<Checklist> getChecklistsByTask(Long taskId) {
        return baseMapper.selectByTaskId(taskId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ChecklistItem addItem(Long checklistId, String content) {
        Checklist checklist = getById(checklistId);
        if (checklist == null) {
            throw new BusinessException("检查清单不存在");
        }
        
        // 获取当前最大排序号
        int maxOrder = 0;
        List<ChecklistItem> existing = getItemsByChecklist(checklistId);
        if (!existing.isEmpty()) {
            maxOrder = existing.stream()
                    .mapToInt(ChecklistItem::getSortOrder)
                    .max()
                    .orElse(0);
        }
        
        ChecklistItem item = new ChecklistItem();
        item.setChecklistId(checklistId);
        item.setContent(content);
        item.setCompleted(false);
        item.setSortOrder(maxOrder + 1);
        // createdBy/createdAt 由 MyBatis-Plus 自动填充
        
        checklistItemMapper.insert(item);
        return item;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ChecklistItem updateItem(Long itemId, String content) {
        ChecklistItem item = checklistItemMapper.selectById(itemId);
        if (item == null) {
            throw new BusinessException("检查项不存在");
        }
        
        item.setContent(content);
        // updatedBy/updatedAt 由 MyBatis-Plus 自动填充
        
        checklistItemMapper.updateById(item);
        return item;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteItem(Long itemId) {
        ChecklistItem item = checklistItemMapper.selectById(itemId);
        if (item == null) {
            throw new BusinessException("检查项不存在");
        }
        
        item.setDeleted(1);
        // updatedBy/updatedAt 由 MyBatis-Plus 自动填充
        checklistItemMapper.updateById(item);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void completeItem(Long itemId) {
        ChecklistItem item = checklistItemMapper.selectById(itemId);
        if (item == null) {
            throw new BusinessException("检查项不存在");
        }
        
        item.setCompleted(true);
        item.setCompletedAt(LocalDateTime.now());
        item.setCompletedBy(UserContext.getUserId());
        // updatedBy/updatedAt 由 MyBatis-Plus 自动填充
        
        checklistItemMapper.updateById(item);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void uncompleteItem(Long itemId) {
        ChecklistItem item = checklistItemMapper.selectById(itemId);
        if (item == null) {
            throw new BusinessException("检查项不存在");
        }
        
        item.setCompleted(false);
        item.setCompletedAt(null);
        item.setCompletedBy(null);
        // updatedBy/updatedAt 由 MyBatis-Plus 自动填充
        
        checklistItemMapper.updateById(item);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void batchCompleteItems(List<Long> itemIds) {
        checklistItemMapper.batchUpdateCompleted(itemIds, true, UserContext.getUserId());
    }

    @Override
    public List<ChecklistItem> getItemsByChecklist(Long checklistId) {
        return checklistItemMapper.selectByChecklistId(checklistId);
    }

    @Override
    public int getChecklistProgress(Long checklistId) {
        int total = checklistItemMapper.countByChecklistId(checklistId);
        if (total == 0) {
            return 0;
        }
        int completed = checklistItemMapper.countCompletedByChecklistId(checklistId);
        return (completed * 100) / total;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void reorderItems(Long checklistId, List<Long> itemIds) {
        for (int i = 0; i < itemIds.size(); i++) {
            ChecklistItem item = checklistItemMapper.selectById(itemIds.get(i));
            if (item != null && item.getChecklistId().equals(checklistId)) {
                item.setSortOrder(i + 1);
                // updatedBy/updatedAt 由 MyBatis-Plus 自动填充
                checklistItemMapper.updateById(item);
            }
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Checklist copyChecklist(Long checklistId, Long targetTaskId) {
        Checklist source = getById(checklistId);
        if (source == null) {
            throw new BusinessException("检查清单不存在");
        }
        
        // 复制检查清单
        Checklist newChecklist = new Checklist();
        newChecklist.setTaskId(targetTaskId);
        newChecklist.setTitle(source.getTitle());
        newChecklist.setSortOrder(source.getSortOrder());
        // createdBy/createdAt 由 MyBatis-Plus 自动填充
        save(newChecklist);
        
        // 复制检查项
        List<ChecklistItem> items = getItemsByChecklist(checklistId);
        for (ChecklistItem item : items) {
            ChecklistItem newItem = new ChecklistItem();
            newItem.setChecklistId(newChecklist.getId());
            newItem.setContent(item.getContent());
            newItem.setCompleted(false);
            newItem.setSortOrder(item.getSortOrder());
            // createdBy/createdAt 由 MyBatis-Plus 自动填充
            checklistItemMapper.insert(newItem);
        }
        
        return newChecklist;
    }
}