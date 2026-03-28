package com.tricenter.dto.response;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 服务商列表响应
 */
@Data
public class ProviderListResponse {

    private Integer id;
    private String name;
    private String category;
    private String categoryName;
    private String district;
    private String cooperationStatus;
    private LocalDate cooperationStartDate;
    private LocalDate contractEndDate;
    private BigDecimal serviceRating;
    private Integer totalServiceCount;
    private Integer totalServedEnterprises;
    private List<String> capabilityRequirementIds;
    private LocalDateTime createdAt;

    /** 主要联系人 */
    private String primaryContactName;
    private String primaryContactPhone;
}
