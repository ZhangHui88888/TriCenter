package com.tricenter.dto.response;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

/**
 * 区域分布响应
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class DistrictStatsResponse {
    
    /** 区域名称 */
    private String name;
    
    /** 企业数量 */
    private Integer count;
}
