package com.tricenter.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

/**
 * 新增跟进记录请求
 */
@Data
@Schema(description = "新增跟进记录请求")
public class FollowUpCreateRequest {
    
    @Schema(description = "企业ID", required = true)
    @NotNull(message = "企业ID不能为空")
    private Integer enterpriseId;
    
    @Schema(description = "跟进类型: 电话/视频/拜访/会议", required = true)
    @NotBlank(message = "跟进类型不能为空")
    private String followType;
    
    @Schema(description = "跟进日期", required = true)
    @NotNull(message = "跟进日期不能为空")
    private LocalDate followDate;
    
    @Schema(description = "跟进内容", required = true)
    @NotBlank(message = "跟进内容不能为空")
    private String content;
    
    @Schema(description = "整体状态")
    private String status;
    
    @Schema(description = "下一步计划")
    private String nextPlan;
    
    @Schema(description = "变更后阶段（可选，如果填写则同时变更企业阶段）")
    private String stageAfter;
}
