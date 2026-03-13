package com.tricenter.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 服务商实体
 */
@Data
@TableName(value = "providers", autoResultMap = true)
public class Provider {
    
    @TableId(type = IdType.AUTO)
    private Integer id;
    
    /** 服务商名称 */
    private String name;
    
    /** 服务分类 */
    private String category;
    
    /** 服务商简介 */
    private String description;
    
    // ========== 企业资质 ==========
    /** 统一社会信用代码 */
    private String creditCode;
    
    /** 省 */
    private String province;
    
    /** 市 */
    private String city;
    
    /** 区(所属区域) */
    private String district;
    
    /** 详细地址 */
    private String address;
    
    /** 官网 */
    private String website;
    
    /** Logo图片 */
    private String logo;
    
    // ========== 服务能力 ==========
    /** 服务范围描述 */
    private String serviceScope;
    
    /** 服务标签ID数组 */
    @TableField(typeHandler = JacksonTypeHandler.class)
    private List<Integer> serviceTags;
    
    /** 人员规模ID */
    private Integer staffSizeId;
    
    /** 资质证书描述 */
    private String qualification;
    
    // ========== 合作信息 ==========
    /** 合作开始日期 */
    private LocalDate cooperationStartDate;
    
    /** 合作状态: ACTIVE/SUSPENDED/TERMINATED */
    private String cooperationStatus;
    
    /** 合同到期日期 */
    private LocalDate contractEndDate;
    
    // ========== 绩效评估 ==========
    /** 综合服务评分(来自小程序端同步) */
    private BigDecimal serviceRating;
    
    /** 累计服务次数(来自小程序端同步) */
    private Integer totalServiceCount;
    
    /** 累计服务企业数(来自小程序端同步) */
    private Integer totalServedEnterprises;
    
    // ========== 跨系统关联 ==========
    /** 关联园区小程序服务商ID(booking.providers.id) */
    private Integer bookingProviderId;
    
    // ========== 系统字段 ==========
    /** 是否删除 */
    @TableLogic
    private Integer isDeleted;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
}
