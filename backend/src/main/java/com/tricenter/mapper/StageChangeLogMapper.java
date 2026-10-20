package com.tricenter.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.tricenter.entity.StageChangeLog;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

/**
 * 阶段变更日志Mapper
 */
@Mapper
public interface StageChangeLogMapper extends BaseMapper<StageChangeLog> {

    /** 保留阶段变更历史，同时解除已删除跟进记录的外键关联。 */
    @Update("UPDATE stage_change_logs SET follow_up_id = NULL WHERE follow_up_id = #{followUpId}")
    int unlinkFollowUp(@Param("followUpId") Integer followUpId);
    
    /**
     * 获取企业的阶段变更历史
     */
    @Select("SELECT s.* FROM stage_change_logs s JOIN enterprises e ON e.id = s.enterprise_id " +
            "WHERE s.enterprise_id = #{enterpriseId} AND e.city_id = #{cityId} AND e.is_deleted = 0 " +
            "ORDER BY s.created_at DESC")
    List<StageChangeLog> selectByEnterpriseId(
            @Param("enterpriseId") Integer enterpriseId,
            @Param("cityId") Integer cityId);
    
    /**
     * 统计各转化路径的数量
     */
    @Select("SELECT stage_from as from_stage, stage_to as to_stage, COUNT(*) as count " +
            "FROM stage_change_logs s JOIN enterprises e ON e.id = s.enterprise_id " +
            "WHERE e.city_id = #{cityId} AND e.is_deleted = 0 " +
            "GROUP BY s.stage_from, s.stage_to")
    List<java.util.Map<String, Object>> countByTransition(@Param("cityId") Integer cityId);
}
