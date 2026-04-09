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

    /** 兼容旧字段，当前前端已改为使用 capabilityRequirementIds 表示服务分类 */
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

    /** 联系人列表，为 null 时不更新联系人；为空数组时清空联系人 */
    private List<ContactInfo> contacts;

    @Data
    public static class ContactInfo {
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
