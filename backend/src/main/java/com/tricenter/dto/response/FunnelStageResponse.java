package com.tricenter.dto.response;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

/**
 * 漏斗阶段响应
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class FunnelStageResponse {
    
    /** 阶段代码 */
    private String stage;
    
    /** 阶段名称 */
    private String name;
    
    /** 企业数量 */
    private Integer count;
    
    /** 颜色 */
    private String color;
}
