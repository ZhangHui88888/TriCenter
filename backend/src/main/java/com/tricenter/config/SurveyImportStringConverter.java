package com.tricenter.config;

import com.alibaba.excel.converters.Converter;
import com.alibaba.excel.converters.ReadConverterContext;
import com.alibaba.excel.enums.CellDataTypeEnum;

import java.util.Set;

/**
 * 调研表导入：文本单元格去掉首尾空白（含复制粘贴带进来的换行），
 * 并把业务人员手填的“缺失”等占位词当作空值，避免数字列报“必须是整数”。
 */
public class SurveyImportStringConverter implements Converter<String> {

    static final Set<String> BLANK_PLACEHOLDERS = Set.of("缺失");

    @Override
    public Class<?> supportJavaTypeKey() {
        return String.class;
    }

    @Override
    public CellDataTypeEnum supportExcelTypeKey() {
        return CellDataTypeEnum.STRING;
    }

    @Override
    public String convertToJavaData(ReadConverterContext<?> context) {
        String value = context.getReadCellData().getStringValue();
        if (value == null) return null;
        String trimmed = value.strip();
        return trimmed.isEmpty() || BLANK_PLACEHOLDERS.contains(trimmed) ? null : trimmed;
    }
}
