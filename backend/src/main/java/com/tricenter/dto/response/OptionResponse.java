package com.tricenter.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 选项响应DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OptionResponse {
    
    private Integer id;
    
    private String value;
    
    private String label;
    
    private String color;
    
    private Integer sortOrder;
    
    private Integer isEnabled;
}
