package com.tricenter.util;

import org.springframework.util.StringUtils;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Locale;

/**
 * 企业漏斗阶段代码与库表、字典约定一致（大写英文枚举，如 POTENTIAL）。
 */
public final class StageCodeUtil {

    private StageCodeUtil() {
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
