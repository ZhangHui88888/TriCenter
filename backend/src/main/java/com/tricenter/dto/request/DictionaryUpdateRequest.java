package com.tricenter.dto.request;

import lombok.Data;

/**
 * 字典选项更新请求DTO（value不可修改）
 */
@Data
public class DictionaryUpdateRequest {
    
    private String label;
    
    private String color;
    
    private Integer sortOrder;
    
    private Integer isEnabled;
}
