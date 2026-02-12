package com.tricenter.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 企业产品实体
 */
@Data
@TableName(value = "enterprise_products", autoResultMap = true)
public class EnterpriseProduct {
    
    @TableId(type = IdType.AUTO)
    private Integer id;
    
    /** 企业ID */
    private Integer enterpriseId;
    
    /** 产品名称 */
    private String name;
    
    /** 产品品类ID */
    private Integer categoryId;
    
    /** 认证标签ID数组 */
    @TableField(typeHandler = JacksonTypeHandler.class)
    private List<Integer> certificationIds;
    
    /** 主要销售区域ID数组 */
    @TableField(typeHandler = JacksonTypeHandler.class)
    private List<Integer> targetRegionIds;
    
    /** 主要销售国家代码数组 */
    @TableField(typeHandler = JacksonTypeHandler.class)
    private List<String> targetCountryIds;
    
    /** 年销售额 */
    private String annualSales;
    
    /** 原材料本地采购比例 */
    private String localProcurementRatio;
    
    /** 装备自动化程度ID */
    private Integer automationLevelId;
    
    /** 年产能 */
    private String annualCapacity;
    
    /** 物流合作方ID数组 */
    @TableField(typeHandler = JacksonTypeHandler.class)
    private List<Integer> logisticsPartnerIds;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
}
