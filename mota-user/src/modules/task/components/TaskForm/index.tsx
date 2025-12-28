/**
 * TaskForm 组件
 * 任务创建/编辑表单
 */

import React from 'react'
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Spin,
} from 'antd'
import dayjs from 'dayjs'
import type { TaskFormProps } from './types'
import { PRIORITY_OPTIONS, FORM_RULES } from './types'
import { useTaskForm, useAssigneeOptions, useDepartmentTaskOptions } from './useTaskForm'
import styles from './index.module.css'

/**
 * TaskForm 主组件
 */
const TaskForm: React.FC<TaskFormProps> = ({
  task,
  projectId,
  departmentTaskId,
  asModal = false,
  visible = true,
  onClose,
  onSuccess,
  onError,
  readonly = false,
  className,
  style,
}) => {
  const {
    form,
    isEditMode,
    submitting,
    handleSubmit,
    handleReset,
  } = useTaskForm({
    task,
    projectId,
    departmentTaskId,
    onSuccess: (newTask) => {
      onSuccess?.(newTask)
      if (asModal) {
        onClose?.()
      }
    },
    onError,
  })

  // 获取负责人选项
  const { options: assigneeOptions, loading: assigneeLoading } = useAssigneeOptions(
    projectId || task?.projectId
  )

  // 获取部门任务选项
  const { options: departmentTaskOptions, loading: deptTaskLoading } = useDepartmentTaskOptions(
    projectId || task?.projectId
  )

  // 渲染表单内容
  const renderFormContent = () => (
    <Form
      form={form}
      layout="vertical"
      disabled={readonly}
      className={asModal ? styles.modalForm : styles.taskForm}
    >
      {/* 基本信息 */}
      <div className={styles.formSection}>
        <div className={styles.sectionTitle}>基本信息</div>

        <Form.Item
          name="name"
          label="任务名称"
          rules={FORM_RULES.name}
        >
          <Input
            placeholder="请输入任务名称"
            maxLength={100}
            showCount
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="任务描述"
        >
          <Input.TextArea
            placeholder="请输入任务描述"
            rows={4}
            maxLength={500}
            showCount
          />
        </Form.Item>
      </div>

      {/* 关联信息 */}
      <div className={styles.formSection}>
        <div className={styles.sectionTitle}>关联信息</div>

        <div className={styles.formRow}>
          <Form.Item
            name="departmentTaskId"
            label="所属部门任务"
            rules={FORM_RULES.departmentTaskId}
          >
            <Select
              placeholder="请选择部门任务"
              options={departmentTaskOptions}
              loading={deptTaskLoading}
              disabled={isEditMode}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>

          <Form.Item
            name="assigneeId"
            label="负责人"
          >
            <Select
              placeholder="请选择负责人"
              options={assigneeOptions}
              loading={assigneeLoading}
              allowClear
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
        </div>
      </div>

      {/* 优先级和时间 */}
      <div className={styles.formSection}>
        <div className={styles.sectionTitle}>优先级和时间</div>

        <Form.Item
          name="priority"
          label="优先级"
        >
          <Select
            placeholder="请选择优先级"
            options={PRIORITY_OPTIONS}
          />
        </Form.Item>

        <div className={styles.formRow}>
          <Form.Item
            name="startDate"
            label="开始日期"
            getValueProps={(value) => ({
              value: value ? dayjs(value) : undefined,
            })}
            getValueFromEvent={(date) => date?.format('YYYY-MM-DD')}
          >
            <DatePicker
              placeholder="选择开始日期"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="endDate"
            label="截止日期"
            getValueProps={(value) => ({
              value: value ? dayjs(value) : undefined,
            })}
            getValueFromEvent={(date) => date?.format('YYYY-MM-DD')}
          >
            <DatePicker
              placeholder="选择截止日期"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </div>
      </div>

      {/* 表单底部 */}
      {!asModal && !readonly && (
        <div className={styles.formFooter}>
          <Button onClick={handleReset}>重置</Button>
          <Button type="primary" onClick={handleSubmit} loading={submitting}>
            {isEditMode ? '保存修改' : '创建任务'}
          </Button>
        </div>
      )}
    </Form>
  )

  // 模态框模式
  if (asModal) {
    return (
      <Modal
        open={visible}
        title={isEditMode ? '编辑任务' : '创建任务'}
        onCancel={onClose}
        onOk={handleSubmit}
        okText={isEditMode ? '保存' : '创建'}
        cancelText="取消"
        confirmLoading={submitting}
        width={640}
        destroyOnClose
      >
        {renderFormContent()}
      </Modal>
    )
  }

  // 普通模式
  return (
    <div className={`${styles.taskForm} ${className || ''}`} style={style}>
      {renderFormContent()}
    </div>
  )
}

export default TaskForm
export type { TaskFormProps } from './types'
export { useTaskForm, useAssigneeOptions, useDepartmentTaskOptions } from './useTaskForm'