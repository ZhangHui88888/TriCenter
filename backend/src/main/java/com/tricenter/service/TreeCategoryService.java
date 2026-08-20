package com.tricenter.service;

import com.tricenter.dto.request.TreeCategoryCreateRequest;
import com.tricenter.dto.request.TreeCategoryUpdateRequest;
import com.tricenter.dto.response.TreeCategoryResponse;

import java.util.List;

public interface TreeCategoryService {

    /**
     * 获取某类型的全部分类节点（扁平列表，含禁用项，按 sort_order 排序）
     */
    List<TreeCategoryResponse> listAll(String type);

    TreeCategoryResponse create(String type, TreeCategoryCreateRequest request);

    TreeCategoryResponse update(String type, Integer id, TreeCategoryUpdateRequest request);

    void delete(String type, Integer id);

    /** 已停用的破坏性兼容接口。 */
    void resetToDefault(String type);

    /** 仅补齐缺失默认项，不删除或覆盖任何现有分类。 */
    int restoreMissingDefaults(String type);
}
