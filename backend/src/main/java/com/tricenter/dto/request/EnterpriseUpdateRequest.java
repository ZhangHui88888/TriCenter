package com.tricenter.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

/**
 * 企业更新请求
 */
@Data
public class EnterpriseUpdateRequest {
    
    @Size(max = 200, message = "企业名称不能超过200个字符")
    private String name;
    
    @Size(max = 18, message = "统一社会信用代码不能超过18个字符")
    private String creditCode;
    
    private String province;
    private String city;
    private String district;
    private String address;
    private Integer industryId;
    private String enterpriseType;
    private Integer staffSizeId;
    private String website;
    private Integer domesticRevenueId;
    private Integer crossBorderRevenueId;
    private Integer sourceId;
    
    // 品牌信息
    private Integer hasOwnBrand;
    private String brandNames;
    
    // 外贸信息
    private List<Integer> targetRegionIds;
    private List<String> targetCountryIds;
    private Integer tradeModeId;
    private Integer hasImportExportLicense;
    private String customsDeclarationMode;
    private Integer tradeTeamModeId;
    private Integer tradeTeamSize;
    private Integer hasDomesticEcommerce;
    
    // 外贸业绩
    private BigDecimal lastYearRevenue;
    private BigDecimal yearBeforeLastRevenue;
    private Object marketChanges;
    private Object modeChanges;
    private Object categoryChanges;
    private List<Integer> growthReasons;
    private List<Integer> declineReasons;
    
    // 跨境电商信息
    private Integer hasCrossBorder;
    private String crossBorderRatio;
    private String crossBorderLogistics;
    private String paymentSettlement;
    private Integer crossBorderTeamSize;
    private Integer usingErp;
    private String transformationWillingness;
    private String investmentWillingness;
    private List<Integer> crossBorderPlatforms;
    private Object targetMarkets;
    
    // 三中心评估
    private Integer serviceCooperationRating;
    private Integer investmentCooperationRating;
    private Integer incubationCooperationRating;
    private Integer brandCooperationRating;
    private Integer trainingCooperationRating;
    private Integer overallCooperationRating;
    private Integer benchmarkPossibility;
    private String additionalNotes;
    
    // 政策支持
    private Integer hasPolicySupport;
    private List<String> enjoyedPolicies;
    private Object desiredSupport;
    private Object cooperationDemands;
    
    // 竞争力信息
    private String competitionPosition;
    private String competitionDescription;
    private String painPoints;
    
    // 三中心合作
    private List<String> tricenterDemands;
    private String tricenterConcerns;
}
