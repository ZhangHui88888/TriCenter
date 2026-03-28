package com.tricenter.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

/**
 * 服务商更新请求
 */
@Data
public class ProviderUpdateRequest {

    @NotBlank(message = "服务商名称不能为空")
    private String name;

    @NotBlank(message = "服务分类不能为空")
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
}
