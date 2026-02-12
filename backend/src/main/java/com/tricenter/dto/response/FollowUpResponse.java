package com.tricenter.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 跟进记录响应
 */
@Data
@Schema(description = "跟进记录响应")
public class FollowUpResponse {
    
    @Schema(description = "跟进记录ID")
    private Integer id;
    
    @Schema(description = "企业ID")
    private Integer enterpriseId;
    
    @Schema(description = "企业名称")
    private String enterpriseName;
    
    @Schema(description = "跟进日期")
    private LocalDate followDate;
    
    @Schema(description = "跟进人姓名")
    private String followerName;
    
    @Schema(description = "跟进类型")
    private String followType;
    
    @Schema(description = "跟进内容")
    private String content;
    
    @Schema(description = "整体状态")
    private String status;
    
    @Schema(description = "下一步计划")
    private String nextPlan;
    
    @Schema(description = "变更前阶段")
    private String stageFrom;
    
    @Schema(description = "变更后阶段")
    private String stageTo;
    
    @Schema(description = "创建时间")
    private LocalDateTime createdAt;
}
