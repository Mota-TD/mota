package com.mota.user.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.mota.user.entity.User;
import com.mota.user.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 用户控制器
 */
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserMapper userMapper;

    /**
     * 获取用户列表
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> list(
            @RequestParam(value = "page", defaultValue = "1") Integer page,
            @RequestParam(value = "size", defaultValue = "10") Integer size,
            @RequestParam(value = "keyword", required = false) String keyword) {
        
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.like(User::getUsername, keyword)
                   .or()
                   .like(User::getNickname, keyword)
                   .or()
                   .like(User::getEmail, keyword);
        }
        wrapper.orderByDesc(User::getCreatedAt);
        
        List<User> list = userMapper.selectList(wrapper);
        
        // 简单分页
        int start = (page - 1) * size;
        int end = Math.min(start + size, list.size());
        List<User> pageList = start < list.size() ? list.subList(start, end) : List.of();
        
        // 隐藏密码
        pageList.forEach(user -> user.setPasswordHash(null));
        
        Map<String, Object> result = new HashMap<>();
        result.put("code", 200);
        result.put("message", "success");
        
        Map<String, Object> data = new HashMap<>();
        data.put("list", pageList);
        data.put("total", list.size());
        data.put("page", page);
        data.put("size", size);
        result.put("data", data);
        
        return ResponseEntity.ok(result);
    }

    /**
     * 获取用户详情
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getById(@PathVariable(value = "id") Long id) {
        User user = userMapper.selectById(id);
        
        Map<String, Object> result = new HashMap<>();
        if (user != null) {
            user.setPasswordHash(null);
            result.put("code", 200);
            result.put("message", "success");
            result.put("data", user);
        } else {
            result.put("code", 404);
            result.put("message", "用户不存在");
        }
        
        return ResponseEntity.ok(result);
    }

    /**
     * 获取当前用户信息
     */
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser() {
        // 模拟当前用户（实际应从 SecurityContext 获取）
        User user = userMapper.selectById(1L);
        
        Map<String, Object> result = new HashMap<>();
        if (user != null) {
            user.setPasswordHash(null);
            result.put("code", 200);
            result.put("message", "success");
            result.put("data", user);
        } else {
            result.put("code", 401);
            result.put("message", "未登录");
        }
        
        return ResponseEntity.ok(result);
    }

    /**
     * 更新用户信息
     */
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(
            @PathVariable(value = "id") Long id,
            @RequestBody User user) {
        
        user.setId(id);
        user.setPasswordHash(null); // 不允许通过此接口修改密码
        userMapper.updateById(user);
        
        Map<String, Object> result = new HashMap<>();
        result.put("code", 200);
        result.put("message", "更新成功");
        
        return ResponseEntity.ok(result);
    }

    /**
     * 获取团队成员
     */
    @GetMapping("/team")
    public ResponseEntity<Map<String, Object>> getTeamMembers(
            @RequestParam(value = "projectId", required = false) Long projectId) {
        
        List<User> users = userMapper.selectList(null);
        users.forEach(user -> user.setPasswordHash(null));
        
        Map<String, Object> result = new HashMap<>();
        result.put("code", 200);
        result.put("message", "success");
        result.put("data", users);
        
        return ResponseEntity.ok(result);
    }

    /**
     * 搜索用户
     */
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> search(
            @RequestParam(value = "keyword") String keyword) {
        
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(User::getUsername, keyword)
               .or()
               .like(User::getNickname, keyword)
               .or()
               .like(User::getEmail, keyword);
        wrapper.last("LIMIT 10");
        
        List<User> users = userMapper.selectList(wrapper);
        users.forEach(user -> user.setPasswordHash(null));
        
        Map<String, Object> result = new HashMap<>();
        result.put("code", 200);
        result.put("message", "success");
        result.put("data", users);
        
        return ResponseEntity.ok(result);
    }
}