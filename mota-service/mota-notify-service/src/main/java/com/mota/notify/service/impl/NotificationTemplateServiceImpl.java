package com.mota.notify.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.mota.common.core.exception.BusinessException;
import com.mota.notify.entity.NotificationTemplate;
import com.mota.notify.mapper.NotificationTemplateMapper;
import com.mota.notify.service.NotificationTemplateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 通知模板服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationTemplateServiceImpl implements NotificationTemplateService {

    private final NotificationTemplateMapper templateMapper;

    // 变量匹配模式 ${variableName}
    private static final Pattern VARIABLE_PATTERN = Pattern.compile("\\$\\{([^}]+)}");

    @Override
    public NotificationTemplate getById(Long id) {
        return templateMapper.selectById(id);
    }

    @Override
    public NotificationTemplate getByCode(String code) {
        LambdaQueryWrapper<NotificationTemplate> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(NotificationTemplate::getCode, code)
               .eq(NotificationTemplate::getEnabled, true)
               .isNull(NotificationTemplate::getTenantId);
        return templateMapper.selectOne(wrapper);
    }

    @Override
    public NotificationTemplate getByTenantAndCode(Long tenantId, String code) {
        // 先查租户自定义模板
        LambdaQueryWrapper<NotificationTemplate> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(NotificationTemplate::getTenantId, tenantId)
               .eq(NotificationTemplate::getCode, code)
               .eq(NotificationTemplate::getEnabled, true);
        NotificationTemplate template = templateMapper.selectOne(wrapper);
        
        // 如果没有，使用系统模板
        if (template == null) {
            template = getByCode(code);
        }
        
        return template;
    }

    @Override
    public List<NotificationTemplate> getByTenantId(Long tenantId) {
        LambdaQueryWrapper<NotificationTemplate> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(NotificationTemplate::getTenantId, tenantId)
               .orderByAsc(NotificationTemplate::getNotifyType)
               .orderByAsc(NotificationTemplate::getCode);
        return templateMapper.selectList(wrapper);
    }

    @Override
    public List<NotificationTemplate> getByType(String notifyType) {
        LambdaQueryWrapper<NotificationTemplate> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(NotificationTemplate::getNotifyType, notifyType)
               .eq(NotificationTemplate::getEnabled, true)
               .orderByAsc(NotificationTemplate::getCode);
        return templateMapper.selectList(wrapper);
    }

    @Override
    @Transactional
    public NotificationTemplate create(NotificationTemplate template) {
        // 检查编码是否重复
        LambdaQueryWrapper<NotificationTemplate> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(NotificationTemplate::getCode, template.getCode());
        if (template.getTenantId() != null) {
            wrapper.eq(NotificationTemplate::getTenantId, template.getTenantId());
        } else {
            wrapper.isNull(NotificationTemplate::getTenantId);
        }
        
        if (templateMapper.selectCount(wrapper) > 0) {
            throw new BusinessException("模板编码已存在");
        }
        
        template.setEnabled(true);
        templateMapper.insert(template);
        log.info("创建通知模板: code={}", template.getCode());
        return template;
    }

    @Override
    @Transactional
    public NotificationTemplate update(NotificationTemplate template) {
        NotificationTemplate existing = templateMapper.selectById(template.getId());
        if (existing == null) {
            throw new BusinessException("模板不存在");
        }
        
        templateMapper.updateById(template);
        log.info("更新通知模板: id={}, code={}", template.getId(), template.getCode());
        return template;
    }

    @Override
    @Transactional
    public void delete(Long id) {
        templateMapper.deleteById(id);
        log.info("删除通知模板: id={}", id);
    }

    @Override
    @Transactional
    public void enable(Long id) {
        NotificationTemplate template = templateMapper.selectById(id);
        if (template != null) {
            template.setEnabled(true);
            templateMapper.updateById(template);
            log.info("启用通知模板: id={}", id);
        }
    }

    @Override
    @Transactional
    public void disable(Long id) {
        NotificationTemplate template = templateMapper.selectById(id);
        if (template != null) {
            template.setEnabled(false);
            templateMapper.updateById(template);
            log.info("禁用通知模板: id={}", id);
        }
    }

    @Override
    public String renderContent(String templateCode, Map<String, Object> variables) {
        NotificationTemplate template = getByCode(templateCode);
        if (template == null) {
            throw new BusinessException("模板不存在: " + templateCode);
        }
        return renderTemplate(template.getContentTemplate(), variables);
    }

    @Override
    public String renderTitle(String templateCode, Map<String, Object> variables) {
        NotificationTemplate template = getByCode(templateCode);
        if (template == null) {
            throw new BusinessException("模板不存在: " + templateCode);
        }
        return renderTemplate(template.getTitleTemplate(), variables);
    }

    @Override
    public RenderedNotification render(String templateCode, Map<String, Object> variables) {
        NotificationTemplate template = getByCode(templateCode);
        if (template == null) {
            throw new BusinessException("模板不存在: " + templateCode);
        }
        
        RenderedNotification rendered = new RenderedNotification();
        rendered.setTitle(renderTemplate(template.getTitleTemplate(), variables));
        rendered.setContent(renderTemplate(template.getContentTemplate(), variables));
        rendered.setChannel(template.getChannel());
        rendered.setType(template.getNotifyType());
        rendered.setCategory(template.getCategory());
        
        return rendered;
    }

    @Override
    public boolean validateVariables(String templateCode, Map<String, Object> variables) {
        List<String> required = getRequiredVariables(templateCode);
        for (String var : required) {
            if (!variables.containsKey(var) || variables.get(var) == null) {
                return false;
            }
        }
        return true;
    }

    @Override
    public List<String> getRequiredVariables(String templateCode) {
        NotificationTemplate template = getByCode(templateCode);
        if (template == null) {
            return new ArrayList<>();
        }
        
        Set<String> variables = new HashSet<>();
        
        // 从标题模板提取变量
        extractVariables(template.getTitleTemplate(), variables);
        
        // 从内容模板提取变量
        extractVariables(template.getContentTemplate(), variables);
        
        return new ArrayList<>(variables);
    }

    @Override
    @Transactional
    public NotificationTemplate copyToTenant(Long templateId, Long tenantId) {
        NotificationTemplate source = templateMapper.selectById(templateId);
        if (source == null) {
            throw new BusinessException("源模板不存在");
        }
        
        NotificationTemplate copy = new NotificationTemplate();
        copy.setTenantId(tenantId);
        copy.setCode(source.getCode());
        copy.setName(source.getName());
        copy.setNotifyType(source.getNotifyType());
        copy.setChannel(source.getChannel());
        copy.setCategory(source.getCategory());
        copy.setTitleTemplate(source.getTitleTemplate());
        copy.setContentTemplate(source.getContentTemplate());
        copy.setVariables(source.getVariables());
        copy.setEnabled(true);
        
        templateMapper.insert(copy);
        log.info("复制模板到租户: templateId={}, tenantId={}", templateId, tenantId);
        
        return copy;
    }

    @Override
    @Transactional
    public void initSystemTemplates() {
        // 检查是否已初始化
        LambdaQueryWrapper<NotificationTemplate> wrapper = new LambdaQueryWrapper<>();
        wrapper.isNull(NotificationTemplate::getTenantId);
        if (templateMapper.selectCount(wrapper) > 0) {
            log.info("系统模板已存在，跳过初始化");
            return;
        }
        
        // 创建系统默认模板
        createSystemTemplate("TASK_ASSIGNED", "任务分配通知", "task", "app",
            "您有新任务", "任务「${taskName}」已分配给您，请及时处理。截止日期：${dueDate}");
        
        createSystemTemplate("TASK_COMPLETED", "任务完成通知", "task", "app",
            "任务已完成", "任务「${taskName}」已由${completedBy}完成。");
        
        createSystemTemplate("TASK_OVERDUE", "任务逾期通知", "task", "app",
            "任务已逾期", "任务「${taskName}」已逾期，请尽快处理。");
        
        createSystemTemplate("PROJECT_CREATED", "项目创建通知", "project", "app",
            "新项目创建", "项目「${projectName}」已创建，您已被添加为项目成员。");
        
        createSystemTemplate("DOCUMENT_SHARED", "文档分享通知", "document", "app",
            "文档分享", "${sharedBy}向您分享了文档「${documentName}」。");
        
        createSystemTemplate("COMMENT_MENTION", "@提及通知", "mention", "app",
            "有人@了您", "${mentionBy}在${context}中@了您：${content}");
        
        createSystemTemplate("SYSTEM_ANNOUNCEMENT", "系统公告", "system", "app",
            "${title}", "${content}");
        
        createSystemTemplate("REMINDER", "提醒通知", "reminder", "app",
            "提醒", "${content}");
        
        log.info("系统模板初始化完成");
    }

    /**
     * 渲染模板
     */
    private String renderTemplate(String template, Map<String, Object> variables) {
        if (template == null || template.isEmpty()) {
            return "";
        }
        
        if (variables == null || variables.isEmpty()) {
            return template;
        }
        
        String result = template;
        Matcher matcher = VARIABLE_PATTERN.matcher(template);
        
        while (matcher.find()) {
            String variable = matcher.group(1);
            Object value = variables.get(variable);
            if (value != null) {
                result = result.replace("${" + variable + "}", value.toString());
            }
        }
        
        return result;
    }

    /**
     * 提取模板中的变量
     */
    private void extractVariables(String template, Set<String> variables) {
        if (template == null || template.isEmpty()) {
            return;
        }
        
        Matcher matcher = VARIABLE_PATTERN.matcher(template);
        while (matcher.find()) {
            variables.add(matcher.group(1));
        }
    }

    /**
     * 创建系统模板
     */
    private void createSystemTemplate(String code, String name, String notifyType, String channel,
                                       String titleTemplate, String contentTemplate) {
        NotificationTemplate template = new NotificationTemplate();
        template.setCode(code);
        template.setName(name);
        template.setNotifyType(notifyType);
        template.setChannel(channel);
        template.setCategory("normal");
        template.setTitleTemplate(titleTemplate);
        template.setContentTemplate(contentTemplate);
        template.setEnabled(true);
        templateMapper.insert(template);
    }
}