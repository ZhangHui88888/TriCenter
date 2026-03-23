package com.tricenter.util;

import com.tricenter.dto.excel.EnterpriseExcelData;
import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.util.List;

/**
 * 企业列表 Sheet：与 {@link EnterpriseExcelData} 列顺序、表头文案一致（纯 POI，避免与矩阵 Sheet 合并时的格式兼容问题）。
 */
public final class EnterpriseExportListSheetPoi {

    private static final String[] HEADERS = {
            "企业名称", "统一社会信用代码", "成立日期", "注册资本", "所属区域", "详细地址", "行业", "企业类型",
            "人员规模", "官网", "漏斗阶段", "联系人姓名", "联系人电话", "联系人职位", "是否跨境",
            "ISO认证", "AEO认证等级", "其他资质", "是否有海外分销商"
    };

    /** 列宽（字符数），与 {@link com.alibaba.excel.annotation.write.style.ColumnWidth} 对齐 */
    private static final int[] WIDTH_CHARS = {
            30, 25, 15, 15, 15, 40, 20, 15, 15, 30, 15, 15, 15, 15, 10, 25, 15, 30, 18
    };

    private EnterpriseExportListSheetPoi() {
    }

    public static void writeSheet(XSSFWorkbook wb, List<EnterpriseExcelData> rows) {
        Sheet sheet = wb.createSheet("企业列表");
        CellStyle headerStyle = headerStyle(wb);
        CellStyle bodyStyle = bodyStyle(wb);

        Row h = sheet.createRow(0);
        for (int i = 0; i < HEADERS.length; i++) {
            Cell c = h.createCell(i);
            c.setCellValue(HEADERS[i]);
            c.setCellStyle(headerStyle);
        }

        int ri = 1;
        for (EnterpriseExcelData d : rows) {
            Row row = sheet.createRow(ri++);
            int c = 0;
            set(row, c++, d.getName(), bodyStyle);
            set(row, c++, d.getCreditCode(), bodyStyle);
            set(row, c++, d.getEstablishedDate(), bodyStyle);
            set(row, c++, d.getRegisteredCapital(), bodyStyle);
            set(row, c++, d.getDistrict(), bodyStyle);
            set(row, c++, d.getAddress(), bodyStyle);
            set(row, c++, d.getIndustryName(), bodyStyle);
            set(row, c++, d.getEnterpriseType(), bodyStyle);
            set(row, c++, d.getStaffSize(), bodyStyle);
            set(row, c++, d.getWebsite(), bodyStyle);
            set(row, c++, d.getStageName(), bodyStyle);
            set(row, c++, d.getContactName(), bodyStyle);
            set(row, c++, d.getContactPhone(), bodyStyle);
            set(row, c++, d.getContactPosition(), bodyStyle);
            set(row, c++, d.getHasCrossBorder(), bodyStyle);
            set(row, c++, d.getIsoCertifications(), bodyStyle);
            set(row, c++, d.getAeoCertification(), bodyStyle);
            set(row, c++, d.getOtherCertifications(), bodyStyle);
            set(row, c++, d.getHasOverseasDistributors(), bodyStyle);
        }

        for (int i = 0; i < WIDTH_CHARS.length; i++) {
            sheet.setColumnWidth(i, WIDTH_CHARS[i] * 256);
        }
    }

    private static void set(Row row, int col, String val, CellStyle st) {
        Cell cell = row.createCell(col);
        cell.setCellValue(val != null ? val : "");
        cell.setCellStyle(st);
    }

    private static CellStyle headerStyle(XSSFWorkbook wb) {
        CellStyle st = wb.createCellStyle();
        Font font = wb.createFont();
        font.setFontName("微软雅黑");
        font.setBold(true);
        font.setFontHeightInPoints((short) 10);
        st.setFont(font);
        st.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        st.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        st.setVerticalAlignment(VerticalAlignment.CENTER);
        st.setAlignment(HorizontalAlignment.CENTER);
        st.setBorderBottom(BorderStyle.THIN);
        st.setBorderTop(BorderStyle.THIN);
        st.setBorderLeft(BorderStyle.THIN);
        st.setBorderRight(BorderStyle.THIN);
        return st;
    }

    private static CellStyle bodyStyle(XSSFWorkbook wb) {
        CellStyle st = wb.createCellStyle();
        Font font = wb.createFont();
        font.setFontName("微软雅黑");
        font.setFontHeightInPoints((short) 10);
        st.setFont(font);
        st.setVerticalAlignment(VerticalAlignment.CENTER);
        st.setBorderBottom(BorderStyle.THIN);
        st.setBorderTop(BorderStyle.THIN);
        st.setBorderLeft(BorderStyle.THIN);
        st.setBorderRight(BorderStyle.THIN);
        return st;
    }
}
