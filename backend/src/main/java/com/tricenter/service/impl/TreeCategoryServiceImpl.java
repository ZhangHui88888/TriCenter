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
        }

        dictionaryCache.refresh();
        log.info("删除树分类: type={}, id={}", type, id);
    }

    @Override
    public void resetToDefault(String type) {
        validateType(type);
        throw new BusinessException(410, "分类重置已停用，请改用补齐缺失默认项接口");
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
