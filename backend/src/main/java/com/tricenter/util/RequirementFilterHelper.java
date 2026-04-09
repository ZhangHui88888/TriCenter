package com.tricenter.util;

import java.util.*;

/**
 * 企业需求筛选辅助类，与前端 requirementsData.ts 保持一致。
 */
public final class RequirementFilterHelper {

    private static final Set<String> UNIVERSAL_REQUIRED_IDS = new LinkedHashSet<>(Arrays.asList(
            "1.4.2", "1.7.1", "1.7.2", "1.7.3", "1.7.4", "1.7.5",
            "3.4.1", "3.4.2",
            "3.2.2", "3.2.3",
            "1.6.2",
            "3.3.1", "3.3.3",
            "3.4.4",
            "1.2.1", "1.4.4"
    ));

    private static final Set<String> UNIVERSAL_ENHANCED_IDS = new LinkedHashSet<>(Arrays.asList(
            "4.1.2", "4.1.3", "4.1.6",
            "3.3.4", "3.3.5",
            "3.4.5",
            "3.1.8", "4.3.3",
            "3.2.4", "3.2.5"
    ));

    private static final Map<String, Map<String, Set<String>>> DIMENSION_REQUIREMENT_MAPPING = new LinkedHashMap<>();

    static {
        registerDimensionMapping("enterpriseType", "factory",
                "1.1.1", "1.7.1", "4.3.2",
                "1.2.1", "1.4.4", "1.4.3",
                "1.8.1", "1.8.2", "1.8.3", "1.8.4",
                "2.1.1", "2.1.2", "2.1.3", "2.1.4", "2.1.5",
                "2.2.1", "2.2.2", "2.2.3",
                "1.3.1", "1.3.2", "1.3.3", "3.1.1", "3.1.2",
                "3.4.3", "3.4.6",
                "3.5.1", "3.5.2",
                "4.3.1", "4.4.1", "4.4.2", "4.4.3", "4.4.4");
        registerDimensionMapping("enterpriseType", "trading",
                "1.4.1", "1.4.3", "1.2.1", "1.4.4",
                "1.6.1", "1.6.3", "3.6.1", "3.6.2", "3.6.3",
                "2.1.1", "2.1.2", "2.1.3",
                "2.2.1", "2.2.2", "2.2.3",
                "2.4.1", "2.4.2", "2.4.3", "4.4.2",
                "3.5.1", "3.5.2", "3.2.3",
                "1.3.3", "3.1.1", "3.1.5",
                "4.3.1", "4.3.4");
        registerDimensionMapping("enterpriseType", "factoryTrading",
                "1.1.1", "1.7.1", "4.3.2",
                "1.2.1",
                "1.4.1", "1.4.3", "1.4.4",
                "1.3.1", "1.3.2", "1.3.3",
                "2.1.1", "2.1.2", "2.1.3",
                "3.1.1", "3.1.5", "3.2.1",
                "4.3.1", "4.4.1", "4.4.2");
        registerDimensionMapping("enterpriseType", "startup",
                "4.1.4", "1.6.4", "4.1.5",
                "1.5.1", "1.5.2", "1.5.3", "3.2.1",
                "1.4.1", "1.4.3", "1.2.1",
                "1.8.2", "1.5.4", "1.8.3",
                "2.1.1", "2.1.2",
                "2.2.1", "2.2.2",
                "3.1.1", "3.1.5",
                "3.5.1", "3.5.2",
                "3.4.4", "3.4.1");
        // 与前端 requirementsData.ts enterpriseType 一致
        registerDimensionMapping("enterpriseType", "production",
                "1.1.1", "1.7.1", "4.3.2", "1.2.1", "1.4.4", "1.4.3",
                "1.8.1", "1.8.2", "1.8.3", "1.8.4", "2.1.1", "2.1.2", "2.1.3",
                "2.1.4", "2.1.5", "2.2.1", "2.2.2", "2.2.3", "1.3.1", "1.3.2",
                "1.3.3", "3.1.1", "3.1.2", "3.4.3", "3.4.6", "3.5.1", "3.5.2",
                "4.3.1", "4.4.1", "4.4.2", "4.4.3", "4.4.4");
        registerDimensionMapping("enterpriseType", "crossBorderSeller",
                "1.4.1", "1.4.3", "1.2.1", "1.4.4", "2.1.1", "2.1.2", "2.1.3",
                "2.2.1", "2.2.2", "2.2.3", "2.4.1", "2.4.2", "2.4.3", "3.1.1",
                "3.1.3", "3.1.5", "3.2.1", "3.5.1", "3.5.2", "4.3.1", "4.3.4");
        registerDimensionMapping("enterpriseType", "brandOperator",
                "1.1.1", "1.2.1", "1.3.1", "1.3.2", "1.3.3", "1.3.4", "2.2.1",
                "2.2.2", "2.2.3", "2.4.1", "2.4.2", "3.1.1", "3.1.2", "3.1.3",
                "3.1.5", "4.3.2", "4.4.1", "4.4.2");
        registerDimensionMapping("enterpriseType", "supplyChainService",
                "1.2.1", "1.5.1", "1.5.3", "1.6.1", "1.6.2", "1.6.3", "1.7.4",
                "1.7.5", "2.1.1", "2.1.4", "3.6.1", "3.6.2", "3.6.3", "4.1.4");
        registerDimensionMapping("enterpriseType", "technicalService",
                "1.1.1", "1.2.1", "1.4.4", "1.7.1", "1.7.3", "1.8.1", "1.8.2",
                "2.1.1", "2.2.1", "2.4.1", "3.1.1", "3.4.3", "4.3.1", "4.4.2");
        registerDimensionMapping("enterpriseType", "comprehensiveService",
                "1.2.1", "1.3.1", "1.3.3", "1.5.4", "1.8.2", "2.1.1", "2.1.4",
                "3.1.1", "3.1.3", "3.1.5", "4.1.4");
        registerDimensionMapping("enterpriseType", "undefined",
                "1.2.1", "1.4.4", "1.5.1", "1.8.2", "2.1.1", "2.2.1", "3.1.1");

        registerDimensionMapping("targetMode", "b2b",
                "2.1.1", "2.2.1",
                "3.1.7",
                "2.4.4",
                "3.1.3",
                "1.7.4", "3.6.3",
                "3.2.5",
                "1.5.4");
        registerDimensionMapping("targetMode", "b2c",
                "2.1.1", "2.2.2",
                "2.2.1", "2.2.3",
                "3.1.5", "3.1.2", "3.1.6",
                "2.3.1", "2.3.2", "2.3.3",
                "2.4.2", "3.3.5");
        registerDimensionMapping("targetMode", "independent",
                "2.1.2",
                "3.1.1", "3.1.5",
                "2.3.3", "4.2.2",
                "2.3.1", "2.3.2",
                "4.2.2",
                "4.2.1",
                "1.7.3",
                "3.1.6", "1.3.1");
        registerDimensionMapping("targetMode", "offline",
                "2.1.3", "2.1.5",
                "1.3.4",
                "2.1.4", "4.1.3",
                "4.3.2", "1.3.3");

        registerDimensionMapping("currentStage", "observation",
                "1.5.3", "3.5.2",
                "1.5.1",
                "1.8.1", "1.8.3",
                "3.4.4");
        registerDimensionMapping("currentStage", "startup",
                "2.1.1", "2.1.2",
                "2.2.1", "2.2.2",
                "2.4.1", "2.4.2", "2.4.3", "2.4.4",
                "3.1.1",
                "3.3.4");
        registerDimensionMapping("currentStage", "growth",
                "3.1.5", "3.1.6",
                "2.2.1", "3.5.1", "1.3.3",
                "1.6.1",
                "1.8.2", "1.8.1",
                "1.5.1", "2.1.1", "2.1.2", "2.1.3",
                "3.2.4", "3.2.5",
                "3.1.8");
        registerDimensionMapping("currentStage", "bottleneck",
                "3.1.5", "3.1.6", "3.1.2", "4.3.3",
                "2.2.1", "3.5.1", "3.3.4",
                "3.2.3", "3.5.2", "4.5.1",
                "3.4.1", "3.4.2", "3.4.4",
                "3.3.3", "3.3.4", "3.3.5", "2.4.2",
                "1.6.1", "4.3.4",
                "1.8.1", "1.8.3", "3.6.1");
        registerDimensionMapping("currentStage", "mature",
                "4.3.2", "1.1.1",
                "4.3.1", "4.3.4", "4.4.1", "4.4.2", "4.4.3", "4.4.4",
                "4.5.1", "4.1.6",
                "4.2.1", "4.2.2",
                "2.1.1", "2.1.2", "2.1.3", "1.5.1",
                "4.6.1", "2.4.3",
                "1.5.5");

        registerDimensionMapping("brandStatus", "hasBrand",
                "1.1.1", "1.3.3",
                "2.4.1",
                "1.7.1", "3.4.3",
                "2.3.3", "3.1.2", "4.3.2",
                "3.4.6",
                "3.3.1", "3.3.3",
                "4.2.1", "4.2.2");
        registerDimensionMapping("brandStatus", "noBrand",
                "1.4.1", "1.2.1",
                "3.2.3", "4.5.1", "1.6.2",
                "4.3.1", "4.3.4",
                "3.1.5", "3.1.6",
                "2.1.1", "2.1.2", "2.1.3", "1.5.1",
                "1.7.1", "1.7.2", "1.7.3", "1.7.4", "1.7.5", "3.4.1", "3.4.4");

        registerDimensionMapping("ecommerceExp", "hasExp",
                "2.1.1", "3.4.1",
                "1.7.1", "1.7.2", "1.7.3", "1.7.4", "1.7.5", "3.4.2",
                "1.6.2", "4.1.1", "4.1.2", "4.1.3", "4.1.4", "4.1.5", "4.1.6",
                "3.2.2", "3.2.4", "3.2.5",
                "2.2.3");
        registerDimensionMapping("ecommerceExp", "noExp",
                "1.8.2",
                "2.1.1", "2.1.2", "2.1.3", "2.1.4", "2.1.5",
                "2.2.1", "2.2.2", "2.2.3",
                "3.3.1", "3.3.2", "3.3.3", "3.3.4", "3.3.5",
                "3.1.8",
                "3.4.4", "3.4.1",
                "1.8.3", "3.6.1", "3.6.2", "3.6.3");
    }

    private RequirementFilterHelper() {
    }

    public static Set<String> getUniversalRequiredIds() {
        return Collections.unmodifiableSet(new LinkedHashSet<>(UNIVERSAL_REQUIRED_IDS));
    }

    public static Set<String> getUniversalEnhancedIds() {
        return Collections.unmodifiableSet(new LinkedHashSet<>(UNIVERSAL_ENHANCED_IDS));
    }

    /**
     * 静态「维度选项 → 需求 ID」映射（与 DB requirement_dimension_mapping 种子一致）
     */
    public static Map<String, Map<String, Set<String>>> getStaticDimensionRequirementMapping() {
        Map<String, Map<String, Set<String>>> copy = new LinkedHashMap<>();
        DIMENSION_REQUIREMENT_MAPPING.forEach((dk, inner) -> {
            Map<String, Set<String>> innerCopy = new LinkedHashMap<>();
            inner.forEach((k, v) -> innerCopy.put(k, new LinkedHashSet<>(v)));
            copy.put(dk, innerCopy);
        });
        return Collections.unmodifiableMap(copy);
    }

    public static Map<String, List<String>> normalizeSelectionMapPublic(Object dimensionSelections) {
        return normalizeSelectionMap(dimensionSelections);
    }

    /**
     * 仅根据维度选择，用静态映射展开需求 ID（无 DB 时使用）
     */
    public static Set<String> calculateStaticDimensionalIds(Map<String, List<String>> selectionMap) {
        Set<String> dimensionalIds = new LinkedHashSet<>();
        selectionMap.forEach((dimensionKey, selectedValues) -> {
            Map<String, Set<String>> optionMappings = DIMENSION_REQUIREMENT_MAPPING.get(dimensionKey);
            if (optionMappings == null) {
                return;
            }
            for (String selectedValue : selectedValues) {
                Set<String> requirementIds = optionMappings.get(selectedValue);
                if (requirementIds != null) {
                    dimensionalIds.addAll(requirementIds);
                }
            }
        });
        return dimensionalIds;
    }

    public static Set<String> calculateEffectiveRequirementIds(
            Object dimensionSelections,
            Object removedRequirements,
            Object addedRequirements,
            Object customRequirements
    ) {
        Set<String> effectiveIds = new LinkedHashSet<>(UNIVERSAL_REQUIRED_IDS);
        effectiveIds.addAll(UNIVERSAL_ENHANCED_IDS);

        Set<String> dimensionalIds = new LinkedHashSet<>();
        Map<String, List<String>> selectionMap = normalizeSelectionMap(dimensionSelections);
        dimensionalIds.addAll(calculateStaticDimensionalIds(selectionMap));

        dimensionalIds.removeAll(normalizeStringSet(removedRequirements));
        effectiveIds.addAll(dimensionalIds);
        effectiveIds.addAll(normalizeStringSet(addedRequirements));
        effectiveIds.addAll(extractCustomRequirementIds(customRequirements));
        return effectiveIds;
    }

    private static void registerDimensionMapping(String dimensionKey, String optionValue, String... requirementIds) {
        DIMENSION_REQUIREMENT_MAPPING
                .computeIfAbsent(dimensionKey, key -> new LinkedHashMap<>())
                .put(optionValue, new LinkedHashSet<>(Arrays.asList(requirementIds)));
    }

    private static Map<String, List<String>> normalizeSelectionMap(Object source) {
        if (!(source instanceof Map<?, ?> sourceMap)) {
            return Collections.emptyMap();
        }

        Map<String, List<String>> normalized = new LinkedHashMap<>();
        sourceMap.forEach((key, value) -> {
            if (key == null) {
                return;
            }
            List<String> values = normalizeStringList(value);
            if (!values.isEmpty()) {
                normalized.put(String.valueOf(key), values);
            }
        });
        return normalized;
    }

    private static Set<String> normalizeStringSet(Object source) {
        return new LinkedHashSet<>(normalizeStringList(source));
    }

    private static List<String> normalizeStringList(Object source) {
        if (source == null) {
            return Collections.emptyList();
        }

        if (source instanceof Collection<?> collection) {
            List<String> result = new ArrayList<>();
            for (Object item : collection) {
                if (item != null) {
                    String text = String.valueOf(item).trim();
                    if (!text.isEmpty()) {
                        result.add(text);
                    }
                }
            }
            return result;
        }

        String text = String.valueOf(source).trim();
        if (text.isEmpty()) {
            return Collections.emptyList();
        }
        return Collections.singletonList(text);
    }

    private static Set<String> extractCustomRequirementIds(Object customRequirements) {
        if (!(customRequirements instanceof Collection<?> items)) {
            return Collections.emptySet();
        }

        Set<String> ids = new LinkedHashSet<>();
        for (Object item : items) {
            if (item instanceof Map<?, ?> itemMap) {
                Object id = itemMap.get("id");
                if (id != null) {
                    String text = String.valueOf(id).trim();
                    if (!text.isEmpty()) {
                        ids.add(text);
                    }
                }
            }
        }
        return ids;
    }
}
