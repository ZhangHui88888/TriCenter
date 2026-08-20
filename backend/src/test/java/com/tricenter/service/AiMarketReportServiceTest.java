package com.tricenter.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tricenter.common.exception.BusinessException;
import com.tricenter.mapper.EnterpriseProductMapper;
import com.tricenter.security.CityContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.core.StringRedisTemplate;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;

class AiMarketReportServiceTest {

    private static final List<String> REQUIRED = List.of(
            "marketOverview", "buyerProfile", "industryTrends",
            "competition", "risks", "recommendations");
    private AiMarketReportService service;

    @BeforeEach
    void setUp() {
        service = new AiMarketReportService(
                mock(CityAccessService.class), mock(CityContext.class),
                mock(MarketReportService.class), mock(EnterpriseProductMapper.class),
                new ObjectMapper(), mock(StringRedisTemplate.class));
    }

    @Test
    void normalizesStructuredValuesToStableJsonStrings() throws Exception {
        Map<String, Object> generated = completeReport();
        generated.put("buyerProfile", Map.of("type", "采购商"));

        Map<String, Object> normalized = service.validateAndNormalize(generated, REQUIRED);

        assertThat(normalized).containsEntry("buyerProfile", "{\"type\":\"采购商\"}");
        assertThat(normalized.keySet()).containsExactlyElementsOf(REQUIRED);
    }

    @Test
    void rejectsMissingOrEmptyRequiredSections() {
        Map<String, Object> generated = completeReport();
        generated.put("risks", " ");

        assertThatThrownBy(() -> service.validateAndNormalize(generated, REQUIRED))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("缺少必需字段");
    }

    private Map<String, Object> completeReport() {
        Map<String, Object> generated = new LinkedHashMap<>();
        REQUIRED.forEach(key -> generated.put(key, key + " content"));
        return generated;
    }
}
