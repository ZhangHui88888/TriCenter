package com.tricenter.dto.request;

import lombok.Data;

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
    private Integer page = 1;

    /** 每页数量 */
    private Integer pageSize = 10;
}
