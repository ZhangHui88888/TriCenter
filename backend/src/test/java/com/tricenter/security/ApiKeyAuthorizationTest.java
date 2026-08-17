package com.tricenter.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tricenter.entity.City;
import com.tricenter.service.CityAccessService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ApiKeyAuthorizationTest {

    private ApiKeyAuthenticationFilter filter;

    @BeforeEach
    void setUp() {
        CityAccessService cityAccessService = mock(CityAccessService.class);
        City changzhou = new City();
        changzhou.setId(1);
        changzhou.setCode("changzhou");
        changzhou.setStatus(1);
        when(cityAccessService.requireCityByCode("changzhou")).thenReturn(changzhou);

        filter = new ApiKeyAuthenticationFilter(cityAccessService, new ObjectMapper());
        ReflectionTestUtils.setField(filter, "validApiKey", "booking-key");
        ReflectionTestUtils.setField(filter, "bookingCityCode", "changzhou");
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void bookingKeyCanCreateEnterpriseInConfiguredCity() throws Exception {
        MockHttpServletRequest request = apiKeyRequest("POST", "/api/enterprises");
        MockFilterChain filterChain = new MockFilterChain();

        filter.doFilter(request, new MockHttpServletResponse(), filterChain);

        LoginUser principal = (LoginUser) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        assertThat(principal.isSystem()).isTrue();
        assertThat(principal.getCurrentCityId()).isEqualTo(1);
        assertThat(filterChain.getRequest()).isNotNull();
    }

    @Test
    void bookingKeyCanReadSharedOptions() throws Exception {
        MockHttpServletRequest request = apiKeyRequest("GET", "/api/options/industries");

        filter.doFilter(request, new MockHttpServletResponse(), new MockFilterChain());

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
    }

    @Test
    void bookingKeyCannotMutateUnrelatedResources() throws Exception {
        MockHttpServletRequest request = apiKeyRequest("POST", "/api/providers");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain filterChain = new MockFilterChain();

        filter.doFilter(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        assertThat(response.getStatus()).isEqualTo(403);
        assertThat(response.getContentAsString()).contains("API Key 无权访问该接口");
        assertThat(filterChain.getRequest()).isNull();
    }

    private MockHttpServletRequest apiKeyRequest(String method, String path) {
        MockHttpServletRequest request = new MockHttpServletRequest(method, path);
        request.addHeader("X-API-Key", "booking-key");
        return request;
    }
}
