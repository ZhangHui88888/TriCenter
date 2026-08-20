package com.tricenter.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.tricenter.common.exception.BusinessException;
import com.tricenter.dto.request.TreeCategoryCreateRequest;
import com.tricenter.dto.request.TreeCategoryUpdateRequest;
import com.tricenter.dto.response.TreeCategoryResponse;
import com.tricenter.entity.Category;
import com.tricenter.entity.RequirementCategory;
import com.tricenter.mapper.CategoryMapper;
import com.tricenter.mapper.RequirementCategoryMapper;
import com.tricenter.mapper.RequirementMapper;
import com.tricenter.service.DictionaryCacheService;
import com.tricenter.service.TreeCategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Predicate;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TreeCategoryServiceImpl implements TreeCategoryService {

    private final CategoryMapper categoryMapper;
    private final RequirementCategoryMapper requirementCategoryMapper;
    private final RequirementMapper requirementMapper;
    private final DictionaryCacheService dictionaryCache;

    private static final Set<String> VALID_TYPES = Set.of("industry", "product", "category", "requirement");

    @Override
    public List<TreeCategoryResponse> listAll(String type) {
        validateType(type);
        return switch (type) {
            case "industry", "product", "category" -> listFromMapper(categoryMapper, Category.class);
            case "requirement" -> {
                List<TreeCategoryResponse> rows = listFromMapper(requirementCategoryMapper, RequirementCategory.class);
                enrichRequirementLinkedIds(rows);
                yield rows;
            }
            default -> throw BusinessException.badRequest("不支持的分类类型: " + type);
        };
    }

    @Override
    @Transactional
    public TreeCategoryResponse create(String type, TreeCategoryCreateRequest request) {
        validateType(type);
        int parentId = request.getParentId() != null ? request.getParentId() : 0;
        int level = 1;
        String parentPath = "";

        if (parentId != 0) {
            TreeCategoryResponse parent = findById(type, parentId);
            if (parent == null) {
                throw BusinessException.badRequest("父级分类不存在");
            }
            level = parent.getLevel() + 1;
            parentPath = parent.getPath();
        }

        if (level > 3) {
            throw BusinessException.badRequest("最多支持3级分类");
        }

        int sortOrder = request.getSortOrder() != null ? request.getSortOrder() : 1;
        boolean enabled = request.getIsEnabled() != null ? request.getIsEnabled() : true;

        Integer newId = switch (type) {
            case "industry", "product", "category" -> {
                Category entity = new Category();
                entity.setParentId(parentId);
                entity.setName(request.getName());
                entity.setLevel(level);
                entity.setSortOrder(sortOrder);
                entity.setIsEnabled(enabled ? 1 : 0);
                categoryMapper.insert(entity);
                entity.setPath(parentId == 0 ? String.valueOf(entity.getId()) : parentPath + "/" + entity.getId());
                categoryMapper.updateById(entity);
                yield entity.getId();
            }
            case "requirement" -> {
                RequirementCategory entity = new RequirementCategory();
                entity.setParentId(parentId);
                entity.setName(request.getName());
                entity.setLevel(level);
                entity.setSortOrder(sortOrder);
                entity.setIsEnabled(enabled ? 1 : 0);
                requirementCategoryMapper.insert(entity);
                entity.setPath(parentId == 0 ? String.valueOf(entity.getId()) : parentPath + "/" + entity.getId());
                requirementCategoryMapper.updateById(entity);
                yield entity.getId();
            }
            default -> throw BusinessException.badRequest("不支持的分类类型");
        };

        dictionaryCache.refresh();
        log.info("新增树分类: type={}, name={}, parentId={}, id={}", type, request.getName(), parentId, newId);
        return findById(type, newId);
    }

    @Override
    @Transactional
    public TreeCategoryResponse update(String type, Integer id, TreeCategoryUpdateRequest request) {
        validateType(type);
        TreeCategoryResponse existing = findById(type, id);
        if (existing == null) {
            throw BusinessException.notFound("分类不存在");
        }

        switch (type) {
            case "industry", "product", "category" -> {
                Category entity = categoryMapper.selectById(id);
                applyUpdates(entity, request);
                categoryMapper.updateById(entity);
            }
            case "requirement" -> {
                RequirementCategory entity = requirementCategoryMapper.selectById(id);
                applyUpdates(entity, request);
                requirementCategoryMapper.updateById(entity);
            }
            default -> throw new IllegalStateException("未支持的分类类型: " + type);
        }

        dictionaryCache.refresh();
        log.info("更新树分类: type={}, id={}", type, id);
        return findById(type, id);
    }

    @Override
    @Transactional
    public void delete(String type, Integer id) {
        validateType(type);
        TreeCategoryResponse existing = findById(type, id);
        if (existing == null) {
            throw BusinessException.notFound("分类不存在");
        }

        boolean hasChildren = hasChildren(type, id);
        if (hasChildren) {
            throw BusinessException.badRequest("请先删除子分类");
        }

        switch (type) {
            case "industry", "product", "category" -> categoryMapper.deleteById(id);
            case "requirement" -> requirementCategoryMapper.deleteById(id);
            default -> throw new IllegalStateException("未支持的分类类型: " + type);
        }

        dictionaryCache.refresh();
        log.info("删除树分类: type={}, id={}", type, id);
    }

    @Override
    public void resetToDefault(String type) {
        validateType(type);
        throw new BusinessException(410, "分类重置已停用，请改用补齐缺失默认项接口");
    }

    @Override
    @Transactional
    public int restoreMissingDefaults(String type) {
        validateType(type);
        if (!"requirement".equals(type)) {
            throw BusinessException.badRequest("该分类类型的默认项由 Flyway 参考数据维护");
        }

        int restored = 0;
        for (DefaultCategory item : DEFAULT_REQUIREMENT_CATEGORIES) {
            if (requirementCategoryMapper.selectById(item.id()) != null) {
                continue;
            }
            RequirementCategory category = new RequirementCategory();
            category.setId(item.id());
            category.setParentId(item.parentId());
            category.setName(item.name());
            category.setLevel(item.level());
            category.setPath(item.path());
            category.setSortOrder(item.sortOrder());
            category.setIsEnabled(1);
            requirementCategoryMapper.insert(category);
            restored++;
        }
        if (restored > 0) {
            dictionaryCache.refresh();
        }
        log.info("补齐缺失默认分类: type={}, restored={}", type, restored);
        return restored;
    }

    private static DefaultCategory d(int id, int parentId, String name, int level, String path, int sortOrder) {
        return new DefaultCategory(id, parentId, name, level, path, sortOrder);
    }

    private static final List<DefaultCategory> DEFAULT_REQUIREMENT_CATEGORIES = List.of(
            d(1, 0, "战略规划与资源准备", 1, "1", 1),
            d(2, 0, "渠道搭建与商品上线", 1, "2", 2),
            d(3, 0, "营销推广与规模增长", 1, "3", 3),
            d(4, 0, "品牌深耕与持续优化", 1, "4", 4),
            d(11, 1, "品牌规划", 2, "1/11", 1), d(12, 1, "市场洞察", 2, "1/12", 2),
            d(13, 1, "搭建营销体系", 2, "1/13", 3), d(14, 1, "测品选品与前置认证评估", 2, "1/14", 4),
            d(15, 1, "战略与预算", 2, "1/15", 5), d(16, 1, "供应链与物流准备", 2, "1/16", 6),
            d(17, 1, "合规前置", 2, "1/17", 7), d(18, 1, "团队与组织准备", 2, "1/18", 8),
            d(111, 11, "品牌定位与规划/设计", 3, "1/11/111", 1),
            d(121, 12, "市场/IP洞察", 3, "1/12/121", 1),
            d(131, 13, "用户旅程设计", 3, "1/13/131", 1), d(132, 13, "画像/要素/标签体系", 3, "1/13/132", 2),
            d(133, 13, "营销活动与节奏规划", 3, "1/13/133", 3),
            d(141, 14, "平台测品、双轨选品", 3, "1/14/141", 1), d(142, 14, "海外认证可行性评估", 3, "1/14/142", 2),
            d(151, 15, "出海路径规划", 3, "1/15/151", 1), d(152, 15, "营销战略与预算", 3, "1/15/152", 2),
            d(161, 16, "备货策略与库存预案", 3, "1/16/161", 1), d(162, 16, "物流渠道方案选型", 3, "1/16/162", 2),
            d(171, 17, "知识产权布局", 3, "1/17/171", 1), d(172, 17, "税务合规前置", 3, "1/17/172", 2),
            d(181, 18, "组织架构设计", 3, "1/18/181", 1), d(182, 18, "人才招聘与培养", 3, "1/18/182", 2),
            d(21, 2, "渠道与店铺建设", 2, "2/21", 1), d(22, 2, "商品内容与上架", 2, "2/22", 2),
            d(23, 2, "达人/社媒/直播启动", 2, "2/23", 3), d(24, 2, "包装与样品管理", 2, "2/24", 4),
            d(211, 21, "平台开店", 3, "2/21/211", 1), d(212, 21, "独立站建设", 3, "2/21/212", 2),
            d(221, 22, "Listing与素材生产", 3, "2/22/221", 1), d(222, 22, "合规材料与上架门槛", 3, "2/22/222", 2),
            d(231, 23, "达人合作与结算", 3, "2/23/231", 1), d(232, 23, "直播间搭建与直播运营", 3, "2/23/232", 2),
            d(241, 24, "外包装设计", 3, "2/24/241", 1), d(242, 24, "防损包装", 3, "2/24/242", 2),
            d(31, 3, "获客与投放", 2, "3/31", 1), d(32, 3, "订单、财务与收款", 2, "3/32", 2),
            d(33, 3, "客服与售后", 2, "3/33", 3), d(34, 3, "合规与风险的持续运营", 2, "3/34", 4),
            d(311, 31, "流量推广与精准营销", 3, "3/31/311", 1), d(312, 31, "广告投放与优化", 3, "3/31/312", 2),
            d(321, 32, "跨境支付与资金管理", 3, "3/32/321", 1), d(322, 32, "出口退税与税务申报", 3, "3/32/322", 2),
            d(331, 33, "知识库/智能客服", 3, "3/33/331", 1), d(332, 33, "退换货、维修、质保服务", 3, "3/33/332", 2),
            d(341, 34, "平台合规", 3, "3/34/341", 1), d(342, 34, "知识产权维护", 3, "3/34/342", 2),
            d(41, 4, "履约升级与交付体验", 2, "4/41", 1), d(42, 4, "私域与会员运营", 2, "4/42", 2),
            d(43, 4, "产品与品牌迭代", 2, "4/43", 3), d(44, 4, "新品规划", 2, "4/44", 4),
            d(411, 41, "报关/清关异常处理", 3, "4/41/411", 1), d(412, 41, "海外仓", 3, "4/41/412", 2),
            d(421, 42, "合伙人转介、交叉销售、复购", 3, "4/42/421", 1),
            d(431, 43, "产品迭代机制", 3, "4/43/431", 1), d(432, 43, "品牌推广与IP策略", 3, "4/43/432", 2),
            d(441, 44, "商品洞察", 3, "4/44/441", 1), d(442, 44, "产品定义", 3, "4/44/442", 2)
    );

    private record DefaultCategory(
            int id, int parentId, String name, int level, String path, int sortOrder) {
    }

    private void validateType(String type) {
        if (!VALID_TYPES.contains(type)) {
            throw BusinessException.badRequest("不支持的分类类型: " + type + "，合法值: " + VALID_TYPES);
        }
    }

    private TreeCategoryResponse findById(String type, Integer id) {
        return switch (type) {
            case "industry", "product", "category" -> {
                Category e = categoryMapper.selectById(id);
                yield e != null ? toResponse(e.getId(), e.getParentId(), e.getName(), e.getLevel(), e.getPath(), e.getSortOrder(), e.getIsEnabled(), e.getCreatedAt()) : null;
            }
            case "requirement" -> {
                RequirementCategory e = requirementCategoryMapper.selectById(id);
                yield e != null ? toResponse(e.getId(), e.getParentId(), e.getName(), e.getLevel(), e.getPath(), e.getSortOrder(), e.getIsEnabled(), e.getCreatedAt()) : null;
            }
            default -> null;
        };
    }

    private boolean hasChildren(String type, Integer parentId) {
        return switch (type) {
            case "industry", "product", "category" -> categoryMapper.selectCount(
                    new LambdaQueryWrapper<Category>().eq(Category::getParentId, parentId)) > 0;
            case "requirement" -> requirementCategoryMapper.selectCount(
                    new LambdaQueryWrapper<RequirementCategory>().eq(RequirementCategory::getParentId, parentId)) > 0;
            default -> false;
        };
    }

    private <T> List<TreeCategoryResponse> listFromMapper(BaseMapper<T> mapper, Class<T> clazz) {
        List<T> all = mapper.selectList(null);
        return all.stream().map(entity -> {
            if (entity instanceof Category e) {
                return toResponse(e.getId(), e.getParentId(), e.getName(), e.getLevel(), e.getPath(), e.getSortOrder(), e.getIsEnabled(), e.getCreatedAt());
            } else if (entity instanceof RequirementCategory e) {
                return toResponse(e.getId(), e.getParentId(), e.getName(), e.getLevel(), e.getPath(), e.getSortOrder(), e.getIsEnabled(), e.getCreatedAt());
            }
            throw new IllegalStateException("Unknown entity type");
        }).sorted((a, b) -> {
            int cmp = Integer.compare(
                    a.getSortOrder() != null ? a.getSortOrder() : 0,
                    b.getSortOrder() != null ? b.getSortOrder() : 0);
            return cmp != 0 ? cmp : Integer.compare(a.getId(), b.getId());
        }).collect(Collectors.toList());
    }

    private TreeCategoryResponse toResponse(Integer id, Integer parentId, String name, Integer level,
                                            String path, Integer sortOrder, Integer isEnabled,
                                            java.time.LocalDateTime createdAt) {
        return TreeCategoryResponse.builder()
                .id(id).parentId(parentId).name(name).level(level)
                .path(path).sortOrder(sortOrder).isEnabled(isEnabled)
                .createdAt(createdAt)
                .build();
    }

    private static final Comparator<TreeCategoryResponse> TREE_ROW_ORDER = Comparator
            .comparingInt((TreeCategoryResponse a) -> a.getSortOrder() != null ? a.getSortOrder() : 0)
            .thenComparingInt(TreeCategoryResponse::getId);

    /**
     * 标准需求 id 与种子树一致：第1段=顶级阶段在同级中的序号，第2段=二级分类在该阶段下的序号，第3段=三级条目在二级下的序号。
     */
    private void enrichRequirementLinkedIds(List<TreeCategoryResponse> rows) {
        Map<Integer, TreeCategoryResponse> byId = rows.stream()
                .collect(Collectors.toMap(TreeCategoryResponse::getId, r -> r, (a, b) -> a));
        for (TreeCategoryResponse row : rows) {
            if (row.getLevel() == null || row.getLevel() != 3) {
                continue;
            }
            TreeCategoryResponse l2 = byId.get(row.getParentId());
            if (l2 == null || l2.getLevel() == null || l2.getLevel() != 2) {
                continue;
            }
            TreeCategoryResponse l1 = byId.get(l2.getParentId());
            if (l1 == null || l1.getLevel() == null || l1.getLevel() != 1) {
                continue;
            }
            int p = siblingIndex(rows, r -> Objects.equals(r.getParentId(), 0) && Objects.equals(r.getLevel(), 1), l1.getId());
            int c = siblingIndex(rows, r -> Objects.equals(r.getParentId(), l1.getId()) && Objects.equals(r.getLevel(), 2), l2.getId());
            int i = siblingIndex(rows, r -> Objects.equals(r.getParentId(), l2.getId()) && Objects.equals(r.getLevel(), 3), row.getId());
            if (p <= 0 || c <= 0 || i <= 0) {
                continue;
            }
            String rid = p + "." + c + "." + i;
            if (requirementMapper.selectById(rid) != null) {
                row.setLinkedRequirementId(rid);
            }
        }
    }

    private static int siblingIndex(List<TreeCategoryResponse> all, Predicate<TreeCategoryResponse> sameGroup, int targetId) {
        List<TreeCategoryResponse> sibs = all.stream()
                .filter(sameGroup)
                .sorted(TREE_ROW_ORDER)
                .toList();
        for (int idx = 0; idx < sibs.size(); idx++) {
            if (Objects.equals(sibs.get(idx).getId(), targetId)) {
                return idx + 1;
            }
        }
        return -1;
    }

    private void applyUpdates(Object entity, TreeCategoryUpdateRequest req) {
        if (entity instanceof Category e) {
            if (req.getName() != null) e.setName(req.getName());
            if (req.getSortOrder() != null) e.setSortOrder(req.getSortOrder());
            if (req.getIsEnabled() != null) e.setIsEnabled(req.getIsEnabled() ? 1 : 0);
        } else if (entity instanceof RequirementCategory e) {
            if (req.getName() != null) e.setName(req.getName());
            if (req.getSortOrder() != null) e.setSortOrder(req.getSortOrder());
            if (req.getIsEnabled() != null) e.setIsEnabled(req.getIsEnabled() ? 1 : 0);
        }
    }
}
