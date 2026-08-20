package com.tricenter.dto.request;

import lombok.Data;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

/**
 * 服务商查询请求
 */
@Data
public class ProviderQueryRequest {

    /** 关键词（服务商名称模糊搜索） */
    private String keyword;

    /** 服务分类 */
    private String category;

    /** 合作状态: ACTIVE/SUSPENDED/TERMINATED */
    private String cooperationStatus;

    /** 所属区域 */
    private String district;

    /** 页码 */
    @Min(value = 1, message = "page 必须大于等于 1")
    private Integer page = 1;

    /** 每页数量 */
    @Min(value = 1, message = "pageSize 必须大于等于 1")
    @Max(value = 100, message = "pageSize 不能超过 100")
    private Integer pageSize = 10;
}
