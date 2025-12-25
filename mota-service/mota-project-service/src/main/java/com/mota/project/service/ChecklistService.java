package com.mota.project.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.mota.project.entity.Checklist;
import com.mota.project.entity.ChecklistItem;

import java.util.List;
import java.util.Map;

/**
 * 检查清单 Service 接口
 */
public interface ChecklistService extends IService<Checklist> {

    /**
     * 创建检查清单
     */
    Checklist createChecklist(Checklist checklist);

    /**
     * 创建检查清单（包含清单项）
     */
    Checklist createChecklistWithItems(Checklist checklist, List<ChecklistItem> items);

    /**
     * 更新检查清单
     */
    Checklist updateChecklist(Checklist checklist);

    /**
     * 删除检查清单
     */
    boolean deleteChecklist(Long id);

    /**
     * 删除任务的所有检查清单
     */
    boolean deleteByTaskId(Long taskId);

    /**
     * 根据任务ID查询检查清单列表
     */
    List<Checklist> listByTaskId(Long taskId);

    /**
     * 根据任务ID查询检查清单列表（包含清单项）
     */
    List<Checklist> listWithItemsByTaskId(Long taskId);

    /**
     * 更新检查清单排序
     */
    boolean updateSortOrder(List<Checklist> checklists);

    /**
     * 添加清单项
     */
    ChecklistItem addItem(ChecklistItem item);

    /**
     * 批量添加清单项
     */
    boolean batchAddItems(List<ChecklistItem> items);

    /**
     * 更新清单项
     */
    ChecklistItem updateItem(ChecklistItem item);

    /**
     * 删除清单项
     */
    boolean deleteItem(Long itemId);

    /**
     * 切换清单项完成状态
     */
    boolean toggleItemCompleted(Long itemId, Long userId);

    /**
     * 更新清单项完成状态
     */
    boolean updateItemCompleted(Long itemId, boolean completed, Long userId);

    /**
     * 更新清单项排序
     */
    boolean updateItemSortOrder(List<ChecklistItem> items);

    /**
     * 获取清单的完成情况
     */
    Map<String, Object> getChecklistCompletion(Long checklistId);

    /**
     * 获取任务的所有清单项完成情况
     */
    Map<String, Object> getTaskChecklistCompletion(Long taskId);

    /**
     * 计算任务的检查清单完成百分比
     */
    Integer calculateTaskChecklistProgress(Long taskId);

    /**
     * 根据清单ID查询清单项列表
     */
    List<ChecklistItem> listItemsByChecklistId(Long checklistId);

    /**
     * 根据任务ID查询所有清单项
     */
    List<ChecklistItem> listItemsByTaskId(Long taskId);
}