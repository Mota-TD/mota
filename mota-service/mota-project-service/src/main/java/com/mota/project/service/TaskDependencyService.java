package com.mota.project.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.mota.project.dto.CriticalPathDTO;
import com.mota.project.dto.DependencyConflictDTO;
import com.mota.project.entity.TaskDependency;

import java.util.List;

/**
 * 任务依赖关系 Service 接口
 */
public interface TaskDependencyService extends IService<TaskDependency> {

    /**
     * 创建任务依赖关系
     */
    TaskDependency createDependency(TaskDependency dependency);

    /**
     * 批量创建任务依赖关系
     */
    boolean batchCreateDependencies(List<TaskDependency> dependencies);

    /**
     * 更新任务依赖关系
     */
    TaskDependency updateDependency(TaskDependency dependency);

    /**
     * 删除任务依赖关系
     */
    boolean deleteDependency(Long id);

    /**
     * 删除任务的所有依赖关系
     */
    boolean deleteByTaskId(Long taskId);

    /**
     * 根据后继任务ID查询所有前置依赖
     */
    List<TaskDependency> listBySuccessorId(Long successorId);

    /**
     * 根据前置任务ID查询所有后继依赖
     */
    List<TaskDependency> listByPredecessorId(Long predecessorId);

    /**
     * 根据任务ID查询所有相关依赖
     */
    List<TaskDependency> listByTaskId(Long taskId);

    /**
     * 根据项目ID查询所有任务依赖关系
     */
    List<TaskDependency> listByProjectId(Long projectId);

    /**
     * 检查是否存在依赖关系
     */
    boolean existsDependency(Long predecessorId, Long successorId);

    /**
     * 检查是否会形成循环依赖
     */
    boolean wouldCreateCycle(Long predecessorId, Long successorId);

    /**
     * 获取任务的所有前置任务ID（递归）
     */
    List<Long> getAllPredecessorIds(Long taskId);

    /**
     * 获取任务的所有后继任务ID（递归）
     */
    List<Long> getAllSuccessorIds(Long taskId);

    /**
     * 计算项目的关键路径
     */
    List<Long> calculateCriticalPath(Long projectId);

    /**
     * 验证任务是否可以开始（检查前置任务是否完成）
     */
    boolean canTaskStart(Long taskId);

    /**
     * 获取阻塞当前任务的前置任务列表
     */
    List<Long> getBlockingPredecessors(Long taskId);

    // ==================== 新增方法 ====================

    /**
     * 检测任务的依赖冲突
     * @param taskId 任务ID
     * @return 冲突列表
     */
    List<DependencyConflictDTO> detectConflicts(Long taskId);

    /**
     * 检测项目的所有依赖冲突
     * @param projectId 项目ID
     * @return 冲突列表
     */
    List<DependencyConflictDTO> detectProjectConflicts(Long projectId);

    /**
     * 验证依赖关系是否有效（考虑日期和状态）
     * @param dependency 依赖关系
     * @return 验证结果，如果有冲突返回冲突信息，否则返回null
     */
    DependencyConflictDTO validateDependency(TaskDependency dependency);

    /**
     * 计算项目的详细关键路径信息
     * @param projectId 项目ID
     * @return 关键路径详细信息
     */
    CriticalPathDTO calculateCriticalPathDetail(Long projectId);

    /**
     * 根据依赖类型计算任务的建议开始日期
     * @param taskId 任务ID
     * @return 建议的开始日期
     */
    java.time.LocalDate calculateSuggestedStartDate(Long taskId);

    /**
     * 验证任务是否可以完成（检查FF和SF依赖）
     * @param taskId 任务ID
     * @return 是否可以完成
     */
    boolean canTaskComplete(Long taskId);

    /**
     * 获取阻塞当前任务完成的前置任务列表
     * @param taskId 任务ID
     * @return 阻塞任务ID列表
     */
    List<Long> getBlockingForCompletion(Long taskId);

    /**
     * 获取依赖关系的详细信息（包含任务名称等）
     * @param projectId 项目ID
     * @return 带详细信息的依赖列表
     */
    List<DependencyDetailDTO> listDependencyDetails(Long projectId);

    /**
     * 依赖详情DTO
     */
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    class DependencyDetailDTO {
        private Long id;
        private Long predecessorId;
        private String predecessorName;
        private java.time.LocalDate predecessorStartDate;
        private java.time.LocalDate predecessorEndDate;
        private String predecessorStatus;
        private Long successorId;
        private String successorName;
        private java.time.LocalDate successorStartDate;
        private java.time.LocalDate successorEndDate;
        private String successorStatus;
        private String dependencyType;
        private Integer lagDays;
        private String description;
        private boolean hasConflict;
        private String conflictDescription;
    }
}