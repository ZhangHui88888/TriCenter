package com.tricenter.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.util.List;

/**
 * 创建产品请求
 */
@Data
@Schema(description = "创建产品请求")
public class ProductCreateRequest {
    
    @Schema(description = "产品名称", required = true)
    @NotBlank(message = "产品名称不能为空")
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
