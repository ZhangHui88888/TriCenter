package com.tricenter.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.tricenter.common.exception.BusinessException;
import com.tricenter.dto.request.DictionaryRequest;
import com.tricenter.dto.request.DictionaryUpdateRequest;
import com.tricenter.dto.response.*;
import com.tricenter.entity.*;
import com.tricenter.mapper.*;
import com.tricenter.service.DictionaryCacheService;
import com.tricenter.service.OptionsService;
import com.tricenter.util.RequirementFilterHelper;
import com.tricenter.util.RequirementIdOrder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 基础数据/数据字典服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OptionsServiceImpl implements OptionsService {

    private final SystemOptionMapper systemOptionMapper;
    private final IndustryCategoryMapper industryCategoryMapper;
    private final ProductCategoryMapper productCategoryMapper;
    private final UserMapper userMapper;
    private final RequirementDimensionMappingMapper dimensionMappingMapper;
    private final DictionaryCacheService dictionaryCache;
    private final ProviderMapper providerMapper;
    private final JdbcTemplate jdbcTemplate;

    /**
     * 分类名称映射
     */
    private static final Map<String, String> CATEGORY_LABELS = new LinkedHashMap<>();
    static {
        CATEGORY_LABELS.put("stage", "漏斗阶段");
        CATEGORY_LABELS.put("district", "区域");
        CATEGORY_LABELS.put("enterprise_type", "企业类型");
        CATEGORY_LABELS.put("staff_size", "人员规模");
        CATEGORY_LABELS.put("revenue", "营收规模");
        CATEGORY_LABELS.put("source", "企业来源");
        CATEGORY_LABELS.put("trade_mode", "外贸模式");
        CATEGORY_LABELS.put("trade_team_mode", "外贸业务团队模式");
        CATEGORY_LABELS.put("trade_business_mode", "外贸业务模式");
        CATEGORY_LABELS.put("region", "销售区域");
        CATEGORY_LABELS.put("certification", "产品认证");
        CATEGORY_LABELS.put("automation_level", "自动化程度");
        CATEGORY_LABELS.put("logistics", "物流合作方");
        CATEGORY_LABELS.put("follow_type", "跟进类型");
        CATEGORY_LABELS.put("growth_reason", "增长原因");
        CATEGORY_LABELS.put("decline_reason", "下降原因");
        CATEGORY_LABELS.put("cross_border_platform", "跨境平台");
        CATEGORY_LABELS.put("cross_border_logistics", "跨境物流模式");
        CATEGORY_LABELS.put("payment_settlement", "支付结算方式");
        CATEGORY_LABELS.put("enjoyed_policy", "已享受政策");
        CATEGORY_LABELS.put("tricenter_project", "三中心合作项目");
        CATEGORY_LABELS.put("cooperation_concern", "不合作顾虑");
        CATEGORY_LABELS.put("requirement_phase", "需求阶段");
        CATEGORY_LABELS.put("requirement_category", "需求分类");
    }

    @Override
    public List<OptionResponse> getOptionsByCategory(String category) {
        List<SystemOption> options = systemOptionMapper.selectList(
            new LambdaQueryWrapper<SystemOption>()
                .eq(SystemOption::getCategory, category)
                .eq(SystemOption::getIsEnabled, 1)
                .orderByAsc(SystemOption::getSortOrder)
        );
        
        return options.stream()
            .map(this::toOptionResponse)
            .collect(Collectors.toList());
    }

    @Override
    public List<TreeNodeResponse> getIndustryTree() {
        List<IndustryCategory> allCategories = industryCategoryMapper.selectList(
            new LambdaQueryWrapper<IndustryCategory>()
                .eq(IndustryCategory::getIsEnabled, 1)
                .orderByAsc(IndustryCategory::getSortOrder)
        );
        
        return buildIndustryTree(allCategories, 0);
    }

    @Override
    public List<TreeNodeResponse> getProductCategoryTree() {
        List<ProductCategory> allCategories = productCategoryMapper.selectList(
            new LambdaQueryWrapper<ProductCategory>()
                .eq(ProductCategory::getIsEnabled, 1)
                .orderByAsc(ProductCategory::getSortOrder)
        );
        
        return buildProductTree(allCategories, 0);
    }

    @Override
    public List<UserOptionResponse> getUserOptions() {
        List<User> users = userMapper.selectList(
            new LambdaQueryWrapper<User>()
                .eq(User::getStatus, 1)
                .orderByAsc(User::getId)
        );
        
        return users.stream()
            .map(user -> UserOptionResponse.builder()
                .value(user.getId())
                .label(user.getName())
                .build())
            .collect(Collectors.toList());
    }

    @Override
    public List<CategoryStatsResponse> getDictionaryCategories() {
        List<Map<String, Object>> stats = systemOptionMapper.getCategoryStats();
        
        return stats.stream()
            .map(stat -> {
                String category = (String) stat.get("category");
                Long count = (Long) stat.get("count");
                String label = CATEGORY_LABELS.getOrDefault(category, category);
                
                return CategoryStatsResponse.builder()
                    .category(category)
                    .label(label)
                    .count(count)
                    .build();
            })
            .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public OptionResponse addDictionaryOption(String category, DictionaryRequest request) {
        // 检查是否已存在相同的 category + value
        SystemOption existing = systemOptionMapper.selectOne(
            new LambdaQueryWrapper<SystemOption>()
                .eq(SystemOption::getCategory, category)
                .eq(SystemOption::getValue, request.getValue())
        );
        
        if (existing != null) {
            throw BusinessException.badRequest("该分类下已存在相同的选项值");
        }
        
        SystemOption option = new SystemOption();
        option.setCategory(category);
        option.setValue(request.getValue());
        option.setLabel(request.getLabel());
        option.setColor(request.getColor());
        option.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0);
        option.setIsEnabled(request.getIsEnabled() != null ? request.getIsEnabled() : 1);
        
        systemOptionMapper.insert(option);
        dictionaryCache.refresh();
        log.info("新增字典选项: category={}, value={}", category, request.getValue());
        
        return toOptionResponse(option);
    }

    @Override
    @Transactional
    public OptionResponse updateDictionaryOption(String category, Integer id, DictionaryUpdateRequest request) {
        SystemOption option = systemOptionMapper.selectById(id);
        
        if (option == null || !option.getCategory().equals(category)) {
            throw BusinessException.notFound("选项不存在");
        }
        
        // value 不可修改，只更新其他字段
        if (request.getLabel() != null) {
            option.setLabel(request.getLabel());
        }
        if (request.getColor() != null) {
            option.setColor(request.getColor());
        }
        if (request.getSortOrder() != null) {
            option.setSortOrder(request.getSortOrder());
        }
        if (request.getIsEnabled() != null) {
            option.setIsEnabled(request.getIsEnabled());
        }
        
        systemOptionMapper.updateById(option);
        dictionaryCache.refresh();
        log.info("更新字典选项: id={}, category={}", id, category);
        
        return toOptionResponse(option);
    }

    @Override
    @Transactional
    public void deleteDictionaryOption(String category, Integer id) {
        SystemOption option = systemOptionMapper.selectById(id);
        
        if (option == null || !option.getCategory().equals(category)) {
            throw BusinessException.notFound("选项不存在");
        }
        
        // TODO: 检查是否被引用，如果被引用则不允许删除，只能禁用
        // 这里暂时直接删除，后续可以添加引用检查逻辑
        
        systemOptionMapper.deleteById(id);
        dictionaryCache.refresh();
        log.info("删除字典选项: id={}, category={}", id, category);
    }

    /**
     * 构建行业分类树
     */
    private List<TreeNodeResponse> buildIndustryTree(List<IndustryCategory> allCategories, Integer parentId) {
        return allCategories.stream()
            .filter(c -> Objects.equals(c.getParentId(), parentId))
            .map(c -> TreeNodeResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .level(c.getLevel())
                .parentId(c.getParentId())
                .children(buildIndustryTree(allCategories, c.getId()))
                .build())
            .collect(Collectors.toList());
    }

    /**
     * 构建产品品类树
     */
    private List<TreeNodeResponse> buildProductTree(List<ProductCategory> allCategories, Integer parentId) {
        return allCategories.stream()
            .filter(c -> Objects.equals(c.getParentId(), parentId))
            .map(c -> TreeNodeResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .level(c.getLevel())
                .parentId(c.getParentId())
                .children(buildProductTree(allCategories, c.getId()))
                .build())
            .collect(Collectors.toList());
    }

    /**
     * 转换为选项响应
     */
    private OptionResponse toOptionResponse(SystemOption option) {
        return OptionResponse.builder()
            .id(option.getId())
            .value(option.getValue())
            .label(option.getLabel())
            .color(option.getColor())
            .sortOrder(option.getSortOrder())
            .isEnabled(option.getIsEnabled())
            .build();
    }

    @Override
    public RequirementConfigResponse getRequirementConfig() {
        // phase 编码 → 中文名（从 system_options 的 requirement_phase 分类读取 label，截取 " — " 之后的部分）
        Map<String, String> phaseMap = new LinkedHashMap<>();
        systemOptionMapper.selectList(
            new LambdaQueryWrapper<SystemOption>()
                .eq(SystemOption::getCategory, "requirement_phase")
                .eq(SystemOption::getIsEnabled, 1)
                .orderByAsc(SystemOption::getSortOrder)
        ).forEach(opt -> {
            String label = opt.getLabel();
            int idx = label.indexOf(" — ");
            phaseMap.put(opt.getValue(), idx >= 0 ? label.substring(idx + 3) : label);
        });

        // category 编码 → 中文名
        Map<String, String> categoryMap = new LinkedHashMap<>();
        systemOptionMapper.selectList(
            new LambdaQueryWrapper<SystemOption>()
                .eq(SystemOption::getCategory, "requirement_category")
                .eq(SystemOption::getIsEnabled, 1)
                .orderByAsc(SystemOption::getSortOrder)
        ).forEach(opt -> categoryMap.put(opt.getValue(), opt.getLabel()));

        // 读取所有启用的标准需求
        boolean hasRecommendedColumn = hasRecommendedColumn();
        String requirementSql = hasRecommendedColumn
            ? "SELECT id, name, description, detail_description, phase, category, is_universal, is_enhanced, sort_order, COALESCE(is_recommended, 0) AS is_recommended FROM requirements WHERE is_custom = 0 AND is_enabled = 1"
            : "SELECT id, name, description, detail_description, phase, category, is_universal, is_enhanced, sort_order, 0 AS is_recommended FROM requirements WHERE is_custom = 0 AND is_enabled = 1";
        List<Requirement> allReqs = jdbcTemplate.query(requirementSql, (rs, rowNum) -> {
            Requirement requirement = new Requirement();
            requirement.setId(rs.getString("id"));
            requirement.setName(rs.getString("name"));
            requirement.setDescription(rs.getString("description"));
            requirement.setDetailDescription(rs.getString("detail_description"));
            requirement.setPhase(rs.getString("phase"));
            requirement.setCategory(rs.getString("category"));
            requirement.setIsUniversal(toInteger(rs.getObject("is_universal")));
            requirement.setIsEnhanced(toInteger(rs.getObject("is_enhanced")));
            requirement.setSortOrder(toInteger(rs.getObject("sort_order")));
            requirement.setIsRecommended(toInteger(rs.getObject("is_recommended")));
            return requirement;
        });
        // 与《跨境电商企业需求文档》序号一致：先按 ID 数值段序，再按库内 sort_order 兜底
        allReqs.sort(Comparator
            .comparing(Requirement::getId, RequirementIdOrder::compare)
            .thenComparing(r -> r.getSortOrder() != null ? r.getSortOrder() : 0));

        List<RequirementConfigResponse.RequirementItemDTO> items = allReqs.stream()
            .map(r -> RequirementConfigResponse.RequirementItemDTO.builder()
                .id(r.getId())
                .name(r.getName())
                .description(r.getDescription())
                .detailDescription(r.getDetailDescription())
                .phase(phaseMap.getOrDefault(r.getPhase(), r.getPhase()))
                .category(categoryMap.getOrDefault(r.getCategory(), r.getCategory()))
                .isRecommended(r.getIsRecommended())
                .build())
            .collect(Collectors.toList());

        Set<String> universalIds = allReqs.stream()
            .filter(r -> Objects.equals(r.getIsUniversal(), 1))
            .map(Requirement::getId)
            .collect(Collectors.toCollection(LinkedHashSet::new));
        if (universalIds.isEmpty()) {
            Set<String> fallbackIds = RequirementFilterHelper.getUniversalRequiredIds();
            universalIds = allReqs.stream()
                .map(Requirement::getId)
                .filter(fallbackIds::contains)
                .collect(Collectors.toCollection(LinkedHashSet::new));
        }

        Set<String> enhancedIds = allReqs.stream()
            .filter(r -> Objects.equals(r.getIsEnhanced(), 1))
            .map(Requirement::getId)
            .collect(Collectors.toCollection(LinkedHashSet::new));
        if (enhancedIds.isEmpty()) {
            Set<String> fallbackIds = RequirementFilterHelper.getUniversalEnhancedIds();
            enhancedIds = allReqs.stream()
                .map(Requirement::getId)
                .filter(fallbackIds::contains)
                .collect(Collectors.toCollection(LinkedHashSet::new));
        }

        // 构建维度映射：dimensionKey -> dimensionValue -> requirementId[]
        List<RequirementDimensionMapping> allMappings = dimensionMappingMapper.selectList(null);
        Map<String, Map<String, List<String>>> dimMap = new LinkedHashMap<>();
        for (RequirementDimensionMapping m : allMappings) {
            dimMap.computeIfAbsent(m.getDimensionKey(), k -> new LinkedHashMap<>())
                  .computeIfAbsent(m.getDimensionValue(), k -> new ArrayList<>())
                  .add(m.getRequirementId());
        }

        return RequirementConfigResponse.builder()
            .requirements(items)
            .universalRequiredIds(universalIds)
            .universalEnhancedIds(enhancedIds)
            .dimensionRequirementMapping(dimMap)
            .build();
    }

    private boolean hasRecommendedColumn() {
        Integer count = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'requirements' AND COLUMN_NAME = 'is_recommended'",
            Integer.class
        );
        return count != null && count > 0;
    }

    private Integer toInteger(Object value) {
        if (value instanceof Number number) {
            return number.intValue();
        }
        return null;
    }

    @Override
    public List<OptionResponse> getProviderOptions() {
        List<Provider> providers = providerMapper.selectList(
            new LambdaQueryWrapper<Provider>()
                .orderByAsc(Provider::getId)
        );
        return providers.stream().map(p -> {
            OptionResponse resp = new OptionResponse();
            resp.setId(p.getId());
            resp.setValue(String.valueOf(p.getId()));
            resp.setLabel(p.getName());
            return resp;
        }).collect(Collectors.toList());
    }
}
