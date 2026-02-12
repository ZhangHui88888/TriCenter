package com.tricenter.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 字典选项请求DTO
 */
@Data
public class DictionaryRequest {
    
    @NotBlank(message = "选项值不能为空")
    private String value;
    
    @NotBlank(message = "显示名称不能为空")
    private String label;
    
    private String color;
    
    private Integer sortOrder;
    
    private Integer isEnabled;
}
