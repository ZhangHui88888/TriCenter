package com.tricenter.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 跟进统计响应
 */
@Data
@Schema(description = "跟进统计响应")
public class FollowUpStatsResponse {
    
    @Schema(description = "本月跟进数")
    private Integer monthlyCount;
    
    @Schema(description = "本周跟进数")
    private Integer weeklyCount;
    
    @Schema(description = "今日跟进数")
    private Integer dailyCount;
    
    @Schema(description = "待跟进企业数（超过30天未跟进）")
    private Integer pendingCount;
}
