package com.tricenter.dto.excel;

import com.alibaba.excel.annotation.ExcelProperty;
import com.alibaba.excel.annotation.write.style.ColumnWidth;
import lombok.Data;

/**
 * 调研Excel - Sheet4: 外贸信息
 */
@Data
public class SurveyTradeData {

    @ExcelProperty("企业ID")
    @ColumnWidth(12)
    private Integer enterpriseId;

    @ExcelProperty("企业名称")
    @ColumnWidth(30)
    private String enterpriseName;

    @ExcelProperty("主要销售区域")
    @ColumnWidth(45)
    private String targetRegions;

    @ExcelProperty("主要销售国家")
    @ColumnWidth(45)
    private String targetCountries;

    @ExcelProperty("外贸模式")
    @ColumnWidth(35)
    private String tradeMode;

    @ExcelProperty("是否有进出口资质")
    @ColumnWidth(20)
    private String hasImportExportLicense;

    @ExcelProperty("报关申报主体模式")
    @ColumnWidth(22)
    private String customsDeclarationMode;

    @ExcelProperty("外贸团队模式")
    @ColumnWidth(35)
    private String tradeTeamMode;

    @ExcelProperty("外贸团队人数")
    @ColumnWidth(15)
    private String tradeTeamSize;

    @ExcelProperty("是否有国内电商经验")
    @ColumnWidth(22)
    private String hasDomesticEcommerce;

    @ExcelProperty("上年外贸营业额(万元)")
    @ColumnWidth(22)
    private String lastYearRevenue;

    @ExcelProperty("上上年外贸营业额(万元)")
    @ColumnWidth(22)
    private String yearBeforeLastRevenue;

    @ExcelProperty("增长市场")
    @ColumnWidth(35)
    private String growthMarkets;

    @ExcelProperty("下降市场")
    @ColumnWidth(35)
    private String declineMarkets;

    @ExcelProperty("增长模式")
    @ColumnWidth(35)
    private String growthModes;

    @ExcelProperty("下降模式")
    @ColumnWidth(35)
    private String declineModes;

    @ExcelProperty("增长品类")
    @ColumnWidth(35)
    private String growthCategories;

    @ExcelProperty("下降品类")
    @ColumnWidth(35)
    private String declineCategories;

    @ExcelProperty("增长原因")
    @ColumnWidth(40)
    private String growthReasons;

    @ExcelProperty("下降原因")
    @ColumnWidth(40)
    private String declineReasons;
}
