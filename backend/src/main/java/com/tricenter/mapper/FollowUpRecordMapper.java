package com.tricenter.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.tricenter.entity.FollowUpRecord;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * 跟进记录Mapper
 */
@Mapper
public interface FollowUpRecordMapper extends BaseMapper<FollowUpRecord> {
    
    /**
     * 获取企业的跟进记录
     */
    @Select("SELECT f.* FROM follow_up_records f JOIN enterprises e ON e.id = f.enterprise_id " +
            "WHERE f.enterprise_id = #{enterpriseId} AND e.city_id = #{cityId} AND e.is_deleted = 0 " +
            "ORDER BY f.follow_date DESC, f.created_at DESC")
    List<FollowUpRecord> selectByEnterpriseId(
            @Param("enterpriseId") Integer enterpriseId,
            @Param("cityId") Integer cityId);
    
    /**
     * 统计指定日期范围内的跟进记录数
     */
    @Select("SELECT COUNT(*) FROM follow_up_records f JOIN enterprises e ON e.id = f.enterprise_id " +
            "WHERE e.city_id = #{cityId} AND e.is_deleted = 0 " +
            "AND f.follow_date >= #{startDate} AND f.follow_date <= #{endDate}")
    int countByDateRange(@Param("startDate") LocalDate startDate,
                         @Param("endDate") LocalDate endDate,
                         @Param("cityId") Integer cityId);
    
    /**
     * 获取企业最后一次跟进日期
     */
    @Select("SELECT MAX(follow_date) FROM follow_up_records WHERE enterprise_id = #{enterpriseId}")
    LocalDate getLastFollowUpDate(@Param("enterpriseId") Integer enterpriseId);

    /**
     * 获取所有企业最近一次跟进日期
     */
    @Select("SELECT f.enterprise_id AS enterpriseId, MAX(f.follow_date) AS lastFollowDate " +
            "FROM follow_up_records f JOIN enterprises e ON e.id = f.enterprise_id " +
            "WHERE e.city_id = #{cityId} AND e.is_deleted = 0 GROUP BY f.enterprise_id")
    List<Map<String, Object>> selectLastFollowDates(@Param("cityId") Integer cityId);

    @Select("SELECT f.* FROM follow_up_records f JOIN enterprises e ON e.id = f.enterprise_id " +
            "WHERE e.city_id = #{cityId} AND e.is_deleted = 0 " +
            "AND f.next_plan IS NOT NULL AND f.next_plan <> '' " +
            "ORDER BY f.follow_date DESC LIMIT #{limit}")
    List<FollowUpRecord> selectRecentWithNextPlan(
            @Param("cityId") Integer cityId,
            @Param("limit") Integer limit);
}
