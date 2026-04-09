package com.tricenter.service;

import java.util.Set;

/**
 * 企业画像维度 → 有效需求 ID 集合（必选底座 + 维度展开 + 自定义 − 已移除）
 */
public interface RequirementMatchEngine {

    Set<String> calculateEffectiveRequirementIds(
            Object dimensionSelections,
            Object removedRequirements,
            Object addedRequirements,
            Object customRequirements
    );
}
