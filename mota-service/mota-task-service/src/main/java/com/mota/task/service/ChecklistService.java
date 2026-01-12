package com.mota.task.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.mota.task.entity.Checklist;
import com.mota.task.entity.ChecklistItem;

import java.util.List;

/**
 * 检查清单服务接口
 */
public interface ChecklistService extends IService<Checklist> {

    /**
     * 创建检查清单
     */
    Checklist createChecklist(Long taskId, String title);

    /**
     * 更新检查清单
     */
    Checklist updateChecklist(Long checklistId, String title);

    /**
     * 删除检查清单
     */
    void deleteChecklist(Long checklistId);

    /**
     * 获取任务的检查清单列表
     */
    List<Checklist> getChecklistsByTask(Long taskId);

    /**
     * 添加检查项
     */
    ChecklistItem addItem(Long checklistId, String content);

    /**
     * 更新检查项
     */
    ChecklistItem updateItem(Long itemId, String content);

    /**
     * 删除检查项
     */
    void deleteItem(Long itemId);

    /**
     * 完成检查项
     */
    void completeItem(Long itemId);

    /**
     * 取消完成检查项
     */
    void uncompleteItem(Long itemId);

    /**
     * 批量完成检查项
     */
    void batchCompleteItems(List<Long> itemIds);

    /**
     * 获取检查清单的所有项
     */
    List<ChecklistItem> getItemsByChecklist(Long checklistId);

    /**
     * 获取检查清单完成进度
     */
    int getChecklistProgress(Long checklistId);

    /**
     * 调整检查项顺序
     */
    void reorderItems(Long checklistId, List<Long> itemIds);

    /**
     * 复制检查清单到另一个任务
     */
    Checklist copyChecklist(Long checklistId, Long targetTaskId);
}