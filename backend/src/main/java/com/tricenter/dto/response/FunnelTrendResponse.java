package com.tricenter.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 漏斗趋势响应
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "漏斗趋势响应")
public class FunnelTrendResponse {
    
    @Schema(description = "月份（格式：YYYY-MM）")
    private String month;
    
    @Schema(description = "潜在企业数")
    private Integer potential;
    
    @Schema(description = "有明确需求数")
    private Integer hasDemand;
    
    @Schema(description = "已签约数")
    private Integer signed;
    
    @Schema(description = "已入驻数")
    private Integer settled;
    
    @Schema(description = "重点孵化数")
    private Integer incubating;
}
