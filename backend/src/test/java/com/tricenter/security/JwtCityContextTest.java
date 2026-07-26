package com.tricenter.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tricenter.common.exception.BusinessException;
import com.tricenter.entity.User;
import com.tricenter.mapper.UserMapper;
import com.tricenter.service.CityAccessService;
import com.tricenter.service.PermissionService;
import com.tricenter.util.JwtUtil;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class JwtCityContextTest {

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void activeTokenCarriesTrustedCurrentCity() {
        JwtUtil jwtUtil = jwtUtil();

        String token = jwtUtil.generateToken(7, "manager", "manager", 2, false);

        assertThat(jwtUtil.getCurrentCityIdFromToken(token)).isEqualTo(2);
        assertThat(jwtUtil.isCitySelectionPending(token)).isFalse();
    }

    @Test
    void pendingTokenHasNoCurrentCity() {
        JwtUtil jwtUtil = jwtUtil();

        String token = jwtUtil.generateToken(7, "manager", "manager", null, true);

        assertThat(jwtUtil.getCurrentCityIdFromToken(token)).isNull();
        assertThat(jwtUtil.isCitySelectionPending(token)).isTrue();
    }

    @Test
    void revokedCityAuthorizationLeavesRequestUnauthenticated() throws Exception {
        JwtUtil jwtUtil = mock(JwtUtil.class);
        UserMapper userMapper = mock(UserMapper.class);
        CityAccessService cityAccessService = mock(CityAccessService.class);
        PermissionService permissionService = new PermissionService();
        JwtAuthenticationFilter filter = new JwtAuthenticationFilter(
                jwtUtil, userMapper, cityAccessService, permissionService, new ObjectMapper());
        User user = enabledUser();

        when(jwtUtil.validateToken("revoked-token")).thenReturn(true);
        when(jwtUtil.getUserIdFromToken("revoked-token")).thenReturn(user.getId());
        when(jwtUtil.getCurrentCityIdFromToken("revoked-token")).thenReturn(2);
        when(jwtUtil.isCitySelectionPending("revoked-token")).thenReturn(false);
        when(userMapper.selectById(user.getId())).thenReturn(user);
        when(cityAccessService.requireAuthorizedCity(user.getId(), 2))
                .thenThrow(BusinessException.forbidden("无权访问该城市"));

        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/enterprises");
        request.addHeader("Authorization", "Bearer revoked-token");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain filterChain = new MockFilterChain();
        filter.doFilter(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        assertThat(response.getStatus()).isEqualTo(403);
        assertThat(response.getContentAsString()).contains("无权访问该城市");
        assertThat(filterChain.getRequest()).isNull();
    }

    @Test
    void pendingUserCannotCallBusinessEndpoint() throws Exception {
        CitySelectionFilter filter = new CitySelectionFilter(new ObjectMapper());
        LoginUser loginUser = new LoginUser(7, "manager", "manager", null, false);
        SecurityContextHolder.getContext().setAuthentication(
                new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                        loginUser, null, new PermissionService().getAuthorities("manager")));
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/enterprises");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, new MockFilterChain());

        assertThat(response.getStatus()).isEqualTo(403);
        assertThat(response.getContentAsString()).contains("请先选择城市");
    }

    @Test
    void disabledUserTokenReturnsStructuredUnauthorizedResponse() throws Exception {
        JwtUtil jwtUtil = mock(JwtUtil.class);
        UserMapper userMapper = mock(UserMapper.class);
        CityAccessService cityAccessService = mock(CityAccessService.class);
        JwtAuthenticationFilter filter = new JwtAuthenticationFilter(
                jwtUtil, userMapper, cityAccessService, new PermissionService(), new ObjectMapper());
        User user = enabledUser();
        user.setStatus(0);

        when(jwtUtil.validateToken("disabled-token")).thenReturn(true);
        when(jwtUtil.getUserIdFromToken("disabled-token")).thenReturn(user.getId());
        when(jwtUtil.getCurrentCityIdFromToken("disabled-token")).thenReturn(1);
        when(jwtUtil.isCitySelectionPending("disabled-token")).thenReturn(false);
        when(userMapper.selectById(user.getId())).thenReturn(user);

        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/enterprises");
        request.addHeader("Authorization", "Bearer disabled-token");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain filterChain = new MockFilterChain();

        filter.doFilter(request, response, filterChain);

        assertThat(response.getStatus()).isEqualTo(401);
        assertThat(response.getContentAsString()).contains("账号已禁用或不存在");
        assertThat(filterChain.getRequest()).isNull();
    }

    private JwtUtil jwtUtil() {
        JwtUtil jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret",
                "test-secret-key-for-city-context-test-must-be-long-enough-0123456789abcdef");
        ReflectionTestUtils.setField(jwtUtil, "expiration", 60_000L);
        return jwtUtil;
    }

    private User enabledUser() {
        User user = new User();
        user.setId(7);
        user.setUsername("manager");
        user.setRole("manager");
        user.setStatus(1);
        return user;
    }
}
