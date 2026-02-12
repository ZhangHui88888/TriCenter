package com.tricenter.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 企业详情响应
 */
@Data
public class EnterpriseDetailResponse {
    
    // ========== 基本信息 ==========
    private Integer id;
    private String name;
    private String creditCode;
    private String province;
    private String city;
    private String district;
    private String address;
    private Integer industryId;
    private String industryName;
    private String enterpriseType;
    private Integer staffSizeId;
    private String staffSizeLabel;
    private String website;
    private Integer domesticRevenueId;
    private String domesticRevenueLabel;
    private Integer crossBorderRevenueId;
    private String crossBorderRevenueLabel;
    private Integer sourceId;
    private String sourceLabel;
    private String stage;
    private String stageName;
    private String stageColor;
    
    // ========== 联系人列表 ==========
    private List<ContactResponse> contacts;
    
    // ========== 品牌信息 ==========
    private Boolean hasOwnBrand;
    private List<String> brandNames;
    
    // ========== 外贸信息 ==========
    private List<Integer> targetRegionIds;
    private List<String> targetCountryIds;
    private Integer tradeModeId;
    private String tradeModeLabel;
    private Boolean hasImportExportLicense;
    private String customsDeclarationMode;
    private Integer tradeTeamModeId;
    private String tradeTeamModeLabel;
    private Integer tradeTeamSize;
    private Boolean hasDomesticEcommerce;
    
    // ========== 外贸业绩 ==========
    private BigDecimal lastYearRevenue;
    private BigDecimal yearBeforeLastRevenue;
    private Object marketChanges;
    private Object modeChanges;
    private Object categoryChanges;
    private List<Integer> growthReasons;
    private List<Integer> declineReasons;
    
    // ========== 跨境电商信息 ==========
    private Boolean hasCrossBorder;
    private String crossBorderRatio;
    private String crossBorderLogistics;
    private String paymentSettlement;
    private Integer crossBorderTeamSize;
    private Boolean usingErp;
    private String transformationWillingness;
    private String investmentWillingness;
    private List<Integer> crossBorderPlatforms;
    private Object targetMarkets;
    
    // ========== 三中心评估 ==========
    private Integer serviceCooperationRating;
    private Integer investmentCooperationRating;
    private Integer incubationCooperationRating;
    private Integer brandCooperationRating;
    private Integer trainingCooperationRating;
    private Integer overallCooperationRating;
    private Integer benchmarkPossibility;
    private String additionalNotes;
    
    // ========== 政策支持 ==========
    private Boolean hasPolicySupport;
    private List<String> enjoyedPolicies;
    private Object desiredSupport;
    private Object cooperationDemands;
    
    // ========== 竞争力信息 ==========
    private String competitionPosition;
    private String competitionDescription;
    private String painPoints;
    
    // ========== 三中心合作 ==========
    private List<String> tricenterDemands;
    private String tricenterConcerns;
    
    // ========== 产品列表 ==========
    private List<ProductInfo> products;
    
    // ========== 专利列表 ==========
    private List<PatentInfo> patents;
    
    // ========== 时间戳 ==========
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @Data
    public static class ProductInfo {
        private Integer id;
        private String name;
        private Integer categoryId;
        private String categoryName;
        private List<Integer> certificationIds;
        private List<String> certificationNames;
        private List<Integer> targetRegionIds;
        private List<String> targetRegionNames;
        private List<String> targetCountryIds;
        private String annualSales;
        private String localProcurementRatio;
        private Integer automationLevelId;
        private String automationLevelName;
        private String annualCapacity;
        private List<Integer> logisticsPartnerIds;
        private List<String> logisticsPartnerNames;
    }
    
    @Data
    public static class PatentInfo {
        private Integer id;
        private String name;
        private String patentNo;
    }
    
    @Data
    public static class ContactResponse {
        private Integer id;
        private String name;
        private String phone;
        private String position;
        private Boolean isPrimary;
        private String email;
        private String wechat;
        private String remark;
    }
}
