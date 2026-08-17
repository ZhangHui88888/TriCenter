package com.tricenter.mapper;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThatNoException;

class CityScopedMapperContractTest {

    @Test
    void dashboardAggregatesRequireCityId() {
        assertThatNoException().isThrownBy(() -> {
            EnterpriseMapper.class.getMethod("countByStage", Integer.class);
            EnterpriseMapper.class.getMethod("countByDistrict", Integer.class);
            EnterpriseMapper.class.getMethod("countByIndustry", Integer.class);
            EnterpriseMapper.class.getMethod(
                    "countByStageBeforeDate", LocalDateTime.class, Integer.class);
            EnterpriseMapper.class.getMethod(
                    "countMonthlyTrend", LocalDateTime.class, Integer.class);
        });
    }

    @Test
    void followUpAndServiceRecordListsRequireCityId() {
        assertThatNoException().isThrownBy(() -> {
            FollowUpRecordMapper.class.getMethod(
                    "countByDateRange", LocalDate.class, LocalDate.class, Integer.class);
            FollowUpRecordMapper.class.getMethod("selectLastFollowDates", Integer.class);
            EnterpriseServiceRecordMapper.class.getMethod(
                    "selectGlobalPage",
                    Page.class,
                    Integer.class,
                    Integer.class,
                    String.class,
                    String.class,
                    Integer.class);
        });
    }
}
