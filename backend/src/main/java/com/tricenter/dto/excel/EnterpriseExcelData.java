package com.tricenter.dto.excel;

import com.alibaba.excel.annotation.ExcelProperty;
import com.alibaba.excel.annotation.write.style.ColumnWidth;
import lombok.Data;

/**
 * 企业Excel导入导出数据模型
 */
@Data
public class EnterpriseExcelData {
    
    @ExcelProperty("企业名称")
    @ColumnWidth(30)
    private String name;
    
    @ExcelProperty("统一社会信用代码")
    @ColumnWidth(25)
    private String creditCode;
    
    @ExcelProperty("成立日期")
    @ColumnWidth(15)
    private String establishedDate;
    
    @ExcelProperty("注册资本")
    @ColumnWidth(15)
    private String registeredCapital;
    
    @ExcelProperty("所属区域")
    @ColumnWidth(15)
    private String district;
    
    @ExcelProperty("详细地址")
    @ColumnWidth(40)
    private String address;
    
    @ExcelProperty("行业")
    @ColumnWidth(20)
    private String industryName;
    
    @ExcelProperty("企业类型")
    @ColumnWidth(15)
    private String enterpriseType;
    
    @ExcelProperty("人员规模")
    @ColumnWidth(15)
    private String staffSize;
    
    @ExcelProperty("官网")
    @ColumnWidth(30)
    private String website;
    
    @ExcelProperty("漏斗阶段")
    @ColumnWidth(15)
    private String stageName;
    
    @ExcelProperty("联系人姓名")
    @ColumnWidth(15)
    private String contactName;
    
    @ExcelProperty("联系人电话")
    @ColumnWidth(15)
    private String contactPhone;
    
    @ExcelProperty("联系人职位")
    @ColumnWidth(15)
    private String contactPosition;
    
    @ExcelProperty("是否跨境")
    @ColumnWidth(10)
    private String hasCrossBorder;
    
    @ExcelProperty("ISO认证")
    @ColumnWidth(25)
    private String isoCertifications;
    
    @ExcelProperty("AEO认证等级")
    @ColumnWidth(15)
    private String aeoCertification;
    
    @ExcelProperty("其他资质")
    @ColumnWidth(30)
    private String otherCertifications;

    @ExcelProperty("社交媒体账号")
    @ColumnWidth(35)
    private String socialMediaAccounts;

    @ExcelProperty("国际展会参展情况")
    @ColumnWidth(30)
    private String exhibitionHistory;

    @ExcelProperty("海外代理商/分销商")
    @ColumnWidth(30)
    private String overseasDistributors;

    @ExcelProperty("是否使用CRM")
    @ColumnWidth(15)
    private String usingCrm;
}
