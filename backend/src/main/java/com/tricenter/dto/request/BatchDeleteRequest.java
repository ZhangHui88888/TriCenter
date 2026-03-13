package com.tricenter.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

/**
 * 批量删除请求
 */
@Data
public class BatchDeleteRequest {

    @NotEmpty(message = "企业ID列表不能为空")
    private List<Integer> ids;
}
