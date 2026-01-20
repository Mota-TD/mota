package com.mota.common.mybatis.config;

import com.baomidou.mybatisplus.annotation.DbType;
import com.baomidou.mybatisplus.core.handlers.MetaObjectHandler;
import com.baomidou.mybatisplus.extension.plugins.MybatisPlusInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.BlockAttackInnerInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.OptimisticLockerInnerInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.PaginationInnerInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.TenantLineInnerInterceptor;
import com.mota.common.core.context.TenantContext;
import com.mota.common.core.context.UserContext;
import com.mota.common.mybatis.handler.TenantLineHandlerImpl;
import lombok.extern.slf4j.Slf4j;
import org.apache.ibatis.reflection.MetaObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;

/**
 * MyBatis Plus配置
 * 包含多租户插件、分页插件、乐观锁插件、防全表更新删除插件
 *
 * @author Mota
 * @since 1.0.0
 */
@Slf4j
@Configuration
public class MybatisPlusConfig {

    /**
     * 是否启用多租户
     */
    @Value("${mota.tenant.enabled:true}")
    private boolean tenantEnabled;

    /**
     * 数据库类型
     */
    @Value("${mota.mybatis.db-type:MYSQL}")
    private String dbType;

    /**
     * MyBatis Plus 拦截器
     */
    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();

        // 多租户插件（必须放在最前面）
        if (tenantEnabled) {
            log.info("启用多租户插件");
            TenantLineInnerInterceptor tenantInterceptor = new TenantLineInnerInterceptor(new TenantLineHandlerImpl());
            interceptor.addInnerInterceptor(tenantInterceptor);
        }

        // 分页插件
        DbType type = DbType.getDbType(dbType);
        PaginationInnerInterceptor paginationInterceptor = new PaginationInnerInterceptor(type);
        // 设置最大单页限制数量，默认 500 条，-1 不受限制
        paginationInterceptor.setMaxLimit(1000L);
        // 设置请求的页面大于最大页后操作，true调回到首页，false继续请求
        paginationInterceptor.setOverflow(false);
        interceptor.addInnerInterceptor(paginationInterceptor);

        // 乐观锁插件
        interceptor.addInnerInterceptor(new OptimisticLockerInnerInterceptor());

        // 防全表更新与删除插件
        interceptor.addInnerInterceptor(new BlockAttackInnerInterceptor());

        return interceptor;
    }

    /**
     * 自动填充处理器
     * 自动填充创建时间、更新时间、创建人、更新人、租户ID
     */
    @Bean
    public MetaObjectHandler metaObjectHandler() {
        return new MetaObjectHandler() {
            @Override
            public void insertFill(MetaObject metaObject) {
                LocalDateTime now = LocalDateTime.now();
                
                // 填充时间字段（通用字段，大部分表都有）
                this.fillStrategy(metaObject, "createdAt", now);
                this.fillStrategy(metaObject, "updatedAt", now);
                this.fillStrategy(metaObject, "createTime", now);
                this.fillStrategy(metaObject, "updateTime", now);

                // 填充用户字段（仅当字段存在且有值时）
                Long userId = UserContext.getUserId();
                if (userId != null) {
                    this.fillStrategy(metaObject, "createdBy", userId);
                    this.fillStrategy(metaObject, "updatedBy", userId);
                    this.fillStrategy(metaObject, "createBy", userId);
                    this.fillStrategy(metaObject, "updateBy", userId);
                }

                // 填充部门字段（仅当字段存在且有值时）
                Long deptId = UserContext.getDeptId();
                if (deptId != null) {
                    this.fillStrategy(metaObject, "deptId", deptId);
                }

                // 填充租户字段（仅在启用多租户且字段存在时）
                if (tenantEnabled) {
                    Long tenantId = TenantContext.getTenantId();
                    if (tenantId != null) {
                        this.fillStrategy(metaObject, "tenantId", tenantId);
                    }
                }

                // 填充删除标记（仅当字段存在时）
                this.fillStrategy(metaObject, "deleted", 0);

                // 填充版本号（仅当字段存在时）
                this.fillStrategy(metaObject, "version", 1);
            }

            @Override
            public void updateFill(MetaObject metaObject) {
                LocalDateTime now = LocalDateTime.now();
                
                // 填充更新时间
                this.fillStrategy(metaObject, "updatedAt", now);
                this.fillStrategy(metaObject, "updateTime", now);

                // 填充更新人
                Long userId = UserContext.getUserId();
                if (userId != null) {
                    this.fillStrategy(metaObject, "updatedBy", userId);
                    this.fillStrategy(metaObject, "updateBy", userId);
                }
            }
            
            /**
             * 安全填充策略：只有当实体类有对应的setter方法时才填充
             *
             * 优点：
             * 1. 防止字段不存在导致的SQL错误
             * 2. 支持不同表有不同字段的灵活设计
             * 3. 向后兼容，不影响现有功能
             *
             * 注意事项：
             * 1. 如果实体类忘记添加字段，不会报错（静默失败）
             * 2. 建议配合 @TableField(fill = FieldFill.INSERT) 注解使用
             * 3. 对于必须填充的字段，应在实体类中明确声明
             *
             * @param metaObject 元对象
             * @param fieldName 字段名
             * @param fieldVal 字段值
             * @return MetaObjectHandler
             */
            public MetaObjectHandler fillStrategy(MetaObject metaObject, String fieldName, Object fieldVal) {
                // 检查实体类是否有该字段的setter方法
                if (metaObject.hasSetter(fieldName)) {
                    this.setFieldValByName(fieldName, fieldVal, metaObject);
                } else {
                    // 可选：添加日志记录，便于调试
                    log.debug("字段 [{}] 在实体 [{}] 中不存在，跳过自动填充",
                             fieldName, metaObject.getOriginalObject().getClass().getSimpleName());
                }
                return this;
            }
        };
    }
}