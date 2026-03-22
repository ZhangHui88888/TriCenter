package com.tricenter.dto.excel;

import com.alibaba.excel.annotation.ExcelProperty;
import com.alibaba.excel.annotation.write.style.ColumnWidth;
import lombok.Data;

/**
 * 调研Excel - Sheet5: 跨境电商信息
 */
@Data
public class SurveyCrossBorderData {

    @ExcelProperty("企业ID")
    @ColumnWidth(12)
    private Integer enterpriseId;

    @ExcelProperty("企业名称")
    @ColumnWidth(30)
    private String enterpriseName;

    @ExcelProperty("是否开展跨境电商")
    @ColumnWidth(20)
    private String hasCrossBorder;

    @ExcelProperty("跨境平台")
    @ColumnWidth(55)
    private String crossBorderPlatforms;

    @ExcelProperty("跨境业务占比")
    @ColumnWidth(15)
    private String crossBorderRatio;

    @ExcelProperty("跨境物流模式")
    @ColumnWidth(40)
    private String crossBorderLogistics;

    @ExcelProperty("支付结算方式")
    @ColumnWidth(45)
    private String paymentSettlement;

    @ExcelProperty("跨境电商团队规模")
    @ColumnWidth(20)
    private String crossBorderTeamSize;

    @ExcelProperty("是否在用ERP")
    @ColumnWidth(18)
    private String usingErp;

    @ExcelProperty("社交媒体账号")
    @ColumnWidth(40)
    private String socialMediaAccounts;

    @ExcelProperty("国际展会参展情况")
    @ColumnWidth(35)
    private String exhibitionHistory;

    @ExcelProperty("海外代理商/分销商")
    @ColumnWidth(35)
    private String overseasDistributors;

    @ExcelProperty("是否使用CRM系统")
    @ColumnWidth(18)
    private String usingCrm;

    @ExcelProperty("跨境转型意愿")
    @ColumnWidth(18)
    private String transformationWillingness;

    @ExcelProperty("愿意投入转型程度")
    @ColumnWidth(20)
    private String investmentWillingness;

    @ExcelProperty("目标市场及占比")
    @ColumnWidth(50)
    private String targetMarkets;
}
