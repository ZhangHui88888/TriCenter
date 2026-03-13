package com.tricenter.config;

import com.alibaba.excel.write.handler.CellWriteHandler;
import com.alibaba.excel.metadata.Head;
import com.alibaba.excel.metadata.data.WriteCellData;
import com.alibaba.excel.write.metadata.holder.WriteSheetHolder;
import com.alibaba.excel.write.metadata.holder.WriteTableHolder;
import org.apache.poi.ss.usermodel.*;

import java.util.List;

/**
 * 调研Excel样式处理器
 * - 表头：深蓝背景+白色粗体+自动换行
 * - 提示行（第2行）：浅黄背景+深灰斜体
 * - 示例行（第3行）：浅蓝背景+蓝色字体
 * - 数据行：斑马纹+动态行高
 */
public class SurveyExcelStyleHandler implements CellWriteHandler {

    @Override
    public void afterCellDispose(WriteSheetHolder writeSheetHolder, WriteTableHolder writeTableHolder,
                                  List<WriteCellData<?>> cellDataList, Cell cell, Head head,
                                  Integer relativeRowIndex, Boolean isHead) {
        if (cell == null) return;
        Workbook workbook = cell.getSheet().getWorkbook();
        Sheet sheet = cell.getSheet();

        if (Boolean.TRUE.equals(isHead)) {
            CellStyle headStyle = workbook.createCellStyle();
            Font headFont = workbook.createFont();
            headFont.setBold(true);
            headFont.setColor(IndexedColors.WHITE.getIndex());
            headFont.setFontName("微软雅黑");
            headFont.setFontHeightInPoints((short) 11);
            headStyle.setFont(headFont);
            headStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            headStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headStyle.setAlignment(HorizontalAlignment.CENTER);
            headStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            headStyle.setWrapText(true);
            setBorders(headStyle, BorderStyle.THIN, IndexedColors.WHITE.getIndex());
            cell.setCellStyle(headStyle);
            // 需求分析Sheet有4行表头，使用不同行高
            String sheetName = cell.getSheet().getSheetName();
            if ("需求分析".equals(sheetName)) {
                int rowIdx = cell.getRowIndex();
                if (rowIdx == 0 || rowIdx == 1) {
                    cell.getRow().setHeightInPoints(25);
                } else if (rowIdx == 2) {
                    cell.getRow().setHeightInPoints(50);
                } else if (rowIdx == 3) {
                    cell.getRow().setHeightInPoints(120);
                }
            } else {
                cell.getRow().setHeightInPoints(40);
            }
        } else if (relativeRowIndex != null && relativeRowIndex == 0) {
            // 提示行
            CellStyle hintStyle = workbook.createCellStyle();
            Font hintFont = workbook.createFont();
            hintFont.setItalic(true);
            hintFont.setColor(IndexedColors.GREY_50_PERCENT.getIndex());
            hintFont.setFontName("微软雅黑");
            hintFont.setFontHeightInPoints((short) 9);
            hintStyle.setFont(hintFont);
            hintStyle.setFillForegroundColor(IndexedColors.LEMON_CHIFFON.getIndex());
            hintStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            hintStyle.setAlignment(HorizontalAlignment.LEFT);
            hintStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            hintStyle.setWrapText(true);
            setBorders(hintStyle, BorderStyle.THIN, IndexedColors.GREY_25_PERCENT.getIndex());
            cell.setCellStyle(hintStyle);
            // 动态行高：根据内容计算
            adjustRowHeight(cell, sheet, 9, 80);
        } else if (relativeRowIndex != null && relativeRowIndex == 1) {
            // 示例行
            CellStyle exampleStyle = workbook.createCellStyle();
            Font exampleFont = workbook.createFont();
            exampleFont.setFontName("微软雅黑");
            exampleFont.setFontHeightInPoints((short) 10);
            exampleFont.setColor(IndexedColors.BLUE.getIndex());
            exampleStyle.setFont(exampleFont);
            exampleStyle.setFillForegroundColor(IndexedColors.PALE_BLUE.getIndex());
            exampleStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            exampleStyle.setAlignment(HorizontalAlignment.LEFT);
            exampleStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            exampleStyle.setWrapText(true);
            exampleStyle.setBorderBottom(BorderStyle.MEDIUM);
            exampleStyle.setBottomBorderColor(IndexedColors.CORNFLOWER_BLUE.getIndex());
            exampleStyle.setBorderLeft(BorderStyle.THIN);
            exampleStyle.setLeftBorderColor(IndexedColors.GREY_25_PERCENT.getIndex());
            exampleStyle.setBorderRight(BorderStyle.THIN);
            exampleStyle.setRightBorderColor(IndexedColors.GREY_25_PERCENT.getIndex());
            cell.setCellStyle(exampleStyle);
            cell.getRow().setHeightInPoints(24);
        } else {
            // 数据行
            CellStyle dataStyle = workbook.createCellStyle();
            Font dataFont = workbook.createFont();
            dataFont.setFontName("微软雅黑");
            dataFont.setFontHeightInPoints((short) 10);
            dataStyle.setFont(dataFont);
            dataStyle.setAlignment(HorizontalAlignment.LEFT);
            dataStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            dataStyle.setWrapText(true);
            setBorders(dataStyle, BorderStyle.THIN, IndexedColors.GREY_25_PERCENT.getIndex());

            if (relativeRowIndex != null && relativeRowIndex % 2 == 0) {
                dataStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
                dataStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            }

            cell.setCellStyle(dataStyle);
            // 动态行高：根据内容计算，最小22pt
            adjustRowHeight(cell, sheet, 10, 22);
        }
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
     * 根据单元格内容动态计算行高
     * 遍历当前行所有单元格，取最大需要行高
     */
    private void adjustRowHeight(Cell cell, Sheet sheet, int fontSize, float minHeight) {
        Row row = cell.getRow();
        float maxHeight = minHeight;

        for (int i = 0; i <= row.getLastCellNum(); i++) {
            Cell c = row.getCell(i);
            if (c == null) continue;
            String content = "";
            try {
                content = c.getStringCellValue();
            } catch (Exception e) {
                continue;
            }
            if (content == null || content.isEmpty()) continue;

            // 获取列宽（单位：1/256字符宽度），转换为字符数
            int colWidthUnits = sheet.getColumnWidth(i);
            int colChars = Math.max(colWidthUnits / 256, 8);

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

            float neededHeight = lines * (fontSize + 5);
            if (neededHeight > maxHeight) {
                maxHeight = neededHeight;
            }
        }

        // 只增大不缩小
        if (maxHeight > row.getHeightInPoints()) {
            row.setHeightInPoints(maxHeight);
        }
    }
}
