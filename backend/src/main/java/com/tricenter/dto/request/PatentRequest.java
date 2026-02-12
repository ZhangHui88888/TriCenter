package com.tricenter.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 专利请求（新增/更新）
 */
@Data
@Schema(description = "专利请求")
public class PatentRequest {
    
    @Schema(description = "专利名称", required = true)
    @NotBlank(message = "专利名称不能为空")
    @Size(max = 200, message = "专利名称不能超过200个字符")
    private String name;
    
    @Schema(description = "专利号")
    @Size(max = 50, message = "专利号不能超过50个字符")
    private String patentNo;
}
