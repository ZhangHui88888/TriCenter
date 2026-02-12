package com.tricenter.service;

import com.tricenter.dto.request.ChangePasswordRequest;
import com.tricenter.dto.request.LoginRequest;
import com.tricenter.dto.response.LoginResponse;
import com.tricenter.dto.response.UserResponse;

/**
 * 认证服务接口
 */
public interface AuthService {
    
    /**
     * 用户登录
     */
    LoginResponse login(LoginRequest request);
    
    /**
     * 用户登出
     */
    void logout(Integer userId);
    
    /**
     * 获取当前用户信息
     */
    UserResponse getCurrentUser(Integer userId);
    
    /**
     * 修改密码
     */
    void changePassword(Integer userId, ChangePasswordRequest request);
}
