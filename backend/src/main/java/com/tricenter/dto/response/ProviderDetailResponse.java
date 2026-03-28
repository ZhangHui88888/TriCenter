package com.tricenter.dto.response;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 服务商详情响应
 */
@Data
public class ProviderDetailResponse {

    private Integer id;
    private String name;
    private String category;
    private String description;
    private String creditCode;
    private String province;
    private String city;
    private String district;
    private String address;
    private String website;
    private String serviceScope;
    private List<Integer> serviceTags;
    private Integer staffSizeId;
    private String qualification;
    private List<String> capabilityRequirementIds;
    private LocalDate cooperationStartDate;
    private String cooperationStatus;
    private LocalDate contractEndDate;
    private BigDecimal serviceRating;
    private Integer totalServiceCount;
    private Integer totalServedEnterprises;
    private Integer bookingProviderId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /** 联系人列表 */
    private List<ContactInfo> contacts;

    /** 服务领域列表 */
    private List<ServiceAreaInfo> serviceAreas;

    @Data
    public static class ContactInfo {
        private Integer id;
        private String name;
        private String phone;
        private String position;
        private Integer isPrimary;
        private String email;
        private String wechat;
        private String remark;
    }

    @Data
    public static class ServiceAreaInfo {
        private Integer id;
        private String areaName;
        private String description;
        private Integer sortOrder;
    }
}
