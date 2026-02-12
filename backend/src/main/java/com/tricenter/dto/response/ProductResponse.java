package com.tricenter.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 产品响应
 */
@Data
@Schema(description = "产品响应")
public class ProductResponse {
    
    @Schema(description = "产品ID")
    private Integer id;
    
    @Schema(description = "企业ID")
    private Integer enterpriseId;
    
    @Schema(description = "产品名称")
    private String name;
    
    @Schema(description = "产品品类ID")
    private Integer categoryId;
    
    @Schema(description = "产品品类名称")
    private String categoryName;
    
    @Schema(description = "认证标签ID数组")
    private List<Integer> certificationIds;
    
    @Schema(description = "认证标签名称列表")
    private List<String> certificationNames;
    
    @Schema(description = "主要销售区域ID数组")
    private List<Integer> targetRegionIds;
    
    @Schema(description = "主要销售区域名称列表")
    private List<String> targetRegionNames;
    
    @Schema(description = "主要销售国家代码数组")
    private List<String> targetCountryIds;
    
    @Schema(description = "年销售额")
    private String annualSales;
    
    @Schema(description = "原材料本地采购比例")
    private String localProcurementRatio;
    
    @Schema(description = "装备自动化程度ID")
    private Integer automationLevelId;
    
    @Schema(description = "装备自动化程度名称")
    private String automationLevelName;
    
    @Schema(description = "年产能")
    private String annualCapacity;
    
    @Schema(description = "物流合作方ID数组")
    private List<Integer> logisticsPartnerIds;
    
    @Schema(description = "物流合作方名称列表")
    private List<String> logisticsPartnerNames;
    
    @Schema(description = "创建时间")
    private LocalDateTime createdAt;
    
    @Schema(description = "更新时间")
    private LocalDateTime updatedAt;
}
