package com.tricenter.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDate;

/**
 * 更新跟进记录请求
 */
@Data
@Schema(description = "更新跟进记录请求")
public class FollowUpUpdateRequest {
    
    @Schema(description = "跟进类型: 电话/视频/拜访/会议")
    private String followType;
    
    @Schema(description = "跟进日期")
    private LocalDate followDate;
    
    @Schema(description = "跟进内容")
    private String content;
    
    @Schema(description = "整体状态")
    private String status;
    
    @Schema(description = "下一步计划")
    private String nextPlan;
}
