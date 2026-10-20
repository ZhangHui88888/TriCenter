package com.tricenter.util;

import com.tricenter.common.exception.BusinessException;
import org.springframework.util.StringUtils;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Locale;

/**
 * 企业漏斗阶段代码与库表、字典约定一致（大写英文枚举，如 POTENTIAL）。
 */
public final class StageCodeUtil {

    private static final String[][] IMPORT_STAGES = {
            {"POTENTIAL", "潜在企业"}, {"NO_DEMAND", "无明确需求"},
            {"NO_INTENTION", "没有合作意向"}, {"HAS_DEMAND", "有明确需求"},
            {"SIGNED", "已签约"}, {"SETTLED", "已入驻"}, {"INCUBATING", "重点孵化"}
    };

    private StageCodeUtil() {
    }

    /** 导入接受中文阶段名称或英文代码；空值交由调用方保留原值或使用默认值。 */
    public static String parseImportValue(String value) {
        if (!StringUtils.hasText(value)) return null;
        String trimmed = value.strip();
        for (String[] stage : IMPORT_STAGES) {
            if (stage[1].equals(trimmed) || stage[0].equalsIgnoreCase(trimmed)) {
                return stage[0];
            }
        }
        throw BusinessException.badRequest("无法识别漏斗阶段：" + value
                + "。请填写：" + importLabels());
    }

    public static String importLabels() {
        return String.join("、", Arrays.stream(IMPORT_STAGES).map(stage -> stage[1]).toList());
    }

    /**
     * 将库中可能存在的非规范写法（如小写 potential）归一化为标准阶段代码。
     */
    public static String normalize(String stage) {
        if (!StringUtils.hasText(stage)) {
            return "POTENTIAL";
        }
        return stage.trim().toUpperCase(Locale.ROOT);
    }

    /**
     * WHERE 条件用：兼容库中历史小写（如 potential）与标准大写（POTENTIAL）。
     */
    public static List<String> variantsForDbMatch(String stage) {
        if (!StringUtils.hasText(stage)) {
            return Collections.emptyList();
        }
        String n = normalize(stage);
        return Arrays.asList(n, n.toLowerCase(Locale.ROOT));
    }
}
