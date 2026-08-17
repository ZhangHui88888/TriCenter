package com.tricenter.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tricenter.mapper.EnterpriseMapper;
import com.tricenter.mapper.FollowUpRecordMapper;
import com.tricenter.security.CityContext;
import com.tricenter.service.impl.DashboardServiceImpl;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

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
}
