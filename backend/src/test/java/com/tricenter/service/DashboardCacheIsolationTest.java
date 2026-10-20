package com.tricenter.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tricenter.mapper.EnterpriseMapper;
import com.tricenter.mapper.FollowUpRecordMapper;
import com.tricenter.security.CityContext;
import com.tricenter.service.impl.DashboardServiceImpl;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;

class DashboardCacheIsolationTest {

    @Test
    void sameDashboardResourceUsesDifferentKeysForDifferentCities() {
        CityContext cityContext = mock(CityContext.class);
        DashboardServiceImpl service = new DashboardServiceImpl(
                mock(EnterpriseMapper.class),
                mock(FollowUpRecordMapper.class),
                mock(DictionaryCacheService.class),
                mock(RedisTemplate.class),
                new ObjectMapper(),
                cityContext);

        when(cityContext.requireCityId()).thenReturn(1);
        String changzhouKey = ReflectionTestUtils.invokeMethod(service, "cacheKey", "overview");
        when(cityContext.requireCityId()).thenReturn(2);
        String suzhouKey = ReflectionTestUtils.invokeMethod(service, "cacheKey", "overview");

        assertThat(changzhouKey).isEqualTo("dashboard:1:overview");
        assertThat(suzhouKey).isEqualTo("dashboard:2:overview");
        assertThat(changzhouKey).isNotEqualTo(suzhouKey);
    }

    @Test
    void enterpriseTypeDistributionUsesSelectedCityAndKeepsUnclassifiedEnterprises() {
        CityContext cityContext = mock(CityContext.class);
        EnterpriseMapper mapper = mock(EnterpriseMapper.class);
        RedisTemplate<String, Object> redis = mock(RedisTemplate.class);
        ValueOperations<String, Object> values = mock(ValueOperations.class);
        when(redis.opsForValue()).thenReturn(values);
        when(cityContext.requireCityId()).thenReturn(1);
        when(mapper.countByEnterpriseType(1)).thenReturn(List.of(
                Map.of("name", "工贸一体", "count", 3L),
                Map.of("name", "未分类", "count", 1L)));
        DashboardServiceImpl service = new DashboardServiceImpl(
                mapper, mock(FollowUpRecordMapper.class), mock(DictionaryCacheService.class),
                redis, new ObjectMapper(), cityContext);

        assertThat(service.getEnterpriseTypeStats())
                .extracting(item -> item.getName() + ":" + item.getCount())
                .containsExactly("工贸一体:3", "未分类:1");
        verify(mapper).countByEnterpriseType(1);
    }
}
