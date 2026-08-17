package com.tricenter.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.tricenter.common.exception.BusinessException;
import com.tricenter.dto.request.ChangePasswordRequest;
import com.tricenter.dto.request.LoginRequest;
import com.tricenter.dto.response.CityInfoResponse;
import com.tricenter.dto.response.LoginResponse;
import com.tricenter.dto.response.UserResponse;
import com.tricenter.entity.City;
import com.tricenter.entity.User;
import com.tricenter.mapper.UserMapper;
import com.tricenter.service.AuthService;
import com.tricenter.service.CityAccessService;
import com.tricenter.service.PermissionService;
import com.tricenter.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

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
    private final CityAccessService cityAccessService;
    private final PermissionService permissionService;

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
        
        List<CityInfoResponse> availableCities = cityAccessService.getAvailableCities(user.getId());
        if (availableCities.isEmpty()) {
            throw BusinessException.forbidden("账号尚未分配可用城市，请联系系统管理员");
        }
        boolean requiresCitySelection = availableCities.size() > 1;
        CityInfoResponse currentCity = requiresCitySelection ? null : availableCities.get(0);
        String token = jwtUtil.generateToken(
                user.getId(),
                user.getUsername(),
                user.getRole(),
                currentCity == null ? null : currentCity.getId(),
                requiresCitySelection);
        
        log.info("用户登录成功: {}", user.getUsername());
        
        return buildLoginResponse(user, token, availableCities, currentCity, requiresCitySelection);
    }

    @Override
    public LoginResponse selectCity(Integer userId, Integer cityId) {
        User user = requireEnabledUser(userId);
        City city = cityAccessService.requireAuthorizedCity(userId, cityId);
        List<CityInfoResponse> availableCities = cityAccessService.getAvailableCities(userId);
        CityInfoResponse currentCity = cityAccessService.toResponse(city);
        String token = jwtUtil.generateToken(
                user.getId(), user.getUsername(), user.getRole(), city.getId(), false);
        return buildLoginResponse(user, token, availableCities, currentCity, false);
    }

    @Override
    public void logout(Integer userId) {
        // 可以将Token加入黑名单（可选实现）
        log.info("用户登出: userId={}", userId);
    }

    @Override
    public UserResponse getCurrentUser(Integer userId, Integer currentCityId) {
        User user = requireEnabledUser(userId);
        List<String> permissions = permissionService.getPermissions(user.getRole());
        List<CityInfoResponse> availableCities = cityAccessService.getAvailableCities(userId);
        CityInfoResponse currentCity = currentCityId == null
                ? null
                : cityAccessService.toResponse(
                        cityAccessService.requireAuthorizedCity(userId, currentCityId));
        
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .role(user.getRole())
                .name(user.getName())
                .phone(user.getPhone())
                .email(user.getEmail())
                .permissions(permissions)
                .availableCities(availableCities)
                .currentCity(currentCity)
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

    private User requireEnabledUser(Integer userId) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw BusinessException.notFound("用户不存在");
        }
        if (!Integer.valueOf(1).equals(user.getStatus())) {
            throw BusinessException.forbidden("账号已被禁用");
        }
        return user;
    }

    private LoginResponse buildLoginResponse(User user,
                                             String token,
                                             List<CityInfoResponse> availableCities,
                                             CityInfoResponse currentCity,
                                             boolean requiresCitySelection) {
        return LoginResponse.builder()
                .token(token)
                .requiresCitySelection(requiresCitySelection)
                .availableCities(availableCities)
                .currentCity(currentCity)
                .user(LoginResponse.UserInfo.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .role(user.getRole())
                        .name(user.getName())
                        .permissions(permissionService.getPermissions(user.getRole()))
                        .build())
                .build();
    }
}
