package com.tricenter.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.tricenter.entity.MarketReport;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface MarketReportMapper extends BaseMapper<MarketReport> {

    @Insert("""
            INSERT INTO market_reports
                (enterprise_id, basic_report_data, basic_generated_at)
            VALUES
                (#{enterpriseId}, #{reportJson}, CURRENT_TIMESTAMP)
            ON DUPLICATE KEY UPDATE
                basic_report_data = VALUES(basic_report_data),
                basic_generated_at = VALUES(basic_generated_at),
                updated_at = CURRENT_TIMESTAMP
            """)
    int upsertBasic(@Param("enterpriseId") Integer enterpriseId,
                    @Param("reportJson") String reportJson);

    @Insert("""
            INSERT INTO market_reports
                (enterprise_id, deep_report_data, deep_generated_at)
            VALUES
                (#{enterpriseId}, #{reportJson}, CURRENT_TIMESTAMP)
            ON DUPLICATE KEY UPDATE
                deep_report_data = VALUES(deep_report_data),
                deep_generated_at = VALUES(deep_generated_at),
                updated_at = CURRENT_TIMESTAMP
            """)
    int upsertDeep(@Param("enterpriseId") Integer enterpriseId,
                   @Param("reportJson") String reportJson);
}
