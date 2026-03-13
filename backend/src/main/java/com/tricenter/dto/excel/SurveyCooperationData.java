package com.tricenter.dto.excel;

import com.alibaba.excel.annotation.ExcelProperty;
import com.alibaba.excel.annotation.write.style.ColumnWidth;
import lombok.Data;

/**
 * 调研Excel - Sheet6: 合作与政策信息
 */
@Data
public class SurveyCooperationData {

    @ExcelProperty("企业ID")
    @ColumnWidth(12)
    private Integer enterpriseId;

    @ExcelProperty("企业名称")
    @ColumnWidth(30)
    private String enterpriseName;

    @ExcelProperty("企业服务合作(1-5星)")
    @ColumnWidth(20)
    private String serviceCooperationRating;

    @ExcelProperty("招商入驻合作(1-5星)")
    @ColumnWidth(20)
    private String investmentCooperationRating;

    @ExcelProperty("孵化转型合作(1-5星)")
    @ColumnWidth(20)
    private String incubationCooperationRating;

    @ExcelProperty("品牌营销合作(1-5星)")
    @ColumnWidth(20)
    private String brandCooperationRating;

    @ExcelProperty("人才培训合作(1-5星)")
    @ColumnWidth(20)
    private String trainingCooperationRating;

    @ExcelProperty("跨境整体方案(1-5星)")
    @ColumnWidth(20)
    private String overallCooperationRating;

    @ExcelProperty("标杆企业可能性(%)")
    @ColumnWidth(20)
    private String benchmarkPossibility;

    @ExcelProperty("是否享受过政策支持")
    @ColumnWidth(22)
    private String hasPolicySupport;

    @ExcelProperty("已享受政策")
    @ColumnWidth(50)
    private String enjoyedPolicies;

    @ExcelProperty("调研日期")
    @ColumnWidth(15)
    private String surveyDate;

    @ExcelProperty("调研人员")
    @ColumnWidth(18)
    private String surveyStaff;

    @ExcelProperty("行业竞争地位")
    @ColumnWidth(15)
    private String competitionPosition;

    @ExcelProperty("竞争地位描述")
    @ColumnWidth(35)
    private String competitionDescription;

    @ExcelProperty("当前面临风险")
    @ColumnWidth(50)
    private String currentRisks;

    @ExcelProperty("风险详细描述")
    @ColumnWidth(40)
    private String riskDescription;

    @ExcelProperty("补充说明")
    @ColumnWidth(40)
    private String additionalNotes;

    @ExcelProperty("建议事项")
    @ColumnWidth(40)
    private String suggestions;
}
