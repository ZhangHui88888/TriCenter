package com.tricenter.dto.excel;

import com.alibaba.excel.annotation.ExcelProperty;
import com.alibaba.excel.annotation.write.style.ColumnWidth;
import com.alibaba.excel.annotation.write.style.HeadStyle;
import lombok.Data;

/**
 * 调研Excel - Sheet1: 企业基本信息
 */
@Data
public class SurveyBasicInfoData {

    @ExcelProperty("企业ID")
    @ColumnWidth(12)
    private Integer enterpriseId;

    @ExcelProperty("企业名称")
    @ColumnWidth(30)
    private String name;

    @ExcelProperty("统一社会信用代码")
    @ColumnWidth(28)
    private String creditCode;

    @ExcelProperty("成立日期")
    @ColumnWidth(15)
    private String establishedDate;

    @ExcelProperty("注册资本")
    @ColumnWidth(15)
    private String registeredCapital;

    @ExcelProperty("所属区域")
    @ColumnWidth(35)
    private String district;

    @ExcelProperty("详细地址")
    @ColumnWidth(45)
    private String address;

    @ExcelProperty("所属行业")
    @ColumnWidth(30)
    private String industryName;

    @ExcelProperty("企业类型")
    @ColumnWidth(30)
    private String enterpriseType;

    @ExcelProperty("人员规模")
    @ColumnWidth(45)
    private String staffSize;

    @ExcelProperty("官网")
    @ColumnWidth(30)
    private String website;

    @ExcelProperty("国内营收")
    @ColumnWidth(40)
    private String domesticRevenue;

    @ExcelProperty("跨境营收")
    @ColumnWidth(40)
    private String crossBorderRevenue;

    @ExcelProperty("企业来源")
    @ColumnWidth(30)
    private String source;

    @ExcelProperty("是否有自主品牌")
    @ColumnWidth(18)
    private String hasOwnBrand;

    @ExcelProperty("品牌名称")
    @ColumnWidth(25)
    private String brandNames;

    @ExcelProperty("漏斗阶段")
    @ColumnWidth(22)
    private String stageName;

    @ExcelProperty("ISO认证")
    @ColumnWidth(30)
    private String isoCertifications;

    @ExcelProperty("AEO认证等级")
    @ColumnWidth(18)
    private String aeoCertification;

    @ExcelProperty("其他资质")
    @ColumnWidth(30)
    private String otherCertifications;
}
