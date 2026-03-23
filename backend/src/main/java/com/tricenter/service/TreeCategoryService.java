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

    /**
     * 恢复默认数据（清空当前数据并重新插入种子数据）
     */
    void resetToDefault(String type);
}
