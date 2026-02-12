package com.tricenter.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.tricenter.entity.Enterprise;
import com.tricenter.dto.response.EnterpriseListResponse;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

/**
 * 企业Mapper
 */
@Mapper
public interface EnterpriseMapper extends BaseMapper<Enterprise> {
    
    /**
     * 分页查询企业列表（带关联信息）
     */
    IPage<EnterpriseListResponse> selectEnterpriseList(
        Page<EnterpriseListResponse> page,
        @Param("keyword") String keyword,
        @Param("stage") String stage,
        @Param("district") String district,
        @Param("industryId") Integer industryId,
        @Param("enterpriseType") String enterpriseType,
        @Param("staffSizeId") Integer staffSizeId,
        @Param("sourceId") Integer sourceId,
        @Param("hasCrossBorder") Integer hasCrossBorder,
        @Param("transformationWillingness") String transformationWillingness
    );
    
    /**
     * 获取企业详情（带关联信息）
     */
    Map<String, Object> selectEnterpriseDetail(@Param("id") Integer id);
    
    /**
     * 统计各阶段企业数量
     */
    @Select("SELECT stage, COUNT(*) as count FROM enterprises WHERE is_deleted = 0 GROUP BY stage")
    List<Map<String, Object>> countByStage();
    
    /**
     * 统计各区域企业数量
     */
    @Select("SELECT district, COUNT(*) as count FROM enterprises WHERE is_deleted = 0 GROUP BY district ORDER BY count DESC")
    List<Map<String, Object>> countByDistrict();
    
    /**
     * 统计各行业企业数量
     */
    @Select("SELECT ic.name, COUNT(e.id) as count " +
            "FROM enterprises e " +
            "LEFT JOIN industry_categories ic ON e.industry_id = ic.id " +
            "WHERE e.is_deleted = 0 " +
            "GROUP BY e.industry_id, ic.name " +
            "ORDER BY count DESC")
    List<Map<String, Object>> countByIndustry();
    
    /**
     * 统计指定日期之前创建的企业各阶段数量（用于趋势分析）
     */
    @Select("SELECT stage, COUNT(*) as count FROM enterprises " +
            "WHERE is_deleted = 0 AND created_at <= #{beforeDate} " +
            "GROUP BY stage")
    List<Map<String, Object>> countByStageBeforeDate(@Param("beforeDate") java.time.LocalDateTime beforeDate);
}
