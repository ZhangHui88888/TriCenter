package com.tricenter.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.tricenter.entity.FollowUpRecord;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDate;
import java.util.List;

/**
 * 跟进记录Mapper
 */
@Mapper
public interface FollowUpRecordMapper extends BaseMapper<FollowUpRecord> {
    
    /**
     * 获取企业的跟进记录
     */
    @Select("SELECT * FROM follow_up_records WHERE enterprise_id = #{enterpriseId} ORDER BY follow_date DESC, created_at DESC")
    List<FollowUpRecord> selectByEnterpriseId(@Param("enterpriseId") Integer enterpriseId);
    
    /**
     * 统计指定日期范围内的跟进记录数
     */
    @Select("SELECT COUNT(*) FROM follow_up_records WHERE follow_date >= #{startDate} AND follow_date <= #{endDate}")
    int countByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    /**
     * 获取企业最后一次跟进日期
     */
    @Select("SELECT MAX(follow_date) FROM follow_up_records WHERE enterprise_id = #{enterpriseId}")
    LocalDate getLastFollowUpDate(@Param("enterpriseId") Integer enterpriseId);
}
