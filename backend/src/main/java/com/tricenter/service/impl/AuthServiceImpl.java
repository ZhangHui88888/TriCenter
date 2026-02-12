package com.tricenter.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.tricenter.common.exception.BusinessException;
import com.tricenter.dto.request.ChangePasswordRequest;
import com.tricenter.dto.request.LoginRequest;
import com.tricenter.dto.response.LoginResponse;
import com.tricenter.dto.response.UserResponse;
import com.tricenter.entity.User;
import com.tricenter.mapper.UserMapper;
import com.tricenter.service.AuthService;
import com.tricenter.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * 认证服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final StringRedisTemplate redisTemplate;

    private static final String TOKEN_BLACKLIST_PREFIX = "token:blacklist:";

    @Override
    @Transactional
    public LoginResponse login(LoginRequest request) {
        // 查询用户
        User user = userMapper.selectOne(
            new LambdaQueryWrapper<User>()
                .eq(User::getUsername, request.getUsername())
        );
        
        if (user == null) {
            throw BusinessException.unauthorized("用户名或密码错误");
        }
        
        // 检查用户状态
        if (user.getStatus() != 1) {
            throw BusinessException.forbidden("账号已被禁用");
        }
        
        // 验证密码
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw BusinessException.unauthorized("用户名或密码错误");
        }
        
        // 更新最后登录时间
        user.setLastLoginAt(LocalDateTime.now());
        userMapper.updateById(user);
        
        // 生成Token
        String token = jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole());
        
        log.info("用户登录成功: {}", user.getUsername());
        
        return LoginResponse.builder()
                .token(token)
                .user(LoginResponse.UserInfo.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .role(user.getRole())
                        .name(user.getName())
                        .build())
                .build();
    }

    @Override
    public void logout(Integer userId) {
        // 可以将Token加入黑名单（可选实现）
        log.info("用户登出: userId={}", userId);
    }

    @Override
    public UserResponse getCurrentUser(Integer userId) {
        User user = userMapper.selectById(userId);
        
        if (user == null) {
            throw BusinessException.notFound("用户不存在");
        }
        
        // 根据角色设置权限
        List<String> permissions = getPermissionsByRole(user.getRole());
        
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .role(user.getRole())
                .name(user.getName())
                .phone(user.getPhone())
                .email(user.getEmail())
                .permissions(permissions)
                .build();
    }

    @Override
    @Transactional
    public void changePassword(Integer userId, ChangePasswordRequest request) {
        User user = userMapper.selectById(userId);
        
        if (user == null) {
            throw BusinessException.notFound("用户不存在");
        }
        
        // 验证原密码
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw BusinessException.badRequest("原密码错误");
        }
        
        // 更新密码
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userMapper.updateById(user);
        
        log.info("用户修改密码成功: {}", user.getUsername());
    }

    /**
     * 根据角色获取权限列表
     */
    private List<String> getPermissionsByRole(String role) {
        List<String> permissions = new ArrayList<>();
        
        switch (role) {
            case "admin":
                permissions.add("system:manage");
                permissions.add("user:manage");
                permissions.add("enterprise:manage");
                permissions.add("enterprise:delete");
                permissions.add("enterprise:export");
                permissions.add("enterprise:import");
                permissions.add("followup:manage");
                permissions.add("dictionary:manage");
                break;
            case "manager":
                permissions.add("enterprise:manage");
                permissions.add("enterprise:delete");
                permissions.add("enterprise:export");
                permissions.add("enterprise:import");
                permissions.add("followup:manage");
                break;
            case "user":
            default:
                permissions.add("enterprise:view");
                permissions.add("enterprise:edit");
                permissions.add("followup:manage");
                break;
        }
        
        return permissions;
    }
}
