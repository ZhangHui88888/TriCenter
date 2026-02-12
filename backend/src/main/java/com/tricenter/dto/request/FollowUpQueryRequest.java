package com.tricenter.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

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
    private Integer page = 1;
    
    @Schema(description = "每页数量", defaultValue = "10")
    private Integer pageSize = 10;
}
