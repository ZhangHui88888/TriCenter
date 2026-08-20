package com.tricenter.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tricenter.common.exception.BusinessException;
import com.tricenter.entity.Enterprise;
import com.tricenter.mapper.MarketReportMapper;
import com.tricenter.security.CityContext;
import com.tricenter.service.impl.MarketReportServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class MarketReportServiceTest {

    private final MarketReportMapper mapper = mock(MarketReportMapper.class);
    private final CityContext cityContext = mock(CityContext.class);
    private final CityAccessService cityAccessService = mock(CityAccessService.class);
    private MarketReportService service;

    @BeforeEach
    void setUp() {
        when(cityContext.requireCityId()).thenReturn(7);
        when(cityAccessService.requireEnterprise(12, 7)).thenReturn(new Enterprise());
        service = new MarketReportServiceImpl(
                mapper, cityContext, cityAccessService, new ObjectMapper());
    }

    @Test
    void upsertUsesOneAtomicStatementForTheRequestedVersion() {
        service.upsert(12, "basic", Map.of("summary", "ok"));

        verify(mapper).upsertBasic(12, "{\"summary\":\"ok\"}");
    }

    @Test
    void upsertRejectsEmptyDataAndUnknownVersions() {
        assertThatThrownBy(() -> service.upsert(12, "basic", Map.of()))
                .isInstanceOf(BusinessException.class)
                .hasMessage("报告内容不能为空");
        assertThatThrownBy(() -> service.upsert(12, "legacy", Map.of("x", 1)))
                .isInstanceOf(BusinessException.class)
                .hasMessage("version 必须是 basic 或 deep");
    }
}
