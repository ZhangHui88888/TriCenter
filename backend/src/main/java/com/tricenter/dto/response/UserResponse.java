package com.tricenter.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;

/**
 * 用户信息响应
 */
@Data
@Builder
public class UserResponse {
    
    private Integer id;
    private String username;
    private String role;
    private String name;
    private String phone;
    private String email;
    private List<String> permissions;
}
