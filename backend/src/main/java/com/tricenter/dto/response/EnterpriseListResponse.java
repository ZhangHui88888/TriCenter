package com.tricenter.dto.response;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 企业列表响应
 */
@Data
public class EnterpriseListResponse {
    
    private Integer id;
    private String name;
    private String district;
    private String industryName;
    private String enterpriseType;
    private String stage;
    private String stageName;
    private String stageColor;
    private Integer hasCrossBorder;
    private String mainPlatforms;
    private String targetMarkets;
    private LocalDateTime createdAt;
    
    /** 联系人列表 */
    private List<ContactInfo> contacts;
    
    @Data
    public static class ContactInfo {
        private String name;
        private String phone;
        private Boolean isPrimary;
    }
}
