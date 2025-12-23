/**
 * 数据导出工具
 * 支持导出为 Excel、CSV、JSON 格式
 */

export type ExportFormat = 'excel' | 'csv' | 'json'

export interface ExportColumn {
  key: string
  title: string
  render?: (value: unknown, record: Record<string, unknown>) => string
}

export interface ExportOptions {
  filename: string
  format: ExportFormat
  columns: ExportColumn[]
  data: Record<string, unknown>[]
  sheetName?: string
}

/**
 * 将数据转换为 CSV 格式
 */
const convertToCSV = (columns: ExportColumn[], data: Record<string, unknown>[]): string => {
  // 表头
  const headers = columns.map(col => `"${col.title}"`).join(',')
  
  // 数据行
  const rows = data.map(record => {
    return columns.map(col => {
      let value = record[col.key]
      if (col.render) {
        value = col.render(value, record)
      }
      // 处理特殊字符
      if (value === null || value === undefined) {
        return '""'
      }
      const strValue = String(value).replace(/"/g, '""')
      return `"${strValue}"`
    }).join(',')
  }).join('\n')
  
  return `${headers}\n${rows}`
}

/**
 * 将数据转换为 JSON 格式
 */
const convertToJSON = (columns: ExportColumn[], data: Record<string, unknown>[]): string => {
  const result = data.map(record => {
    const obj: Record<string, unknown> = {}
    columns.forEach(col => {
      let value = record[col.key]
      if (col.render) {
        value = col.render(value, record)
      }
      obj[col.title] = value
    })
    return obj
  })
  return JSON.stringify(result, null, 2)
}

/**
 * 下载文件
 */
const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob(['\ufeff' + content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * 导出数据
 */
export const exportData = (options: ExportOptions): void => {
  const { filename, format, columns, data, sheetName = 'Sheet1' } = options
  
  switch (format) {
    case 'csv': {
      const csvContent = convertToCSV(columns, data)
      downloadFile(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8')
      break
    }
    case 'json': {
      const jsonContent = convertToJSON(columns, data)
      downloadFile(jsonContent, `${filename}.json`, 'application/json;charset=utf-8')
      break
    }
    case 'excel': {
      // 使用简化的 Excel 导出（实际项目中可以使用 xlsx 库）
      // 这里使用 HTML 表格格式，Excel 可以识别
      const htmlContent = generateExcelHTML(columns, data, sheetName)
      downloadFile(htmlContent, `${filename}.xls`, 'application/vnd.ms-excel;charset=utf-8')
      break
    }
  }
}

/**
 * 生成 Excel HTML 格式
 */
const generateExcelHTML = (
  columns: ExportColumn[], 
  data: Record<string, unknown>[],
  sheetName: string
): string => {
  const headers = columns.map(col => `<th style="background:#f0f0f0;font-weight:bold;border:1px solid #ccc;padding:8px;">${col.title}</th>`).join('')
  
  const rows = data.map(record => {
    const cells = columns.map(col => {
      let value = record[col.key]
      if (col.render) {
        value = col.render(value, record)
      }
      return `<td style="border:1px solid #ccc;padding:8px;">${value ?? ''}</td>`
    }).join('')
    return `<tr>${cells}</tr>`
  }).join('')
  
  return `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
    <head>
      <meta charset="UTF-8">
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>${sheetName}</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
    </head>
    <body>
      <table border="1">
        <thead><tr>${headers}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </body>
    </html>
  `
}

/**
 * 导出项目数据
 */
export const exportProjects = (projects: Record<string, unknown>[], format: ExportFormat = 'excel') => {
  const columns: ExportColumn[] = [
    { key: 'key', title: '项目标识' },
    { key: 'name', title: '项目名称' },
    { key: 'description', title: '项目描述' },
    { key: 'status', title: '状态', render: (v) => {
      const statusMap: Record<string, string> = {
        active: '进行中',
        completed: '已完成',
        archived: '已归档'
      }
      return statusMap[v as string] || String(v)
    }},
    { key: 'memberCount', title: '成员数' },
    { key: 'issueCount', title: '事项数' },
    { key: 'createdAt', title: '创建时间' },
  ]
  
  exportData({
    filename: `项目列表_${new Date().toLocaleDateString()}`,
    format,
    columns,
    data: projects,
    sheetName: '项目列表'
  })
}

/**
 * 导出事项数据
 */
export const exportIssues = (issues: Record<string, unknown>[], format: ExportFormat = 'excel') => {
  const columns: ExportColumn[] = [
    { key: 'key', title: '事项编号' },
    { key: 'title', title: '标题' },
    { key: 'type', title: '类型', render: (v) => {
      const typeMap: Record<string, string> = {
        story: '用户故事',
        task: '任务',
        bug: '缺陷',
        feature: '新功能'
      }
      return typeMap[v as string] || String(v)
    }},
    { key: 'status', title: '状态', render: (v) => {
      const statusMap: Record<string, string> = {
        open: '待处理',
        in_progress: '进行中',
        testing: '测试中',
        done: '已完成',
        closed: '已关闭'
      }
      return statusMap[v as string] || String(v)
    }},
    { key: 'priority', title: '优先级', render: (v) => {
      const priorityMap: Record<string, string> = {
        highest: '最高',
        high: '高',
        medium: '中',
        low: '低',
        lowest: '最低'
      }
      return priorityMap[v as string] || String(v)
    }},
    { key: 'assignee', title: '负责人' },
    { key: 'storyPoints', title: '故事点' },
    { key: 'createdAt', title: '创建时间' },
    { key: 'dueDate', title: '截止日期' },
  ]
  
  exportData({
    filename: `事项列表_${new Date().toLocaleDateString()}`,
    format,
    columns,
    data: issues,
    sheetName: '事项列表'
  })
}

/**
 * 导出迭代数据
 */
export const exportIterations = (iterations: Record<string, unknown>[], format: ExportFormat = 'excel') => {
  const columns: ExportColumn[] = [
    { key: 'name', title: '迭代名称' },
    { key: 'goal', title: '迭代目标' },
    { key: 'status', title: '状态', render: (v) => {
      const statusMap: Record<string, string> = {
        planning: '规划中',
        active: '进行中',
        completed: '已完成'
      }
      return statusMap[v as string] || String(v)
    }},
    { key: 'startDate', title: '开始日期' },
    { key: 'endDate', title: '结束日期' },
    { key: 'issueCount', title: '事项数' },
    { key: 'completedCount', title: '已完成数' },
    { key: 'progress', title: '进度', render: (v) => `${v}%` },
  ]
  
  exportData({
    filename: `迭代列表_${new Date().toLocaleDateString()}`,
    format,
    columns,
    data: iterations,
    sheetName: '迭代列表'
  })
}

/**
 * 导出成员数据
 */
export const exportMembers = (members: Record<string, unknown>[], format: ExportFormat = 'excel') => {
  const columns: ExportColumn[] = [
    { key: 'name', title: '姓名' },
    { key: 'email', title: '邮箱' },
    { key: 'phone', title: '手机号' },
    { key: 'role', title: '角色', render: (v) => {
      const roleMap: Record<string, string> = {
        admin: '管理员',
        member: '成员',
        guest: '访客'
      }
      return roleMap[v as string] || String(v)
    }},
    { key: 'department', title: '部门' },
    { key: 'joinedAt', title: '加入时间' },
  ]
  
  exportData({
    filename: `成员列表_${new Date().toLocaleDateString()}`,
    format,
    columns,
    data: members,
    sheetName: '成员列表'
  })
}

export default {
  exportData,
  exportProjects,
  exportIssues,
  exportIterations,
  exportMembers
}