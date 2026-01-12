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
                
                // 填充时间字段
                this.strictInsertFill(metaObject, "createdAt", LocalDateTime.class, now);
                this.strictInsertFill(metaObject, "updatedAt", LocalDateTime.class, now);
                this.strictInsertFill(metaObject, "createTime", LocalDateTime.class, now);
                this.strictInsertFill(metaObject, "updateTime", LocalDateTime.class, now);

                // 填充用户字段
                Long userId = UserContext.getUserId();
                if (userId != null) {
                    this.strictInsertFill(metaObject, "createdBy", Long.class, userId);
                    this.strictInsertFill(metaObject, "updatedBy", Long.class, userId);
                    this.strictInsertFill(metaObject, "createBy", Long.class, userId);
                    this.strictInsertFill(metaObject, "updateBy", Long.class, userId);
                }

                // 填充部门字段
                Long deptId = UserContext.getDeptId();
                if (deptId != null) {
                    this.strictInsertFill(metaObject, "deptId", Long.class, deptId);
                }

                // 填充租户字段
                Long tenantId = TenantContext.getTenantId();
                if (tenantId != null) {
                    this.strictInsertFill(metaObject, "tenantId", Long.class, tenantId);
                }

                // 填充删除标记
                this.strictInsertFill(metaObject, "deleted", Integer.class, 0);

                // 填充版本号
                this.strictInsertFill(metaObject, "version", Integer.class, 1);
            }

            @Override
            public void updateFill(MetaObject metaObject) {
                LocalDateTime now = LocalDateTime.now();
                
                // 填充更新时间
                this.strictUpdateFill(metaObject, "updatedAt", LocalDateTime.class, now);
                this.strictUpdateFill(metaObject, "updateTime", LocalDateTime.class, now);

                // 填充更新人
                Long userId = UserContext.getUserId();
                if (userId != null) {
                    this.strictUpdateFill(metaObject, "updatedBy", Long.class, userId);
                    this.strictUpdateFill(metaObject, "updateBy", Long.class, userId);
                }
            }
        };
    }
}