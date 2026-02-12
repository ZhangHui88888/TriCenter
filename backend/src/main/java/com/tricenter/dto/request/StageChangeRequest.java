package com.tricenter.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 阶段变更请求
 */
@Data
public class StageChangeRequest {
    
    @NotBlank(message = "目标阶段不能为空")
    private String stage;
    
    private String reason;
}
