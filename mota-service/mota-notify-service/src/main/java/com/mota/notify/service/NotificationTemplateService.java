package com.mota.notify.service;

import com.mota.notify.entity.NotificationTemplate;

import java.util.List;
import java.util.Map;

/**
 * 通知模板服务接口
 */
public interface NotificationTemplateService {

    /**
     * 根据ID获取模板
     */
    NotificationTemplate getById(Long id);

    /**
     * 根据编码获取模板
     */
    NotificationTemplate getByCode(String code);

    /**
     * 根据租户和编码获取模板
     */
    NotificationTemplate getByTenantAndCode(Long tenantId, String code);

    /**
     * 获取租户的所有模板
     */
    List<NotificationTemplate> getByTenantId(Long tenantId);

    /**
     * 获取指定类型的模板
     */
    List<NotificationTemplate> getByType(String notifyType);

    /**
     * 创建模板
     */
    NotificationTemplate create(NotificationTemplate template);

    /**
     * 更新模板
     */
    NotificationTemplate update(NotificationTemplate template);

    /**
     * 删除模板
     */
    void delete(Long id);

    /**
     * 启用模板
     */
    void enable(Long id);

    /**
     * 禁用模板
     */
    void disable(Long id);

    /**
     * 渲染模板内容
     */
    String renderContent(String templateCode, Map<String, Object> variables);

    /**
     * 渲染模板标题
     */
    String renderTitle(String templateCode, Map<String, Object> variables);

    /**
     * 渲染完整通知
     */
    RenderedNotification render(String templateCode, Map<String, Object> variables);

    /**
     * 验证模板变量
     */
    boolean validateVariables(String templateCode, Map<String, Object> variables);

    /**
     * 获取模板所需变量列表
     */
    List<String> getRequiredVariables(String templateCode);

    /**
     * 复制模板到租户
     */
    NotificationTemplate copyToTenant(Long templateId, Long tenantId);

    /**
     * 初始化系统默认模板
     */
    void initSystemTemplates();

    /**
     * 渲染后的通知
     */
    class RenderedNotification {
        private String title;
        private String content;
        private String channel;
        private String type;
        private String category;

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }

        public String getChannel() {
            return channel;
        }

        public void setChannel(String channel) {
            this.channel = channel;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public String getCategory() {
            return category;
        }

        public void setCategory(String category) {
            this.category = category;
        }
    }
}