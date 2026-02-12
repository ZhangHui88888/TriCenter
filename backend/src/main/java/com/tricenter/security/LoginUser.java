package com.tricenter.security;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * 登录用户信息
 */
@Data
@AllArgsConstructor
public class LoginUser {
    
    private Integer id;
    private String username;
    private String role;
}
