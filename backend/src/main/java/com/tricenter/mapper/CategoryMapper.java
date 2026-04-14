package com.tricenter.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.tricenter.entity.Category;
import org.apache.ibatis.annotations.Mapper;

/**
 * 统一分类Mapper（合并原 IndustryCategoryMapper + ProductCategoryMapper）
 */
@Mapper
public interface CategoryMapper extends BaseMapper<Category> {
}
