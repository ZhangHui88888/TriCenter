package com.tricenter.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 漏斗转化率响应
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "漏斗转化率响应")
public class FunnelConversionResponse {
    
    @Schema(description = "来源阶段代码")
    private String from;
    
    @Schema(description = "目标阶段代码")
    private String to;
    
    @Schema(description = "来源阶段名称")
    private String fromName;
    
    @Schema(description = "目标阶段名称")
    private String toName;
    
    @Schema(description = "转化数量")
    private Integer count;
    
    @Schema(description = "转化率（百分比）")
    private Double rate;
}
