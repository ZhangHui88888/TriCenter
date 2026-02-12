package com.tricenter.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;

/**
 * 导入结果响应
 */
@Data
@Builder
public class ImportResultResponse {
    
    /** 成功数量 */
    private int success;
    
    /** 失败数量 */
    private int failed;
    
    /** 错误详情 */
    private List<ErrorDetail> errors;
    
    @Data
    @Builder
    public static class ErrorDetail {
        private int row;
        private String message;
    }
}
