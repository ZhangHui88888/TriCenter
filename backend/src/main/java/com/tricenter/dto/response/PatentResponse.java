package com.tricenter.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 专利响应
 */
@Data
@Schema(description = "专利响应")
public class PatentResponse {
    
    @Schema(description = "专利ID")
    private Integer id;
    
    @Schema(description = "企业ID")
    private Integer enterpriseId;
    
    @Schema(description = "专利名称")
    private String name;
    
    @Schema(description = "专利号")
    private String patentNo;
    
    @Schema(description = "创建时间")
    private LocalDateTime createdAt;
}
