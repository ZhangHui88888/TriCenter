package com.tricenter.util;

import com.tricenter.dto.request.EnterpriseQueryRequest;
import com.tricenter.dto.response.RequirementConfigResponse;
import com.tricenter.entity.Enterprise;
import com.tricenter.entity.SystemOption;
import com.tricenter.service.DictionaryCacheService;
import com.tricenter.service.RequirementMatchEngine;
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
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * 企业列表导出：需求分析矩阵 Sheet（需求为行、企业为列，左上筛选说明 + 冻结窗格）。
 */
public final class EnterpriseExportRequirementMatrixSheet {

    /** 阶段、分类、需求ID、需求名称、要点说明、具体说明（与需求文档结构一致） */
    private static final int FIXED_COLS = 6;
    /** 筛选说明合并行数（0..FILTER_MERGE_END） */
    private static final int FILTER_MERGE_END = 2;
    /** 表头所在行（0-based） */
    private static final int HEADER_ROW_INDEX = 3;

    private EnterpriseExportRequirementMatrixSheet() {
    }

    public static void append(
            XSSFWorkbook wb,
            List<Enterprise> enterprises,
            RequirementConfigResponse reqConfig,
            RequirementMatchEngine requirementMatchEngine,
            EnterpriseQueryRequest request,
            DictionaryCacheService dictionaryCache) {
        if (reqConfig == null || reqConfig.getRequirements() == null) {
            Sheet ph = wb.createSheet("需求分析矩阵");
            Row pr = ph.createRow(0);
            pr.createCell(0).setCellValue(
                    reqConfig == null
                            ? "未加载到需求配置（reqConfig 为空），请检查后端 OptionsService / requirements 表。"
                            : "需求列表为空（requirements 为 null），请检查 requirements 表是否有启用的标准需求项。");
            ph.setColumnWidth(0, 80 * 256);
            return;
        }
        Sheet sheet = wb.createSheet("需求分析矩阵");

        CellStyle filterStyle = buildFilterStyle(wb);
        CellStyle headerStyle = buildHeaderStyle(wb);
        CellStyle dataStyle = buildDataStyle(wb);
        CellStyle dataAltStyle = buildDataAltStyle(wb);
        CellStyle dataWrapStyle = buildDataWrapStyle(wb);
        CellStyle dataWrapAltStyle = buildDataWrapAltStyle(wb);
        // 独立样式对象并居中，避免 cloneStyleFrom 在少数环境下的兼容问题
        CellStyle dataCenterStyle = buildDataStyle(wb);
        dataCenterStyle.setAlignment(HorizontalAlignment.CENTER);
        CellStyle dataCenterAltStyle = buildDataAltStyle(wb);
        dataCenterAltStyle.setAlignment(HorizontalAlignment.CENTER);

        String filterText = buildExportFilterSummary(request, dictionaryCache)
                + "\n企业数量：" + enterprises.size()
                + "\n说明：左侧为文档序号顺序的标准需求（含要点与具体说明）；右侧列为企业，单元格为是否命中该需求；自定义需求未逐行列出，请查看企业详情。";

        Row r0 = sheet.createRow(0);
        Cell c0 = r0.createCell(0);
        c0.setCellValue(filterText);
        c0.setCellStyle(filterStyle);
        r0.setHeightInPoints(78f);
        sheet.addMergedRegion(new CellRangeAddress(0, FILTER_MERGE_END, 0, FIXED_COLS - 1));
        for (int r = 1; r <= FILTER_MERGE_END; r++) {
            Row rx = sheet.getRow(r);
            if (rx == null) {
                rx = sheet.createRow(r);
            }
            for (int col = 0; col < FIXED_COLS; col++) {
                Cell cc = rx.getCell(col);
                if (cc == null) {
                    cc = rx.createCell(col);
                }
                cc.setCellStyle(filterStyle);
            }
        }

        Row headerRow = sheet.createRow(HEADER_ROW_INDEX);
        String[] fixedHeaders = {"阶段", "分类", "需求ID", "需求名称", "要点说明", "具体说明"};
        for (int i = 0; i < FIXED_COLS; i++) {
            Cell hc = headerRow.createCell(i);
            hc.setCellValue(fixedHeaders[i]);
            hc.setCellStyle(headerStyle);
        }
        for (int i = 0; i < enterprises.size(); i++) {
            Enterprise e = enterprises.get(i);
            String title = e.getName() != null ? e.getName() : "";
            if (title.length() > 40) {
                title = title.substring(0, 37) + "...";
            }
            title = title + "\n#" + e.getId();
            Cell ec = headerRow.createCell(FIXED_COLS + i);
            ec.setCellValue(title);
            ec.setCellStyle(headerStyle);
        }

        Map<Integer, Set<String>> effectiveByEnterprise = new LinkedHashMap<>();
        for (Enterprise e : enterprises) {
            Set<String> ids = requirementMatchEngine.calculateEffectiveRequirementIds(
                    e.getDimensionSelections(),
                    e.getRemovedRequirements(),
                    e.getCustomRequirements());
            effectiveByEnterprise.put(e.getId(), ids);
        }

        List<RequirementConfigResponse.RequirementItemDTO> reqs = reqConfig.getRequirements();
        int dataStartRow = HEADER_ROW_INDEX + 1;
        for (int r = 0; r < reqs.size(); r++) {
            RequirementConfigResponse.RequirementItemDTO item = reqs.get(r);
            Row row = sheet.createRow(dataStartRow + r);
            boolean alt = r % 2 == 1;
            CellStyle base = alt ? dataAltStyle : dataStyle;

            setCell(row, 0, nz(item.getPhase()), base);
            setCell(row, 1, nz(item.getCategory()), base);
            setCell(row, 2, nz(item.getId()), base);
            setCell(row, 3, nz(item.getName()), base);
            setCell(row, 4, nz(item.getDescription()), alt ? dataWrapAltStyle : dataWrapStyle);
            setCell(row, 5, nz(item.getDetailDescription()), alt ? dataWrapAltStyle : dataWrapStyle);

            String reqId = item.getId();
            for (int c = 0; c < enterprises.size(); c++) {
                Enterprise e = enterprises.get(c);
                boolean on = reqId != null && effectiveByEnterprise.getOrDefault(e.getId(), Set.of()).contains(reqId);
                Cell dc = row.createCell(FIXED_COLS + c);
                dc.setCellValue(on ? "是" : "否");
                dc.setCellStyle(alt ? dataCenterAltStyle : dataCenterStyle);
            }
        }

        sheet.setColumnWidth(0, 14 * 256);
        sheet.setColumnWidth(1, 14 * 256);
        sheet.setColumnWidth(2, 12 * 256);
        sheet.setColumnWidth(3, 28 * 256);
        sheet.setColumnWidth(4, 22 * 256);
        sheet.setColumnWidth(5, 58 * 256);
        for (int i = 0; i < enterprises.size(); i++) {
            sheet.setColumnWidth(FIXED_COLS + i, 12 * 256);
        }
        headerRow.setHeightInPoints(36);

        sheet.createFreezePane(FIXED_COLS, HEADER_ROW_INDEX + 1);
    }

    private static void setCell(Row row, int col, String value, CellStyle style) {
        Cell cell = row.createCell(col);
        cell.setCellValue(value);
        cell.setCellStyle(style);
    }

    private static String nz(String s) {
        return s != null ? s : "";
    }

    private static CellStyle buildFilterStyle(XSSFWorkbook wb) {
        CellStyle st = wb.createCellStyle();
        Font font = wb.createFont();
        font.setFontName("微软雅黑");
        font.setFontHeightInPoints((short) 10);
        st.setFont(font);
        st.setWrapText(true);
        st.setVerticalAlignment(VerticalAlignment.TOP);
        st.setAlignment(HorizontalAlignment.LEFT);
        st.setBorderBottom(BorderStyle.THIN);
        st.setBorderTop(BorderStyle.THIN);
        st.setBorderLeft(BorderStyle.THIN);
        st.setBorderRight(BorderStyle.THIN);
        return st;
    }

    private static CellStyle buildHeaderStyle(XSSFWorkbook wb) {
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
        st.setWrapText(true);
        borderThin(st);
        return st;
    }

    private static CellStyle buildDataStyle(XSSFWorkbook wb) {
        CellStyle st = wb.createCellStyle();
        Font font = wb.createFont();
        font.setFontName("微软雅黑");
        font.setFontHeightInPoints((short) 10);
        st.setFont(font);
        st.setVerticalAlignment(VerticalAlignment.CENTER);
        borderThin(st);
        return st;
    }

    private static CellStyle buildDataAltStyle(XSSFWorkbook wb) {
        CellStyle st = wb.createCellStyle();
        Font font = wb.createFont();
        font.setFontName("微软雅黑");
        font.setFontHeightInPoints((short) 10);
        st.setFont(font);
        st.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        st.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        st.setVerticalAlignment(VerticalAlignment.CENTER);
        borderThin(st);
        return st;
    }

    private static CellStyle buildDataWrapStyle(XSSFWorkbook wb) {
        CellStyle st = buildDataStyle(wb);
        st.setWrapText(true);
        st.setVerticalAlignment(VerticalAlignment.TOP);
        return st;
    }

    private static CellStyle buildDataWrapAltStyle(XSSFWorkbook wb) {
        CellStyle st = buildDataAltStyle(wb);
        st.setWrapText(true);
        st.setVerticalAlignment(VerticalAlignment.TOP);
        return st;
    }

    private static void borderThin(CellStyle st) {
        st.setBorderBottom(BorderStyle.THIN);
        st.setBorderTop(BorderStyle.THIN);
        st.setBorderLeft(BorderStyle.THIN);
        st.setBorderRight(BorderStyle.THIN);
    }

    /**
     * 与列表导出条件一致的可读摘要，仅占用左侧列展示。
     */
    public static String buildExportFilterSummary(EnterpriseQueryRequest request, DictionaryCacheService dict) {
        List<String> parts = new ArrayList<>();
        parts.add("导出日期：" + LocalDate.now());
        if (StringUtils.hasText(request.getKeyword())) {
            parts.add("关键词：" + request.getKeyword());
        }
        if (StringUtils.hasText(request.getCreditCodeKeyword())) {
            parts.add("信用代码(含)：" + request.getCreditCodeKeyword());
        }
        if (StringUtils.hasText(request.getAddressKeyword())) {
            parts.add("详细地址(含)：" + request.getAddressKeyword());
        }
        if (StringUtils.hasText(request.getWebsiteKeyword())) {
            parts.add("官网(含)：" + request.getWebsiteKeyword());
        }
        if (StringUtils.hasText(request.getIsoCertificationsKeyword())) {
            parts.add("ISO认证(含)：" + request.getIsoCertificationsKeyword());
        }
        if (StringUtils.hasText(request.getAeoCertificationKeyword())) {
            parts.add("AEO认证(含)：" + request.getAeoCertificationKeyword());
        }
        if (StringUtils.hasText(request.getOtherCertificationsKeyword())) {
            parts.add("其他资质(含)：" + request.getOtherCertificationsKeyword());
        }
        if (StringUtils.hasText(request.getStage())) {
            String code = StageCodeUtil.normalize(request.getStage());
            SystemOption opt = dict.getOptionByValue("stage", code);
            parts.add("漏斗阶段：" + (opt != null ? opt.getLabel() : request.getStage()));
        }
        if (StringUtils.hasText(request.getDistrict())) {
            parts.add("区域：" + request.getDistrict());
        }
        if (StringUtils.hasText(request.getProvince())) {
            parts.add("省份：" + request.getProvince());
        }
        if (StringUtils.hasText(request.getCity())) {
            parts.add("城市：" + request.getCity());
        }
        if (request.getCreatedDateStart() != null || request.getCreatedDateEnd() != null) {
            String start = request.getCreatedDateStart() != null ? request.getCreatedDateStart().toString() : "—";
            String end = request.getCreatedDateEnd() != null ? request.getCreatedDateEnd().toString() : "—";
            parts.add("录入时间：" + start + "～" + end);
        }
        if (request.getIndustryId() != null && request.getIndustryId() > 0) {
            String name = dict.getIndustryName(request.getIndustryId());
            if (StringUtils.hasText(name)) {
                parts.add("行业：" + name);
            }
        }
        if (StringUtils.hasText(request.getEnterpriseType())) {
            parts.add("企业类型：" + request.getEnterpriseType());
        }
        if (request.getStaffSizeId() != null && request.getStaffSizeId() > 0) {
            String label = dict.getOptionLabel(request.getStaffSizeId());
            if (StringUtils.hasText(label)) {
                parts.add("人员规模：" + label);
            }
        }
        if (request.getDomesticRevenueId() != null && request.getDomesticRevenueId() > 0) {
            String label = dict.getOptionLabel(request.getDomesticRevenueId());
            if (StringUtils.hasText(label)) {
                parts.add("国内营收：" + label);
            }
        }
        if (request.getCrossBorderRevenueId() != null && request.getCrossBorderRevenueId() > 0) {
            String label = dict.getOptionLabel(request.getCrossBorderRevenueId());
            if (StringUtils.hasText(label)) {
                parts.add("跨境营收：" + label);
            }
        }
        if (request.getCrossBorderRevenueMinWan() != null || request.getCrossBorderRevenueMaxWan() != null) {
            String lo = request.getCrossBorderRevenueMinWan() != null ? request.getCrossBorderRevenueMinWan().toPlainString() : "—";
            String hi = request.getCrossBorderRevenueMaxWan() != null ? request.getCrossBorderRevenueMaxWan().toPlainString() : "—";
            parts.add("跨境营收(万元)：" + lo + "～" + hi);
        }
        if (request.getSourceId() != null && request.getSourceId() > 0) {
            String label = dict.getOptionLabel(request.getSourceId());
            if (StringUtils.hasText(label)) {
                parts.add("企业来源：" + label);
            }
        }
        if (request.getHasCrossBorder() != null) {
            parts.add("是否跨境：" + (request.getHasCrossBorder() == 1 ? "是" : "否"));
        }
        if (request.getUsingErp() != null) {
            parts.add("是否使用ERP：" + (request.getUsingErp() == 1 ? "是" : "否"));
        }
        if (StringUtils.hasText(request.getTransformationWillingness())) {
            parts.add("转型意愿：" + request.getTransformationWillingness());
        }
        if (request.getAutomationLevelId() != null && request.getAutomationLevelId() > 0) {
            String label = dict.getOptionLabel(request.getAutomationLevelId());
            if (StringUtils.hasText(label)) {
                parts.add("设备自动化：" + label);
            }
        }
        if (StringUtils.hasText(request.getLocalProcurementRatio())) {
            parts.add("本地采购比例：" + request.getLocalProcurementRatio());
        }
        if (StringUtils.hasText(request.getLogisticsPartnerIds())) {
            parts.add("物流合作方(IDs)：" + request.getLogisticsPartnerIds());
        }
        if (request.getLastFollowupDays() != null) {
            parts.add("最近跟进(天)：" + request.getLastFollowupDays());
        }
        if (StringUtils.hasText(request.getRequirementIds())) {
            parts.add("需求筛选(ID)：" + request.getRequirementIds());
        }
        if (StringUtils.hasText(request.getMainPlatforms())) {
            parts.add("主要平台：" + request.getMainPlatforms());
        }
        if (StringUtils.hasText(request.getTargetMarkets())) {
            parts.add("目标市场：" + request.getTargetMarkets());
        }
        if (request.getHasForeignTrade() != null) {
            parts.add("是否外贸：" + (request.getHasForeignTrade() == 1 ? "是" : "否"));
        }
        if (request.getTradeModeId() != null && request.getTradeModeId() > 0) {
            String label = dict.getOptionLabel(request.getTradeModeId());
            if (StringUtils.hasText(label)) {
                parts.add("外贸模式：" + label);
            }
        }
        if (request.getHasExportQualification() != null) {
            parts.add("进出口资质：" + (request.getHasExportQualification() == 1 ? "有" : "无"));
        }
        if (request.getTradeTeamModeId() != null && request.getTradeTeamModeId() > 0) {
            String label = dict.getOptionLabel(request.getTradeTeamModeId());
            if (StringUtils.hasText(label)) {
                parts.add("外贸团队模式：" + label);
            }
        }
        if (StringUtils.hasText(request.getTradeTeamSize())) {
            parts.add("外贸团队规模：" + request.getTradeTeamSize());
        }
        if (StringUtils.hasText(request.getCrossBorderTeamSize())) {
            parts.add("跨境团队规模：" + request.getCrossBorderTeamSize());
        }
        if (StringUtils.hasText(request.getLogisticsMode())) {
            parts.add("跨境物流：" + request.getLogisticsMode());
        }
        if (StringUtils.hasText(request.getPaymentMethod())) {
            parts.add("支付结算：" + request.getPaymentMethod());
        }
        return String.join("\n", parts);
    }
}
