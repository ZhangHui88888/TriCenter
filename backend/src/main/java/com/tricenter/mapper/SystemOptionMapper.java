package com.tricenter.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.tricenter.entity.SystemOption;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

/**
 * 系统选项Mapper
 */
@Mapper
public interface SystemOptionMapper extends BaseMapper<SystemOption> {
    
    /**
     * 获取所有分类及其选项数量
     */
    @Select("SELECT category, COUNT(*) as count FROM system_options GROUP BY category ORDER BY category")
    List<Map<String, Object>> getCategoryStats();
}
