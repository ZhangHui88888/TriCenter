package com.tricenter.dto.excel;

import com.alibaba.excel.annotation.ExcelProperty;
import com.alibaba.excel.annotation.write.style.ColumnWidth;
import lombok.Data;

/**
 * 调研Excel - Sheet2: 联系人信息
 */
@Data
public class SurveyContactData {

    @ExcelProperty("企业ID")
    @ColumnWidth(12)
    private Integer enterpriseId;

    @ExcelProperty("企业名称")
    @ColumnWidth(30)
    private String enterpriseName;

    @ExcelProperty("联系人姓名")
    @ColumnWidth(15)
    private String name;

    @ExcelProperty("联系电话")
    @ColumnWidth(18)
    private String phone;

    @ExcelProperty("职位")
    @ColumnWidth(15)
    private String position;

    @ExcelProperty("邮箱")
    @ColumnWidth(25)
    private String email;

    @ExcelProperty("微信")
    @ColumnWidth(18)
    private String wechat;

    @ExcelProperty("是否主要联系人")
    @ColumnWidth(18)
    private String isPrimary;

    @ExcelProperty("备注")
    @ColumnWidth(30)
    private String remark;
}
