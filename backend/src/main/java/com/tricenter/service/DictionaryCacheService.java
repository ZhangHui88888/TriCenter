package com.tricenter.service;

import com.tricenter.entity.IndustryCategory;
import com.tricenter.entity.SystemOption;
import com.tricenter.mapper.IndustryCategoryMapper;
import com.tricenter.mapper.SystemOptionMapper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * 数据字典内存缓存服务
 * 启动时加载所有 SystemOption 和 IndustryCategory，避免重复查库
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DictionaryCacheService {

    private final SystemOptionMapper systemOptionMapper;
    private final IndustryCategoryMapper industryCategoryMapper;

    private volatile Map<String, Map<String, SystemOption>> categoryValueMap = new ConcurrentHashMap<>();
    private volatile Map<Integer, SystemOption> optionIdMap = new ConcurrentHashMap<>();
    private volatile Map<Integer, IndustryCategory> industryIdMap = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        refresh();
    }

    /**
     * 全量刷新缓存（字典数据变更后调用）
     */
    public void refresh() {
        long start = System.currentTimeMillis();

        var allOptions = systemOptionMapper.selectList(null);
        Map<Integer, SystemOption> newIdMap = new ConcurrentHashMap<>(allOptions.size());
        Map<String, Map<String, SystemOption>> newCategoryMap = new ConcurrentHashMap<>();
        for (SystemOption option : allOptions) {
            newIdMap.put(option.getId(), option);
            newCategoryMap
                    .computeIfAbsent(option.getCategory(), k -> new ConcurrentHashMap<>())
                    .put(option.getValue(), option);
        }
        this.optionIdMap = newIdMap;
        this.categoryValueMap = newCategoryMap;

        var allIndustries = industryCategoryMapper.selectList(null);
        Map<Integer, IndustryCategory> newIndustryMap = new ConcurrentHashMap<>(allIndustries.size());
        for (IndustryCategory industry : allIndustries) {
            newIndustryMap.put(industry.getId(), industry);
        }
        this.industryIdMap = newIndustryMap;

        log.info("数据字典缓存刷新完成: {} 个选项, {} 个行业分类, 耗时 {}ms",
                allOptions.size(), allIndustries.size(), System.currentTimeMillis() - start);
    }

    public SystemOption getOptionByValue(String category, String value) {
        if (category == null || value == null) return null;
        Map<String, SystemOption> valueMap = categoryValueMap.get(category);
        return valueMap != null ? valueMap.get(value) : null;
    }

    public SystemOption getOptionById(Integer id) {
        if (id == null) return null;
        return optionIdMap.get(id);
    }

    public String getOptionLabel(Integer id) {
        SystemOption option = getOptionById(id);
        return option != null ? option.getLabel() : null;
    }

    public IndustryCategory getIndustryById(Integer id) {
        if (id == null) return null;
        return industryIdMap.get(id);
    }

    public String getIndustryName(Integer id) {
        IndustryCategory industry = getIndustryById(id);
        return industry != null ? industry.getName() : null;
    }

    /**
     * 将任意 industryId 归并到一级分类名称（与数据分析统计口径一致）
     */
    public String resolveLevel1IndustryName(Integer industryId) {
        if (industryId == null) {
            return "未分类";
        }
        IndustryCategory cat = getIndustryById(industryId);
        if (cat == null) {
            return "未分类";
        }
        while (true) {
            Integer lv = cat.getLevel();
            if (lv == null || lv <= 1) {
                break;
            }
            Integer pid = cat.getParentId();
            if (pid == null || pid == 0) {
                break;
            }
            IndustryCategory parent = getIndustryById(pid);
            if (parent == null) {
                break;
            }
            cat = parent;
        }
        String n = cat.getName();
        return n != null && !n.isBlank() ? n : "未分类";
    }

    /**
     * 一级行业分类名称列表（按 sortOrder）。
     * 以 parent_id 为 0/NULL 判定顶级，避免 TINYINT level 与 Integer 比较失败导致列表为空。
     */
    public List<String> getLevel1IndustryNamesInOrder() {
        return industryIdMap.values().stream()
                .filter(c -> {
                    Integer pid = c.getParentId();
                    return pid == null || pid == 0;
                })
                .filter(c -> c.getIsEnabled() == null || Objects.equals(c.getIsEnabled(), 1))
                .sorted(Comparator.comparingInt(c -> c.getSortOrder() != null ? c.getSortOrder() : 0))
                .map(IndustryCategory::getName)
                .filter(n -> n != null && !n.isBlank())
                .distinct()
                .collect(Collectors.toCollection(ArrayList::new));
    }
}
