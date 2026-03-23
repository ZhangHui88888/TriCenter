package com.tricenter.service.impl;

import com.tricenter.service.RequirementDimensionService;
import com.tricenter.service.RequirementMatchEngine;
import com.tricenter.util.RequirementFilterHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * 当 requirement_dimension_mapping 有数据时，维度展开仅以 DB 为准（与数据字典维护一致）；
 * 无数据时回退到代码静态表（兼容未跑迁移的空库）。
 */
@Service
@RequiredArgsConstructor
public class RequirementMatchEngineImpl implements RequirementMatchEngine {

    private final RequirementDimensionService requirementDimensionService;

    @Override
    public Set<String> calculateEffectiveRequirementIds(
            Object dimensionSelections,
            Object removedRequirements,
            Object customRequirements
    ) {
        Set<String> effectiveIds = new LinkedHashSet<>(RequirementFilterHelper.getUniversalRequiredIds());
        effectiveIds.addAll(RequirementFilterHelper.getUniversalEnhancedIds());

        Map<String, List<String>> selectionMap = RequirementFilterHelper.normalizeSelectionMapPublic(dimensionSelections);
        Set<String> dimensionalIds;
        if (requirementDimensionService.hasStoredMappings()) {
            dimensionalIds = requirementDimensionService.expandSelectionsFromDatabase(selectionMap);
        } else {
            dimensionalIds = RequirementFilterHelper.calculateStaticDimensionalIds(selectionMap);
        }

        dimensionalIds.removeAll(normalizeStringSet(removedRequirements));
        effectiveIds.addAll(dimensionalIds);
        effectiveIds.addAll(extractCustomRequirementIds(customRequirements));
        return effectiveIds;
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
