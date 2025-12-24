package com.mota.project.controller;

import com.mota.common.core.result.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * 用户控制器
 * 提供用户管理相关API
 */
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /**
     * 获取用户列表
     */
    @GetMapping
    public Result<Map<String, Object>> list(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "page", defaultValue = "1") Integer page,
            @RequestParam(value = "pageSize", defaultValue = "10") Integer pageSize) {
        
        // 返回模拟数据
        List<Map<String, Object>> users = new ArrayList<>();
        
        users.add(createUser(1L, "admin", "管理员", "admin@example.com", "13800138001", "active"));
        users.add(createUser(2L, "zhangsan", "张三", "zhangsan@example.com", "13800138002", "active"));
        users.add(createUser(3L, "lisi", "李四", "lisi@example.com", "13800138003", "active"));
        users.add(createUser(4L, "wangwu", "王五", "wangwu@example.com", "13800138004", "active"));
        users.add(createUser(5L, "zhaoliu", "赵六", "zhaoliu@example.com", "13800138005", "inactive"));
        
        // 简单过滤
        if (keyword != null && !keyword.isEmpty()) {
            users = users.stream()
                .filter(u -> u.get("username").toString().contains(keyword) 
                    || u.get("nickname").toString().contains(keyword)
                    || u.get("email").toString().contains(keyword))
                .toList();
        }
        
        if (status != null && !status.isEmpty()) {
            users = users.stream()
                .filter(u -> u.get("status").equals(status))
                .toList();
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("list", users);
        result.put("total", users.size());
        
        return Result.success(result);
    }

    /**
     * 获取用户详情
     */
    @GetMapping("/{id}")
    public Result<Map<String, Object>> detail(@PathVariable("id") Long id) {
        Map<String, Object> user = switch (id.intValue()) {
            case 1 -> createUser(1L, "admin", "管理员", "admin@example.com", "13800138001", "active");
            case 2 -> createUser(2L, "zhangsan", "张三", "zhangsan@example.com", "13800138002", "active");
            case 3 -> createUser(3L, "lisi", "李四", "lisi@example.com", "13800138003", "active");
            case 4 -> createUser(4L, "wangwu", "王五", "wangwu@example.com", "13800138004", "active");
            case 5 -> createUser(5L, "zhaoliu", "赵六", "zhaoliu@example.com", "13800138005", "inactive");
            default -> createUser(id, "user" + id, "用户" + id, "user" + id + "@example.com", "13800138000", "active");
        };
        
        return Result.success(user);
    }

    /**
     * 获取当前用户信息
     */
    @GetMapping("/me")
    public Result<Map<String, Object>> getCurrentUser() {
        Map<String, Object> user = createUser(1L, "admin", "管理员", "admin@example.com", "13800138001", "active");
        return Result.success(user);
    }

    /**
     * 更新当前用户信息
     */
    @PutMapping("/me")
    public Result<Map<String, Object>> updateCurrentUser(@RequestBody Map<String, Object> data) {
        Map<String, Object> user = createUser(1L, "admin", "管理员", "admin@example.com", "13800138001", "active");
        // 合并更新的数据
        if (data.containsKey("nickname")) {
            user.put("nickname", data.get("nickname"));
        }
        if (data.containsKey("email")) {
            user.put("email", data.get("email"));
        }
        if (data.containsKey("phone")) {
            user.put("phone", data.get("phone"));
        }
        if (data.containsKey("avatar")) {
            user.put("avatar", data.get("avatar"));
        }
        user.put("updatedAt", LocalDateTime.now().format(FORMATTER));
        
        return Result.success(user);
    }

    /**
     * 创建用户
     */
    @PostMapping
    public Result<Map<String, Object>> create(@RequestBody Map<String, Object> data) {
        Long id = System.currentTimeMillis();
        String username = (String) data.getOrDefault("username", "newuser");
        String nickname = (String) data.getOrDefault("nickname", "新用户");
        String email = (String) data.getOrDefault("email", "newuser@example.com");
        String phone = (String) data.getOrDefault("phone", "");
        
        Map<String, Object> user = createUser(id, username, nickname, email, phone, "active");
        return Result.success(user);
    }

    /**
     * 更新用户
     */
    @PutMapping("/{id}")
    public Result<Map<String, Object>> update(@PathVariable("id") Long id, @RequestBody Map<String, Object> data) {
        Map<String, Object> user = createUser(id, 
            (String) data.getOrDefault("username", "user" + id),
            (String) data.getOrDefault("nickname", "用户" + id),
            (String) data.getOrDefault("email", "user" + id + "@example.com"),
            (String) data.getOrDefault("phone", ""),
            (String) data.getOrDefault("status", "active"));
        user.put("updatedAt", LocalDateTime.now().format(FORMATTER));
        
        return Result.success(user);
    }

    /**
     * 删除用户
     */
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable("id") Long id) {
        return Result.success();
    }

    /**
     * 创建用户数据
     */
    private Map<String, Object> createUser(Long id, String username, String nickname, 
            String email, String phone, String status) {
        Map<String, Object> user = new HashMap<>();
        user.put("id", id);
        user.put("username", username);
        user.put("nickname", nickname);
        user.put("email", email);
        user.put("phone", phone);
        user.put("avatar", "");
        user.put("status", status);
        user.put("createdAt", "2024-01-01 00:00:00");
        user.put("updatedAt", "2024-01-01 00:00:00");
        return user;
    }
}