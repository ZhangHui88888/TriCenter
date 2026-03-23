package com.tricenter.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.tricenter.entity.RequirementDimensionMapping;
import com.tricenter.mapper.RequirementDimensionMappingMapper;
import com.tricenter.service.RequirementDimensionService;
import com.tricenter.util.RequirementFilterHelper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Collectors;

/**
 * dimension_key + dimension_value -> 需求 ID 集合（来自 DB）
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RequirementDimensionServiceImpl implements RequirementDimensionService {

    private static final Set<String> ALLOWED_KEYS = Set.of(
            "enterpriseType", "targetMode", "currentStage", "brandStatus", "ecommerceExp"
    );

    private final RequirementDimensionMappingMapper mappingMapper;

    /** 缓存：dimensionKey -> dimensionValue -> requirementIds */
    private final AtomicReference<Map<String, Map<String, Set<String>>>> invertedCache =
            new AtomicReference<>(Map.of());

    @PostConstruct
    public void init() {
        long count = mappingMapper.selectCount(null);
        if (count == 0) {
            log.info("requirement_dimension_mapping 为空，从静态映射种子数据");
            seedFromStatic();
        }
        refreshCache();
    }

    private void seedFromStatic() {
        Map<String, Map<String, Set<String>>> src = RequirementFilterHelper.getStaticDimensionRequirementMapping();
        List<RequirementDimensionMapping> batch = new ArrayList<>();
        src.forEach((dk, inner) -> inner.forEach((dv, reqIds) -> {
            for (String rid : reqIds) {
                RequirementDimensionMapping row = new RequirementDimensionMapping();
                row.setRequirementId(rid);
                row.setDimensionKey(dk);
                row.setDimensionValue(dv);
                row.setCreatedAt(LocalDateTime.now());
                batch.add(row);
            }
        }));
        for (RequirementDimensionMapping row : batch) {
            mappingMapper.insert(row);
        }
        log.info("已种子写入 requirement_dimension_mapping {} 条", batch.size());
    }

    @Override
    public boolean hasStoredMappings() {
        return mappingMapper.selectCount(null) > 0;
    }

    @Override
    public Set<String> expandSelectionsFromDatabase(Map<String, List<String>> selectionMap) {
        Map<String, Map<String, Set<String>>> inv = invertedCache.get();
        Set<String> out = new LinkedHashSet<>();
        selectionMap.forEach((dk, values) -> {
            if (values == null) {
                return;
            }
            Map<String, Set<String>> byValue = inv.get(dk);
            if (byValue == null) {
                return;
            }
            for (String v : values) {
                if (!StringUtils.hasText(v)) {
                    continue;
                }
                Set<String> ids = byValue.get(v.trim());
                if (ids != null) {
                    out.addAll(ids);
                }
            }
        });
        return out;
    }

    @Override
    public Map<String, List<String>> getDimensionsForRequirement(String requirementId) {
        List<RequirementDimensionMapping> rows = mappingMapper.selectList(
                new LambdaQueryWrapper<RequirementDimensionMapping>()
                        .eq(RequirementDimensionMapping::getRequirementId, requirementId)
        );
        Map<String, List<String>> grouped = new LinkedHashMap<>();
        for (RequirementDimensionMapping row : rows) {
            grouped.computeIfAbsent(row.getDimensionKey(), k -> new ArrayList<>())
                    .add(row.getDimensionValue());
        }
        for (List<String> list : grouped.values()) {
            list.sort(String::compareTo);
        }
        return grouped;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void replaceDimensionsForRequirement(String requirementId, Map<String, List<String>> dimensionsByKey) {
        if (!StringUtils.hasText(requirementId)) {
            throw new IllegalArgumentException("requirementId 不能为空");
        }
        mappingMapper.delete(new LambdaQueryWrapper<RequirementDimensionMapping>()
                .eq(RequirementDimensionMapping::getRequirementId, requirementId));

        if (dimensionsByKey == null || dimensionsByKey.isEmpty()) {
            refreshCache();
            return;
        }

        LocalDateTime now = LocalDateTime.now();
        for (Map.Entry<String, List<String>> e : dimensionsByKey.entrySet()) {
            String dk = e.getKey();
            if (!ALLOWED_KEYS.contains(dk)) {
                continue;
            }
            List<String> values = e.getValue();
            if (values == null) {
                continue;
            }
            Set<String> distinct = values.stream()
                    .filter(StringUtils::hasText)
                    .map(String::trim)
                    .collect(Collectors.toCollection(LinkedHashSet::new));
            for (String dv : distinct) {
                RequirementDimensionMapping row = new RequirementDimensionMapping();
                row.setRequirementId(requirementId);
                row.setDimensionKey(dk);
                row.setDimensionValue(dv);
                row.setCreatedAt(now);
                mappingMapper.insert(row);
            }
        }
        refreshCache();
    }

    @Override
    public void refreshCache() {
        List<RequirementDimensionMapping> all = mappingMapper.selectList(null);
        Map<String, Map<String, Set<String>>> inv = new LinkedHashMap<>();
        for (RequirementDimensionMapping row : all) {
            inv.computeIfAbsent(row.getDimensionKey(), k -> new LinkedHashMap<>())
                    .computeIfAbsent(row.getDimensionValue(), k -> new LinkedHashSet<>())
                    .add(row.getRequirementId());
        }
        invertedCache.set(inv);
    }
}
