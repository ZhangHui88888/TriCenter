package com.tricenter.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

/**
 * 批量阶段变更请求
 */
@Data
public class BatchStageChangeRequest {

    @NotEmpty(message = "企业ID列表不能为空")
    private List<Integer> ids;

    @NotBlank(message = "目标阶段不能为空")
    private String stage;

    private String reason;
}
