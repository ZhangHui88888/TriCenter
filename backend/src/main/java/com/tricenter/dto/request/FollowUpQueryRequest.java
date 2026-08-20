package com.tricenter.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

/**
 * 跟进记录查询请求
 */
@Data
@Schema(description = "跟进记录查询请求")
public class FollowUpQueryRequest {
    
    @Schema(description = "关键词（搜索跟进内容）")
    private String keyword;
    
    @Schema(description = "跟进类型")
    private String type;
    
    @Schema(description = "企业ID")
    private Integer enterpriseId;
    
    @Schema(description = "页码", defaultValue = "1")
    @Min(value = 1, message = "page 必须大于等于 1")
    private Integer page = 1;
    
    @Schema(description = "每页数量", defaultValue = "10")
    @Min(value = 1, message = "pageSize 必须大于等于 1")
    @Max(value = 100, message = "pageSize 不能超过 100")
    private Integer pageSize = 10;
}
