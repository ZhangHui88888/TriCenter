package com.tricenter.service;

import com.tricenter.entity.Category;
import com.tricenter.entity.SystemOption;
import com.tricenter.mapper.CategoryMapper;
import com.tricenter.mapper.SystemOptionMapper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * 数据字典内存缓存服务
 * 启动时加载所有 SystemOption 和 Category，避免重复查库
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DictionaryCacheService {

    private final SystemOptionMapper systemOptionMapper;
    private final CategoryMapper categoryMapper;

    private volatile Map<String, Map<String, SystemOption>> categoryValueMap = new ConcurrentHashMap<>();
    private volatile Map<Integer, SystemOption> optionIdMap = new ConcurrentHashMap<>();
    private volatile Map<Integer, Category> categoryIdMap = new ConcurrentHashMap<>();

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

        var allCategories = categoryMapper.selectList(null);
        Map<Integer, Category> newCatIdMap = new ConcurrentHashMap<>(allCategories.size());
        for (Category cat : allCategories) {
            newCatIdMap.put(cat.getId(), cat);
        }
        this.categoryIdMap = newCatIdMap;

        log.info("数据字典缓存刷新完成: {} 个选项, {} 个分类, 耗时 {}ms",
                allOptions.size(), allCategories.size(),
                System.currentTimeMillis() - start);
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

    public Category getCategoryById(Integer id) {
        if (id == null) return null;
        return categoryIdMap.get(id);
    }

    public String getCategoryName(Integer id) {
        Category cat = getCategoryById(id);
        return cat != null ? cat.getName() : null;
    }

    /**
     * 获取指定分类ID及其所有后代分类ID（用于筛选时包含子分类）
     */
    public Set<Integer> getCategoryDescendantIds(Integer id) {
        Set<Integer> result = new LinkedHashSet<>();
        if (id == null) return result;
        result.add(id);
        Queue<Integer> queue = new LinkedList<>();
        queue.add(id);
        while (!queue.isEmpty()) {
            Integer parentId = queue.poll();
            for (Category cat : categoryIdMap.values()) {
                if (parentId.equals(cat.getParentId()) && !result.contains(cat.getId())) {
                    result.add(cat.getId());
                    queue.add(cat.getId());
                }
            }
        }
        return result;
    }

    /**
     * 将任意分类ID归并到一级分类名称（与数据分析统计口径一致）
     */
    public String resolveLevel1CategoryName(Integer categoryId) {
        if (categoryId == null) {
            return "未分类";
        }
        Category cat = getCategoryById(categoryId);
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
            Category parent = getCategoryById(pid);
            if (parent == null) {
                break;
            }
            cat = parent;
        }
        String n = cat.getName();
        return n != null && !n.isBlank() ? n : "未分类";
    }

    /**
     * 一级分类名称列表（按 sortOrder）。
     * 以 parent_id 为 0/NULL 判定顶级，避免 TINYINT level 与 Integer 比较失败导致列表为空。
     */
    public List<String> getLevel1CategoryNamesInOrder() {
        return categoryIdMap.values().stream()
                .filter(c -> {
                    Integer pid = c.getParentId();
                    return pid == null || pid == 0;
                })
                .filter(c -> c.getIsEnabled() == null || Objects.equals(c.getIsEnabled(), 1))
                .sorted(Comparator.comparingInt(c -> c.getSortOrder() != null ? c.getSortOrder() : 0))
                .map(Category::getName)
                .filter(n -> n != null && !n.isBlank())
                .distinct()
                .collect(Collectors.toCollection(ArrayList::new));
    }
}
