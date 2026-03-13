package com.tricenter.dto.excel;

import com.alibaba.excel.annotation.ExcelProperty;
import com.alibaba.excel.annotation.write.style.ColumnWidth;
import lombok.Data;

/**
 * 调研Excel - Sheet3: 产品信息
 */
@Data
public class SurveyProductData {

    @ExcelProperty("企业ID")
    @ColumnWidth(12)
    private Integer enterpriseId;

    @ExcelProperty("企业名称")
    @ColumnWidth(30)
    private String enterpriseName;

    @ExcelProperty("产品名称")
    @ColumnWidth(20)
    private String name;

    @ExcelProperty("产品品类")
    @ColumnWidth(18)
    private String categoryName;

    @ExcelProperty("认证资质")
    @ColumnWidth(50)
    private String certifications;

    @ExcelProperty("主要销售区域")
    @ColumnWidth(45)
    private String targetRegions;

    @ExcelProperty("主要销售国家")
    @ColumnWidth(50)
    private String targetCountries;

    @ExcelProperty("年销售额")
    @ColumnWidth(15)
    private String annualSales;

    @ExcelProperty("原材料本地采购比例")
    @ColumnWidth(22)
    private String localProcurementRatio;

    @ExcelProperty("设备自动化程度")
    @ColumnWidth(35)
    private String automationLevel;

    @ExcelProperty("年产能")
    @ColumnWidth(15)
    private String annualCapacity;

    @ExcelProperty("物流合作方")
    @ColumnWidth(40)
    private String logisticsPartners;
}
