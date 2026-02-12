package com.tricenter.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 用户选项响应DTO（用于对接人下拉）
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserOptionResponse {
    
    private Integer value;
    
    private String label;
}
