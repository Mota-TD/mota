package com.mota.common.mybatis.handler;

import com.mota.common.core.context.UserContext;
import com.mota.common.core.enums.DataScopeEnum;
import lombok.extern.slf4j.Slf4j;
import net.sf.jsqlparser.expression.Expression;
import net.sf.jsqlparser.expression.LongValue;
import net.sf.jsqlparser.expression.Parenthesis;
import net.sf.jsqlparser.expression.StringValue;
import net.sf.jsqlparser.expression.operators.conditional.AndExpression;
import net.sf.jsqlparser.expression.operators.conditional.OrExpression;
import net.sf.jsqlparser.expression.operators.relational.EqualsTo;
import net.sf.jsqlparser.expression.operators.relational.InExpression;
import net.sf.jsqlparser.expression.operators.relational.ExpressionList;
import net.sf.jsqlparser.schema.Column;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 数据权限处理器
 * 根据用户的数据权限范围，自动为SQL添加数据过滤条件
 * 
 * @author Mota
 * @since 1.0.0
 */
@Slf4j
public class DataPermissionHandler {

    /**
     * 用户ID字段名
     */
    private static final String USER_ID_COLUMN = "created_by";

    /**
     * 部门ID字段名
     */
    private static final String DEPT_ID_COLUMN = "dept_id";

    /**
     * 获取数据权限SQL片段
     *
     * @param tableAlias 表别名
     * @return SQL表达式
     */
    public Expression getDataPermissionExpression(String tableAlias) {
        // 如果是超级管理员，不添加数据权限过滤
        if (UserContext.isSuperAdmin()) {
            log.debug("超级管理员，跳过数据权限过滤");
            return null;
        }

        String dataScopeStr = UserContext.getDataScope();
        Integer dataScope;
        if (dataScopeStr == null || dataScopeStr.isEmpty()) {
            log.debug("数据权限范围为空，默认使用仅本人权限");
            dataScope = DataScopeEnum.SELF.getValue();
        } else {
            try {
                dataScope = Integer.parseInt(dataScopeStr);
            } catch (NumberFormatException e) {
                log.warn("数据权限范围格式错误: {}, 默认使用仅本人权限", dataScopeStr);
                dataScope = DataScopeEnum.SELF.getValue();
            }
        }

        Long userId = UserContext.getUserId();
        Long deptId = UserContext.getDeptId();

        if (userId == null) {
            log.warn("用户ID为空，无法添加数据权限过滤");
            return null;
        }

        String prefix = tableAlias != null ? tableAlias + "." : "";

        // 根据数据权限范围生成不同的SQL条件
        if (DataScopeEnum.isAll(dataScope)) {
            // 全部数据权限，不添加过滤条件
            log.debug("全部数据权限，不添加过滤条件");
            return null;
        } else if (DataScopeEnum.isSelf(dataScope)) {
            // 仅本人数据权限
            return createUserIdCondition(prefix, userId);
        } else if (DataScopeEnum.isDept(dataScope)) {
            // 本部门数据权限
            if (deptId == null) {
                log.warn("部门ID为空，降级为仅本人权限");
                return createUserIdCondition(prefix, userId);
            }
            return createDeptIdCondition(prefix, deptId);
        } else if (DataScopeEnum.isDeptAndChild(dataScope)) {
            // 本部门及以下数据权限
            // 这里需要查询子部门ID列表，暂时简化为本部门
            if (deptId == null) {
                log.warn("部门ID为空，降级为仅本人权限");
                return createUserIdCondition(prefix, userId);
            }
            // TODO: 实现子部门查询逻辑
            return createDeptIdCondition(prefix, deptId);
        } else if (DataScopeEnum.isCustom(dataScope)) {
            // 自定义数据权限
            // 需要根据用户的自定义部门列表进行过滤
            // TODO: 实现自定义数据权限逻辑
            log.debug("自定义数据权限，暂时使用仅本人权限");
            return createUserIdCondition(prefix, userId);
        }

        // 默认使用仅本人权限
        return createUserIdCondition(prefix, userId);
    }

    /**
     * 创建用户ID条件
     */
    private Expression createUserIdCondition(String prefix, Long userId) {
        EqualsTo equalsTo = new EqualsTo();
        equalsTo.setLeftExpression(new Column(prefix + USER_ID_COLUMN));
        equalsTo.setRightExpression(new LongValue(userId));
        log.debug("添加用户ID过滤条件: {} = {}", prefix + USER_ID_COLUMN, userId);
        return equalsTo;
    }

    /**
     * 创建部门ID条件
     */
    private Expression createDeptIdCondition(String prefix, Long deptId) {
        EqualsTo equalsTo = new EqualsTo();
        equalsTo.setLeftExpression(new Column(prefix + DEPT_ID_COLUMN));
        equalsTo.setRightExpression(new LongValue(deptId));
        log.debug("添加部门ID过滤条件: {} = {}", prefix + DEPT_ID_COLUMN, deptId);
        return equalsTo;
    }

    /**
     * 创建部门ID IN条件
     */
    private Expression createDeptIdInCondition(String prefix, Set<Long> deptIds) {
        if (deptIds == null || deptIds.isEmpty()) {
            return null;
        }

        InExpression inExpression = new InExpression();
        inExpression.setLeftExpression(new Column(prefix + DEPT_ID_COLUMN));
        
        List<Expression> expressions = deptIds.stream()
                .map(id -> (Expression) new LongValue(id))
                .collect(Collectors.toList());
        ExpressionList expressionList = new ExpressionList(expressions);
        inExpression.setRightItemsList(expressionList);
        
        log.debug("添加部门ID IN过滤条件: {} IN ({})", prefix + DEPT_ID_COLUMN, deptIds);
        return inExpression;
    }

    /**
     * 合并两个表达式（AND关系）
     */
    public Expression mergeExpression(Expression original, Expression dataPermission) {
        if (dataPermission == null) {
            return original;
        }
        if (original == null) {
            return dataPermission;
        }
        return new AndExpression(original, new Parenthesis(dataPermission));
    }

    /**
     * 合并两个表达式（OR关系）
     */
    public Expression mergeExpressionOr(Expression original, Expression dataPermission) {
        if (dataPermission == null) {
            return original;
        }
        if (original == null) {
            return dataPermission;
        }
        return new OrExpression(original, new Parenthesis(dataPermission));
    }
}