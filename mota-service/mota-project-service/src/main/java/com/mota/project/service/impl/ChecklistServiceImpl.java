package com.mota.project.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mota.project.entity.Checklist;
import com.mota.project.entity.ChecklistItem;
import com.mota.project.mapper.ChecklistItemMapper;
import com.mota.project.mapper.ChecklistMapper;
import com.mota.project.service.ChecklistService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 检查清单 Service 实现类
 */
@Service
@RequiredArgsConstructor
public class ChecklistServiceImpl extends ServiceImpl<ChecklistMapper, Checklist> implements ChecklistService {

    private final ChecklistMapper checklistMapper;
    private final ChecklistItemMapper checklistItemMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Checklist createChecklist(Checklist checklist) {
        // 设置排序顺序
        if (checklist.getSortOrder() == null) {
            Integer maxSortOrder = checklistMapper.getMaxSortOrder(checklist.getTaskId());
            checklist.setSortOrder(maxSortOrder != null ? maxSortOrder + 1 : 0);
        }
        
        save(checklist);
        return checklist;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Checklist createChecklistWithItems(Checklist checklist, List<ChecklistItem> items) {
        // 创建清单
        createChecklist(checklist);
        
        // 创建清单项
        if (items != null && !items.isEmpty()) {
            int sortOrder = 0;
            for (ChecklistItem item : items) {
                item.setChecklistId(checklist.getId());
                item.setSortOrder(sortOrder++);
                if (item.getIsCompleted() == null) {
                    item.setIsCompleted(0);
                }
            }
            checklistItemMapper.batchInsert(items);
            checklist.setItems(items);
        }
        
        return checklist;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Checklist updateChecklist(Checklist checklist) {
        updateById(checklist);
        return getById(checklist.getId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteChecklist(Long id) {
        // 先删除清单项
        checklistItemMapper.deleteByChecklistId(id);
        // 再删除清单
        return removeById(id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteByTaskId(Long taskId) {
        // 获取任务的所有清单
        List<Checklist> checklists = listByTaskId(taskId);
        
        // 删除每个清单的清单项
        for (Checklist checklist : checklists) {
            checklistItemMapper.deleteByChecklistId(checklist.getId());
        }
        
        // 删除清单
        return checklistMapper.deleteByTaskId(taskId) >= 0;
    }

    @Override
    public List<Checklist> listByTaskId(Long taskId) {
        return checklistMapper.selectByTaskId(taskId);
    }

    @Override
    public List<Checklist> listWithItemsByTaskId(Long taskId) {
        List<Checklist> checklists = checklistMapper.selectWithItemsByTaskId(taskId);
        
        // 计算每个清单的完成情况
        for (Checklist checklist : checklists) {
            if (checklist.getItems() != null) {
                int total = checklist.getItems().size();
                int completed = (int) checklist.getItems().stream()
                        .filter(item -> item.getIsCompleted() != null && item.getIsCompleted() == 1)
                        .count();
                checklist.setTotalCount(total);
                checklist.setCompletedCount(completed);
            } else {
                checklist.setTotalCount(0);
                checklist.setCompletedCount(0);
            }
        }
        
        return checklists;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateSortOrder(List<Checklist> checklists) {
        if (checklists == null || checklists.isEmpty()) {
            return true;
        }
        return checklistMapper.batchUpdateSortOrder(checklists) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ChecklistItem addItem(ChecklistItem item) {
        // 设置排序顺序
        if (item.getSortOrder() == null) {
            Integer maxSortOrder = checklistItemMapper.getMaxSortOrder(item.getChecklistId());
            item.setSortOrder(maxSortOrder != null ? maxSortOrder + 1 : 0);
        }
        
        // 设置默认完成状态
        if (item.getIsCompleted() == null) {
            item.setIsCompleted(0);
        }
        
        checklistItemMapper.insert(item);
        return item;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean batchAddItems(List<ChecklistItem> items) {
        if (items == null || items.isEmpty()) {
            return true;
        }
        
        for (ChecklistItem item : items) {
            if (item.getIsCompleted() == null) {
                item.setIsCompleted(0);
            }
        }
        
        return checklistItemMapper.batchInsert(items) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ChecklistItem updateItem(ChecklistItem item) {
        checklistItemMapper.updateById(item);
        return checklistItemMapper.selectById(item.getId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteItem(Long itemId) {
        return checklistItemMapper.deleteById(itemId) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean toggleItemCompleted(Long itemId, Long userId) {
        ChecklistItem item = checklistItemMapper.selectById(itemId);
        if (item == null) {
            return false;
        }
        
        boolean newCompleted = item.getIsCompleted() == null || item.getIsCompleted() == 0;
        return updateItemCompleted(itemId, newCompleted, userId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateItemCompleted(Long itemId, boolean completed, Long userId) {
        return checklistItemMapper.updateCompleted(itemId, completed ? 1 : 0, userId) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateItemSortOrder(List<ChecklistItem> items) {
        if (items == null || items.isEmpty()) {
            return true;
        }
        return checklistItemMapper.batchUpdateSortOrder(items) > 0;
    }

    @Override
    public Map<String, Object> getChecklistCompletion(Long checklistId) {
        Map<String, Object> result = checklistItemMapper.countCompletionByChecklistId(checklistId);
        if (result == null) {
            result = new HashMap<>();
            result.put("total", 0);
            result.put("completed", 0);
        }
        
        // 计算完成百分比
        int total = ((Number) result.getOrDefault("total", 0)).intValue();
        int completed = ((Number) result.getOrDefault("completed", 0)).intValue();
        int percentage = total > 0 ? (completed * 100 / total) : 0;
        result.put("percentage", percentage);
        
        return result;
    }

    @Override
    public Map<String, Object> getTaskChecklistCompletion(Long taskId) {
        Map<String, Object> result = checklistItemMapper.countCompletionByTaskId(taskId);
        if (result == null) {
            result = new HashMap<>();
            result.put("total", 0);
            result.put("completed", 0);
        }
        
        // 计算完成百分比
        int total = ((Number) result.getOrDefault("total", 0)).intValue();
        int completed = ((Number) result.getOrDefault("completed", 0)).intValue();
        int percentage = total > 0 ? (completed * 100 / total) : 0;
        result.put("percentage", percentage);
        
        return result;
    }

    @Override
    public Integer calculateTaskChecklistProgress(Long taskId) {
        Map<String, Object> completion = getTaskChecklistCompletion(taskId);
        return (Integer) completion.get("percentage");
    }

    @Override
    public List<ChecklistItem> listItemsByChecklistId(Long checklistId) {
        return checklistItemMapper.selectByChecklistId(checklistId);
    }

    @Override
    public List<ChecklistItem> listItemsByTaskId(Long taskId) {
        return checklistItemMapper.selectByTaskId(taskId);
    }
}