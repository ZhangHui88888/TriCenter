package com.tricenter.service;

import com.tricenter.dto.request.DictionaryRequest;
import com.tricenter.dto.request.DictionaryUpdateRequest;
import com.tricenter.dto.response.*;

import java.util.List;

/**
 * 基础数据/数据字典服务接口
 */
public interface OptionsService {
    
    /**
     * 获取系统选项列表
     */
    List<OptionResponse> getOptionsByCategory(String category);
    
    /**
     * 获取行业分类树
     */
    List<TreeNodeResponse> getIndustryTree();
    
    /**
     * 获取产品品类树
     */
    List<TreeNodeResponse> getProductCategoryTree();
    
    /**
     * 获取用户列表（对接人）
     */
    List<UserOptionResponse> getUserOptions();
    
    /**
     * 获取字典分类列表
     */
    List<CategoryStatsResponse> getDictionaryCategories();
    
    /**
     * 新增字典选项
     */
    OptionResponse addDictionaryOption(String category, DictionaryRequest request);
    
    /**
     * 更新字典选项
     */
    OptionResponse updateDictionaryOption(String category, Integer id, DictionaryUpdateRequest request);
    
    /**
     * 删除字典选项
     */
    void deleteDictionaryOption(String category, Integer id);
}
