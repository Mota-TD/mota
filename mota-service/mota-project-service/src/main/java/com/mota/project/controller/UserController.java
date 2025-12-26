package com.mota.project.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.mota.common.core.result.Result;
import com.mota.common.security.util.SecurityUtils;
import com.mota.project.entity.User;
import com.mota.project.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * 用户控制器
 * 提供用户管理相关API
 */
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    /**
     * 获取用户列表
     */
    @GetMapping
    public Result<Map<String, Object>> list(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "status", required = false) Integer status,
            @RequestParam(value = "page", defaultValue = "1") Integer page,
            @RequestParam(value = "pageSize", defaultValue = "10") Integer pageSize) {
        
        // 获取当前用户的企业ID
        Long enterpriseId = SecurityUtils.getEnterpriseId();
        
        IPage<User> userPage = userService.listUsers(keyword, status, page, pageSize, enterpriseId);
        
        // 转换为前端需要的格式
        List<Map<String, Object>> userList = new ArrayList<>();
        for (User user : userPage.getRecords()) {
            userList.add(convertToMap(user));
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("list", userList);
        result.put("total", userPage.getTotal());
        
        return Result.success(result);
    }

    /**
     * 获取用户详情
     */
    @GetMapping("/{id}")
    public Result<Map<String, Object>> detail(@PathVariable("id") Long id) {
        User user = userService.getUserById(id);
        return Result.success(convertToMap(user));
    }

    /**
     * 获取当前用户信息
     */
    @GetMapping("/me")
    public Result<Map<String, Object>> getCurrentUser() {
        Long userId = null;
        try {
            userId = SecurityUtils.getUserId();
        } catch (Exception e) {
            // 未登录
        }
        if (userId == null) {
            // 如果没有登录用户，返回默认信息
            Map<String, Object> defaultUser = new HashMap<>();
            defaultUser.put("id", 0L);
            defaultUser.put("username", "guest");
            defaultUser.put("nickname", "访客");
            defaultUser.put("email", "");
            defaultUser.put("phone", "");
            defaultUser.put("avatar", "");
            defaultUser.put("status", "active");
            defaultUser.put("role", "guest");
            return Result.success(defaultUser);
        }
        User user = userService.getUserById(userId);
        return Result.success(convertToMap(user));
    }

    /**
     * 更新当前用户信息
     */
    @PutMapping("/me")
    public Result<Map<String, Object>> updateCurrentUser(@RequestBody Map<String, Object> data) {
        Long userId = null;
        try {
            userId = SecurityUtils.getUserId();
        } catch (Exception e) {
            // 未登录
        }
        if (userId == null) {
            return Result.fail("用户未登录");
        }
        
        User user = new User();
        user.setId(userId);
        
        if (data.containsKey("nickname")) {
            user.setNickname((String) data.get("nickname"));
        }
        if (data.containsKey("email")) {
            user.setEmail((String) data.get("email"));
        }
        if (data.containsKey("phone")) {
            user.setPhone((String) data.get("phone"));
        }
        if (data.containsKey("avatar")) {
            user.setAvatar((String) data.get("avatar"));
        }
        
        User updatedUser = userService.updateUser(user);
        return Result.success(convertToMap(updatedUser));
    }

    /**
     * 创建用户
     */
    @PostMapping
    public Result<Map<String, Object>> create(@RequestBody Map<String, Object> data) {
        User user = new User();
        
        // 设置企业ID
        Long enterpriseId = SecurityUtils.getEnterpriseId();
        user.setEnterpriseId(enterpriseId);
        
        if (data.containsKey("username")) {
            user.setUsername((String) data.get("username"));
        }
        if (data.containsKey("nickname")) {
            user.setNickname((String) data.get("nickname"));
        }
        if (data.containsKey("email")) {
            user.setEmail((String) data.get("email"));
        }
        if (data.containsKey("phone")) {
            user.setPhone((String) data.get("phone"));
        }
        if (data.containsKey("role")) {
            user.setRole((String) data.get("role"));
        }
        if (data.containsKey("avatar")) {
            user.setAvatar((String) data.get("avatar"));
        }
        
        // 处理密码 - 使用BCrypt加密
        if (data.containsKey("password")) {
            String password = (String) data.get("password");
            if (StringUtils.hasText(password)) {
                user.setPasswordHash(passwordEncoder.encode(password));
            }
        }
        
        // 处理部门
        if (data.containsKey("departmentId")) {
            Object deptId = data.get("departmentId");
            if (deptId instanceof Number) {
                user.setDepartmentId(((Number) deptId).longValue());
            } else if (deptId instanceof String) {
                try {
                    user.setDepartmentId(Long.parseLong((String) deptId));
                } catch (NumberFormatException e) {
                    // 忽略无效的部门ID
                }
            }
        }
        if (data.containsKey("departmentName")) {
            user.setDepartmentName((String) data.get("departmentName"));
        }
        
        // 如果没有用户名，使用手机号
        if (!StringUtils.hasText(user.getUsername())) {
            if (StringUtils.hasText(user.getPhone())) {
                user.setUsername(user.getPhone());
            } else if (StringUtils.hasText(user.getEmail())) {
                user.setUsername(user.getEmail().split("@")[0]);
            }
        }
        
        User createdUser = userService.createUser(user);
        return Result.success(convertToMap(createdUser));
    }

    /**
     * 更新用户
     */
    @PutMapping("/{id}")
    public Result<Map<String, Object>> update(@PathVariable("id") Long id, @RequestBody Map<String, Object> data) {
        User user = new User();
        user.setId(id);
        
        if (data.containsKey("username")) {
            user.setUsername((String) data.get("username"));
        }
        if (data.containsKey("nickname")) {
            user.setNickname((String) data.get("nickname"));
        }
        if (data.containsKey("email")) {
            user.setEmail((String) data.get("email"));
        }
        if (data.containsKey("phone")) {
            user.setPhone((String) data.get("phone"));
        }
        if (data.containsKey("role")) {
            user.setRole((String) data.get("role"));
        }
        if (data.containsKey("avatar")) {
            user.setAvatar((String) data.get("avatar"));
        }
        if (data.containsKey("status")) {
            Object statusObj = data.get("status");
            if (statusObj instanceof Integer) {
                user.setStatus((Integer) statusObj);
            } else if (statusObj instanceof String) {
                user.setStatus("active".equals(statusObj) ? 1 : 0);
            }
        }
        
        User updatedUser = userService.updateUser(user);
        return Result.success(convertToMap(updatedUser));
    }

    /**
     * 删除用户
     */
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable("id") Long id) {
        userService.deleteUser(id);
        return Result.success();
    }

    /**
     * 将User实体转换为Map
     */
    private Map<String, Object> convertToMap(User user) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", user.getId());
        map.put("username", user.getUsername());
        map.put("nickname", user.getNickname());
        map.put("email", user.getEmail());
        map.put("phone", user.getPhone());
        map.put("avatar", user.getAvatar() != null ? user.getAvatar() : "");
        map.put("status", user.getStatus() != null && user.getStatus() == 1 ? "active" : "inactive");
        map.put("role", user.getRole() != null ? user.getRole() : "member");
        map.put("departmentId", user.getDepartmentId());
        map.put("departmentName", user.getDepartmentName());
        map.put("createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : "");
        map.put("updatedAt", user.getUpdatedAt() != null ? user.getUpdatedAt().toString() : "");
        return map;
    }
}