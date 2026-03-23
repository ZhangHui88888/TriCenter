package com.tricenter.service;

import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * 需求项与画像维度映射（requirement_dimension_mapping）
 */
public interface RequirementDimensionService {

    boolean hasStoredMappings();

    /**
     * 根据企业维度选择，从 DB 映射展开需求 ID（仅 DB，不含代码静态表）
     */
    Set<String> expandSelectionsFromDatabase(Map<String, List<String>> selectionMap);

    Map<String, List<String>> getDimensionsForRequirement(String requirementId);

    void replaceDimensionsForRequirement(String requirementId, Map<String, List<String>> dimensionsByKey);

    void refreshCache();
}
