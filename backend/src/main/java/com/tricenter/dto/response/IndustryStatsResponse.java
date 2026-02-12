package com.tricenter.dto.response;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

/**
 * 行业分布响应
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class IndustryStatsResponse {
    
    /** 行业名称 */
    private String name;
    
    /** 企业数量 */
    private Integer count;
    
    /** 占比百分比 */
    private Double percentage;
}
