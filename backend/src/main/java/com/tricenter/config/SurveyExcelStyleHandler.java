package com.tricenter.config;

import com.alibaba.excel.write.handler.CellWriteHandler;
import com.alibaba.excel.metadata.Head;
import com.alibaba.excel.metadata.data.WriteCellData;
import com.alibaba.excel.write.metadata.holder.WriteSheetHolder;
import com.alibaba.excel.write.metadata.holder.WriteTableHolder;
import org.apache.poi.ss.usermodel.*;

import java.util.HashMap;
import java.util.IdentityHashMap;
import java.util.List;
import java.util.Map;

/**
 * 调研Excel样式处理器
 * - 表头：深蓝背景+白色粗体+自动换行
 * - 提示行（第2行）：浅黄背景+深灰斜体
 * - 示例行（第3行）：浅蓝背景+蓝色字体
 * - 数据行：斑马纹+动态行高
 */
public class SurveyExcelStyleHandler implements CellWriteHandler {

    private final Map<Workbook, CachedStyles> styleCache = new IdentityHashMap<>();
    private final Map<Sheet, Map<Integer, Integer>> columnWidthCache = new IdentityHashMap<>();

    @Override
    @SuppressWarnings("PMD.CloseResource") // EasyExcel owns and closes the workbook after handlers finish.
    public void afterCellDispose(WriteSheetHolder writeSheetHolder, WriteTableHolder writeTableHolder,
                                  List<WriteCellData<?>> cellDataList, Cell cell, Head head,
                                  Integer relativeRowIndex, Boolean isHead) {
        if (cell == null) return;
        Workbook workbook = cell.getSheet().getWorkbook();
        Sheet sheet = cell.getSheet();
        CachedStyles styles = styleCache.computeIfAbsent(workbook, this::buildStyles);

        if (Boolean.TRUE.equals(isHead)) {
            cell.setCellStyle(styles.headStyle);
            // 需求分析Sheet有4行表头，压低行高避免顶部区域过高
            String sheetName = cell.getSheet().getSheetName();
            if ("需求分析".equals(sheetName)) {
                int rowIdx = cell.getRowIndex();
                if (rowIdx == 0 || rowIdx == 1) {
                    cell.getRow().setHeightInPoints(18);
                } else if (rowIdx == 2) {
                    cell.getRow().setHeightInPoints(28);
                } else if (rowIdx == 3) {
                    cell.getRow().setHeightInPoints(44);
                }
            } else {
                cell.getRow().setHeightInPoints(40);
            }
        } else if (relativeRowIndex != null && relativeRowIndex == 0) {
            // 提示行
            cell.setCellStyle(styles.hintStyle);
            // 动态行高：根据内容计算
            adjustRowHeight(cell, sheet, 9, 80);
        } else if (relativeRowIndex != null && relativeRowIndex == 1) {
            // 示例行
            cell.setCellStyle(styles.exampleStyle);
            cell.getRow().setHeightInPoints(24);
        } else {
            // 数据行
            cell.setCellStyle(relativeRowIndex != null && relativeRowIndex % 2 == 0
                    ? styles.dataEvenStyle
                    : styles.dataOddStyle);
            // 动态行高：根据内容计算，最小22pt
            adjustRowHeight(cell, sheet, 10, 22);
        }
    }

    private CachedStyles buildStyles(Workbook workbook) {
        CachedStyles styles = new CachedStyles();

        Font headFont = workbook.createFont();
        headFont.setBold(true);
        headFont.setColor(IndexedColors.WHITE.getIndex());
        headFont.setFontName("微软雅黑");
        headFont.setFontHeightInPoints((short) 11);
        styles.headStyle = workbook.createCellStyle();
        styles.headStyle.setFont(headFont);
        styles.headStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
        styles.headStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        styles.headStyle.setAlignment(HorizontalAlignment.CENTER);
        styles.headStyle.setVerticalAlignment(VerticalAlignment.CENTER);
        styles.headStyle.setWrapText(true);
        setBorders(styles.headStyle, BorderStyle.THIN, IndexedColors.WHITE.getIndex());

        Font hintFont = workbook.createFont();
        hintFont.setItalic(true);
        hintFont.setColor(IndexedColors.GREY_50_PERCENT.getIndex());
        hintFont.setFontName("微软雅黑");
        hintFont.setFontHeightInPoints((short) 9);
        styles.hintStyle = workbook.createCellStyle();
        styles.hintStyle.setFont(hintFont);
        styles.hintStyle.setFillForegroundColor(IndexedColors.LEMON_CHIFFON.getIndex());
        styles.hintStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        styles.hintStyle.setAlignment(HorizontalAlignment.LEFT);
        styles.hintStyle.setVerticalAlignment(VerticalAlignment.CENTER);
        styles.hintStyle.setWrapText(true);
        setBorders(styles.hintStyle, BorderStyle.THIN, IndexedColors.GREY_25_PERCENT.getIndex());

        Font exampleFont = workbook.createFont();
        exampleFont.setFontName("微软雅黑");
        exampleFont.setFontHeightInPoints((short) 10);
        exampleFont.setColor(IndexedColors.BLUE.getIndex());
        styles.exampleStyle = workbook.createCellStyle();
        styles.exampleStyle.setFont(exampleFont);
        styles.exampleStyle.setFillForegroundColor(IndexedColors.PALE_BLUE.getIndex());
        styles.exampleStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        styles.exampleStyle.setAlignment(HorizontalAlignment.LEFT);
        styles.exampleStyle.setVerticalAlignment(VerticalAlignment.CENTER);
        styles.exampleStyle.setWrapText(true);
        styles.exampleStyle.setBorderBottom(BorderStyle.MEDIUM);
        styles.exampleStyle.setBottomBorderColor(IndexedColors.CORNFLOWER_BLUE.getIndex());
        styles.exampleStyle.setBorderLeft(BorderStyle.THIN);
        styles.exampleStyle.setLeftBorderColor(IndexedColors.GREY_25_PERCENT.getIndex());
        styles.exampleStyle.setBorderRight(BorderStyle.THIN);
        styles.exampleStyle.setRightBorderColor(IndexedColors.GREY_25_PERCENT.getIndex());

        Font dataFont = workbook.createFont();
        dataFont.setFontName("微软雅黑");
        dataFont.setFontHeightInPoints((short) 10);
        styles.dataOddStyle = workbook.createCellStyle();
        styles.dataOddStyle.setFont(dataFont);
        styles.dataOddStyle.setAlignment(HorizontalAlignment.LEFT);
        styles.dataOddStyle.setVerticalAlignment(VerticalAlignment.CENTER);
        styles.dataOddStyle.setWrapText(true);
        setBorders(styles.dataOddStyle, BorderStyle.THIN, IndexedColors.GREY_25_PERCENT.getIndex());

        styles.dataEvenStyle = workbook.createCellStyle();
        styles.dataEvenStyle.cloneStyleFrom(styles.dataOddStyle);
        styles.dataEvenStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        styles.dataEvenStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        return styles;
    }

    private void setBorders(CellStyle style, BorderStyle borderStyle, short color) {
        style.setBorderBottom(borderStyle);
        style.setBottomBorderColor(color);
        style.setBorderTop(borderStyle);
        style.setTopBorderColor(color);
        style.setBorderLeft(borderStyle);
        style.setLeftBorderColor(color);
        style.setBorderRight(borderStyle);
        style.setRightBorderColor(color);
    }

    /**
     * 根据单元格内容动态计算行高（只增大不缩小）。
     * 每个单元格写完都会调用一次，所以只算当前单元格即可，行高最终等于整行最大值。
     * 不能每次重扫整行：需求分析 Sheet 每个企业一列，1080 家时整行重扫加上 POI
     * getColumnWidth 的线性查找是立方级，导出要跑十几分钟。
     */
    private void adjustRowHeight(Cell cell, Sheet sheet, int fontSize, float minHeight) {
        Row row = cell.getRow();
        float neededHeight = minHeight;
        String content = null;
        try {
            content = cell.getStringCellValue();
        } catch (Exception ignored) {
            // 非字符串单元格不参与行高计算
        }
        if (content != null && !content.isEmpty()) {
            // 获取列宽（单位：1/256字符宽度），转换为字符数
            int colChars = Math.max(columnWidth(sheet, cell.getColumnIndex()) / 256, 8);

            // 计算需要的行数：换行符 + 文字自动换行
            int lines = 1;
            String[] parts = content.split("\n");
            for (String part : parts) {
                int partLen = 0;
                for (char ch : part.toCharArray()) {
                    partLen += (ch > 127) ? 2 : 1; // 中文算2字符宽
                }
                lines += Math.max(0, (int) Math.ceil((double) partLen / colChars) - 1);
            }
            lines += parts.length - 1; // 换行符本身的行数
            neededHeight = Math.max(neededHeight, (float) lines * (fontSize + 5));
        }

        if (neededHeight > row.getHeightInPoints()) {
            row.setHeightInPoints(neededHeight);
        }
    }

    /** 列宽在 afterSheetCreate 里就设好了，写数据期间不变，按 Sheet 缓存避免 POI 的线性查找。 */
    private int columnWidth(Sheet sheet, int columnIndex) {
        return columnWidthCache.computeIfAbsent(sheet, s -> new HashMap<>())
                .computeIfAbsent(columnIndex, sheet::getColumnWidth);
    }

    private static class CachedStyles {
        private CellStyle headStyle;
        private CellStyle hintStyle;
        private CellStyle exampleStyle;
        private CellStyle dataOddStyle;
        private CellStyle dataEvenStyle;
    }
}
