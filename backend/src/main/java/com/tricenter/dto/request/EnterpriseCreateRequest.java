package com.tricenter.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 企业创建请求
 * 支持创建空白企业，只需要企业名称（可选）
 */
@Data
public class EnterpriseCreateRequest {
    
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
    
    private Integer domesticRevenueId;
    
    private Integer crossBorderRevenueId;
    
    private Integer sourceId;
    
    private String website;
    
    // 主要联系人信息（可选）
    private String contactName;
    
    private String contactPhone;
    
    private String contactPosition;
}
