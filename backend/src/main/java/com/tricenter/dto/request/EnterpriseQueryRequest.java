package com.tricenter.dto.request;

import lombok.Data;

/**
 * 企业查询请求
 */
@Data
public class EnterpriseQueryRequest {
    
    /** 关键词（企业名称模糊搜索） */
    private String keyword;
    
    /** 漏斗阶段 */
    private String stage;
    
    /** 所属区域 */
    private String district;
    
    /** 行业ID */
    private Integer industryId;
    
    /** 企业类型 */
    private String enterpriseType;
    
    /** 人员规模ID */
    private Integer staffSizeId;
    
    /** 企业来源ID */
    private Integer sourceId;
    
    /** 是否开展跨境电商 */
    private Integer hasCrossBorder;
    
    /** 跨境转型意愿 */
    private String transformationWillingness;
    
    /** 页码 */
    private Integer page = 1;
    
    /** 每页数量 */
    private Integer pageSize = 10;
}
