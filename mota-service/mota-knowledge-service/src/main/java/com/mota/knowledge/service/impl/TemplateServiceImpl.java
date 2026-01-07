package com.mota.knowledge.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mota.knowledge.entity.Template;
import com.mota.knowledge.mapper.TemplateMapper;
import com.mota.knowledge.service.TemplateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 模板服务实现类
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TemplateServiceImpl implements TemplateService {

    private final TemplateMapper templateMapper;

    @Override
    @Transactional
    public Template createTemplate(Long enterpriseId, String name, String type, String category,
                                    String content, String description, Long userId) {
        Template template = new Template();
        template.setEnterpriseId(enterpriseId);
        template.setName(name);
        template.setType(type);
        template.setCategory(category);
        template.setContent(content);
        template.setDescription(description);
        template.setUseCount(0);
        template.setStatus(1);
        template.setCreatedBy(userId);
        template.setCreatedAt(LocalDateTime.now());
        template.setUpdatedAt(LocalDateTime.now());
        template.setDeleted(0);
        
        templateMapper.insert(template);
        return template;
    }

    @Override
    public IPage<Template> getTemplateList(Long enterpriseId, String type, String category, 
                                            int page, int size) {
        Page<Template> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<Template> wrapper = new LambdaQueryWrapper<>();
        
        // 包含企业模板和系统模板
        wrapper.and(w -> w.eq(Template::getEnterpriseId, enterpriseId)
                         .or()
                         .isNull(Template::getEnterpriseId))
               .eq(Template::getDeleted, 0)
               .eq(Template::getStatus, 1);
        
        if (type != null && !type.isEmpty()) {
            wrapper.eq(Template::getType, type);
        }
        if (category != null && !category.isEmpty()) {
            wrapper.eq(Template::getCategory, category);
        }
        
        wrapper.orderByDesc(Template::getUseCount)
               .orderByDesc(Template::getUpdatedAt);
        
        return templateMapper.selectPage(pageParam, wrapper);
    }

    @Override
    public List<Template> getSystemTemplates(String type, String category) {
        LambdaQueryWrapper<Template> wrapper = new LambdaQueryWrapper<>();
        wrapper.isNull(Template::getEnterpriseId)
               .eq(Template::getDeleted, 0)
               .eq(Template::getStatus, 1);
        
        if (type != null && !type.isEmpty()) {
            wrapper.eq(Template::getType, type);
        }
        if (category != null && !category.isEmpty()) {
            wrapper.eq(Template::getCategory, category);
        }
        
        wrapper.orderByDesc(Template::getUseCount);
        
        return templateMapper.selectList(wrapper);
    }

    @Override
    public Template getTemplateById(Long id) {
        return templateMapper.selectById(id);
    }

    @Override
    @Transactional
    public void updateTemplate(Long id, String name, String content, String description) {
        Template template = templateMapper.selectById(id);
        if (template != null) {
            if (name != null) {
                template.setName(name);
            }
            if (content != null) {
                template.setContent(content);
            }
            if (description != null) {
                template.setDescription(description);
            }
            template.setUpdatedAt(LocalDateTime.now());
            templateMapper.updateById(template);
        }
    }

    @Override
    @Transactional
    public void deleteTemplate(Long id) {
        Template template = templateMapper.selectById(id);
        if (template != null) {
            template.setDeleted(1);
            template.setUpdatedAt(LocalDateTime.now());
            templateMapper.updateById(template);
        }
    }

    @Override
    @Transactional
    public String useTemplate(Long id) {
        Template template = templateMapper.selectById(id);
        if (template != null) {
            template.setUseCount(template.getUseCount() + 1);
            templateMapper.updateById(template);
            return template.getContent();
        }
        return null;
    }

    @Override
    public List<Template> getPopularTemplates(int limit) {
        LambdaQueryWrapper<Template> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Template::getDeleted, 0)
               .eq(Template::getStatus, 1)
               .orderByDesc(Template::getUseCount)
               .last("LIMIT " + limit);
        
        return templateMapper.selectList(wrapper);
    }

    @Override
    public IPage<Template> searchTemplates(String keyword, int page, int size) {
        Page<Template> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<Template> wrapper = new LambdaQueryWrapper<>();
        
        wrapper.eq(Template::getDeleted, 0)
               .eq(Template::getStatus, 1)
               .and(w -> w.like(Template::getName, keyword)
                         .or()
                         .like(Template::getDescription, keyword))
               .orderByDesc(Template::getUseCount);
        
        return templateMapper.selectPage(pageParam, wrapper);
    }
}