package com.tricenter.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.tricenter.common.exception.BusinessException;
import com.tricenter.dto.request.DictionaryRequest;
import com.tricenter.dto.request.DictionaryUpdateRequest;
import com.tricenter.dto.response.*;
import com.tricenter.entity.IndustryCategory;
import com.tricenter.entity.ProductCategory;
import com.tricenter.entity.SystemOption;
import com.tricenter.entity.User;
import com.tricenter.mapper.IndustryCategoryMapper;
import com.tricenter.mapper.ProductCategoryMapper;
import com.tricenter.mapper.SystemOptionMapper;
import com.tricenter.mapper.UserMapper;
import com.tricenter.service.OptionsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
}
