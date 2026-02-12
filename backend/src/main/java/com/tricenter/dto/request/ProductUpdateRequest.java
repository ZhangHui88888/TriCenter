package com.tricenter.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.util.List;

/**
 * 更新产品请求
 */
@Data
@Schema(description = "更新产品请求")
public class ProductUpdateRequest {
    
    @Schema(description = "产品名称")
    @Size(max = 200, message = "产品名称不能超过200个字符")
    private String name;
    
    @Schema(description = "产品品类ID")
    private Integer categoryId;
    
    @Schema(description = "认证标签ID数组")
    private List<Integer> certificationIds;
    
    @Schema(description = "主要销售区域ID数组")
    private List<Integer> targetRegionIds;
    
    @Schema(description = "主要销售国家代码数组")
    private List<String> targetCountryIds;
    
    @Schema(description = "年销售额")
    @Size(max = 50, message = "年销售额不能超过50个字符")
    private String annualSales;
    
    @Schema(description = "原材料本地采购比例")
    @Size(max = 20, message = "原材料本地采购比例不能超过20个字符")
    private String localProcurementRatio;
    
    @Schema(description = "装备自动化程度ID")
    private Integer automationLevelId;
    
    @Schema(description = "年产能")
    @Size(max = 50, message = "年产能不能超过50个字符")
    private String annualCapacity;
    
    @Schema(description = "物流合作方ID数组")
    private List<Integer> logisticsPartnerIds;
}
